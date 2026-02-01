package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.request.NoteRequest;
import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.dto.response.NoteResponse;
import com.tamdao.my_task_be.entity.NoteFolder;
import com.tamdao.my_task_be.service.NoteService;
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
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Tag(name = "Note", description = "API quản lý Ghi chú")
@SecurityRequirement(name = "bearerAuth")
public class NoteController {
    
    private final NoteService noteService;
    
    @GetMapping
    @Operation(summary = "Lấy tất cả Notes của user")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getAllNotes() {
        List<NoteResponse> notes = noteService.getAllNotes();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách notes thành công", notes));
    }
    
    @GetMapping("/folder/{folderId}")
    @Operation(summary = "Lấy Notes theo Folder")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getNotesByFolder(
            @PathVariable(required = false) Long folderId) {
        List<NoteResponse> notes = noteService.getNotesByFolder(folderId);
        return ResponseEntity.ok(ApiResponse.success("Lấy notes thành công", notes));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy Note theo ID")
    public ResponseEntity<ApiResponse<NoteResponse>> getNoteById(@PathVariable Long id) {
        NoteResponse note = noteService.getNoteById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy note thành công", note));
    }
    
    @PostMapping
    @Operation(summary = "Tạo Note mới")
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(@Valid @RequestBody NoteRequest request) {
        NoteResponse note = noteService.createNote(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo note thành công", note));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Note")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @PathVariable Long id, 
            @Valid @RequestBody NoteRequest request) {
        NoteResponse note = noteService.updateNote(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật note thành công", note));
    }
    
    @PatchMapping("/{id}/pin")
    @Operation(summary = "Toggle Pin/Unpin Note")
    public ResponseEntity<ApiResponse<NoteResponse>> togglePin(@PathVariable Long id) {
        NoteResponse note = noteService.togglePin(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ghim thành công", note));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa Note")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa note thành công", null));
    }
    
    // Folders
    @GetMapping("/folders")
    @Operation(summary = "Lấy tất cả Folders")
    public ResponseEntity<ApiResponse<List<NoteFolder>>> getAllFolders() {
        List<NoteFolder> folders = noteService.getAllFolders();
        return ResponseEntity.ok(ApiResponse.success("Lấy folders thành công", folders));
    }
    
    @PostMapping("/folders")
    @Operation(summary = "Tạo Folder mới")
    public ResponseEntity<ApiResponse<NoteFolder>> createFolder(@RequestBody Map<String, String> request) {
        NoteFolder folder = noteService.createFolder(request.get("name"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo folder thành công", folder));
    }
    
    @DeleteMapping("/folders/{id}")
    @Operation(summary = "Xóa Folder")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(@PathVariable Long id) {
        noteService.deleteFolder(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa folder thành công", null));
    }
}
