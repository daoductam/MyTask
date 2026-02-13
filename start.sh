#!/bin/bash
echo "Starting MyTask Application..."

echo "Starting Backend..."
# Mở cửa sổ cmd mới để chạy backend
start cmd /k "cd my-task-be && mvnw spring-boot:run"

echo "Starting Frontend..."
# Mở cửa sổ cmd mới để chạy frontend
start cmd /k "cd my-task-fe && npm run dev"

echo "Both services are starting in separate windows."
read -p "Press enter to continue..."
