@echo off
echo Starting Adobe Hackathon Application...
echo.

echo Starting Backend...
start "Backend" cmd /k "cd Backend && .\mvnw.cmd spring-boot:run"

echo Waiting for backend to start...
timeout /t 15 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd Frontend && npm run dev"

echo.
echo Application starting...
echo Backend will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit this script (services will continue running)
pause > nul

