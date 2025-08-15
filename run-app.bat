@echo off
echo 🚀 Starting Adobe Learn Platform...

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 18 or higher
    pause
    exit /b 1
)

REM Check if ports are available
netstat -an | findstr ":8080" >nul
if not errorlevel 1 (
    echo ⚠️ Port 8080 is in use, attempting to free it...
    taskkill /f /im java.exe >nul 2>&1
    timeout /t 2 >nul
)

netstat -an | findstr ":3000" >nul
if not errorlevel 1 (
    echo ⚠️ Port 3000 is in use, attempting to free it...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 >nul
)

REM Start backend
echo 🔧 Starting Spring Boot Backend...
cd Backend

REM Check if JAR exists, if not build it
if not exist "target\Adobe1B.jar" (
    echo 📦 Building backend...
    call mvnw.cmd clean package -DskipTests
    if errorlevel 1 (
        echo ❌ Backend build failed
        pause
        exit /b 1
    )
)

REM Start backend in background
start "Adobe Backend" cmd /c "java -jar target\Adobe1B.jar --server.address=0.0.0.0 --server.port=8080 --logging.level.com.adobe.hackathon=INFO"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
:wait_backend
timeout /t 2 >nul
curl -s http://localhost:8080/api/frontend/health >nul 2>&1
if errorlevel 1 (
    echo ⏳ Still waiting for backend...
    goto wait_backend
)

echo ✅ Backend is running!

REM Start frontend
echo 🎨 Starting Next.js Frontend...
cd ..\Frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Frontend dependency installation failed
        pause
        exit /b 1
    )
)

REM Start frontend in background
start "Adobe Frontend" cmd /c "npm run dev -- --hostname 0.0.0.0 --port 3000"

REM Wait for frontend to start
echo ⏳ Waiting for frontend to start...
:wait_frontend
timeout /t 2 >nul
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ⏳ Still waiting for frontend...
    goto wait_frontend
)

echo ✅ Frontend is running!

echo.
echo 🎉 Adobe Learn Platform is running!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:8080
echo 📊 Health:   http://localhost:8080/api/frontend/health
echo.
echo Press any key to stop all services...

pause >nul

echo.
echo 🛑 Shutting down services...
taskkill /f /im java.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo ✅ Services stopped.
pause
