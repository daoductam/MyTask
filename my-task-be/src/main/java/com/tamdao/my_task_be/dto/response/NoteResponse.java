package com.tamdao.my_task_be.dto.response;

import com.tamdao.my_task_be.entity.Note;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {
    private Long id;
    private String title;
    private String content;
    private String contentPreview;
    private Long folderId;
    private String folderName;
    private Boolean isPinned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static NoteResponse fromEntity(Note note) {
        String preview = note.getContent() != null && note.getContent().length() > 100
                ? note.getContent().substring(0, 100) + "..."
                : note.getContent();
        
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .contentPreview(preview)
                .folderId(note.getFolder() != null ? note.getFolder().getId() : null)
                .folderName(note.getFolder() != null ? note.getFolder().getName() : null)
                .isPinned(note.getIsPinned())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
