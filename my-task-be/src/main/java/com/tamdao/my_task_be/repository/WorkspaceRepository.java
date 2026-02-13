package com.tamdao.my_task_be.repository;

import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.entity.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    Page<Workspace> findByOwnerIdOrderByCreatedAtDesc(Long ownerId, Pageable pageable);
    List<Workspace> findByOwnerOrderByCreatedAtDesc(User owner);
}
