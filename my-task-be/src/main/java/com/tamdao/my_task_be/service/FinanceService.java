package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.dto.request.TransactionRequest;
import com.tamdao.my_task_be.dto.response.PageResponse;
import com.tamdao.my_task_be.dto.response.TransactionResponse;
import com.tamdao.my_task_be.entity.FinanceCategory;
import com.tamdao.my_task_be.entity.Transaction;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.exception.ResourceNotFoundException;
import com.tamdao.my_task_be.repository.FinanceCategoryRepository;
import com.tamdao.my_task_be.repository.TransactionRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceService {
    
    private final TransactionRepository transactionRepository;
    private final FinanceCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }
    
    // Transactions
    public PageResponse<TransactionResponse> getTransactions(LocalDate startDate, LocalDate endDate, int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> txPage = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                user.getId(), startDate, endDate, pageable);
                
        List<TransactionResponse> content = txPage.getContent().stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
                
        return PageResponse.<TransactionResponse>builder()
                .content(content)
                .pageNumber(txPage.getNumber())
                .pageSize(txPage.getSize())
                .totalElements(txPage.getTotalElements())
                .totalPages(txPage.getTotalPages())
                .last(txPage.isLast())
                .build();
    }
    
    public PageResponse<TransactionResponse> getTransactionsForMonth(int year, int month, int page, int size) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        return getTransactions(start, end, page, size);
    }
    
    public TransactionResponse getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        
        User user = getCurrentUser();
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập giao dịch này");
        }
        
        return TransactionResponse.fromEntity(transaction);
    }
    
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = getCurrentUser();
        
        FinanceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        
        Transaction.TransactionType type = Transaction.TransactionType.valueOf(request.getType());
        LocalDate transactionDate = request.getTransactionDate() != null 
                ? LocalDate.parse(request.getTransactionDate())
                : LocalDate.now();
        
        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .type(type)
                .category(category)
                .note(request.getNote())
                .transactionDate(transactionDate)
                .user(user)
                .build();
        
        transaction = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(transaction);
    }
    
    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        
        User user = getCurrentUser();
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa giao dịch này");
        }
        
        FinanceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        
        transaction.setAmount(request.getAmount());
        transaction.setType(Transaction.TransactionType.valueOf(request.getType()));
        transaction.setCategory(category);
        transaction.setNote(request.getNote());
        
        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(LocalDate.parse(request.getTransactionDate()));
        }
        
        transaction = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(transaction);
    }
    
    @Transactional
    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        
        User user = getCurrentUser();
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa giao dịch này");
        }
        
        transactionRepository.delete(transaction);
    }
    
    // Summary
    public Map<String, Object> getMonthlySummary(int year, int month) {
        User user = getCurrentUser();
        
        // Current Month
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        
        List<Transaction> currentTransactions = transactionRepository
                .findByUserIdAndTransactionDateBetween(user.getId(), start, end);
        
        BigDecimal income = currentTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal expense = currentTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Previous Month for comparison
        YearMonth prevYearMonth = yearMonth.minusMonths(1);
        LocalDate prevStart = prevYearMonth.atDay(1);
        LocalDate prevEnd = prevYearMonth.atEndOfMonth();
        
        List<Transaction> prevTransactions = transactionRepository
                .findByUserIdAndTransactionDateBetween(user.getId(), prevStart, prevEnd);
        
        BigDecimal prevIncome = prevTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal prevExpense = prevTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal currentBalance = income.subtract(expense);
        BigDecimal prevBalance = prevIncome.subtract(prevExpense);
        
        double growth = 0;
        if (prevBalance.compareTo(BigDecimal.ZERO) != 0) {
            growth = currentBalance.subtract(prevBalance)
                    .divide(prevBalance.abs(), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100))
                    .doubleValue();
        } else if (currentBalance.compareTo(BigDecimal.ZERO) != 0) {
            growth = 100.0;
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("income", income);
        summary.put("expense", expense);
        summary.put("balance", currentBalance);
        summary.put("growth", growth);
        summary.put("transactionCount", currentTransactions.size());
        
        return summary;
    }
    
    public PageResponse<TransactionResponse> getTransactionsByDateRange(String startDateStr, String endDateStr, int page, int size) {
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        return getTransactions(startDate, endDate, page, size);
    }
    
    public Map<String, Object> getCategoryStatistics(String startDateStr, String endDateStr) {
        User user = getCurrentUser();
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionDateBetween(user.getId(), startDate, endDate);
        
        // Group by category for expenses
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        
        for (Transaction tx : transactions) {
            String categoryName = tx.getCategory().getName();
            if (tx.getType() == Transaction.TransactionType.EXPENSE) {
                expenseByCategory.merge(categoryName, tx.getAmount(), BigDecimal::add);
            } else {
                incomeByCategory.merge(categoryName, tx.getAmount(), BigDecimal::add);
            }
        }
        
        // Convert to list of maps for easier frontend consumption
        List<Map<String, Object>> expenseData = expenseByCategory.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", entry.getKey());
                    item.put("value", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());
                
        List<Map<String, Object>> incomeData = incomeByCategory.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", entry.getKey());
                    item.put("value", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());
        
        BigDecimal totalExpense = expenseByCategory.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalIncome = incomeByCategory.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, Object> result = new HashMap<>();
        result.put("expenseByCategory", expenseData);
        result.put("incomeByCategory", incomeData);
        result.put("totalExpense", totalExpense);
        result.put("totalIncome", totalIncome);
        
        return result;
    }
    
    // Categories
    @Transactional
    public List<FinanceCategory> getAllCategories() {
        User user = getCurrentUser();
        List<FinanceCategory> categories = categoryRepository.findByUserIdOrUserIdIsNullOrderByNameAsc(user.getId());
        
        if (categories.isEmpty()) {
            return createDefaultCategories(user);
        }
        
        return categories;
    }

    private List<FinanceCategory> createDefaultCategories(User user) {
        String[][] defaults = {
            {"Ăn uống", "restaurant", "EXPENSE"},
            {"Di chuyển", "directions_car", "EXPENSE"},
            {"Mua sắm", "shopping_cart", "EXPENSE"},
            {"Hóa đơn", "receipt_long", "EXPENSE"},
            {"Giải trí", "sports_esports", "EXPENSE"},
            {"Sức khỏe", "medical_services", "EXPENSE"},
            {"Lương", "savings", "INCOME"},
            {"Thưởng", "redeem", "INCOME"},
            {"Đầu tư", "trending_up", "INCOME"}
        };

        java.util.List<FinanceCategory> toSave = new java.util.ArrayList<>();
        for (String[] def : defaults) {
            toSave.add(FinanceCategory.builder()
                .name(def[0])
                .icon(def[1])
                .type(FinanceCategory.CategoryType.valueOf(def[2]))
                .user(user)
                .build());
        }
        return categoryRepository.saveAll(toSave);
    }
    
    @Transactional
    public FinanceCategory createCategory(String name, String icon, String type) {
        User user = getCurrentUser();
        
        FinanceCategory category = FinanceCategory.builder()
                .name(name)
                .icon(icon != null ? icon : "💰")
                .type(FinanceCategory.CategoryType.valueOf(type))
                .user(user)
                .build();
        
        return categoryRepository.save(category);
    }
}
