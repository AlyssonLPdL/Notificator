package com.notificacao.notificador.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class EmailLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String destinatario;
    private String assunto;
    @Column(columnDefinition = "TEXT")
    private String corpo;

    private LocalDateTime enviadoEm;
    private String status;
    @Column(columnDefinition = "TEXT")
    private String erro;

}
