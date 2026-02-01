package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.dto.response.DashboardResponse;
import com.tamdao.my_task_be.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "API tổng hợp Dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/overview")
    @Operation(summary = "Lấy dữ liệu tổng quan Dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getOverview() {
        DashboardResponse data = dashboardService.getDashboardOverview();
        return ResponseEntity.ok(ApiResponse.success("Lấy dữ liệu dashboard thành công", data));
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm toàn cục Tasks và Projects")
    public ResponseEntity<ApiResponse<com.tamdao.my_task_be.dto.response.SearchResponse>> search(@RequestParam String query) {
        com.tamdao.my_task_be.dto.response.SearchResponse results = dashboardService.search(query);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm thành công", results));
    }
}
