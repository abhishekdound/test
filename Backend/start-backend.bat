@echo off
echo Starting Adobe Backend...
cd /d "%~dp0"
set SPRING_PROFILES_ACTIVE=dev
set ADOBE_CLIENT_ID=demo-client-id
set ADOBE_CLIENT_SECRET=demo-client-secret

if not exist "data" mkdir data
if not exist "uploads" mkdir uploads

echo Starting backend on port 8080...
java -jar target/Adobe1B.jar
pause
