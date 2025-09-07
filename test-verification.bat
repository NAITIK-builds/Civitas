@echo off
echo Testing Photo Verification System...
echo.

echo [1/4] Testing Python Service...
curl -s http://localhost:8000/health
if errorlevel 1 (
    echo ❌ Python service not running
) else (
    echo ✅ Python service is running
)
echo.

echo [2/4] Testing Node.js API...
curl -s http://localhost:3001/api/demo
if errorlevel 1 (
    echo ❌ Node.js API not running
) else (
    echo ✅ Node.js API is running
)
echo.

echo [3/4] Testing Photo Verification API...
curl -s http://localhost:3001/api/verification-health
if errorlevel 1 (
    echo ❌ Photo verification API not running
) else (
    echo ✅ Photo verification API is running
)
echo.

echo [4/4] Testing Frontend...
curl -s http://localhost:8080 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend not running
) else (
    echo ✅ Frontend is running
)
echo.

echo Test complete!
echo.
echo If all services are running, you can:
echo 1. Open http://localhost:8080 for the main app
echo 2. Open http://localhost:8080/admin/photos for admin review
echo 3. Test photo verification in the task submission
echo.
pause
