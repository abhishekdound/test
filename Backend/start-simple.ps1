# Simple Backend Startup Script
Write-Host "Starting Adobe Backend..." -ForegroundColor Cyan

# Set working directory
Set-Location "Backend"

# Create necessary directories
if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" -Force | Out-Null }
if (!(Test-Path "uploads")) { New-Item -ItemType Directory -Path "uploads" -Force | Out-Null }

# Set environment variables
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:ADOBE_CLIENT_ID = "demo-client-id"
$env:ADOBE_CLIENT_SECRET = "demo-client-secret"

Write-Host "Starting application..." -ForegroundColor Yellow
Write-Host "Profile: $env:SPRING_PROFILES_ACTIVE" -ForegroundColor Gray
Write-Host "Client ID: $env:ADOBE_CLIENT_ID" -ForegroundColor Gray

# Start the application
java -jar target/Adobe1B.jar --spring.profiles.active=dev
