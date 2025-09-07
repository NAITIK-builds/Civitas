@echo off
echo Testing Civitas Services...
echo.

echo Testing Python Photo Verification Service...
curl -s http://localhost:8000/health
if errorlevel 1 (
    echo FAILED: Python service not responding
) else (
    echo SUCCESS: Python service is running
)
echo.

echo Testing Node.js Server...
curl -s http://localhost:3001/api/demo
if errorlevel 1 (
    echo FAILED: Node.js server not responding
) else (
    echo SUCCESS: Node.js server is running
)
echo.

echo Testing Photo Verification API...
curl -s http://localhost:3001/api/verification-health
if errorlevel 1 (
    echo FAILED: Photo verification API not responding
) else (
    echo SUCCESS: Photo verification API is running
)
echo.

echo Test complete!
pause
