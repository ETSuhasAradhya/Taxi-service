@echo off
echo ========================================================
echo Starting Taxi Service Backend API (Port 5000)...
echo ========================================================
cd /d "%~dp0backend"
node server.js
pause
