package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.entity.PomodoroSession;
import com.tamdao.my_task_be.entity.Task;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.exception.ResourceNotFoundException;
import com.tamdao.my_task_be.repository.PomodoroSessionRepository;
import com.tamdao.my_task_be.repository.TaskRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PomodoroService {
    
    private final PomodoroSessionRepository sessionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }
    
    public List<PomodoroSession> getSessionsByDate(LocalDate date) {
        User user = getCurrentUser();
        LocalDateTime startOfDay = date.atStartOfDay();
        return sessionRepository.findByUserIdSince(user.getId(), startOfDay);
    }
    
    @Transactional
    public PomodoroSession startSession(Long taskId, Integer duration) {
        User user = getCurrentUser();
        
        Task task = null;
        if (taskId != null) {
            task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        }
        
        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .task(task)
                .duration(duration != null ? duration : 25)
                .startedAt(LocalDateTime.now())
                .type(PomodoroSession.SessionType.WORK)
                .build();
        
        return sessionRepository.save(session);
    }
    
    @Transactional
    public PomodoroSession completeSession(Long sessionId) {
        PomodoroSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", sessionId));
        
        User user = getCurrentUser();
        if (!session.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền kết thúc session này");
        }
        
        session.setCompletedAt(LocalDateTime.now());
        
        return sessionRepository.save(session);
    }
    
    @Transactional
    public void cancelSession(Long sessionId) {
        PomodoroSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", sessionId));
        
        User user = getCurrentUser();
        if (!session.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền hủy session này");
        }
        
        sessionRepository.delete(session);
    }
    
    public Map<String, Object> getStats(LocalDate startDate, LocalDate endDate) {
        User user = getCurrentUser();
        LocalDateTime start = startDate.atStartOfDay();
        
        List<PomodoroSession> sessions = sessionRepository.findByUserIdSince(user.getId(), start);
        
        long completedSessions = sessions.stream()
                .filter(s -> s.getCompletedAt() != null)
                .count();
        
        int totalMinutes = sessions.stream()
                .filter(s -> s.getCompletedAt() != null)
                .mapToInt(PomodoroSession::getDuration)
                .sum();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSessions", sessions.size());
        stats.put("completedSessions", completedSessions);
        stats.put("totalMinutes", totalMinutes);
        stats.put("totalHours", totalMinutes / 60.0);
        
        return stats;
    }
}
