package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.request.GoalRequest;
import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.dto.response.GoalResponse;
import com.tamdao.my_task_be.service.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@Tag(name = "Goal", description = "API quản lý Mục tiêu")
@SecurityRequirement(name = "bearerAuth")
public class GoalController {
    
    private final GoalService goalService;
    
    @GetMapping
    @Operation(summary = "Lấy tất cả Mục tiêu của user")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getAllGoals() {
        List<GoalResponse> goals = goalService.getAllGoals();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách mục tiêu thành công", goals));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy Mục tiêu theo ID")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoalById(@PathVariable Long id) {
        GoalResponse goal = goalService.getGoalById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy mục tiêu thành công", goal));
    }
    
    @PostMapping
    @Operation(summary = "Tạo Mục tiêu mới")
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(@Valid @RequestBody GoalRequest request) {
        GoalResponse goal = goalService.createGoal(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo mục tiêu thành công", goal));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Mục tiêu")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @PathVariable Long id, 
            @Valid @RequestBody GoalRequest request) {
        GoalResponse goal = goalService.updateGoal(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mục tiêu thành công", goal));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa Mục tiêu")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mục tiêu thành công", null));
    }
    
    // Milestone Endpoints
    @PostMapping("/{id}/milestones")
    @Operation(summary = "Thêm cột mốc mới")
    public ResponseEntity<ApiResponse<GoalResponse>> addMilestone(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        GoalResponse goal = goalService.addMilestone(id, request.get("title"));
        return ResponseEntity.ok(ApiResponse.success("Thêm cột mốc thành công", goal));
    }
    
    @PatchMapping("/milestones/{id}/toggle")
    @Operation(summary = "Đánh dấu hoàn thành/chưa hoàn thành cột mốc")
    public ResponseEntity<ApiResponse<GoalResponse>> toggleMilestone(@PathVariable Long id) {
        GoalResponse goal = goalService.toggleMilestone(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật cột mốc thành công", goal));
    }
    
    @DeleteMapping("/milestones/{id}")
    @Operation(summary = "Xóa cột mốc")
    public ResponseEntity<ApiResponse<GoalResponse>> deleteMilestone(@PathVariable Long id) {
        GoalResponse goal = goalService.deleteMilestone(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa cột mốc thành công", goal));
    }
}
