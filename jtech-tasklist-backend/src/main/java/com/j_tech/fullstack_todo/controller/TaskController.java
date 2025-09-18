package com.j_tech.fullstack_todo.controller;

import com.j_tech.fullstack_todo.dto.TaskDTO;
import com.j_tech.fullstack_todo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService tasks;


    @PostMapping
    public TaskDTO add(@RequestParam Long listId, @RequestParam String title, @RequestParam(required = false) String description) {
        return tasks.add(listId, title, description);
    }


    @PutMapping("/{id}")
    public TaskDTO update(@PathVariable Long id,
                          @RequestParam(required = false) String title,
                          @RequestParam(required = false) String description,
                          @RequestParam(required = false) Boolean done) {
        return tasks.update(id, title, description, done);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        tasks.delete(id);
        return ResponseEntity.noContent().build();
    }
}