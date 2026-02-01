package com.tamdao.my_task_be.dto.response;

import com.tamdao.my_task_be.entity.Goal;
import com.tamdao.my_task_be.entity.Milestone;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate targetDate;
    private Integer progress;
    private String status;
    private LocalDateTime createdAt;
    private List<MilestoneResponse> milestones;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MilestoneResponse {
        private Long id;
        private String title;
        private LocalDate targetDate;
        private Boolean isCompleted;
        
        public static MilestoneResponse fromEntity(Milestone milestone) {
            return MilestoneResponse.builder()
                    .id(milestone.getId())
                    .title(milestone.getTitle())
                    .targetDate(milestone.getTargetDate())
                    .isCompleted(milestone.getIsCompleted())
                    .build();
        }
    }
    
    public static GoalResponse fromEntity(Goal goal) {
        List<MilestoneResponse> milestones = goal.getMilestones().stream()
                .map(MilestoneResponse::fromEntity)
                .collect(Collectors.toList());
                
        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .targetDate(goal.getTargetDate())
                .progress(goal.getProgress())
                .status(goal.getStatus().name())
                .createdAt(goal.getCreatedAt())
                .milestones(milestones)
                .build();
    }
}
