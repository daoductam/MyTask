package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserIdAndActiveOrderByCreatedAtDesc(Long userId, Boolean active);
    List<Habit> findByUserIdAndActiveTrue(Long userId);
    List<Habit> findByUserIdOrderByCreatedAtDesc(Long userId);
}
