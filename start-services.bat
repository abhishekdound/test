@echo off
echo Starting Adobe Hackathon Services...
echo.

echo [1/3] Starting Backend Service...
cd Backend
start "Backend Service" cmd /k "java -jar target/Adobe1B.jar"
timeout /t 5 /nobreak >nul

echo [2/3] Starting Frontend Service...
cd ..\Frontend
start "Frontend Service" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Opening Test Page...
start http://localhost:3000
start test-insights.html

echo.
echo Services are starting up...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo Test Page: test-insights.html
echo.
echo Press any key to exit this script (services will continue running)
pause >nul
