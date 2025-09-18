package com.j_tech.fullstack_todo;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenTest {
    @Test
    void gen() {
        var enc = new BCryptPasswordEncoder();
        System.out.println(enc.encode("123"));
    }
}