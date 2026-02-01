package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    List<HabitLog> findByHabitIdOrderByCompletedDateDesc(Long habitId);
    Optional<HabitLog> findByHabitIdAndCompletedDate(Long habitId, LocalDate date);
    
    @Query("SELECT hl FROM HabitLog hl WHERE hl.habit.id = :habitId AND hl.completedDate BETWEEN :startDate AND :endDate")
    List<HabitLog> findByHabitIdAndDateRange(@Param("habitId") Long habitId, 
                                              @Param("startDate") LocalDate startDate, 
                                              @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(hl) FROM HabitLog hl WHERE hl.habit.id = :habitId AND hl.completedDate >= :startDate")
    Long countByHabitIdSince(@Param("habitId") Long habitId, @Param("startDate") LocalDate startDate);
    
    @Query("SELECT hl FROM HabitLog hl WHERE hl.habit.user.id = :userId AND hl.completedDate = :date")
    List<HabitLog> findByUserIdAndCompletedDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    @Query("SELECT hl FROM HabitLog hl WHERE hl.habit.user.id = :userId AND hl.completedDate BETWEEN :startDate AND :endDate")
    List<HabitLog> findByUserIdAndDateRange(@Param("userId") Long userId, 
                                            @Param("startDate") LocalDate startDate, 
                                            @Param("endDate") LocalDate endDate);
}
