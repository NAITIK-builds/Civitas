@echo off
echo ========================================
echo    Civitas - Complete Project Startup
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Please run this script from the Civitas project root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo [1/4] Checking system requirements...

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
) else (
    echo ✓ Python found
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
) else (
    echo ✓ Node.js found
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not available
    pause
    exit /b 1
) else (
    echo ✓ npm found
)

echo.
echo [2/4] Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo ✓ Node.js dependencies installed

echo.
echo [3/4] Setting up Python verification service...

REM Create Python virtual environment if it doesn't exist
if not exist "server\venv" (
    echo Creating Python virtual environment...
    cd server
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create Python virtual environment
        pause
        exit /b 1
    )
    cd ..
)

REM Install Python dependencies
echo Installing Python dependencies...
cd server
call venv\Scripts\activate.bat
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Python dependencies installed

echo.
echo [4/4] Starting all services...

REM Start Python verification service
echo Starting Python Photo Verification Service...
start "Python Verification Service" cmd /k "cd server && call venv\Scripts\activate.bat && python photo_verification_api.py"

REM Wait for Python service to start
echo Waiting for Python service to initialize...
timeout /t 8 /nobreak > nul

REM Test Python service
echo Testing Python service...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Python service may not be fully started yet
) else (
    echo ✓ Python service is running
)

REM Start Node.js server
echo Starting Node.js Server...
start "Node.js Server" cmd /k "npm run dev:server"

REM Wait for Node.js service
echo Waiting for Node.js server to initialize...
timeout /t 5 /nobreak > nul

REM Test Node.js service
echo Testing Node.js server...
curl -s http://localhost:3001/api/demo >nul 2>&1
if errorlevel 1 (
    echo WARNING: Node.js server may not be fully started yet
) else (
    echo ✓ Node.js server is running
)

REM Start frontend development server
echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "npm run dev"

REM Wait for frontend
echo Waiting for frontend to initialize...
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo    🚀 Civitas is now running!
echo ========================================
echo.
echo Services:
echo • Python Verification Service: http://localhost:8000
echo • Node.js API Server: http://localhost:3001
echo • Frontend Application: http://localhost:8080
echo.
echo Check the opened terminal windows for any error messages.
echo The frontend should automatically open in your browser.
echo.
echo To stop all services, close the terminal windows.
echo.
echo Press any key to exit this launcher...
pause >nul
