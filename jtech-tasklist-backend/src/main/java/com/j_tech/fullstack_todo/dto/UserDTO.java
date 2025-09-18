package com.j_tech.fullstack_todo.dto;

import com.j_tech.fullstack_todo.model.User;

public record UserDTO(Long id, String name, String email) {
    public static UserDTO from(User u) {
        return new UserDTO(u.getId(), u.getName(), u.getEmail());
    }
}
