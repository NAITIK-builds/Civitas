@echo off
echo Starting Civitas Services...
echo.

echo Starting Python Photo Verification Service...
start "Python Verification Service" cmd /k "cd server && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python photo_verification_api.py"

echo Waiting for Python service to start...
timeout /t 5 /nobreak > nul

echo Starting Node.js Server...
start "Node.js Server" cmd /k "npm run dev:server"

echo.
echo Services are starting...
echo Python Verification Service: http://localhost:8000
echo Node.js Server: http://localhost:3001
echo.
echo Press any key to exit this launcher...
pause > nul
