# Civitas - Complete Project Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Civitas - Complete Project Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Please run this script from the Civitas project root directory" -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/4] Checking system requirements..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://python.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 16+ from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not available" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Node.js dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Node.js dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Setting up Python verification service..." -ForegroundColor Yellow

# Create Python virtual environment if it doesn't exist
if (-not (Test-Path "server\venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    Set-Location server
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create Python virtual environment" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location ..
}

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Set-Location server
& .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Python dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..
Write-Host "✓ Python dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Starting all services..." -ForegroundColor Yellow

# Start Python verification service
Write-Host "Starting Python Photo Verification Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; .\venv\Scripts\Activate.ps1; python photo_verification_api.py" -WindowStyle Normal

# Wait for Python service to start
Write-Host "Waiting for Python service to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Test Python service
Write-Host "Testing Python service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Python service is running" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: Python service may not be fully started yet" -ForegroundColor Yellow
}

# Start Node.js server
Write-Host "Starting Node.js Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev:server" -WindowStyle Normal

# Wait for Node.js service
Write-Host "Waiting for Node.js server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test Node.js service
Write-Host "Testing Node.js server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/demo" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Node.js server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: Node.js server may not be fully started yet" -ForegroundColor Yellow
}

# Start frontend development server
Write-Host "Starting Frontend Development Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

# Wait for frontend
Write-Host "Waiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    🚀 Civitas is now running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "• Python Verification Service: http://localhost:8000" -ForegroundColor White
Write-Host "• Node.js API Server: http://localhost:3001" -ForegroundColor White
Write-Host "• Frontend Application: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Check the opened terminal windows for any error messages." -ForegroundColor Yellow
Write-Host "The frontend should automatically open in your browser." -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop all services, close the terminal windows." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit this launcher"
