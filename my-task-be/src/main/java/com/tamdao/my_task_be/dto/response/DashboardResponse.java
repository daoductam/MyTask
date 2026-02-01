package com.tamdao.my_task_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    // Tasks
    private long tasksDueToday;
    private long tasksPending;
    private long tasksCompleted;
    
    // Habits
    private long habitsCompletedToday;
    private long totalHabits;
    private int maxStreak;
    
    // Finance
    private BigDecimal totalIncomeMonth;
    private BigDecimal totalExpenseMonth;
    
    // Pomodoro
    private int focusMinutesToday;
    
    // Recent Data
    private List<TaskResponse> recentTasks;
    
    // AI Suggestions (Simple logic based)
    private List<String> suggestions;

    // Productivity Analysis
    private int productivityScore;
    private List<Integer> productivityTrend; // Last 7 days scores
}
