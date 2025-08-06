package com.notificacao.notificador.service;

import com.notificacao.notificador.model.EmailLog;
import com.notificacao.notificador.repository.EmailLogRepository;
import com.notificacao.notificador.service.CircuitBreakerService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificacaoEmailService {

    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepo;
    private final String from;

    @Autowired
    private CircuitBreakerService circuitBreaker;

    public NotificacaoEmailService(JavaMailSender mailSender,
                                   EmailLogRepository emailLogRepo,
                                   @Value("${spring.mail.from}") String from) {
        this.mailSender = mailSender;
        this.emailLogRepo = emailLogRepo;
        this.from = from;
    }

    public void enviarComLog(String to, String subject, String htmlBody) {
        System.out.println("⏳ Iniciando envio de e-mail para: " + to);

        // Cria log inicial
        EmailLog log = new EmailLog();
        log.setDestinatario(to);
        log.setAssunto(subject);
        log.setCorpo(htmlBody);
        log.setEnviadoEm(LocalDateTime.now());
        log.setStatus("PENDENTE");
        emailLogRepo.save(log);

        if (!circuitBreaker.podeTentarEnvio()) {
            System.out.println("⛔ Circuito aberto. Envio bloqueado.");

            EmailLog falhaCircuito = new EmailLog();
            falhaCircuito.setDestinatario(to);
            falhaCircuito.setAssunto(subject);
            falhaCircuito.setCorpo(htmlBody);
            falhaCircuito.setEnviadoEm(LocalDateTime.now());
            falhaCircuito.setStatus("FALHA");
            falhaCircuito.setErro("Circuit breaker ativado");
            emailLogRepo.save(falhaCircuito);

            return;
        }

        try {
            System.out.println("📤 Tentativa 1 de envio...");

            sendHtmlEmail(to, subject, htmlBody);

            log.setStatus("SUCESSO");
            log.setErro(null);
            circuitBreaker.registrarSucesso();
            System.out.println("✅ E-mail enviado com sucesso.");
        } catch (Exception e1) {
            System.out.println("⚠️ Erro na tentativa 1: " + e1.getMessage());
            log.setStatus("RETRY");
            log.setErro(e1.getMessage());
            circuitBreaker.registrarFalha();

            emailLogRepo.save(log);

            // Prepara conteúdo de fallback
            String fallbackSubject = "[REENVIO] " + subject;
            String fallbackBody =
                    "<p>Este é um reenvio automático após falha na entrega inicial.</p>" +
                            htmlBody;

            try {
                Thread.sleep(5000);
                System.out.println("🔁 Tentativa 2 de envio com conteúdo de fallback...");

                sendHtmlEmail(to, fallbackSubject, fallbackBody);

                log.setStatus("SUCESSO_FALLBACK");
                log.setAssunto(fallbackSubject);
                log.setCorpo(fallbackBody);
                log.setErro(null);
                System.out.println("✅ E-mail fallback enviado com sucesso.");
                circuitBreaker.registrarSucesso();
            } catch (Exception e2) {
                System.out.println("❌ Erro na tentativa 2 (fallback): " + e2.getMessage());
                log.setStatus("FALHA");
                log.setErro(e2.getMessage());
                circuitBreaker.registrarFalha();
            }
        }

        log.setEnviadoEm(LocalDateTime.now());
        emailLogRepo.save(log);
        System.out.println("📋 Log salvo com status: " + log.getStatus());
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);  // true = corpo em HTML
        mailSender.send(message);
    }
}
