# MyTask - Ứng dụng Quản lý Công việc & Năng suất

MyTask là một ứng dụng quản lý năng suất toàn diện được thiết kế để giúp người dùng quản lý các nhiệm vụ, mục tiêu, thói quen và sự tập trung thông qua đồng hồ Pomodoro, cùng với tính năng theo dõi tài chính và hỗ trợ từ AI.

## Cấu trúc Dự án

Dự án được cấu trúc theo dạng monorepo bao gồm:

- **[my-task-be](./my-task-be)**: Dịch vụ Backend được xây dựng với Java Spring Boot.
- **[my-task-fe](./my-task-fe)**: Ứng dụng Frontend được xây dựng với React, Vite và Tailwind CSS.
- **[FLOWS.md](./FLOWS.md)**: Tài liệu về các luồng người dùng chính và logic ứng dụng.

## Các Tính năng Chính

- ✅ **Quản lý Công việc**: Tạo, cập nhật và sắp xếp các nhiệm vụ trong không gian làm việc (workspace).
- 🎯 **Theo dõi Mục tiêu**: Thiết lập và theo dõi các mục tiêu dài hạn và các cột mốc (milestone).
- 🔄 **Theo dõi Thói quen**: Xây dựng và duy trì các thói quen tích cực hàng ngày.
- ⏱️ **Đồng hồ Pomodoro**: Tăng cường sự tập trung bằng kỹ thuật Pomodoro tích hợp sẵn.
- 💰 **Quản lý Tài chính**: Theo dõi thu nhập, chi phí và quản lý ngân sách.
- 🤖 **Trợ lý AI**: Nhận hỗ trợ và thông tin chi tiết thông qua chat AI tích hợp (sử dụng Groq).
- 📊 **Bảng điều khiển (Dashboard)**: Trực quan hóa năng suất và tình trạng tài chính của bạn một cách nhanh chóng.

## Công nghệ Sử dụng

### Backend
- **Framework**: Spring Boot 3.x
- **Ngôn ngữ**: Java 21
- **Cơ sở dữ liệu**: MySQL
- **Bảo mật**: Spring Security + JWT
- **Tích hợp AI**: Groq API (LLaMA 3.1)
- **Container hóa**: Docker

### Frontend
- **Framework**: React 18
- **Công cụ Build**: Vite
- **Styling**: Tailwind CSS + DaisyUI
- **Quản lý Trạng thái**: Redux Toolkit / Context API
- **Icons**: Lucide React

## Bắt đầu

### Điều kiện tiên quyết
- JDK 21+
- Node.js 18+
- MySQL 8.0+ (Sử dụng Aiven cho môi trường Production)
- Docker (tùy chọn)

### Hướng dẫn Cài đặt

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd MyTask
   ```

2. **Cài đặt Backend**:
   - Di chuyển vào thư mục `my-task-be`.
   - Cấu hình file `.env` với `GROQ_API_KEY` và thông tin cơ sở dữ liệu của bạn.
   - Chạy bằng Maven: `./mvnw spring-boot:run`

3. **Cài đặt Frontend**:
   - Di chuyển vào thư mục `my-task-fe`.
   - Cài đặt các gói phụ thuộc: `npm install`
   - Chạy server phát triển: `npm run dev`

## Bản quyền

Dự án này được cấp phép theo Giấy phép MIT.
