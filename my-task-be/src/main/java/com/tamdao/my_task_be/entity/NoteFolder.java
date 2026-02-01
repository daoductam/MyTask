package com.tamdao.my_task_be.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "note_folders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteFolder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private NoteFolder parent;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;
    
    @OneToMany(mappedBy = "parent")
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<NoteFolder> children = new HashSet<>();
    
    @OneToMany(mappedBy = "folder")
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<Note> notes = new HashSet<>();
}
