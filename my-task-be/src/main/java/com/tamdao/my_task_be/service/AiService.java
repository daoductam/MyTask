package com.tamdao.my_task_be.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tamdao.my_task_be.dto.response.ChatResponse;
import com.tamdao.my_task_be.dto.response.DashboardResponse;
import com.tamdao.my_task_be.entity.AiMessage;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.repository.AiMessageRepository;
import com.tamdao.my_task_be.repository.UserRepository;
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

    @SuppressWarnings("unchecked")
    public ChatResponse chat(String userMessage) {
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
            String responseContent = callGroqApi(messages);

            // 5. Check for Action (JSON format)
            if (responseContent.trim().startsWith("{") && responseContent.contains("\"action\"")) {
                try {
                    Map<String, Object> actionMap = objectMapper.readValue(responseContent, Map.class);
                    String action = (String) actionMap.get("action");
                    Map<String, Object> payload = (Map<String, Object>) actionMap.get("payload");
                    
                    if (action != null) {
                        String actionResult = aiActionService.performAction(action, payload, user);
                        // Save the action thought process or just the final result?
                        // Let's save the AI's intent as transparent "assistant" msg? 
                        // Or better, save the result as the assistant reply.
                        responseContent = actionResult;
                    }
                } catch (JsonProcessingException e) {
                    log.error("Failed to parse AI Action JSON: " + responseContent, e);
                    // Fallback: treat as normal text
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
    private String callGroqApi(List<Map<String, String>> messages) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.3-70b-versatile");
        requestBody.put("messages", messages);
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
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là AI Assistant của MyTask. ");
        sb.append("Bạn có khả năng thực hiện các hành động sau bằng cách trả về JSON format:\n");
        sb.append("1. Tạo công việc: { \"action\": \"CREATE_TASK\", \"payload\": { \"title\": \"...\", \"description\": \"...\", \"priority\": \"HIGH/MEDIUM/LOW\" } }\n");
        sb.append("2. Tạo ghi chú: { \"action\": \"CREATE_NOTE\", \"payload\": { \"title\": \"...\", \"content\": \"...\", \"folderName\": \"...\" (optional) } }\n");
        sb.append("3. Thêm giao dịch: { \"action\": \"ADD_TRANSACTION\", \"payload\": { \"type\": \"INCOME/EXPENSE\", \"amount\": 100000, \"categoryName\": \"...\", \"note\": \"...\" } }\n");
        sb.append("4. Tạo thói quen: { \"action\": \"CREATE_HABIT\", \"payload\": { \"name\": \"...\", \"targetPerDay\": 1 } }\n");
        sb.append("5. Tạo dự án: { \"action\": \"CREATE_PROJECT\", \"payload\": { \"name\": \"...\", \"description\": \"...\" } }\n");
        sb.append("6. Tạo mục tiêu: { \"action\": \"CREATE_GOAL\", \"payload\": { \"title\": \"...\", \"description\": \"...\", \"targetDate\": \"YYYY-MM-DD\" } }\n");

        sb.append("   - Nếu người dùng yêu cầu thực hiện hành động, hãy Trả Về Chỉ JSON Object này. Không thêm lời dẫn.\n");
        sb.append("   - Đối với 'categoryName' trong giao dịch, hãy cố gắng đoán danh mục (ví dụ: 'Ăn uống', 'Lương', 'Di chuyển').\n\n");
        
        sb.append("Thông tin ngữ cảnh hiện tại:\n");
        sb.append("- Tasks hôm nay: ").append(d.getTasksDueToday()).append("\n");
        sb.append("- Đã xong: ").append(d.getTasksCompleted()).append("\n");
        sb.append("- Streak Habits: ").append(d.getMaxStreak()).append("\n");
        sb.append("- Chi tiêu tháng: ").append(d.getTotalExpenseMonth()).append(" VND\n\n");
        
        sb.append("Quy tắc: \n");
        sb.append("- Nếu là câu hỏi thường: Trả lời ngắn gọn, thân thiện bằng tiếng Việt.\n");
        sb.append("- Nếu là lệnh hành động: Trả về JSON.\n");
        
        return sb.toString();
    }
}
