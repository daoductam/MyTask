package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.FinanceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinanceCategoryRepository extends JpaRepository<FinanceCategory, Long> {
    List<FinanceCategory> findByUserIdOrderByNameAsc(Long userId);
    List<FinanceCategory> findByUserIdAndTypeOrderByNameAsc(Long userId, FinanceCategory.CategoryType type);
    
    @Query("SELECT c FROM FinanceCategory c WHERE c.user.id = :userId OR c.user IS NULL ORDER BY c.name ASC")
    List<FinanceCategory> findByUserIdOrUserIdIsNullOrderByNameAsc(@Param("userId") Long userId);
}
