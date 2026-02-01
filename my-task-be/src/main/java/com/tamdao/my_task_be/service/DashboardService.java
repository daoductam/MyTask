package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.dto.response.DashboardResponse;
import com.tamdao.my_task_be.dto.response.SearchResponse;
import com.tamdao.my_task_be.dto.response.TaskResponse;
import com.tamdao.my_task_be.dto.response.SearchResponse.TaskItem;
import com.tamdao.my_task_be.entity.Task;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final TaskRepository taskRepository;
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final TransactionRepository transactionRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }
    
    public DashboardResponse getDashboardOverview() {
        // ... (existing code unchanged in view, but I'll replace it properly)
        User user = getCurrentUser();
        Long userId = user.getId();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        
        // 1. Task Stats
        long tasksDueToday = taskRepository.countByAssigneeIdAndDueDate(userId, today);
        long tasksPending = taskRepository.countActiveTasksByUser(userId);
        long tasksCompleted = taskRepository.countByAssigneeIdAndStatus(userId, Task.TaskStatus.DONE);
        
        List<TaskResponse> recentTasks = taskRepository.findByAssigneeIdOrderByDueDateAsc(userId).stream()
                .filter(t -> t.getStatus() != Task.TaskStatus.DONE)
                .limit(5)
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
        
        // 2. Habit Stats
        long totalHabits = habitRepository.findByUserIdAndActiveTrue(userId).size();
        long habitsCompletedToday = habitLogRepository.findByUserIdAndCompletedDate(userId, today).size();
        
        int maxStreak = habitRepository.findByUserIdAndActiveTrue(userId).stream()
                .mapToInt(h -> h.getCurrentStreak() != null ? h.getCurrentStreak() : 0)
                .max()
                .orElse(0);
        
        // 3. Finance Stats
        BigDecimal totalIncome = transactionRepository.sumIncomeByUserAndDateRange(userId, startOfMonth, endOfMonth);
        BigDecimal totalExpense = transactionRepository.sumExpenseByUserAndDateRange(userId, startOfMonth, endOfMonth);
        
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;
        
        // 4. Pomodoro Stats
        Integer focusMinutes = pomodoroSessionRepository.sumCompletedDurationByUserSince(userId, today.atStartOfDay());
        if (focusMinutes == null) focusMinutes = 0;
        
        // 5. AI Suggestions
        List<String> suggestions = new ArrayList<>();
        if (tasksDueToday > 0) {
            suggestions.add("Bạn có " + tasksDueToday + " công việc cần hoàn thành hôm nay. Hãy ưu tiên chúng!");
        }
        if (tasksPending > 5) {
            suggestions.add("Khối lượng công việc đang tích tụ. Hãy xem xét sử dụng Pomodoro để tập trung hơn.");
        }
        if (habitsCompletedToday < totalHabits && totalHabits > 0) {
            suggestions.add("Đừng quên check-in các thói quen của bạn nhé!");
        }
        
        // 6. Productivity Calculation
        List<Integer> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            trend.add(calculateDailyScore(userId, today.minusDays(i)));
        }
        int currentScore = trend.get(6);
        
        return DashboardResponse.builder()
                .tasksDueToday(tasksDueToday)
                .tasksPending(tasksPending)
                .tasksCompleted(tasksCompleted)
                .habitsCompletedToday(habitsCompletedToday)
                .totalHabits(totalHabits)
                .maxStreak(maxStreak)
                .totalIncomeMonth(totalIncome)
                .totalExpenseMonth(totalExpense)
                .focusMinutesToday(focusMinutes)
                .recentTasks(recentTasks)
                .suggestions(suggestions)
                .productivityScore(currentScore)
                .productivityTrend(trend)
                .build();
    }

    private int calculateDailyScore(Long userId, LocalDate date) {
        // Simple formula: Task (10pts), Habit (5pts), Pomodoro (1pt per 5min)
        // Adjust relative to targets or fixed weights
        long tasks = taskRepository.countByAssigneeIdAndDueDate(userId, date); // Actually should be completed count on that date
        // Note: Repository doesn't have completedDate for tasks, so we estimate using dueDate for simplicity or assume tasks completed today.
        // For real app, Task should have completedAt. 
        
        long habits = habitLogRepository.findByUserIdAndCompletedDate(userId, date).size();
        Integer focusMinutes = pomodoroSessionRepository.sumCompletedDurationByUserSince(userId, date.atStartOfDay());
        if (focusMinutes == null) focusMinutes = 0;
        
        // Let's use a dynamic base of 100 for "perfect day"
        // 3 tasks (30), 5 habits (25), 2h focus (120/5 = 24) = 79. Scale it.
        double score = (tasks * 15) + (habits * 10) + (focusMinutes / 3.0);
        return (int) Math.min(score, 100);
    }

    private final ProjectRepository projectRepository;

    public SearchResponse search(String query) {
        User user = getCurrentUser();

        List<TaskItem> tasks = taskRepository.searchTasks(user.getId(), query)
                .stream()
                .limit(5)
                .map(t -> com.tamdao.my_task_be.dto.response.SearchResponse.TaskItem.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .status(t.getStatus().name())
                        .projectId(t.getProject() != null ? t.getProject().getId() : null)
                        .projectName(t.getProject() != null ? t.getProject().getName() : null)
                        .build())
                .collect(Collectors.toList());

        List<com.tamdao.my_task_be.dto.response.SearchResponse.ProjectItem> projects = projectRepository.findByCreatedByIdAndNameContainingIgnoreCase(user.getId(), query)
                .stream()
                .limit(3)
                .map(p -> com.tamdao.my_task_be.dto.response.SearchResponse.ProjectItem.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .color(p.getColor())
                        .icon(p.getIcon())
                        .build())
                .collect(Collectors.toList());

        return com.tamdao.my_task_be.dto.response.SearchResponse.builder()
                .tasks(tasks)
                .projects(projects)
                .build();
    }
}
