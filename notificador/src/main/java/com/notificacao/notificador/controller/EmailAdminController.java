package com.notificacao.notificador.controller;

import com.notificacao.notificador.model.EmailLog;
import com.notificacao.notificador.repository.EmailLogRepository;
import com.notificacao.notificador.service.NotificacaoEmailService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/emails")
@PreAuthorize("hasRole('ADMIN')")
public class EmailAdminController {

    private final EmailLogRepository emailLogRepo;
    private final NotificacaoEmailService notifService;

    public EmailAdminController(EmailLogRepository emailLogRepo,
                                NotificacaoEmailService notifService) {
        this.emailLogRepo = emailLogRepo;
        this.notifService = notifService;
    }

    @GetMapping("/todos")
    public List<EmailLog> listarTodos() {
        return emailLogRepo.findAllOrderByDataEnvio();
    }

    @PostMapping("/reenvio/{id}")
    public ResponseEntity<?> reenviar(@PathVariable Long id) {
        EmailLog log = emailLogRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        try {
            notifService.enviarComLog(log.getDestinatario(), log.getAssunto(), log.getCorpo());

            log.setStatus("REENVIADO");
            log.setEnviadoEm(LocalDateTime.now());
            emailLogRepo.save(log);

            return ResponseEntity.ok("Reenvio realizado com sucesso");
        } catch (Exception e) {
            log.setStatus("FALHA");
            log.setErro("Falha no reenvio: " + e.getMessage());
            log.setEnviadoEm(LocalDateTime.now());
            emailLogRepo.save(log);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao reenviar: " + e.getMessage());
        }
    }

    @PostMapping("/testar-falha")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> criarLogFalhaTeste() {
        EmailLog log = new EmailLog();
        log.setDestinatario("teste@exemplo.com");
        log.setAssunto("Teste falha");
        log.setCorpo("Este é um teste de falha");
        log.setStatus("FALHA");
        log.setEnviadoEm(LocalDateTime.now());
        emailLogRepo.save(log);
        return ResponseEntity.ok("Log de falha criado.");
    }

}


