package com.tamdao.my_task_be.dto.response;

import com.tamdao.my_task_be.entity.Workspace;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceResponse {
    private Long id;
    private String name;
    private String description;
    private String color;
    private Long ownerId;
    private String ownerName;
    private int projectCount;
    private LocalDateTime createdAt;
    
    public static WorkspaceResponse fromEntity(Workspace workspace) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .color(workspace.getColor())
                .ownerId(workspace.getOwner().getId())
                .ownerName(workspace.getOwner().getFullName())
                .projectCount(workspace.getProjects() != null ? workspace.getProjects().size() : 0)
                .createdAt(workspace.getCreatedAt())
                .build();
    }
}
