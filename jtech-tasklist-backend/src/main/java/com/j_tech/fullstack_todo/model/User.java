package com.j_tech.fullstack_todo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity @Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true)
    private String email;
    private LocalDateTime createdAt = LocalDateTime.now();
}