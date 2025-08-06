package com.notificacao.notificador.repository;

import com.notificacao.notificador.model.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByStatus(String status);

    @Query("SELECT e FROM EmailLog e ORDER BY e.enviadoEm DESC")
    List<EmailLog> findAllOrderByDataEnvio();
}
