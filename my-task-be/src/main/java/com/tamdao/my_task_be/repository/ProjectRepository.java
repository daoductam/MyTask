package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Project;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);
    List<Project> findByWorkspaceOrderByCreatedAtDesc(Workspace workspace);
    List<Project> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
    List<Project> findByCreatedByOrderByCreatedAtDesc(User createdBy);
    List<Project> findByCreatedByAndStatusOrderByCreatedAtDesc(User createdBy, Project.ProjectStatus status);
    
    List<Project> findByCreatedByIdAndNameContainingIgnoreCase(Long userId, String query);
}
