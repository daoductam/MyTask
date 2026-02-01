package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.dto.request.ProjectRequest;
import com.tamdao.my_task_be.dto.response.ProjectResponse;
import com.tamdao.my_task_be.entity.Project;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.entity.Workspace;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.exception.ResourceNotFoundException;
import com.tamdao.my_task_be.repository.ProjectRepository;
import com.tamdao.my_task_be.repository.TaskRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import com.tamdao.my_task_be.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }
    
    public List<ProjectResponse> getProjectsByWorkspace(Long workspaceId) {
        User user = getCurrentUser();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));
        
        if (!workspace.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập workspace này");
        }
        
        return projectRepository.findByWorkspaceOrderByCreatedAtDesc(workspace).stream()
                .map(ProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<ProjectResponse> getAllProjects(Project.ProjectStatus status) {
        User user = getCurrentUser();
        List<Project> projects = projectRepository.findByCreatedByOrderByCreatedAtDesc(user);
        
        // Sync statuses and filter
        return projects.stream()
                .peek(this::syncProjectStatus)
                .filter(p -> status == null || p.getStatus() == status)
                .map(ProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        
        User user = getCurrentUser();
        if (!project.getCreatedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập project này");
        }
        
        return ProjectResponse.fromEntity(project);
    }
    
    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        User user = getCurrentUser();
        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", request.getWorkspaceId()));
        
        if (!workspace.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền tạo project trong workspace này");
        }
        
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(Project.ProjectStatus.ACTIVE)
                .priority(request.getPriority() != null ? Project.ProjectPriority.valueOf(request.getPriority()) : Project.ProjectPriority.MEDIUM)
                .icon(request.getIcon())
                .color(request.getColor())
                .workspace(workspace)
                .createdBy(user)
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .build();
        
        project = projectRepository.save(project);
        return ProjectResponse.fromEntity(project);
    }
    
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        
        User user = getCurrentUser();
        if (!project.getCreatedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa project này");
        }
        
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setDueDate(request.getDueDate());
        if (request.getPriority() != null) {
            project.setPriority(Project.ProjectPriority.valueOf(request.getPriority()));
        }
        project.setIcon(request.getIcon());
        project.setColor(request.getColor());
        if (request.getStatus() != null) {
            project.setStatus(Project.ProjectStatus.valueOf(request.getStatus()));
        }
        
        project = projectRepository.save(project);
        return ProjectResponse.fromEntity(project);
    }
    
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        
        User user = getCurrentUser();
        if (!project.getCreatedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa project này");
        }
        
        projectRepository.delete(project);
    }
    public void syncProjectStatus(Project project) {
        long totalTasks = taskRepository.countByProject(project);
        if (totalTasks == 0) return;
        
        long undoneTasks = taskRepository.countByProjectAndStatusNot(project, com.tamdao.my_task_be.entity.Task.TaskStatus.DONE);
        
        if (undoneTasks == 0 && project.getStatus() == Project.ProjectStatus.ACTIVE) {
            project.setStatus(Project.ProjectStatus.COMPLETED);
            projectRepository.save(project);
        } else if (undoneTasks > 0 && project.getStatus() == Project.ProjectStatus.COMPLETED) {
            project.setStatus(Project.ProjectStatus.ACTIVE);
            projectRepository.save(project);
        }
    }
}
