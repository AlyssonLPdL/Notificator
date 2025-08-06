package com.notificacao.notificador.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.notificacao.notificador.config.JwtProperties;

import java.security.Key;
import java.util.Date;
import java.util.*;

@Service
public class JwtService {

    private final Key key;
    private final long expirationMs;

    public JwtService(JwtProperties jwtProperties) {
        this.key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());
        this.expirationMs = jwtProperties.getExpirationMs();
    }

    public String gerarToken(String email, Set<String> roles) {
        return Jwts.builder()
                .setSubject(email)
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validarToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String obterEmailDoToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public Set<String> obterRolesDoToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Object rolesObject = claims.get("roles");

        if (rolesObject instanceof Collection<?>) {
            Collection<?> rolesCollection = (Collection<?>) rolesObject;
            Set<String> roles = new HashSet<>();
            for (Object role : rolesCollection) {
                roles.add(role.toString());
            }
            return roles;
        }
        return Collections.emptySet();
    }

}
