package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.dto.request.HabitRequest;
import com.tamdao.my_task_be.dto.response.HabitResponse;
import com.tamdao.my_task_be.dto.response.PageResponse;
import com.tamdao.my_task_be.entity.Habit;
import com.tamdao.my_task_be.entity.HabitLog;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.exception.ResourceNotFoundException;
import com.tamdao.my_task_be.repository.HabitLogRepository;
import com.tamdao.my_task_be.repository.HabitRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitService {
    
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }
    
    public PageResponse<HabitResponse> getAllHabits(LocalDate date, int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Habit> habitPage = habitRepository.findByUserIdAndActiveOrderByCreatedAtDesc(user.getId(), true, pageable);
        
        List<HabitResponse> content = habitPage.getContent().stream()
                .map(habit -> {
                    Optional<HabitLog> dateLog = habitLogRepository.findByHabitIdAndCompletedDate(habit.getId(), date);
                    int count = dateLog.map(HabitLog::getCount).orElse(0);
                    boolean completed = count >= (habit.getTargetPerDay() != null ? habit.getTargetPerDay() : 1);
                    return HabitResponse.fromEntity(habit, completed, count);
                })
                .collect(Collectors.toList());
                
        return PageResponse.<HabitResponse>builder()
                .content(content)
                .pageNumber(habitPage.getNumber())
                .pageSize(habitPage.getSize())
                .totalElements(habitPage.getTotalElements())
                .totalPages(habitPage.getTotalPages())
                .last(habitPage.isLast())
                .build();
    }
    
    public HabitResponse getHabitById(Long id) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", id));
        
        User user = getCurrentUser();
        if (!habit.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập habit này");
        }
        
        LocalDate today = LocalDate.now();
        Optional<HabitLog> todayLog = habitLogRepository.findByHabitIdAndCompletedDate(id, today);
        int count = todayLog.map(HabitLog::getCount).orElse(0);
        boolean completed = count >= (habit.getTargetPerDay() != null ? habit.getTargetPerDay() : 1);
        
        return HabitResponse.fromEntity(habit, completed, count);
    }
    
    @Transactional
    public HabitResponse createHabit(HabitRequest request) {
        User user = getCurrentUser();
        
        Habit habit = Habit.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon() != null ? request.getIcon() : "🎯")
                .color(request.getColor() != null ? request.getColor() : "#8B5CF6")
                .frequency(request.getFrequency() != null ? request.getFrequency() : "DAILY")
                .targetPerDay(request.getTargetPerDay() != null ? request.getTargetPerDay() : 1)
                .reminderTime(request.getReminderTime())
                .user(user)
                .build();
        
        habit = habitRepository.save(habit);
        return HabitResponse.fromEntity(habit, false, 0);
    }
    
    @Transactional
    public HabitResponse updateHabit(Long id, HabitRequest request) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", id));
        
        User user = getCurrentUser();
        if (!habit.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa habit này");
        }
        
        habit.setName(request.getName());
        habit.setDescription(request.getDescription());
        if (request.getIcon() != null) habit.setIcon(request.getIcon());
        if (request.getColor() != null) habit.setColor(request.getColor());
        if (request.getFrequency() != null) habit.setFrequency(request.getFrequency());
        if (request.getTargetPerDay() != null) habit.setTargetPerDay(request.getTargetPerDay());
        habit.setReminderTime(request.getReminderTime());
        
        habit = habitRepository.save(habit);
        
        LocalDate today = LocalDate.now();
        Optional<HabitLog> todayLog = habitLogRepository.findByHabitIdAndCompletedDate(id, today);
        int count = todayLog.map(HabitLog::getCount).orElse(0);
        boolean completed = count >= habit.getTargetPerDay();
        
        return HabitResponse.fromEntity(habit, completed, count);
    }
    
    @Transactional
    public HabitResponse checkIn(Long habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));
        
        User user = getCurrentUser();
        if (!habit.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền check-in habit này");
        }
        
        LocalDate today = LocalDate.now();
        Optional<HabitLog> existingLog = habitLogRepository.findByHabitIdAndCompletedDate(habitId, today);
        
        HabitLog log;
        if (existingLog.isPresent()) {
            log = existingLog.get();
            log.setCount(log.getCount() + 1);
        } else {
            log = HabitLog.builder()
                    .habit(habit)
                    .completedDate(today)
                    .count(1)
                    .build();
            
            // Update streak
            LocalDate yesterday = today.minusDays(1);
            Optional<HabitLog> yesterdayLog = habitLogRepository.findByHabitIdAndCompletedDate(habitId, yesterday);
            
            if (yesterdayLog.isPresent()) {
                habit.setCurrentStreak(habit.getCurrentStreak() + 1);
            } else {
                habit.setCurrentStreak(1);
            }
            
            if (habit.getCurrentStreak() > habit.getLongestStreak()) {
                habit.setLongestStreak(habit.getCurrentStreak());
            }
            habitRepository.save(habit);
        }
        
        habitLogRepository.save(log);
        
        boolean completed = log.getCount() >= habit.getTargetPerDay();
        return HabitResponse.fromEntity(habit, completed, log.getCount());
    }
    
    @Transactional
    public void deleteHabit(Long id) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", id));
        
        User user = getCurrentUser();
        if (!habit.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa habit này");
        }
        
        habit.setActive(false);
        habitRepository.save(habit);
    }
    
    public List<HabitLog> getHabitLogs(Long habitId, LocalDate startDate, LocalDate endDate) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));
        
        User user = getCurrentUser();
        if (!habit.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền xem habit này");
        }
        
        return habitLogRepository.findByHabitIdAndDateRange(habitId, startDate, endDate);
    }

    public List<HabitLog> getGlobalHabitLogs(LocalDate startDate, LocalDate endDate) {
        User user = getCurrentUser();
        return habitLogRepository.findByUserIdAndDateRange(user.getId(), startDate, endDate);
    }
}
