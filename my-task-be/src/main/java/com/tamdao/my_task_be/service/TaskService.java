package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.dto.request.TaskRequest;
import com.tamdao.my_task_be.dto.response.TaskResponse;
import com.tamdao.my_task_be.entity.Label;
import com.tamdao.my_task_be.entity.Project;
import com.tamdao.my_task_be.entity.Task;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.exception.ResourceNotFoundException;
import com.tamdao.my_task_be.repository.LabelRepository;
import com.tamdao.my_task_be.repository.ProjectRepository;
import com.tamdao.my_task_be.repository.TaskRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }
    
    public List<TaskResponse> getTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        
        User user = getCurrentUser();
        if (!project.getCreatedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập project này");
        }
        
        return taskRepository.findByProjectOrderByPositionAsc(project).stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public Map<String, List<TaskResponse>> getTasksByProjectGroupedByStatus(Long projectId) {
        List<TaskResponse> tasks = getTasksByProject(projectId);
        return tasks.stream()
                .collect(Collectors.groupingBy(TaskResponse::getStatus));
    }

    public Map<String, List<TaskResponse>> getAllTasksGroupedByStatus() {
        User user = getCurrentUser();
        List<Task> tasks = taskRepository.findAllByUserId(user.getId());
        return tasks.stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.groupingBy(TaskResponse::getStatus));
    }
    
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        
        User user = getCurrentUser();
        if (!task.getProject().getCreatedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập task này");
        }
        
        return TaskResponse.fromEntity(task);
    }
    
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        User user = getCurrentUser();
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", request.getProjectId()));
        
        if (!project.getCreatedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền tạo task trong project này");
        }
        
        // Get max position
        int maxPosition = taskRepository.findMaxPositionByProjectAndStatus(project, 
                request.getStatus() != null ? request.getStatus() : Task.TaskStatus.TODO);
        
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
        }
        
        Set<Label> labels = new HashSet<>();
        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
        }
        
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Task.TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Task.TaskPriority.MEDIUM)
                .project(project)
                .assignee(assignee)
                .dueDate(request.getDueDate())
                .estimatedHours(request.getEstimatedHours())
                .position(maxPosition + 1)
                .labels(labels)
                .build();
        
        task = taskRepository.save(task);
        checkAndUpdateProjectStatus(task.getProject());
        return TaskResponse.fromEntity(task);
    }
    
    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        
        User user = getCurrentUser();
        if (!task.getProject().getCreatedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa task này");
        }
        
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
            task.setAssignee(assignee);
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getEstimatedHours() != null) {
            task.setEstimatedHours(request.getEstimatedHours());
        }
        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }
        if (request.getLabelIds() != null) {
            Set<Label> labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
            task.setLabels(labels);
        }
        
        task = taskRepository.save(task);
        checkAndUpdateProjectStatus(task.getProject());
        return TaskResponse.fromEntity(task);
    }
    
    @Transactional
    public TaskResponse updateTaskStatus(Long id, Task.TaskStatus newStatus, Integer newPosition) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        
        User user = getCurrentUser();
        if (!task.getProject().getCreatedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa task này");
        }
        
        task.setStatus(newStatus);
        if (newPosition != null) {
            task.setPosition(newPosition);
        }
        
        task = taskRepository.save(task);
        
        // Auto update project status
        checkAndUpdateProjectStatus(task.getProject());
        
        return TaskResponse.fromEntity(task);
    }
    
    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        
        User user = getCurrentUser();
        if (!task.getProject().getCreatedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa task này");
        }
        
        Project project = task.getProject();
        taskRepository.delete(task);
        
        // Update project status after deletion
        checkAndUpdateProjectStatus(project);
    }

    private void checkAndUpdateProjectStatus(Project project) {
        Long totalTasks = taskRepository.countByProject(project);
        if (totalTasks == null || totalTasks == 0) return;
        
        long undoneTasks = taskRepository.countByProjectAndStatusNot(project, Task.TaskStatus.DONE);
        
        if (undoneTasks == 0 && project.getStatus() == Project.ProjectStatus.ACTIVE) {
            project.setStatus(Project.ProjectStatus.COMPLETED);
            projectRepository.save(project);
        } else if (undoneTasks > 0 && project.getStatus() == Project.ProjectStatus.COMPLETED) {
            project.setStatus(Project.ProjectStatus.ACTIVE);
            projectRepository.save(project);
        }
    }
}
