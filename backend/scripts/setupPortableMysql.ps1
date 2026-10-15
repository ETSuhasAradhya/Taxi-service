# =============================================================================
# Automated Portable MySQL 8 Setup for College DBMS Course
# =============================================================================
$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path "C:\Users\aradh\.gemini\antigravity\scratch\taxi-service-system"
$ZipPath = Join-Path $ProjectRoot "mysql-8.0.37.zip"
$MysqlDir = Join-Path $ProjectRoot "backend\mysql-server"
$DataDir = Join-Path $MysqlDir "data"

Write-Host ">>> 1. Verifying downloaded MySQL zip..."
if (-not (Test-Path $ZipPath)) {
    Write-Error "MySQL zip not found at $ZipPath"
}

if (-not (Test-Path $MysqlDir)) {
    Write-Host ">>> 2. Extracting MySQL 8 binaries to $MysqlDir (this takes ~15 seconds)..."
    New-Item -ItemType Directory -Path $MysqlDir -Force | Out-Null
    Expand-Archive -Path $ZipPath -DestinationPath $ProjectRoot -Force
    # Move unzipped folder contents
    $ExtractedFolder = Get-ChildItem -Path $ProjectRoot -Directory -Filter "mysql-8.0.37-winx64" | Select-Object -First 1
    if ($ExtractedFolder) {
        Move-Item -Path "$($ExtractedFolder.FullName)\*" -Destination $MysqlDir -Force
        Remove-Item -Path $ExtractedFolder.FullName -Recurse -Force
    }
}

$BinDir = Join-Path $MysqlDir "bin"
$MysqldExe = Join-Path $BinDir "mysqld.exe"
$MysqlExe = Join-Path $BinDir "mysql.exe"

# Create my.ini
$MyIni = Join-Path $MysqlDir "my.ini"
$IniContent = @"
[mysqld]
port=3306
bind-address=127.0.0.1
datadir="$($DataDir.Replace('\', '/'))"
default_authentication_plugin=mysql_native_password
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
max_connections=50
innodb_buffer_pool_size=64M
"@
Set-Content -Path $MyIni -Value $IniContent -Encoding utf8

# Initialize Data Directory if not exists
if (-not (Test-Path $DataDir)) {
    Write-Host ">>> 3. Initializing MySQL Data Directory (root with empty password)..."
    & $MysqldExe --defaults-file=$MyIni --initialize-insecure --console
    Start-Sleep -Seconds 2
}

# Create start and stop helper batch scripts
$StartBat = Join-Path $ProjectRoot "start-mysql.bat"
$StartBatContent = @"
@echo off
echo Starting Portable MySQL 8 on port 3306...
start "" "$MysqldExe" --defaults-file="$MyIni" --console
echo MySQL Server is running.
"@
Set-Content -Path $StartBat -Value $StartBatContent

$StopBat = Join-Path $ProjectRoot "stop-mysql.bat"
$StopBatContent = @"
@echo off
echo Stopping Portable MySQL 8...
taskkill /F /IM mysqld.exe
echo MySQL Server stopped.
"@
Set-Content -Path $StopBat -Value $StopBatContent

Write-Host ">>> 4. Starting MySQL Server Process..."
Start-Process -FilePath $MysqldExe -ArgumentList "--defaults-file=`"$MyIni`"", "--console" -WindowStyle Hidden
Start-Sleep -Seconds 4

Write-Host ">>> 5. Testing connection..."
& $MysqlExe -u root -e "SELECT VERSION() AS mysql_version, NOW() AS server_time;"
Write-Host ">>> Portable MySQL 8 is running and operational!"
