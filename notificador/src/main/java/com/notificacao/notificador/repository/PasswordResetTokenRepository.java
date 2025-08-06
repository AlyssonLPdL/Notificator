package com.notificacao.notificador.repository;

import com.notificacao.notificador.model.PasswordResetToken;
import com.notificacao.notificador.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUsuario(Usuario usuario);
}
