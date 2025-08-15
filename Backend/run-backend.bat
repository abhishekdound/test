@echo off
title Adobe Backend Server
echo ========================================
echo Adobe Learn Platform Backend Server
echo ========================================
echo.

REM Set environment variables
set SPRING_PROFILES_ACTIVE=dev
set ADOBE_CLIENT_ID=demo-client-id
set ADOBE_CLIENT_SECRET=demo-client-secret

REM Create necessary directories
if not exist "data" mkdir data
if not exist "uploads" mkdir uploads

echo Starting Adobe Backend Server...
echo Profile: %SPRING_PROFILES_ACTIVE%
echo Port: 8080
echo.
echo The server will be available at:
echo - Backend: http://localhost:8080
echo - Health Check: http://localhost:8080/api/frontend/health
echo - Test Endpoint: http://localhost:8080/test
echo - H2 Console: http://localhost:8080/h2-console
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the Java application
java -jar target/Adobe1B.jar

echo.
echo Server stopped.
pause
