package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.request.WorkspaceRequest;
import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.dto.response.WorkspaceResponse;
import com.tamdao.my_task_be.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
@Tag(name = "Workspace", description = "API quản lý Workspace")
@SecurityRequirement(name = "bearerAuth")
public class WorkspaceController {
    
    private final WorkspaceService workspaceService;
    
    @GetMapping
    @Operation(summary = "Lấy tất cả Workspace của user")
    public ResponseEntity<ApiResponse<List<WorkspaceResponse>>> getAllWorkspaces() {
        List<WorkspaceResponse> workspaces = workspaceService.getAllWorkspaces();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách workspace thành công", workspaces));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy Workspace theo ID")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspaceById(@PathVariable Long id) {
        WorkspaceResponse workspace = workspaceService.getWorkspaceById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy workspace thành công", workspace));
    }
    
    @PostMapping
    @Operation(summary = "Tạo Workspace mới")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(@Valid @RequestBody WorkspaceRequest request) {
        WorkspaceResponse workspace = workspaceService.createWorkspace(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo workspace thành công", workspace));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Workspace")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> updateWorkspace(
            @PathVariable Long id, 
            @Valid @RequestBody WorkspaceRequest request) {
        WorkspaceResponse workspace = workspaceService.updateWorkspace(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật workspace thành công", workspace));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa Workspace")
    public ResponseEntity<ApiResponse<Void>> deleteWorkspace(@PathVariable Long id) {
        workspaceService.deleteWorkspace(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa workspace thành công", null));
    }
}
