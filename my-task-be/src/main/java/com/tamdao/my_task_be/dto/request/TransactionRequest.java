package com.tamdao.my_task_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {
    
    @NotNull(message = "Số tiền không được để trống")
    private BigDecimal amount;
    
    @NotBlank(message = "Loại giao dịch không được để trống")
    private String type; // INCOME or EXPENSE
    
    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;
    
    @Size(max = 500, message = "Ghi chú không được quá 500 ký tự")
    private String note;
    
    private String transactionDate; // YYYY-MM-DD format
}
