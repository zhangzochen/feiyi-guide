@echo off
cd /d "%~dp0"
netstat -ano | findstr ":8082" | findstr "LISTENING" >nul
if not errorlevel 1 (
  start "" http://localhost:8082
  exit /b 0
)
where java >nul 2>nul
if errorlevel 1 (
  echo Java not found. Please install JDK 17+ and add it to PATH.
  pause
  exit /b 1
)
if not exist "feiyi-guide.jar" (
  echo feiyi-guide.jar not found.
  pause
  exit /b 1
)
echo.
echo DeepSeek AI guide launcher
if exist "deepseek-key.txt" (
  set /p DEEPSEEK_API_KEY=<deepseek-key.txt
  echo Using local deepseek-key.txt
) else (
  echo Get an API Key at https://platform.deepseek.com
  set /p DEEPSEEK_API_KEY=Paste your DeepSeek API Key:
)
if "%DEEPSEEK_API_KEY%"=="" (
  echo No API Key found.
  pause
  exit /b 1
)
echo Starting DeepSeek version at http://localhost:8082 ...
start "feiyi-deepseek" cmd /c "java -jar feiyi-guide.jar --spring.profiles.active=deepseek --server.port=8082 --app.llm.api-key=%DEEPSEEK_API_KEY%"
timeout /t 15 /nobreak >nul
start "" http://localhost:8082
