package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Goal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    Page<Goal> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Goal> findByUserIdAndStatusOrderByTargetDateAsc(Long userId, Goal.GoalStatus status);
}
