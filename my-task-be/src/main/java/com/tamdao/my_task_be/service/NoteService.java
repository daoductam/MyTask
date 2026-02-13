package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.dto.request.NoteRequest;
import com.tamdao.my_task_be.dto.response.NoteResponse;
import com.tamdao.my_task_be.dto.response.PageResponse;
import com.tamdao.my_task_be.entity.Note;
import com.tamdao.my_task_be.entity.NoteFolder;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.exception.ResourceNotFoundException;
import com.tamdao.my_task_be.repository.NoteFolderRepository;
import com.tamdao.my_task_be.repository.NoteRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {
    
    private final NoteRepository noteRepository;
    private final NoteFolderRepository noteFolderRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }
    
    public PageResponse<NoteResponse> getAllNotes(int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Note> notePage = noteRepository.findByUserIdOrderByIsPinnedDescUpdatedAtDesc(user.getId(), pageable);
        
        List<NoteResponse> content = notePage.getContent().stream()
                .map(NoteResponse::fromEntity)
                .collect(Collectors.toList());
                
        return PageResponse.<NoteResponse>builder()
                .content(content)
                .pageNumber(notePage.getNumber())
                .pageSize(notePage.getSize())
                .totalElements(notePage.getTotalElements())
                .totalPages(notePage.getTotalPages())
                .last(notePage.isLast())
                .build();
    }
    
    public PageResponse<NoteResponse> getNotesByFolder(Long folderId, int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        
        if (folderId != null) {
            NoteFolder folder = noteFolderRepository.findById(folderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", folderId));
            
            if (!folder.getUser().getId().equals(user.getId())) {
                throw new BadRequestException("Bạn không có quyền truy cập folder này");
            }
        }
        
        Page<Note> notePage = noteRepository.findByUserIdAndFolderIdOrderByIsPinnedDescUpdatedAtDesc(user.getId(), folderId, pageable);
        
        List<NoteResponse> content = notePage.getContent().stream()
                .map(NoteResponse::fromEntity)
                .collect(Collectors.toList());
                
        return PageResponse.<NoteResponse>builder()
                .content(content)
                .pageNumber(notePage.getNumber())
                .pageSize(notePage.getSize())
                .totalElements(notePage.getTotalElements())
                .totalPages(notePage.getTotalPages())
                .last(notePage.isLast())
                .build();
    }
    
    public NoteResponse getNoteById(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", id));
        
        User user = getCurrentUser();
        if (!note.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập note này");
        }
        
        return NoteResponse.fromEntity(note);
    }
    
    @Transactional
    public NoteResponse createNote(NoteRequest request) {
        User user = getCurrentUser();
        
        NoteFolder folder = null;
        if (request.getFolderId() != null) {
            folder = noteFolderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", request.getFolderId()));
            
            if (!folder.getUser().getId().equals(user.getId())) {
                throw new BadRequestException("Bạn không có quyền sử dụng folder này");
            }
        }
        
        Note note = Note.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .folder(folder)
                .isPinned(request.getIsPinned() != null ? request.getIsPinned() : false)
                .user(user)
                .build();
        
        note = noteRepository.save(note);
        return NoteResponse.fromEntity(note);
    }
    
    @Transactional
    public NoteResponse updateNote(Long id, NoteRequest request) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", id));
        
        User user = getCurrentUser();
        if (!note.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa note này");
        }
        
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        
        if (request.getFolderId() != null) {
            NoteFolder folder = noteFolderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", request.getFolderId()));
            note.setFolder(folder);
        } else {
            note.setFolder(null);
        }
        
        if (request.getIsPinned() != null) {
            note.setIsPinned(request.getIsPinned());
        }
        
        note = noteRepository.save(note);
        return NoteResponse.fromEntity(note);
    }
    
    @Transactional
    public NoteResponse togglePin(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", id));
        
        User user = getCurrentUser();
        if (!note.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa note này");
        }
        
        note.setIsPinned(!note.getIsPinned());
        note = noteRepository.save(note);
        return NoteResponse.fromEntity(note);
    }
    
    @Transactional
    public void deleteNote(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", id));
        
        User user = getCurrentUser();
        if (!note.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa note này");
        }
        
        noteRepository.delete(note);
    }
    
    // Note Folders
    public List<NoteFolder> getAllFolders() {
        User user = getCurrentUser();
        return noteFolderRepository.findByUserIdOrderByNameAsc(user.getId());
    }
    
    @Transactional
    public NoteFolder createFolder(String name) {
        User user = getCurrentUser();
        
        NoteFolder folder = NoteFolder.builder()
                .name(name)
                .user(user)
                .build();
        
        return noteFolderRepository.save(folder);
    }
    
    @Transactional
    public void deleteFolder(Long id) {
        NoteFolder folder = noteFolderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", id));
        
        User user = getCurrentUser();
        if (!folder.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa folder này");
        }
        
        // Delete all notes in this folder
        noteRepository.deleteByFolderId(id);
        
        noteFolderRepository.delete(folder);
    }
}
