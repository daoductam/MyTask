@echo off
echo Starting MyTask Application...

echo Starting Backend...
start "MyTask Backend" cmd /k "cd my-task-be && mvnw spring-boot:run"

echo Starting Frontend...
start "MyTask Frontend" cmd /k "cd my-task-fe && npm run dev"

echo Both services are starting in separate windows.
pause
