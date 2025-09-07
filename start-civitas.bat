@echo off
echo ========================================
echo    Civitas Photo Verification System
echo ========================================
echo.

echo Starting all services...
echo.

REM Start Python service
echo [1/3] Starting Python Photo Verification Service...
start "Python Service" cmd /k "cd server && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python photo_verification_api.py"

REM Wait for Python service
echo [2/3] Waiting for Python service to initialize...
timeout /t 10 /nobreak > nul

REM Start Node.js service
echo [3/3] Starting Node.js Server...
start "Node.js Server" cmd /k "npm run dev:server"

REM Wait for Node.js service
echo Waiting for Node.js server to initialize...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo    Services Started Successfully!
echo ========================================
echo.
echo Python Verification Service: http://localhost:8000
echo Node.js Server: http://localhost:3001
echo Frontend: http://localhost:8080
echo.
echo Check the opened terminal windows for any errors.
echo Press any key to exit this launcher...
pause > nul
