package com.j_tech.fullstack_todo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;

@Entity @Table(name = "todo_lists",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "name"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TodoList {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String name;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "list", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();
}