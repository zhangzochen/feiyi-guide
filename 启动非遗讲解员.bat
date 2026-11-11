@echo off
cd /d "%~dp0"
netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if not errorlevel 1 (
  start "" http://localhost:8081
  exit /b 0
)
where java >nul 2>nul
if errorlevel 1 (
  echo Java not found. Please install JDK 17+ and add it to PATH.
  pause
  exit /b 1
)
if not exist "feiyi-guide.jar" (
  echo feiyi-guide.jar not found. Please build it first.
  pause
  exit /b 1
)
start "feiyi-guide" cmd /c "java -jar feiyi-guide.jar"
timeout /t 15 /nobreak >nul
start "" http://localhost:8081
