package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.request.ChatRequest;
import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.dto.response.ChatResponse;
import com.tamdao.my_task_be.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "API trí tuệ nhân tạo")
@SecurityRequirement(name = "bearerAuth")
public class AiController {
    
    private final AiService aiService;
    
    @PostMapping("/chat")
    @Operation(summary = "Chat với AI Assistant")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@RequestBody ChatRequest request) {
        ChatResponse response = aiService.chat(request.getMessage());
        return ResponseEntity.ok(ApiResponse.success("Phản hồi từ AI", response));
    }

    @GetMapping("/history")
    @Operation(summary = "Lấy lịch sử chat")
    public ResponseEntity<ApiResponse<List<com.tamdao.my_task_be.entity.AiMessage>>> getHistory() {
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử thành công", aiService.getHistory()));
    }
}
