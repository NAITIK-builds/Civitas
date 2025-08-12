# PowerShell script to start Civitas Services
Write-Host "Starting Civitas Services..." -ForegroundColor Green
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>&1
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found! Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Start Python Photo Verification Service
Write-Host "Starting Python Photo Verification Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; .\venv\Scripts\Activate.ps1; python photo_verification_api.py" -WindowStyle Normal

# Wait for Python service to start
Write-Host "Waiting for Python service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Test Python service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Python service is running successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "Warning: Python service may not be fully started yet" -ForegroundColor Yellow
}

# Start Node.js Server
Write-Host "Starting Node.js Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev:server" -WindowStyle Normal

# Wait for Node.js server to start
Write-Host "Waiting for Node.js server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Test Node.js server
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/demo" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Node.js server is running successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "Warning: Node.js server may not be fully started yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Services are starting..." -ForegroundColor Green
Write-Host "Python Verification Service: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Node.js Server: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the opened terminal windows for any error messages." -ForegroundColor Yellow
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
