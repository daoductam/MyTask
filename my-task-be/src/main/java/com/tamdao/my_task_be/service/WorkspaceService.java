package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.dto.request.WorkspaceRequest;
import com.tamdao.my_task_be.dto.response.WorkspaceResponse;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.entity.Workspace;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.exception.ResourceNotFoundException;
import com.tamdao.my_task_be.repository.UserRepository;
import com.tamdao.my_task_be.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }
    
    public List<WorkspaceResponse> getAllWorkspaces() {
        User user = getCurrentUser();
        return workspaceRepository.findByOwnerOrderByCreatedAtDesc(user).stream()
                .map(WorkspaceResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public WorkspaceResponse getWorkspaceById(Long id) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
        
        // Check permission
        User user = getCurrentUser();
        if (!workspace.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập workspace này");
        }
        
        return WorkspaceResponse.fromEntity(workspace);
    }
    
    @Transactional
    public WorkspaceResponse createWorkspace(WorkspaceRequest request) {
        User user = getCurrentUser();
        
        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .description(request.getDescription())
                .color(request.getColor() != null ? request.getColor() : "#6366F1")
                .owner(user)
                .build();
        
        workspace = workspaceRepository.save(workspace);
        return WorkspaceResponse.fromEntity(workspace);
    }
    
    @Transactional
    public WorkspaceResponse updateWorkspace(Long id, WorkspaceRequest request) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
        
        // Check permission
        User user = getCurrentUser();
        if (!workspace.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa workspace này");
        }
        
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        if (request.getColor() != null) {
            workspace.setColor(request.getColor());
        }
        
        workspace = workspaceRepository.save(workspace);
        return WorkspaceResponse.fromEntity(workspace);
    }
    
    @Transactional
    public void deleteWorkspace(Long id) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
        
        // Check permission
        User user = getCurrentUser();
        if (!workspace.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa workspace này");
        }
        
        workspaceRepository.delete(workspace);
    }
}
