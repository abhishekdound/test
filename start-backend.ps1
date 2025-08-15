# Adobe Hackathon 2025 - Backend Startup Script
Write-Host "Adobe Hackathon 2025 - Backend Startup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Set working directory
Set-Location "Backend"

# Check if Java is available
Write-Host "`nChecking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    if ($javaVersion -match "version") {
        Write-Host "✅ Java is installed" -ForegroundColor Green
        Write-Host "   $($javaVersion[0])" -ForegroundColor Gray
    } else {
        Write-Host "❌ Java not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Java not found" -ForegroundColor Red
    exit 1
}

# Check if JAR file exists
Write-Host "`nChecking JAR file..." -ForegroundColor Yellow
if (Test-Path "target/Adobe1B.jar") {
    Write-Host "✅ JAR file found: target/Adobe1B.jar" -ForegroundColor Green
} else {
    Write-Host "❌ JAR file not found. Building application..." -ForegroundColor Red
    
    # Check if Maven is available
    if (Test-Path "../maven-temp/apache-maven-3.9.4/bin/mvn.cmd") {
        Write-Host "Building with Maven..." -ForegroundColor Yellow
        & "../maven-temp/apache-maven-3.9.4/bin/mvn.cmd" clean package -DskipTests
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Maven build failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Maven not found. Please build the application first." -ForegroundColor Red
        exit 1
    }
}

# Create necessary directories
Write-Host "`nCreating directories..." -ForegroundColor Yellow
$directories = @("data", "uploads", "logs")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Directory exists: $dir" -ForegroundColor Green
    }
}

# Set environment variables
Write-Host "`nSetting environment variables..." -ForegroundColor Yellow
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:JAVA_OPTS = "-Xmx2g -Xms1g -Dfile.encoding=UTF-8"
$env:ADOBE_CLIENT_ID = "demo-client-id"
$env:ADOBE_CLIENT_SECRET = "demo-client-secret"

Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host "   SPRING_PROFILES_ACTIVE: $env:SPRING_PROFILES_ACTIVE" -ForegroundColor Gray
Write-Host "   JAVA_OPTS: $env:JAVA_OPTS" -ForegroundColor Gray

# Check if port 8080 is available
Write-Host "`nChecking port availability..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr ":8080"
if ($portCheck) {
    Write-Host "⚠️ Port 8080 is in use. Stopping existing process..." -ForegroundColor Yellow
    $processId = ($portCheck -split '\s+')[-1]
    taskkill /PID $processId /F 2>$null
    Start-Sleep -Seconds 2
}

# Start the application
Write-Host "`nStarting Adobe Learn Platform Backend..." -ForegroundColor Yellow
Write-Host "Application will be available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:8080/api/frontend/health" -ForegroundColor Cyan
Write-Host "H2 Console: http://localhost:8080/h2-console" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""

# Start the application with proper configuration
java -jar target/Adobe1B.jar --spring.profiles.active=dev
