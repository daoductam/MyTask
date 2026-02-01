# MyTask - Personal Life Management App

## Phase 1: Foundation Setup ✅
- [x] Backend Setup
  - [x] Configure pom.xml với dependencies (Spring Boot 3.2.x)
  - [x] Setup database connection (MySQL)
  - [x] Configure Spring Security với JWT
  - [x] Setup CORS configuration
- [x] Frontend Setup
  - [x] Initialize React app với Vite
  - [x] Setup project structure
  - [x] Configure routing và state management (Redux)
  - [x] Setup TailwindCSS và Axios

## Phase 2: Core Features
- [ ] Authentication Module
  - [x] User registration/login API
  - [x] JWT token management
  - [x] Login/Register UI pages
- [ ] Workspace & Project Management
  - [ ] CRUD Workspace/Project API
  - [ ] Workspace/Project UI components
- [ ] Task Management (Jira/ClickUp style)
  - [ ] CRUD Task API với priority, status, labels
  - [ ] Kanban board view
  - [ ] List view
  - [ ] Task detail modal

## Phase 3: Personal Life Features ✅
- [x] Habit Tracker
  - [x] CRUD Habits API
  - [x] Daily check-in UI
  - [x] Streak và progress charts
- [x] Finance Tracker
  - [x] Categories và Transactions API
  - [x] Budget management
  - [x] Monthly reports
- [x] Goals Management
  - [x] Goals với milestones API
  - [x] Progress visualization
- [x] Notes
  - [x] CRUD Notes với folders
  - [x] Rich text editor
- [x] Pomodoro Timer
  - [x] Timer component
  - [x] Session tracking

## Phase 4: Dashboard & AI Integration ✅
- [x] Dashboard Aggregation
  - [x] Backend Aggregation Service (Tasks, Habits, Finance, Overview)
  - [x] Frontend Dashboard UI with real data
- [x] AI Integration
  - [x] Groq API Integration (Backend)
  - [x] Context-aware prompt engineering (System Prompt with Dashboard data)
  - [x] Chat UI implementation (Sidebar & Frontend Service) endpoints
- [x] AI Chat Sidebar
  - [x] Chat UI component
  - [x] Chat message history (Persisted in DB)
- [x] AI Actions
  - [x] Tạo task từ mô tả tự nhiên (Function Calling)
  - [x] Phân tích và đề xuất ưu tiên (Context-aware)
  - [x] Tạo report/summary (Context-aware)
  - [x] Trả lời câu hỏi về project (Context-aware)
  - [x] Đề xuất thói quen và lịch trình (Context-aware)

## Phase 5: Polish & Deploy
- [ ] Dashboard với overview statistics
- [ ] Calendar view tích hợp
- [ ] Dark/Light theme
- [ ] Deploy Backend to Railway
- [ ] Deploy Frontend to Vercel
