package com.tamdao.my_task_be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_chats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;
    
    @Column(columnDefinition = "TEXT")
    private String response;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action_type")
    private ActionType actionType;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum ActionType {
        CREATE_TASK, ANALYZE_PRIORITY, GENERATE_REPORT, ANSWER_QUESTION, GENERAL
    }
}
