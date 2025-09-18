package com.j_tech.fullstack_todo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${security.jwt.secret:ZmFrZS1qd3Qtc2VjcmV0LWZvci10ZXN0aW5nLWF0LWxlYXN0LTMyLWNoYXJz}")
    private String secret;

    @Value("${security.jwt.expiration-seconds:86400}")
    private long expirationSeconds;

    private SecretKey key;

    @PostConstruct
    void init() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secret);
            this.key = Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
    }

    public String generateToken(String subject) {
        return generateToken(subject, Collections.emptyMap());
    }

    public String generateToken(String subject, Map<String, Object> claims) {
        Instant now = Instant.now();
        Date iat = Date.from(now);
        Date exp = Date.from(now.plusSeconds(expirationSeconds));

        return Jwts.builder()
                .subject(subject)
                .claims(claims)
                .issuedAt(iat)
                .expiration(exp)
                .signWith(key, Jwts.SIG.HS256) // <- 0.12.x
                .compact();
    }

    public String extractUsername(String token) {
        return parse(token).getPayload().getSubject();
    }

    public boolean isTokenValid(String token, String expectedSubject) {
        try {
            Jws<Claims> jws = parse(token);
            Claims payload = jws.getPayload();
            Date exp = payload.getExpiration();
            return expectedSubject.equals(payload.getSubject()) && exp.after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }

    public Jws<Claims> parseAndValidate(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }
}
