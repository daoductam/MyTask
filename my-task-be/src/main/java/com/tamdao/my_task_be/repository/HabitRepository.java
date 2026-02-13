package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Habit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    Page<Habit> findByUserIdAndActiveOrderByCreatedAtDesc(Long userId, Boolean active, Pageable pageable);
    List<Habit> findByUserIdAndActiveTrue(Long userId);
    Page<Habit> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
