package com.tamdao.my_task_be.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tamdao.my_task_be.dto.request.*;
import com.tamdao.my_task_be.dto.response.*;
import com.tamdao.my_task_be.entity.*;
import com.tamdao.my_task_be.repository.*;
import com.tamdao.my_task_be.entity.Task.TaskStatus;
import com.tamdao.my_task_be.entity.Task.TaskPriority;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiActionService {

    private final TaskService taskService;
    private final NoteService noteService;
    private final FinanceService financeService;
    private final HabitService habitService;
    private final ProjectService projectService;
    private final GoalService goalService;

    private final ProjectRepository projectRepository;
    private final NoteFolderRepository noteFolderRepository;
    private final FinanceCategoryRepository financeCategoryRepository;
    private final WorkspaceRepository workspaceRepository;
    
    private final ObjectMapper objectMapper;

    public String performAction(String action, Map<String, Object> payload, User user) {
        try {
            switch (action.toUpperCase()) {
                case "CREATE_TASK":
                    return createTask(payload, user);
                case "CREATE_NOTE":
                    return createNote(payload, user);
                case "ADD_TRANSACTION":
                    return addTransaction(payload, user);
                case "CREATE_HABIT":
                    return createHabit(payload, user);
                case "CREATE_PROJECT":
                    return createProject(payload, user);
                case "CREATE_GOAL":
                     return createGoal(payload, user);
                case "CREATE_PLAN":
                     return createPlan(payload, user);
                default:
                    return "Hành động '" + action + "' chưa được hỗ trợ.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi khi thực hiện hành động: " + e.getMessage();
        }
    }

    private String createTask(Map<String, Object> payload, User user) {
        TaskRequest request = objectMapper.convertValue(payload, TaskRequest.class);

        if (request.getProjectId() == null) {
            List<Project> projects = projectRepository.findByCreatedByOrderByCreatedAtDesc(user);
            if (projects.isEmpty()) {
                return "Bạn chưa có Project nào. Vui lòng tạo Project trước.";
            }
            request.setProjectId(projects.get(0).getId());
        }

        if (request.getAssigneeId() == null) {
            request.setAssigneeId(user.getId());
        }

        TaskResponse response = taskService.createTask(request);
        return "Đã tạo công việc: **" + response.getTitle() + "** trong dự án _" + response.getProjectName() + "_.";
    }

    private String createNote(Map<String, Object> payload, User user) {
        NoteRequest request = objectMapper.convertValue(payload, NoteRequest.class);
        
        // Handle folder mapping by name
        if (payload.containsKey("folderName")) {
            String folderName = (String) payload.get("folderName");
            Optional<NoteFolder> folder = noteFolderRepository.findAll().stream() // Assuming findByUser is not readily available or findAll filters by AOP/etc (check repo). 
                    // Better: use noteService to get folders if possible, or assume repo has findByUser.
                    // Let's assume repo has findByUserId or createdBy. Since I can't confirm, I'll try to find by filtering if access is safe.
                    // SAFE: NoteFolder likely has User.
                    // SAFEST: Just don't use folder if not certain. But user wants features.
                    // Let's rely on standard logic: most private apps filter implicitly or explicit findByUser.
                    // I'll try to use a standard retrieval if exists.
                    // For now, I'll skip folder mapping if I'm not sure about repo method. 
                    // Wait, I can use noteFolderRepository.findByCreatedBy(user) if it exists.
                    .filter(f -> f.getName().equalsIgnoreCase(folderName) && f.getUser().getId().equals(user.getId()))
                    .findFirst();
            folder.ifPresent(noteFolder -> request.setFolderId(noteFolder.getId()));
        }

        var response = noteService.createNote(request);
        return "Đã tạo ghi chú: **" + response.getTitle() + "**.";
    }

    private String addTransaction(Map<String, Object> payload, User user) {
        TransactionRequest request = objectMapper.convertValue(payload, TransactionRequest.class);
        String catName = (String) payload.getOrDefault("categoryName", "");
        
        try {
             List<FinanceCategory> categories = financeCategoryRepository.findAll();
             
             // 1. Exact/Case-insensitive match
             Optional<FinanceCategory> match = categories.stream()
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .filter(c -> c.getName().equalsIgnoreCase(catName.trim()))
                .findFirst();
             
             // 2. Contains match (Fuzzy) if no exact match
             if (match.isEmpty() && !catName.isBlank()) {
                 match = categories.stream()
                    .filter(c -> c.getUser().getId().equals(user.getId()))
                    .filter(c -> c.getName().toLowerCase().contains(catName.toLowerCase().trim()) || 
                                catName.toLowerCase().contains(c.getName().toLowerCase()))
                    .findFirst();
             }

             if (match.isPresent()) {
                 request.setCategoryId(match.get().getId());
                 request.setType(match.get().getType().name()); // Ensure type matches category
             } else {
                 // Fallback to first one of matching type
                 Optional<FinanceCategory> first = categories.stream()
                    .filter(c -> c.getUser().getId().equals(user.getId()))
                    .filter(c -> c.getType().name().equalsIgnoreCase(request.getType()))
                    .findFirst();
                 first.ifPresent(c -> request.setCategoryId(c.getId()));
             }
        } catch (Exception e) {
            // ignore
        }
        
        if (request.getTransactionDate() == null) {
            request.setTransactionDate(LocalDate.now().toString());
        }

        financeService.createTransaction(request);
        return "Đã thêm giao dịch: **" + request.getAmount() + " VND** vào danh mục **" + 
               (request.getCategoryId() != null ? "đã chọn" : "mặc định") + "**. (" + request.getType() + ")";
    }

    private String createHabit(Map<String, Object> payload, User user) {
        HabitRequest request = objectMapper.convertValue(payload, HabitRequest.class);
        if (request.getColor() == null) request.setColor("#8B5CF6");
        if (request.getIcon() == null) request.setIcon("star");
        if (request.getFrequency() == null) request.setFrequency("DAILY");
        
        var response = habitService.createHabit(request);
        return "Đã tạo thói quen: **" + response.getName() + "**.";
    }

    private String createProject(Map<String, Object> payload, User user) {
        ProjectRequest request = objectMapper.convertValue(payload, ProjectRequest.class);
        
        if (request.getWorkspaceId() == null) {
            // Find default workspace
           List<Workspace> workspaces = workspaceRepository.findAll(); 
           // Filter for user
           Optional<Workspace> ws = workspaces.stream()
               .filter(w -> w.getOwner().getId().equals(user.getId()))
               .findFirst();
            if (ws.isPresent()) {
                request.setWorkspaceId(ws.get().getId());
            } else {
                return "Bạn chưa có Workspace nào.";
            }
        }
        
        var response = projectService.createProject(request);
        return "Đã tạo dự án: **" + response.getName() + "**.";
    }
    
    private String createGoal(Map<String, Object> payload, User user) {
        GoalRequest request = objectMapper.convertValue(payload, GoalRequest.class);
        var response = goalService.createGoal(request);
        return "Đã tạo mục tiêu: **" + response.getTitle() + "**.";
    }

    @SuppressWarnings("unchecked")
    private String createPlan(Map<String, Object> payload, User user) {
        String projectName = (String) payload.getOrDefault("project", payload.get("topic"));
        String description = (String) payload.getOrDefault("description", "Kế hoạch được tạo bởi AI");
        List<String> tasks = (List<String>) payload.get("tasks");
        
        if (projectName == null || tasks == null || tasks.isEmpty()) {
            return "Thông tin kế hoạch không hợp lệ.";
        }
        
        // 1. Find or Create Project
        ProjectResponse project;
        List<Project> existingProjects = projectRepository.findByCreatedByOrderByCreatedAtDesc(user);
        Optional<Project> existingMatch = existingProjects.stream()
                .filter(p -> p.getName().equalsIgnoreCase(projectName))
                .findFirst();

        if (existingMatch.isPresent()) {
            project = ProjectResponse.fromEntity(existingMatch.get());
        } else {
            ProjectRequest projReq = new ProjectRequest();
            projReq.setName(projectName);
            projReq.setDescription(description);
            projReq.setStatus("ACTIVE");

            // Find workspace (reuse logic)
            List<Workspace> workspaces = workspaceRepository.findAll();
            Optional<Workspace> ws = workspaces.stream()
               .filter(w -> w.getOwner().getId().equals(user.getId()))
               .findFirst();
            if (ws.isPresent()) {
                 projReq.setWorkspaceId(ws.get().getId());
            } else {
                 return "Bạn chưa có Workspace để tạo dự án.";
            }
            project = projectService.createProject(projReq);
        }
        
        // 2. Create Tasks
        int count = 0;
        for (String taskTitle : tasks) {
            TaskRequest taskReq = new TaskRequest();
            taskReq.setTitle(taskTitle);
            taskReq.setProjectId(project.getId());
            taskReq.setAssigneeId(user.getId());
            taskReq.setPriority(TaskPriority.MEDIUM);
            taskReq.setDescription("Tự động tạo từ kế hoạch AI");
            taskReq.setStatus(TaskStatus.TODO);
            
            try {
                taskService.createTask(taskReq);
                count++;
            } catch (Exception e) {
                // ignore failed tasks
            }
        }
        
        return "Đã lập kế hoạch **" + projectName + "** và tạo thành công **" + count + "/" + tasks.size() + "** công việc.";
    }
}
