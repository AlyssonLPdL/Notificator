package com.notificacao.notificador.service;

import org.springframework.stereotype.Service;

@Service
public class CircuitBreakerService {

    private int falhasRecentes = 0;
    private long ultimaFalha = 0;
    private boolean circuitoAberto = false;
    private final int limiteFalhas = 3;
    private final long tempoEsperaMs = 10 * 60 * 1000; // 10 minutos

    public synchronized boolean podeTentarEnvio() {
        if (circuitoAberto && System.currentTimeMillis() - ultimaFalha < tempoEsperaMs) {
            return false;
        }

        if (circuitoAberto && System.currentTimeMillis() - ultimaFalha >= tempoEsperaMs) {
            // tempo de espera acabou, podemos resetar
            circuitoAberto = false;
            falhasRecentes = 0;
        }

        return true;
    }

    public synchronized void registrarFalha() {
        falhasRecentes++;
        ultimaFalha = System.currentTimeMillis();

        if (falhasRecentes >= limiteFalhas) {
            circuitoAberto = true;
            System.out.println("⚠️ Circuit breaker ativado. Novos envios estão bloqueados temporariamente.");
        }
    }

    public synchronized void registrarSucesso() {
        falhasRecentes = 0;
        circuitoAberto = false;
    }
}

