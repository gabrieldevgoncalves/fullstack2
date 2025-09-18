package com.j_tech.fullstack_todo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity @Table(name = "tasks",
        uniqueConstraints = @UniqueConstraint(columnNames = {"list_id", "title"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "list_id")
    private TodoList list;

    @Column(nullable = false, length = 140)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    private boolean done;
    private LocalDate dueDate;
    private LocalDateTime createdAt = LocalDateTime.now();
}