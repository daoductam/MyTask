package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    Page<Note> findByUserId(Long userId, Pageable pageable);
    Page<Note> findByUserIdOrderByIsPinnedDescUpdatedAtDesc(Long userId, Pageable pageable);
    Page<Note> findByUserIdAndIsPinnedOrderByUpdatedAtDesc(Long userId, Boolean isPinned, Pageable pageable);
    Page<Note> findByFolderId(Long folderId, Pageable pageable);
    Page<Note> findByUserIdAndFolderIsNullOrderByUpdatedAtDesc(Long userId, Pageable pageable);
    Page<Note> findByUserIdAndFolderIdOrderByIsPinnedDescUpdatedAtDesc(Long userId, Long folderId, Pageable pageable);
    
    // Fallback for non-paginated use-cases if any
    List<Note> findByUserIdOrderByUpdatedAtDesc(Long userId);
    void deleteByFolderId(Long folderId);
}
