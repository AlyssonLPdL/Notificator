 Notificador de E-mail com Fallback

Este projeto implementa um sistema de notificações por e-mail com fallback, pensado para garantir que mensagens críticas sejam entregues mesmo em caso de falhas temporárias.

 🕰️ Tempo gasto:
 18 horas e 30 minutos

 🚀 Funcionalidades

Autenticação simples via JWT para segurança mínima.
 Envio de e-mail utilizando SMTP configurado por variáveis de ambiente.
 Retry automático (1 reenvio após 5 segundos) para tentativas de entrega.
 Registro de histórico de todas as tentativas, com status de sucesso ou erro.
 Reenvio manual de notificações com falha via endpoint administrativo.
 Feedback claro no frontend para ações de usuário.

Adições alem do exigido:
Verificação de senha forte.
Pagina de Informações.
Log-out.

 🛠️ Tecnologias

 Backend: Spring Boot, Spring Security, JavaMailSender, Spring Retry
 Banco de Dados: H2
 Frontend: React, Fetch API, Vite

 📋 Pré-requisitos

 Java 17+
 Maven ou Gradle
 Node.js 20+ (para o frontend)

 ⚙️ Configuração

1. Renomeie o arquivo `application.yml.example` para `application.yml`.
2. Defina as variáveis de ambiente ou preencha diretamente em `application.yml`:

 No Linux ou Mac

export SMTP_USER="notificatorproject@gmail.com"
export SMTP_PASS="bmxinqbkfcqvknkm"

 No Windows (PowerShell)

setx SMTP_USER "notificatorproject@gmail.com"
setx SMTP_PASS "bmxinqbkfcqvknkm"

 🚀 Como executar

 Backend

```bash
 na raiz do backend
mvn spring-boot:run
 ou
./gradlew bootRun
```

 Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend ficará disponível em `http://localhost:5173` e consumirá o backend em `http://localhost:8080`.

@ALPdL."# Notificator" 
