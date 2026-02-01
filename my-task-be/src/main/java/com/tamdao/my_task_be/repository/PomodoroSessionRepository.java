package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {
    List<PomodoroSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT p FROM PomodoroSession p WHERE p.user.id = :userId AND p.startedAt >= :startDate ORDER BY p.startedAt DESC")
    List<PomodoroSession> findByUserIdSince(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT SUM(p.duration) FROM PomodoroSession p WHERE p.user.id = :userId AND p.completedAt IS NOT NULL AND p.startedAt >= :startDate")
    Integer sumCompletedDurationByUserSince(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
}
