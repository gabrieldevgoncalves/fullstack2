package com.j_tech.fullstack_todo.repository;

import com.j_tech.fullstack_todo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface TodoListRepository extends JpaRepository<TodoList, Long> {
    List<TodoList> findAllByUserId(Long userId);
    boolean existsByUserIdAndName(Long userId, String name);
}