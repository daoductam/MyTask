package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserIdOrderByUpdatedAtDesc(Long userId);
    List<Note> findByUserIdOrderByIsPinnedDescUpdatedAtDesc(Long userId);
    List<Note> findByUserIdAndIsPinnedOrderByUpdatedAtDesc(Long userId, Boolean isPinned);
    List<Note> findByFolderIdOrderByUpdatedAtDesc(Long folderId);
    List<Note> findByUserIdAndFolderIsNullOrderByUpdatedAtDesc(Long userId);
    List<Note> findByUserIdAndFolderIdOrderByIsPinnedDescUpdatedAtDesc(Long userId, Long folderId);
}
