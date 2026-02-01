package com.tamdao.my_task_be.controller;

import com.tamdao.my_task_be.dto.request.TransactionRequest;
import com.tamdao.my_task_be.dto.response.ApiResponse;
import com.tamdao.my_task_be.dto.response.TransactionResponse;
import com.tamdao.my_task_be.entity.FinanceCategory;
import com.tamdao.my_task_be.service.FinanceService;
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
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@Tag(name = "Finance", description = "API quản lý Tài chính")
@SecurityRequirement(name = "bearerAuth")
public class FinanceController {
    
    private final FinanceService financeService;
    
    // Transactions
    @GetMapping("/transactions")
    @Operation(summary = "Lấy giao dịch theo tháng")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @RequestParam int year,
            @RequestParam int month) {
        List<TransactionResponse> transactions = financeService.getTransactionsForMonth(year, month);
        return ResponseEntity.ok(ApiResponse.success("Lấy giao dịch thành công", transactions));
    }
    
    @GetMapping("/transactions/{id}")
    @Operation(summary = "Lấy giao dịch theo ID")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(@PathVariable Long id) {
        TransactionResponse transaction = financeService.getTransactionById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy giao dịch thành công", transaction));
    }
    
    @PostMapping("/transactions")
    @Operation(summary = "Tạo giao dịch mới")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse transaction = financeService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo giao dịch thành công", transaction));
    }
    
    @PutMapping("/transactions/{id}")
    @Operation(summary = "Cập nhật giao dịch")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse transaction = financeService.updateTransaction(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật giao dịch thành công", transaction));
    }
    
    @DeleteMapping("/transactions/{id}")
    @Operation(summary = "Xóa giao dịch")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        financeService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa giao dịch thành công", null));
    }
    
    // Summary
    @GetMapping("/summary")
    @Operation(summary = "Lấy tổng hợp tài chính theo tháng")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month) {
        Map<String, Object> summary = financeService.getMonthlySummary(year, month);
        return ResponseEntity.ok(ApiResponse.success("Lấy tổng hợp thành công", summary));
    }
    
    // Categories
    @GetMapping("/categories")
    @Operation(summary = "Lấy tất cả danh mục")
    public ResponseEntity<ApiResponse<List<FinanceCategory>>> getAllCategories() {
        List<FinanceCategory> categories = financeService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục thành công", categories));
    }
    
    @PostMapping("/categories")
    @Operation(summary = "Tạo danh mục mới")
    public ResponseEntity<ApiResponse<FinanceCategory>> createCategory(@RequestBody Map<String, String> request) {
        FinanceCategory category = financeService.createCategory(
                request.get("name"),
                request.get("icon"),
                request.get("type")
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo danh mục thành công", category));
    }
}
