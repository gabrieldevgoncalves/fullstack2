package com.j_tech.fullstack_todo.service;

import com.j_tech.fullstack_todo.dto.*;
import com.j_tech.fullstack_todo.model.*;
import com.j_tech.fullstack_todo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ListService {
    private final TodoListRepository lists;
    private final UserRepository users;
    private final TaskRepository tasks;


    public List<TaskDTO> tasks(Long listId) {
        return tasks.findAllByListId(listId)
                .stream()
                .map(t -> new TaskDTO(
                        t.getId(),
                        t.getTitle(),
                        t.getDescription(),
                        t.isDone(),
                        t.getDueDate()))
                .toList();
    }

    public List<ListDTO> findAll(Long userId) {
        return lists.findAllByUserId(userId).stream().map(l ->
                new ListDTO(l.getId(), l.getName(), l.getTasks() != null ? l.getTasks().size() : 0, l.getUpdatedAt())
        ).toList();
    }

    @Transactional
    public ListDTO create(Long userId, String name) {
        name = name.trim();
        if (name.isBlank()) throw new IllegalArgumentException("Nome da lista é obrigatório");
        if (lists.existsByUserIdAndName(userId, name)) throw new IllegalStateException("Lista já existe");
        User user = users.findById(userId).orElseThrow();
        TodoList l = TodoList.builder().user(user).name(name).build();
        l = lists.save(l);
        return new ListDTO(l.getId(), l.getName(), 0, l.getUpdatedAt());
    }

    @Transactional
    public ListDTO rename(Long id, String newName) {
        TodoList l = lists.findById(id).orElseThrow();
        newName = newName.trim();
        if (newName.isBlank()) throw new IllegalArgumentException("Nome da lista é obrigatório");
        if (lists.existsByUserIdAndName(l.getUser().getId(), newName))
            throw new IllegalStateException("Lista já existe");
        l.setName(newName);
        l.setUpdatedAt(LocalDateTime.now());
        return new ListDTO(l.getId(), l.getName(), l.getTasks() != null ? l.getTasks().size() : 0, l.getUpdatedAt());
    }

    @Transactional
    public void delete(Long id, boolean force) {
        TodoList l = lists.findById(id).orElseThrow();
        if (!force && l.getTasks() != null && !l.getTasks().isEmpty()) ;
    }
}