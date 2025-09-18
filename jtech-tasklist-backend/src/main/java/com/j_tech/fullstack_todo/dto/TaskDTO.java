package com.j_tech.fullstack_todo.dto;

import java.time.*;

public record TaskDTO(Long id, String title, String description, boolean done, LocalDate dueDate) {
}