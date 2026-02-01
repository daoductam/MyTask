package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.request.TaskRequest;
import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.dto.response.TaskResponse;
import com.tamdao.my_task_be.entity.Task;
import com.tamdao.my_task_be.service.TaskService;
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
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Task", description = "API quản lý Task")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {
    
    private final TaskService taskService;
    
    @GetMapping("/project/{projectId}")
    @Operation(summary = "Lấy tất cả Task theo Project ID")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByProject(@PathVariable Long projectId) {
        List<TaskResponse> tasks = taskService.getTasksByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách task thành công", tasks));
    }
    
    @GetMapping("/project/{projectId}/kanban")
    @Operation(summary = "Lấy Task theo Project ID, grouped by status (cho Kanban)")
    public ResponseEntity<ApiResponse<Map<String, List<TaskResponse>>>> getTasksForKanban(@PathVariable Long projectId) {
        Map<String, List<TaskResponse>> tasks = taskService.getTasksByProjectGroupedByStatus(projectId);
        return ResponseEntity.ok(ApiResponse.success("Lấy Kanban tasks thành công", tasks));
    }

    @GetMapping("/kanban")
    @Operation(summary = "Lấy tất cả Task của user, grouped by status (cho Kanban)")
    public ResponseEntity<ApiResponse<Map<String, List<TaskResponse>>>> getAllTasksForKanban() {
        Map<String, List<TaskResponse>> tasks = taskService.getAllTasksGroupedByStatus();
        return ResponseEntity.ok(ApiResponse.success("Lấy tất cả Kanban tasks thành công", tasks));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy Task theo ID")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable Long id) {
        TaskResponse task = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy task thành công", task));
    }
    
    @PostMapping
    @Operation(summary = "Tạo Task mới")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo task thành công", task));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Task")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id, 
            @Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.updateTask(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật task thành công", task));
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật Status Task (cho Kanban drag & drop)")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam Task.TaskStatus status,
            @RequestParam(required = false) Integer position) {
        TaskResponse task = taskService.updateTaskStatus(id, status, position);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật status thành công", task));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa Task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa task thành công", null));
    }
}
