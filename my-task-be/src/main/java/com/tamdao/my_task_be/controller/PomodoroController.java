package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.entity.PomodoroSession;
import com.tamdao.my_task_be.service.PomodoroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pomodoro")
@RequiredArgsConstructor
@Tag(name = "Pomodoro", description = "API quản lý Pomodoro Timer")
@SecurityRequirement(name = "bearerAuth")
public class PomodoroController {
    
    private final PomodoroService pomodoroService;
    
    @GetMapping("/sessions")
    @Operation(summary = "Lấy sessions theo ngày")
    public ResponseEntity<ApiResponse<List<PomodoroSession>>> getSessions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<PomodoroSession> sessions = pomodoroService.getSessionsByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Lấy sessions thành công", sessions));
    }
    
    @PostMapping("/sessions/start")
    @Operation(summary = "Bắt đầu Pomodoro session")
    public ResponseEntity<ApiResponse<PomodoroSession>> startSession(
            @RequestBody Map<String, Object> request) {
        Long taskId = request.get("taskId") != null 
                ? Long.valueOf(request.get("taskId").toString()) 
                : null;
        Integer duration = request.get("duration") != null 
                ? Integer.valueOf(request.get("duration").toString()) 
                : 25;
        
        PomodoroSession session = pomodoroService.startSession(taskId, duration);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bắt đầu Pomodoro", session));
    }
    
    @PostMapping("/sessions/{id}/complete")
    @Operation(summary = "Hoàn thành Pomodoro session")
    public ResponseEntity<ApiResponse<PomodoroSession>> completeSession(@PathVariable Long id) {
        PomodoroSession session = pomodoroService.completeSession(id);
        return ResponseEntity.ok(ApiResponse.success("Hoàn thành Pomodoro", session));
    }
    
    @DeleteMapping("/sessions/{id}")
    @Operation(summary = "Hủy/Xóa Pomodoro session")
    public ResponseEntity<ApiResponse<Void>> cancelSession(@PathVariable Long id) {
        pomodoroService.cancelSession(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa Pomodoro session", null));
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê Pomodoro")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> stats = pomodoroService.getStats(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê thành công", stats));
    }
}
