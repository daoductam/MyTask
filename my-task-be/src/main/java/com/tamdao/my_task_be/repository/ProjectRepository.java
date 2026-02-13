package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Project;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.entity.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Page<Project> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId, Pageable pageable);
    List<Project> findByWorkspaceOrderByCreatedAtDesc(Workspace workspace);
    Page<Project> findByCreatedByIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Project> findByCreatedByOrderByCreatedAtDesc(User createdBy);
    Page<Project> findByCreatedByAndStatusOrderByCreatedAtDesc(User createdBy, Project.ProjectStatus status, Pageable pageable);
    
    List<Project> findByCreatedByIdAndNameContainingIgnoreCase(Long userId, String query);
}
