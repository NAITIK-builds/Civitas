@echo off
echo Starting Civitas Services...
echo.

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and try again
    pause
    exit /b 1
)

echo Starting Python Photo Verification Service...
cd server
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo Starting Python verification service...
start "Python Verification Service" cmd /k "cd server && call venv\Scripts\activate.bat && python photo_verification_api.py"

echo Waiting for Python service to start...
timeout /t 8 /nobreak > nul

echo Testing Python service...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Python service may not be fully started yet
) else (
    echo Python service is running successfully!
)

cd ..

echo Starting Node.js Server...
start "Node.js Server" cmd /k "npm run dev:server"

echo Waiting for Node.js server to start...
timeout /t 5 /nobreak > nul

echo Testing Node.js server...
curl -s http://localhost:3001/api/demo >nul 2>&1
if errorlevel 1 (
    echo WARNING: Node.js server may not be fully started yet
) else (
    echo Node.js server is running successfully!
)

echo.
echo Services are starting...
echo Python Verification Service: http://localhost:8000
echo Node.js Server: http://localhost:3001
echo.
echo Check the opened terminal windows for any error messages.
echo Press any key to exit this launcher...
pause > nul
