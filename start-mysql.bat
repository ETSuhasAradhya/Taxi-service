@echo off
echo ========================================================
echo Starting MySQL 8.0 Database Daemon...
echo ========================================================
cd /d "%~dp0backend"
mysql-server\bin\mysqld.exe --defaults-file=mysql-server\my.ini --console
pause
