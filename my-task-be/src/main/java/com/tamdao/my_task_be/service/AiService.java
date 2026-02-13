package com.tamdao.my_task_be.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tamdao.my_task_be.dto.response.ChatResponse;
import com.tamdao.my_task_be.dto.response.DashboardResponse;
import com.tamdao.my_task_be.entity.AiMessage;
import com.tamdao.my_task_be.entity.FinanceCategory;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.repository.AiMessageRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import com.tamdao.my_task_be.service.FinanceService;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final DashboardService dashboardService;
    private final AiActionService aiActionService;
    private final AiMessageRepository aiMessageRepository;
    private final UserRepository userRepository;
    private final FinanceService financeService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    @Value("${app.groq.api-key:}")
    private String apiKey;

    @Value("${app.groq.api-url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    public List<AiMessage> getHistory() {
        User user = getCurrentUser();
        return aiMessageRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 50));
    }
    
    public String getInsights() {
        try {
            DashboardResponse d = dashboardService.getDashboardOverview();
            String context = buildSystemContext(d);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", context));
            messages.add(Map.of("role", "user", "content", 
                "Hãy phân tích nhanh tình hình hiện tại của tôi (trong 1 câu ngắn) và đưa ra 1 lời khuyên hoặc một lời chào động viên quan trọng nhất. Không cần chào hỏi rườm rà."));
                
            return callGroqApi(messages, null);
        } catch (Exception e) {
            log.error("Error generating insights", e);
            return "Chào mừng bạn trở lại! Hãy kiểm tra công việc hôm nay nhé.";
        }
    }

    @SuppressWarnings("unchecked")
    public ChatResponse chat(String userMessage) {
        return chatWithImage(userMessage, null);
    }

    public ChatResponse chatWithImage(String userMessage, String base64Image) {
        if (apiKey == null || apiKey.isEmpty()) {
            return ChatResponse.builder()
                    .reply("Vui lòng cấu hình Groq API Key.")
                    .build();
        }

        User user = getCurrentUser();
        
        // 1. Save User Message
        saveMessage(user, "user", userMessage);

        try {
            // 2. Build Context (Dashboard + History)
            DashboardResponse dashboard = dashboardService.getDashboardOverview();
            String systemContext = buildSystemContext(dashboard);
            List<AiMessage> history = aiMessageRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 20)); // Last 20 msgs
            Collections.reverse(history); // Oldest first

            // 3. Build Messages Payload
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemContext));
            for (AiMessage msg : history) {
                messages.add(Map.of("role", "assistant".equals(msg.getRole()) ? "assistant" : "user", "content", msg.getContent()));
            }
            // Note: userMessage is already in history (saved above), so it's included in the loop? 
            // Yes, findByUserId...Desc includes the one we just saved.
            // Wait, if we fetch form DB, it's there. Just need to make sure order is correct.
            
            // 4. Call Groq
            String responseContent = callGroqApi(messages, base64Image);

            // 5. Check for Action (JSON format)
            String cleanResponse = responseContent.trim();
            // Remove Markdown code blocks if present
            if (cleanResponse.startsWith("```")) {
                cleanResponse = cleanResponse.replaceAll("^```json", "").replaceAll("^```", "").replaceAll("```$", "").trim();
            }
            // Find first { and last } to handle surrounding text
            int firstBrace = cleanResponse.indexOf("{");
            int lastBrace = cleanResponse.lastIndexOf("}");
            
            if (firstBrace >= 0 && lastBrace > firstBrace) {
                String potentialJson = cleanResponse.substring(firstBrace, lastBrace + 1);
                if (potentialJson.contains("\"action\"")) {
                    try {
                        Map<String, Object> actionMap = objectMapper.readValue(potentialJson, Map.class);
                        String action = (String) actionMap.get("action");
                        Map<String, Object> payload = (Map<String, Object>) actionMap.get("payload");
                        
                        if (action != null) {
                            String actionResult = aiActionService.performAction(action, payload, user);
                            responseContent = actionResult;
                        }
                    } catch (JsonProcessingException e) {
                        log.error("Failed to parse AI Action JSON: " + potentialJson, e);
                        // Fallback: treat as normal text
                    }
                }
            }

            // 6. Save Assistant Response
            saveMessage(user, "assistant", responseContent);

            return ChatResponse.builder().reply(responseContent).build();

        } catch (Exception e) {
            log.error("Error calling AI API", e);
            return ChatResponse.builder().reply("Lỗi kết nối AI: " + e.getMessage()).build();
        }
    }

    private void saveMessage(User user, String role, String content) {
        AiMessage msg = AiMessage.builder()
                .user(user)
                .role(role)
                .content(content)
                .build();
        aiMessageRepository.save(msg);
    }
    
    @SuppressWarnings("unchecked")
    private String callGroqApi(List<Map<String, String>> messages, String base64Image) {
        Map<String, Object> requestBody = new HashMap<>();
        
        // Use Vision model if image is present
        if (base64Image != null && !base64Image.isEmpty()) {
            requestBody.put("model", "meta-llama/llama-4-scout-17b-16e-instruct");
            
            // Transform the LAST user message to include image
            // Note: This logic is simple; strictly we should construct 'messages' differently from the start
            // But here we can just swap the last "content" string for a complex object
            // Actually, Groq expects 'content' to be array if text+image
            
            List<Object> finalMessages = new ArrayList<>();
            for (int i = 0; i < messages.size(); i++) {
                if (i == messages.size() - 1 && "user".equals(messages.get(i).get("role"))) {
                     // This is the formatted user prompt
                     Map<String, Object> complexMsg = new HashMap<>();
                     complexMsg.put("role", "user");
                     List<Map<String, Object>> contentList = new ArrayList<>();
                     String originalText = (String) messages.get(i).get("content");
                     String enhancedText = originalText + "\n\n[SYSTEM IMPORTANT: If this image is a receipt or invoice, analyze it and return ONLY the JSON for 'ADD_TRANSACTION'. Extract amount, guess category (e.g., Food, Transport), and use 'EXPENSE'. Do not explain, just return JSON.]";
                     
                     contentList.add(Map.of("type", "text", "text", enhancedText));
                     contentList.add(Map.of("type", "image_url", "image_url", Map.of("url", base64Image)));
                     complexMsg.put("content", contentList);
                     finalMessages.add(complexMsg);
                } else {
                     finalMessages.add(messages.get(i));
                }
            }
            requestBody.put("messages", finalMessages);
        } else {
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", messages);
        }

        requestBody.put("temperature", 0.7);
        // Force JSON mode if needed? No, user prompt is enough for now.

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
        
        try {
            Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing Groq response", e);
        }
    }



    private String buildSystemContext(DashboardResponse d) {
        User user = getCurrentUser();
        List<FinanceCategory> categories = financeService.getAllCategories();
        
        String incomeCats = categories.stream()
                .filter(c -> c.getType() == FinanceCategory.CategoryType.INCOME)
                .map(FinanceCategory::getName)
                .collect(Collectors.joining(", "));
                
        String expenseCats = categories.stream()
                .filter(c -> c.getType() == FinanceCategory.CategoryType.EXPENSE)
                .map(FinanceCategory::getName)
                .collect(Collectors.joining(", "));

        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là trợ lý ảo chính thức của ứng dụng LifeDash (MyTask). ");
        sb.append("Nhiệm vụ của bạn là hỗ trợ người dùng quản lý công việc, tài chính, thói quen và ghi chú một cách hiệu quả.\n\n");
        
        sb.append("GIỚI HẠN PHẠM VI (RẤT QUAN TRỌNG):\n");
        sb.append("- Bạn CHỈ hỗ trợ các chủ đề liên quan đến: Công việc (Tasks/Projects), Tài chính (Thu nhập/Chi tiêu), Thói quen (Habits), Ghi chú (Notes), và cách sử dụng ứng dụng LifeDash.\n");
        sb.append("- Nếu người dùng hỏi các chủ đề ngoài phạm vi trên (ví dụ: nấu ăn, code, chính trị, giải trí không liên quan...), hãy LỊCH SỰ TỪ CHỐI và nhắc nhở rằng bạn sinh ra để giúp họ quản lý cuộc sống tại LifeDash.\n\n");

        sb.append("KHẢ NĂNG HÀNH ĐỘNG (Trả về DUY NHẤT JSON format khi cần thực hiện lệnh):\n");
        sb.append("1. Tạo công việc: { \"action\": \"CREATE_TASK\", \"payload\": { \"title\": \"...\", \"description\": \"...\", \"priority\": \"HIGH/MEDIUM/LOW\", \"projectId\": ... } }\n");
        sb.append("   - Nếu người dùng yêu cầu TẠO NHIỀU công việc cùng lúc (ví dụ: 'tạo 10 task...', 'lập kế hoạch...'), bạn PHẢI dùng action 'CREATE_PLAN' bên dưới.\n");
        sb.append("2. Tạo ghi chú: { \"action\": \"CREATE_NOTE\", \"payload\": { \"title\": \"...\", \"content\": \"...\", \"folderName\": \"...\" } }\n");
        sb.append("3. Thêm giao dịch tài chính: { \"action\": \"ADD_TRANSACTION\", \"payload\": { \"type\": \"INCOME/EXPENSE\", \"amount\": ..., \"categoryName\": \"...\", \"note\": \"...\" } }\n");
        sb.append("   - PHÂN BIỆT THU/CHI: 'Nộp tiền', 'Trả tiền', 'Mua', 'Chi' -> EXPENSE. 'Lĩnh lương', 'Được thưởng', 'Nhận tiền' -> INCOME.\n");
        sb.append("   - Danh mục THU NHẬP sẵn có: [").append(incomeCats).append("]\n");
        sb.append("   - Danh mục CHI TIÊU sẵn có: [").append(expenseCats).append("]\n");
        sb.append("   - QUY TẮC: Bạn PHẢI chọn 'categoryName' khớp chính xác với danh sách trên. (VD: 'Nộp học phí' hãy chọn danh mục 'Hóa đơn' hoặc 'Mua sắm' nếu có).\n");
        sb.append("4. Lập kế hoạch HOẶC Tạo nhiều công việc: { \"action\": \"CREATE_PLAN\", \"payload\": { \"topic\": \"...\", \"project\": \"Tên dự án\", \"tasks\": [\"Task 1\", \"Task 2\", \"Task 3\"...] } }\n");
        sb.append("   - Dùng khi người dùng muốn thực hiện một mục tiêu lớn HOẶC yêu cầu tạo nhiều task một lúc (kể cả vào dự án đã có sẵn). Hãy liệt kê đầy đủ các task được yêu cầu vào mảng 'tasks'.\n");
        sb.append("5. Các hành động khác: CREATE_HABIT, CREATE_PROJECT, CREATE_GOAL.\n\n");

        sb.append("NGỮ CẢNH NGƯỜI DÙNG HIỆN TẠI:\n");
        sb.append("- Tên: ").append(user.getFullName()).append("\n");
        sb.append("- Việc hôm nay: ").append(d.getTasksRemainingToday()).append("\n");
        sb.append("- Chi tiêu tháng: ").append(d.getTotalExpenseMonth()).append(" VND\n");
        sb.append("- Thu nhập tháng: ").append(d.getTotalIncomeMonth()).append(" VND\n\n");
        
        sb.append("QUY TẮC PHẢN HỒI:\n");
        sb.append("- Nếu là lệnh: Chỉ trả về JSON object.\n");
        sb.append("- Nếu là câu hỏi (trong phạm vi): Trả lời ngắn gọn, thông minh bằng tiếng Việt.\n");
        
        return sb.toString();
    }
}
