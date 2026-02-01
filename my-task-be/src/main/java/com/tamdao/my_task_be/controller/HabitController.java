package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.request.HabitRequest;
import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.dto.response.HabitResponse;
import com.tamdao.my_task_be.entity.HabitLog;
import com.tamdao.my_task_be.service.HabitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
@Tag(name = "Habit", description = "API quản lý Thói quen")
@SecurityRequirement(name = "bearerAuth")
public class HabitController {
    
    private final HabitService habitService;
    
    @GetMapping
    @Operation(summary = "Lấy tất cả Habits của user (có thể lọc theo ngày)")
    public ResponseEntity<ApiResponse<List<HabitResponse>>> getAllHabits(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<HabitResponse> habits = habitService.getAllHabits(date != null ? date : LocalDate.now());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách habit thành công", habits));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy Habit theo ID")
    public ResponseEntity<ApiResponse<HabitResponse>> getHabitById(@PathVariable Long id) {
        HabitResponse habit = habitService.getHabitById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy habit thành công", habit));
    }
    
    @PostMapping
    @Operation(summary = "Tạo Habit mới")
    public ResponseEntity<ApiResponse<HabitResponse>> createHabit(@Valid @RequestBody HabitRequest request) {
        HabitResponse habit = habitService.createHabit(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo habit thành công", habit));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Habit")
    public ResponseEntity<ApiResponse<HabitResponse>> updateHabit(
            @PathVariable Long id, 
            @Valid @RequestBody HabitRequest request) {
        HabitResponse habit = habitService.updateHabit(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật habit thành công", habit));
    }
    
    @PostMapping("/{id}/checkin")
    @Operation(summary = "Check-in Habit (đánh dấu hoàn thành)")
    public ResponseEntity<ApiResponse<HabitResponse>> checkIn(@PathVariable Long id) {
        HabitResponse habit = habitService.checkIn(id);
        return ResponseEntity.ok(ApiResponse.success("Check-in thành công", habit));
    }
    
    @GetMapping("/{id}/logs")
    @Operation(summary = "Lấy lịch sử check-in của Habit")
    public ResponseEntity<ApiResponse<List<HabitLog>>> getHabitLogs(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<HabitLog> logs = habitService.getHabitLogs(id, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Lấy logs thành công", logs));
    }
    
    @GetMapping("/logs")
    @Operation(summary = "Lấy toàn bộ lịch sử check-in của user trong khoảng thời gian")
    public ResponseEntity<ApiResponse<List<HabitLog>>> getGlobalStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<HabitLog> logs = habitService.getGlobalHabitLogs(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Lấy logs tổng hợp thành công", logs));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa Habit (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteHabit(@PathVariable Long id) {
        habitService.deleteHabit(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa habit thành công", null));
    }
}
