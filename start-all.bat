@echo off
echo ========================================================
echo Launching Complete Taxi Service Management System
echo 1. MySQL 8 Database
echo 2. Express Backend API
echo 3. React Vite Frontend
echo ========================================================
start "MySQL 8.0 Server" cmd /k "%~dp0start-mysql.bat"
timeout /t 3 /nobreak >nul
start "Backend API Server (5000)" cmd /k "%~dp0start-backend.bat"
timeout /t 2 /nobreak >nul
start "Frontend UI (5173)" cmd /k "%~dp0start-frontend.bat"
echo All services launched! Check individual windows.
