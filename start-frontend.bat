@echo off
echo ========================================================
echo Starting Taxi Service Frontend (Vite Port 5173)...
echo ========================================================
cd /d "%~dp0frontend"
npm.cmd run dev
pause
