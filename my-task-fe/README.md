# MyTask Frontend (React + Vite)

Đây là ứng dụng frontend cho MyTask, được xây dựng bằng React, Vite và Tailwind CSS. Nó cung cấp một giao diện người dùng hiện đại, phản hồi nhanh để quản lý năng suất và tài chính.

## Công nghệ Sử dụng

- **React 18**
- **Vite** (Công cụ Build)
- **Tailwind CSS** (Styling)
- **DaisyUI** (Thư viện Component)
- **React Router Dom** (Định tuyến)
- **Axios** (Yêu cầu API)
- **Lucide React** (Icons)
- **Redux Toolkit** (Quản lý Trạng thái)
- **Framer Motion** (Animations)

## Cấu trúc Dự án

- `src/components`: Các component UI có thể tái sử dụng.
- `src/pages`: Các trang chính của ứng dụng và các view định tuyến.
- `src/services`: API client và các dịch vụ lấy dữ liệu.
- `src/context`: Các provider React Context cho trạng thái toàn cục.
- `src/hooks`: Các hook React tùy chỉnh.
- `src/assets`: Tài sản tĩnh, hình ảnh và styles toàn cục.

## Cấu hình

Frontend sử dụng các biến môi trường để cấu hình. Hãy tạo một file `.env` trong thư mục `my-task-fe`:

```env
VITE_API_URL=http://localhost:8080/api
```

## Các lệnh có sẵn

### Phát triển
```bash
npm install
npm run dev
```

### Build Sản xuất
```bash
npm run build
npm run preview
```

## Các Tính năng

- **Thiết kế Phản hồi (Responsive)**: Tương thích với các trình duyệt máy tính để bàn và di động.
- **Giao diện Hiện đại**: Hỗ trợ chế độ tối và hiệu ứng glassmorphism bóng bẩy.
- **Phản hồi Thời gian thực**: Các bộ tải tương tác và thông báo snackbar.
- **Component AI Chat**: Giao diện chat nổi hỗ trợ markdown.

## Nguyên tắc Thiết kế

- **Lấy người dùng làm trung tâm**: Tập trung vào sự dễ sử dụng và rõ ràng.
- **Hiệu suất**: Bản build được tối ưu hóa bằng Vite và styling chọn lọc.
- **Tính nhất quán**: Ngôn ngữ thiết kế thống nhất sử dụng Tailwind và DaisyUI.
