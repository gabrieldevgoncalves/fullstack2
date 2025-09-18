package com.j_tech.fullstack_todo.controller;

import com.j_tech.fullstack_todo.dto.UserDTO;
import com.j_tech.fullstack_todo.model.User;
import com.j_tech.fullstack_todo.repository.UserRepository;
import com.j_tech.fullstack_todo.security.JwtService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record LoginResponse(String token, UserDTO user) {}

    private final UserRepository users;
    private final JwtService jwt;

    public AuthController(UserRepository users, JwtService jwt) {
        this.users = users;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest body) {
        String email = body.username();
        Optional<User> maybe = users.findByEmail(email);
        User user = maybe.orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setName(email.split("@")[0]);
            return users.save(u);
        });

        String token = jwt.generateToken(
                Map.of("name", user.getName(), "email", user.getEmail()).toString()
        );
        return ResponseEntity.ok(new LoginResponse(token, UserDTO.from(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.noContent().build();
        }
        String userId = authentication.getPrincipal().toString();
        return users.findById(Long.parseLong(userId))
                .map(u -> ResponseEntity.ok(UserDTO.from(u)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
