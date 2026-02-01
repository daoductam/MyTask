package com.tamdao.my_task_be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "habits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    private String frequency; // DAILY, WEEKLY, CUSTOM
    
    private String icon;
    
    @Column(length = 7)
    @Builder.Default
    private String color = "#8B5CF6";
    
    @Builder.Default
    private Integer targetPerDay = 1;
    
    private String reminderTime; // HH:mm format
    
    @Builder.Default
    private Integer currentStreak = 0;
    
    @Builder.Default
    private Integer longestStreak = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Builder.Default
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "habit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<HabitLog> logs = new HashSet<>();
}
