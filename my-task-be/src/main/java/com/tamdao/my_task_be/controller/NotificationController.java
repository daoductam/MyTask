package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.entity.Notification;
import com.tamdao.my_task_be.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications() {
        return ResponseEntity.ok(ApiResponse.success(
            "Lấy danh sách thông báo thành công",
            notificationService.getMyNotifications()
        ));
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(
            "Lấy số lượng chưa đọc thành công",
            notificationService.getUnreadCount()
        ));
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã đọc", null));
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu tất cả là đã đọc", null));
    }
}
