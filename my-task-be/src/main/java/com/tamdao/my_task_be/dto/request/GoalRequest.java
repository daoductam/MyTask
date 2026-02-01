package com.tamdao.my_task_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequest {
    
    @NotBlank(message = "Tên mục tiêu không được để trống")
    @Size(max = 200, message = "Tên mục tiêu không được quá 200 ký tự")
    private String title;
    
    @Size(max = 1000, message = "Mô tả không được quá 1000 ký tự")
    private String description;
    
    private LocalDate targetDate;
    
    // Optional milestones for creation
    private List<MilestoneRequest> milestones;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MilestoneRequest {
        @NotBlank(message = "Tên cột mốc không được để trống")
        private String title;
        private LocalDate targetDate;
    }
}
