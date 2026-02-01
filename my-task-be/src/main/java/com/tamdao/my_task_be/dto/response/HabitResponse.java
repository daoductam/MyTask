package com.tamdao.my_task_be.dto.response;

import com.tamdao.my_task_be.entity.Habit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String color;
    private String frequency;
    private Integer targetPerDay;
    private String reminderTime;
    private Integer currentStreak;
    private Integer longestStreak;
    private Boolean isCompletedToday;
    private Integer completedCountToday;
    private LocalDateTime createdAt;
    
    public static HabitResponse fromEntity(Habit habit, boolean completedToday, int completedCountToday) {
        return HabitResponse.builder()
                .id(habit.getId())
                .name(habit.getName())
                .description(habit.getDescription())
                .icon(habit.getIcon())
                .color(habit.getColor())
                .frequency(habit.getFrequency())
                .targetPerDay(habit.getTargetPerDay())
                .reminderTime(habit.getReminderTime())
                .currentStreak(habit.getCurrentStreak())
                .longestStreak(habit.getLongestStreak())
                .isCompletedToday(completedToday)
                .completedCountToday(completedCountToday)
                .createdAt(habit.getCreatedAt())
                .build();
    }
}
