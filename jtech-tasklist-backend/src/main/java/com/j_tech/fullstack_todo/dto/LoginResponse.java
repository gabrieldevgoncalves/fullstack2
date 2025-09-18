package com.j_tech.fullstack_todo.dto;

public record LoginResponse(Long userId, String displayName, String sessionToken) {
}