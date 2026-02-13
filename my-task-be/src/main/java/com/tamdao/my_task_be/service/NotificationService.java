package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.entity.Notification;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.ResourceNotFoundException;
import com.tamdao.my_task_be.repository.NotificationRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    public List<Notification> getMyNotifications() {
        User user = getCurrentUser();
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
    }
    
    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }
    
    @Transactional
    public void markAsRead(Long id) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        
        if (!notification.getUserId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification", id);
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
    
    @Transactional
    public void createNotification(Long userId, String title, String message, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}
