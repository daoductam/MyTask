package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.request.ProjectRequest;
import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.dto.response.PageResponse;
import com.tamdao.my_task_be.dto.response.ProjectResponse;
import com.tamdao.my_task_be.entity.Project;
import com.tamdao.my_task_be.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Project", description = "API quản lý Project")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {
    
    private final ProjectService projectService;
    
    @GetMapping
    @Operation(summary = "Lấy tất cả Project của user")
    public ResponseEntity<ApiResponse<PageResponse<ProjectResponse>>> getAllProjects(
            @RequestParam(required = false) Project.ProjectStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ProjectResponse> projects = projectService.getAllProjects(status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách project thành công", projects));
    }
    
    @GetMapping("/workspace/{workspaceId}")
    @Operation(summary = "Lấy Project theo Workspace ID")
    public ResponseEntity<ApiResponse<PageResponse<ProjectResponse>>> getProjectsByWorkspace(
            @PathVariable Long workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ProjectResponse> projects = projectService.getProjectsByWorkspace(workspaceId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách project thành công", projects));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy Project theo ID")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Long id) {
        ProjectResponse project = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy project thành công", project));
    }
    
    @PostMapping
    @Operation(summary = "Tạo Project mới")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse project = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo project thành công", project));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Project")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long id, 
            @Valid @RequestBody ProjectRequest request) {
        ProjectResponse project = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật project thành công", project));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa Project")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa project thành công", null));
    }
}
