package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.dto.request.GoalRequest;
import com.tamdao.my_task_be.dto.response.GoalResponse;
import com.tamdao.my_task_be.entity.Goal;
import com.tamdao.my_task_be.entity.Milestone;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.exception.ResourceNotFoundException;
import com.tamdao.my_task_be.repository.GoalRepository;
import com.tamdao.my_task_be.repository.MilestoneRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {
    
    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }
    
    public List<GoalResponse> getAllGoals() {
        User user = getCurrentUser();
        return goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(GoalResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public GoalResponse getGoalById(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));
        
        User user = getCurrentUser();
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập mục tiêu này");
        }
        
        return GoalResponse.fromEntity(goal);
    }
    
    @Transactional
    public GoalResponse createGoal(GoalRequest request) {
        User user = getCurrentUser();
        
        Goal goal = Goal.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .targetDate(request.getTargetDate())
                .status(Goal.GoalStatus.IN_PROGRESS)
                .progress(0)
                .user(user)
                .milestones(new HashSet<>())
                .build();
        
        if (request.getMilestones() != null && !request.getMilestones().isEmpty()) {
            for (GoalRequest.MilestoneRequest mr : request.getMilestones()) {
                Milestone milestone = Milestone.builder()
                        .title(mr.getTitle())
                        .targetDate(mr.getTargetDate())
                        .goal(goal)
                        .isCompleted(false)
                        .build();
                goal.getMilestones().add(milestone);
            }
        }
        
        // Recalculate progress just in case
        updateGoalProgress(goal);
        
        goal = goalRepository.save(goal);
        return GoalResponse.fromEntity(goal);
    }
    
    @Transactional
    public GoalResponse updateGoal(Long id, GoalRequest request) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));
        
        User user = getCurrentUser();
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa mục tiêu này");
        }
        
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setTargetDate(request.getTargetDate());
        
        goal = goalRepository.save(goal);
        return GoalResponse.fromEntity(goal);
    }
    
    @Transactional
    public void deleteGoal(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));
        
        User user = getCurrentUser();
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa mục tiêu này");
        }
        
        goalRepository.delete(goal);
    }
    
    // Milestones logic
    @Transactional
    public GoalResponse addMilestone(Long goalId, String title) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", goalId));
                
        User user = getCurrentUser();
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa mục tiêu này");
        }
        
        Milestone milestone = Milestone.builder()
                .title(title)
                .isCompleted(false)
                .goal(goal)
                .build();
                
        goal.getMilestones().add(milestone);
        updateGoalProgress(goal);
        
        goal = goalRepository.save(goal);
        return GoalResponse.fromEntity(goal);
    }
    
    @Transactional
    public GoalResponse toggleMilestone(Long milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", milestoneId));
                
        Goal goal = milestone.getGoal();
        User user = getCurrentUser();
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa mục tiêu này");
        }
        
        milestone.setIsCompleted(!milestone.getIsCompleted());
        milestoneRepository.save(milestone);
        
        updateGoalProgress(goal);
        goalRepository.save(goal);
        
        return GoalResponse.fromEntity(goal);
    }
    
    @Transactional
    public GoalResponse deleteMilestone(Long milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", milestoneId));
                
        Goal goal = milestone.getGoal();
        User user = getCurrentUser();
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa mục tiêu này");
        }
        
        goal.getMilestones().remove(milestone);
        milestoneRepository.delete(milestone);
        
        updateGoalProgress(goal);
        goalRepository.save(goal);
        
        return GoalResponse.fromEntity(goal);
    }
    
    private void updateGoalProgress(Goal goal) {
        if (goal.getMilestones() == null || goal.getMilestones().isEmpty()) {
            goal.setProgress(0); // Or maybe manual progress if needed?
        } else {
            long total = goal.getMilestones().size();
            long completed = goal.getMilestones().stream().filter(Milestone::getIsCompleted).count();
            int progress = (int) ((completed * 100) / total);
            goal.setProgress(progress);
            
            if (progress == 100) {
                goal.setStatus(Goal.GoalStatus.COMPLETED);
            } else if (progress > 0) {
                goal.setStatus(Goal.GoalStatus.IN_PROGRESS);
            }
        }
    }
}
