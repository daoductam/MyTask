package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tamdao.my_task_be.entity.Project;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectIdOrderByPositionAsc(Long projectId);
    List<Task> findByProjectOrderByPositionAsc(Project project);
    List<Task> findByAssigneeIdOrderByDueDateAsc(Long assigneeId);
    
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.status = :status ORDER BY t.position ASC")
    List<Task> findByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") Task.TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.project.createdBy.id = :userId ORDER BY t.position ASC")
    List<Task> findAllByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status != 'DONE'")
    Long countActiveTasksByUser(@Param("userId") Long userId);
    
    @Query("SELECT COALESCE(MAX(t.position), 0) FROM Task t WHERE t.project = :project AND t.status = :status")
    int findMaxPositionByProjectAndStatus(@Param("project") Project project, @Param("status") Task.TaskStatus status);

    Long countByAssigneeIdAndStatus(Long assigneeId, Task.TaskStatus status);
    Long countByAssigneeIdAndDueDate(Long assigneeId, LocalDate dueDate);
    
    Long countByProject(Project project);
    long countByProjectAndStatusNot(Project project, Task.TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.project.createdBy.id = :userId AND LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Task> searchTasks(@Param("userId") Long userId, @Param("query") String query);
}
