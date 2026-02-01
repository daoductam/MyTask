package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.AiMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {
    List<AiMessage> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<AiMessage> findByUserIdOrderByCreatedAtAsc(Long userId); // For full history if needed, but risky
    void deleteByUserId(Long userId);
}
