package com.j_tech.fullstack_todo.dto;

import java.time.*;

public record ListDTO(Long id, String name, int taskCount, LocalDateTime updatedAt) {
}