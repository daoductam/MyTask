package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.NoteFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteFolderRepository extends JpaRepository<NoteFolder, Long> {
    List<NoteFolder> findByUserIdOrderByNameAsc(Long userId);
}
