@echo off
echo ========================================
echo    Civitas - Real-time Startup
echo ========================================
echo.

REM Kill any existing processes on the ports
echo Cleaning up existing processes...
netstat -ano | findstr :8000 >nul 2>&1 && taskkill /f /im python.exe >nul 2>&1
netstat -ano | findstr :3001 >nul 2>&1 && taskkill /f /im node.exe >nul 2>&1
netstat -ano | findstr :8080 >nul 2>&1 && taskkill /f /im node.exe >nul 2>&1

echo.
echo [1/3] Starting Python Photo Verification Service...
start "Python Service" cmd /k "cd server && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python photo_verification_api.py"

echo Waiting for Python service...
timeout /t 10 /nobreak > nul

echo Testing Python service...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Python service may not be ready yet
) else (
    echo SUCCESS: Python service is running
)

echo.
echo [2/3] Starting Node.js API Server...
start "Node.js API" cmd /k "npm run dev:server"

echo Waiting for Node.js server...
timeout /t 5 /nobreak > nul

echo Testing Node.js server...
curl -s http://localhost:3001/api/demo >nul 2>&1
if errorlevel 1 (
    echo WARNING: Node.js server may not be ready yet
) else (
    echo SUCCESS: Node.js server is running
)

echo.
echo [3/3] Starting Frontend Development Server...
start "Frontend" cmd /k "npm run dev"

echo Waiting for frontend...
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo    🚀 All Services Started!
echo ========================================
echo.
echo Services:
echo • Python Verification: http://localhost:8000
echo • Node.js API: http://localhost:3001
echo • Frontend: http://localhost:8080
echo • Admin Photos: http://localhost:8080/admin/photos
echo.
echo The frontend should open automatically in your browser.
echo Check the terminal windows for any error messages.
echo.
echo Press any key to exit this launcher...
pause >nul
