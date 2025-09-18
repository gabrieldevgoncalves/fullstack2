package com.j_tech.fullstack_todo.repository;

import com.j_tech.fullstack_todo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByListId(Long listId);
    boolean existsByListIdAndTitle(Long listId, String title);
}