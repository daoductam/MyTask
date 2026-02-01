package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Goal> findByUserIdAndStatusOrderByTargetDateAsc(Long userId, Goal.GoalStatus status);
}
