package com.j_tech.fullstack_todo.service;

import com.j_tech.fullstack_todo.dto.TaskDTO;
import com.j_tech.fullstack_todo.model.*;
import com.j_tech.fullstack_todo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository tasks;
    private final TodoListRepository lists;

    @Transactional
    public TaskDTO add(Long listId, String title, String description) {
        title = title.trim();
        if (title.isBlank()) throw new IllegalArgumentException("Título é obrigatório");
        if (tasks.existsByListIdAndTitle(listId, title))
            throw new IllegalStateException("Tarefa duplicada nesta lista");
        TodoList l = lists.findById(listId).orElseThrow();
        Task t = tasks.save(Task.builder().list(l).title(title).description(description).build());
        return new TaskDTO(t.getId(), t.getTitle(), t.getDescription(), t.isDone(), t.getDueDate());
    }

    @Transactional
    public TaskDTO update(Long id, String title, String description, Boolean done) {
        Task t = tasks.findById(id).orElseThrow();
        if (title != null) {
            String newTitle = title.trim();
            if (newTitle.isBlank()) throw new IllegalArgumentException("Título é obrigatório");
            if (!t.getTitle().equals(newTitle) && tasks.existsByListIdAndTitle(t.getList().getId(), newTitle))
                throw new IllegalStateException("Tarefa duplicada nesta lista");
            t.setTitle(newTitle);
        }
        if (description != null) t.setDescription(description);
        if (done != null) t.setDone(done);
        return new TaskDTO(t.getId(), t.getTitle(), t.getDescription(), t.isDone(), t.getDueDate());
    }

    public void delete(Long id) {
        tasks.deleteById(id);
    }
}