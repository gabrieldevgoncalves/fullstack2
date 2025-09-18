package com.j_tech.fullstack_todo.service;

import com.j_tech.fullstack_todo.dto.*;
import com.j_tech.fullstack_todo.model.User;
import com.j_tech.fullstack_todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;

    public LoginResponse mockLogin(LoginRequest req) {
        String email = req.email() != null ? req.email() : req.username() + "@mock.local";
        User user = users.findByEmail(email).orElseGet(() -> users.save(User.builder()
                .name(req.username()).email(email).build()));
        return new LoginResponse(user.getId(), user.getName(), UUID.randomUUID().toString());
    }
}