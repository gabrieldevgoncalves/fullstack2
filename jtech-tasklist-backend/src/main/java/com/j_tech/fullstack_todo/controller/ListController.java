package com.j_tech.fullstack_todo.controller;

import com.j_tech.fullstack_todo.dto.*;
import com.j_tech.fullstack_todo.service.ListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class ListController {
    private final ListService lists;


    @GetMapping
    public List<ListDTO> all(@RequestParam Long userId) {
        return lists.findAll(userId);
    }

    @PostMapping
    public ListDTO create(@RequestParam Long userId, @RequestParam String name) {
        return lists.create(userId, name);
    }

    @PutMapping("/{id}")
    public ListDTO rename(@PathVariable Long id, @RequestParam String name) {
        return lists.rename(id, name);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean force) {
        lists.delete(id, force);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/tasks")
    public List<TaskDTO> tasks(@PathVariable Long id) {
        return lists.tasks(id);
    }
}