package com.tamdao.my_task_be.dto.response;

import com.tamdao.my_task_be.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private String status;
    private String priority;
    private String icon;
    private String color;
    private Long workspaceId;
    private String workspaceName;
    private Long createdById;
    private String createdByName;
    private LocalDate startDate;
    private LocalDate dueDate;
    private int taskCount;
    private int completedTaskCount;
    private double progress;
    private LocalDateTime createdAt;
    
    public static ProjectResponse fromEntity(Project project) {
        int taskCount = project.getTasks() != null ? project.getTasks().size() : 0;
        long completedCount = project.getTasks() != null 
                ? project.getTasks().stream()
                    .filter(t -> "DONE".equals(t.getStatus().name()))
                    .count()
                : 0;
        
        double progress = taskCount > 0 ? (double) completedCount * 100 / taskCount : 0;
        
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus().name())
                .priority(project.getPriority() != null ? project.getPriority().name() : Project.ProjectPriority.MEDIUM.name())
                .icon(project.getIcon())
                .color(project.getColor())
                .workspaceId(project.getWorkspace().getId())
                .workspaceName(project.getWorkspace().getName())
                .createdById(project.getCreatedBy().getId())
                .createdByName(project.getCreatedBy().getFullName())
                .startDate(project.getStartDate())
                .dueDate(project.getDueDate())
                .taskCount(taskCount)
                .completedTaskCount((int) completedCount)
                .progress(progress)
                .createdAt(project.getCreatedAt())
                .build();
    }
}
