package com.notificacao.notificador.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String buildPasswordResetEmail(String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Redefinição de Senha</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .btn { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #777; }
                    .code { background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; }
                    .security-note { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <h2 style="color: #4F46E5; margin-bottom: 5px;">Notificator</h2>
                        <p style="margin-top: 0; color: #6B7280;">Sua solução inteligente</p>
                    </div>
                    
                    <h2 style="color: #1F2937;">Redefinição de Senha</h2>
                    
                    <p>Olá,</p>
                    
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a style="color: #FFF;" href="%s" class="btn">Redefinir Minha Senha</a>
                    </p>
                    
                    <div class="security-note">
                        <p><strong>Importante:</strong> Por questões de segurança, este link expirará em 15 minutos. Se você não solicitou a redefinição de senha, por favor ignore este e-mail ou entre em contato com nosso suporte.</p>
                    </div>
                    
                    <p>Se tiver alguma dúvida ou precisar de ajuda, nossa equipe de suporte está à disposição.</p>
                    
                    <p>Atenciosamente,<br><strong>Equipe Notificator</strong></p>
                    
                    <div class="footer">
                        <p>© 2023 Notificator. Todos os direitos reservados.</p>
                        <p>Este é um e-mail automático, por favor não responda.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(resetLink, resetLink);
    }
}
