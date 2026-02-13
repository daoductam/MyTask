package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tamdao.my_task_be.entity.Project;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByProjectIdOrderByPositionAsc(Long projectId, Pageable pageable);
    List<Task> findByProjectOrderByPositionAsc(Project project);
    @Query("SELECT t FROM Task t WHERE t.assignee.id = :assigneeId AND t.project.status != 'COMPLETED' ORDER BY t.dueDate ASC")
    List<Task> findByAssigneeIdOrderByDueDateAsc(@Param("assigneeId") Long assigneeId);
    
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.status = :status ORDER BY t.position ASC")
    List<Task> findByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") Task.TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.project.createdBy.id = :userId AND t.project.status != 'COMPLETED' ORDER BY t.position ASC")
    Page<Task> findAllByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.project.createdBy.id = :userId AND t.status = :status AND t.project.status != 'COMPLETED' ORDER BY t.position ASC")
    Page<Task> findAllByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Task.TaskStatus status, Pageable pageable);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status != 'DONE' AND t.project.status != 'COMPLETED'")
    Long countActiveTasksByUser(@Param("userId") Long userId);
    
    @Query("SELECT COALESCE(MAX(t.position), 0) FROM Task t WHERE t.project = :project AND t.status = :status")
    int findMaxPositionByProjectAndStatus(@Param("project") Project project, @Param("status") Task.TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :assigneeId AND t.status = :status AND t.project.status != 'COMPLETED'")
    Long countByAssigneeIdAndStatus(@Param("assigneeId") Long assigneeId, @Param("status") Task.TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :assigneeId AND t.dueDate = :dueDate AND t.project.status != 'COMPLETED'")
    Long countByAssigneeIdAndDueDate(@Param("assigneeId") Long assigneeId, @Param("dueDate") LocalDate dueDate);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.completedAt BETWEEN :start AND :end AND t.project.status != 'COMPLETED'")
    Long countByAssigneeIdAndCompletedAtBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    Long countByProject(Project project);
    long countByProjectAndStatusNot(Project project, Task.TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.project.createdBy.id = :userId AND t.project.status != 'COMPLETED' AND LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Task> searchTasks(@Param("userId") Long userId, @Param("query") String query);
}
