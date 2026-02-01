package com.tamdao.my_task_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitRequest {
    
    @NotBlank(message = "Tên thói quen không được để trống")
    @Size(max = 100, message = "Tên thói quen không được quá 100 ký tự")
    private String name;
    
    @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
    private String description;
    
    private String icon;
    
    private String color;
    
    private String frequency; // DAILY, WEEKLY, CUSTOM
    
    private Integer targetPerDay;
    
    private String reminderTime; // HH:mm format
}
