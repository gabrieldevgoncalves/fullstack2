package com.j_tech.fullstack_todo.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank String username, @NotBlank String password, String email) {
}