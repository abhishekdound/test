# Adobe Hackathon 2025 - Frontend Startup Script
Write-Host "Adobe Hackathon 2025 - Frontend Startup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Set working directory
Set-Location "Frontend"

# Check if Node.js is available
Write-Host "`nChecking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies are installed" -ForegroundColor Green
} else {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if port 3000 is available
Write-Host "`nChecking port availability..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr ":3000"
if ($portCheck) {
    Write-Host "⚠️ Port 3000 is in use. Stopping existing process..." -ForegroundColor Yellow
    $processId = ($portCheck -split '\s+')[-1]
    taskkill /PID $processId /F 2>$null
    Start-Sleep -Seconds 2
}

# Start the development server
Write-Host "`nStarting Adobe Learn Platform Frontend..." -ForegroundColor Yellow
Write-Host "Application will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev
