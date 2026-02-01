package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.AiChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatRepository extends JpaRepository<AiChat, Long> {
    List<AiChat> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AiChat> findByUserIdAndProjectIdOrderByCreatedAtDesc(Long userId, Long projectId);
    List<AiChat> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
