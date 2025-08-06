package com.notificacao.notificador.controller;
import com.notificacao.notificador.dto.UsuarioCadastroDTO;
import com.notificacao.notificador.model.*;
import com.notificacao.notificador.repository.*;
import com.notificacao.notificador.service.*;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final NotificacaoEmailService notificacaoEmailService;
    private final EmailTemplateService emailTemplateService;

    public AuthController(UsuarioRepository usuarioRepository,
                          JwtService jwtService,
                          PasswordResetTokenRepository resetTokenRepository,
                          NotificacaoEmailService notificacaoEmailService,
                          EmailTemplateService emailTemplateService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtService = jwtService;
        this.resetTokenRepository = resetTokenRepository;
        this.notificacaoEmailService         = notificacaoEmailService;
        this.emailTemplateService = emailTemplateService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        try {
            // Verificação do token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String token = authHeader.substring(7);
            if (!jwtService.validarToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Obter usuário
            String email = jwtService.obterEmailDoToken(token);
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

            // Construir resposta
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("email", usuario.getEmail());
            response.put("roles", usuario.getRoles());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro ao processar requisição: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid UsuarioCadastroDTO dto) {
        if (usuarioRepository.findByEmail(dto.email()).isPresent()) {
            return ResponseEntity.badRequest().body("E-mail ja cadastrado");
        }

        Set<String> roles = new HashSet<>();
        if (dto.roles() != null && dto.roles().contains("ROLE_ADMIN")) {
            roles.add("ROLE_ADMIN");
        } else {
            roles.add("ROLE_USER");
        }

        Usuario novo = Usuario.builder()
                .email(dto.email())
                .senha(passwordEncoder.encode(dto.senha()))
                .roles(roles)
                .build();

        usuarioRepository.save(novo);
        return ResponseEntity.ok("Usuario registrado com sucesso.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsuarioCadastroDTO dto) {
        var usuarioOpt = usuarioRepository.findByEmail(dto.email());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Usuário ou senha inválidos");
        }

        var usuario = usuarioOpt.get();
        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            return ResponseEntity.status(401).body("Usuário ou senha inválidos");
        }

        String token = jwtService.gerarToken(usuario.getEmail(), usuario.getRoles());
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        Optional<Usuario> optionalUser = usuarioRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.ok("Se o e-mail estiver cadastrado, você receberá um link de redefinição.");
        }

        Usuario usuario = optionalUser.get();

        resetTokenRepository.findByUsuario(usuario)
                .ifPresent(resetTokenRepository::delete);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUsuario(usuario);
        resetToken.setExpiration(LocalDateTime.now().plusMinutes(15));
        resetTokenRepository.save(resetToken);

        String link = "http://localhost:5173/reset-password?token=" + token;
        String assunto = "Redefinição de Senha - Notificator";
        String mensagemHTML = emailTemplateService.buildPasswordResetEmail(link);

        notificacaoEmailService.enviarComLog(email, assunto, mensagemHTML);

        return ResponseEntity.ok("Se o e-mail estiver cadastrado, você receberá um link de redefinição.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String novaSenha = body.get("novaSenha");

        Optional<PasswordResetToken> optToken = resetTokenRepository.findByToken(token);
        if (optToken.isEmpty()) {
            return ResponseEntity.badRequest().body("Token inválido.");
        }

        PasswordResetToken resetToken = optToken.get();

        if (resetToken.getExpiration().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token expirado.");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        resetTokenRepository.delete(resetToken);

        return ResponseEntity.ok("Senha redefinida com sucesso.");
    }


    public record LoginResponse(String token) {}
}

