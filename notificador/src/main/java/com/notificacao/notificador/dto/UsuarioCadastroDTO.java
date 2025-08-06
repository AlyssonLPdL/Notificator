package com.notificacao.notificador.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record UsuarioCadastroDTO (
    @NotBlank(message = "E-mail obrigadorio")
    @Email(message = "E-mail inválido")
    String email,

    @NotBlank(message = "Senha obrigatoria")
    String senha,

    Set<String> roles
) {}
