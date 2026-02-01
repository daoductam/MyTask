package com.tamdao.my_task_be.dto.request;

import com.tamdao.my_task_be.entity.Task.TaskPriority;
import com.tamdao.my_task_be.entity.Task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    
    @NotBlank(message = "Tiêu đề task không được để trống")
    @Size(max = 200, message = "Tiêu đề không được quá 200 ký tự")
    private String title;
    
    private String description;
    
    @NotNull(message = "Project ID không được để trống")
    private Long projectId;
    
    private TaskStatus status;
    
    private TaskPriority priority;
    
    private Long assigneeId;
    
    private LocalDate dueDate;
    
    private Integer estimatedHours;
    
    private Integer position;
    
    private Set<Long> labelIds;
}
