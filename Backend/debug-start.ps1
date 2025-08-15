# Debug Backend Startup
Write-Host "Debug Backend Startup..." -ForegroundColor Cyan

# Check Java
Write-Host "`nChecking Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java version:" -ForegroundColor Green
    $javaVersion | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} catch {
    Write-Host "❌ Java not found: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check JAR
Write-Host "`nChecking JAR file..." -ForegroundColor Yellow
if (Test-Path "target/Adobe1B.jar") {
    $jarSize = (Get-Item "target/Adobe1B.jar").Length
    Write-Host "✅ JAR found: target/Adobe1B.jar ($($jarSize / 1MB) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ JAR not found!" -ForegroundColor Red
    exit 1
}

# Create directories
Write-Host "`nCreating directories..." -ForegroundColor Yellow
if (!(Test-Path "data")) { 
    New-Item -ItemType Directory -Path "data" -Force | Out-Null
    Write-Host "✅ Created data directory" -ForegroundColor Green
} else {
    Write-Host "✅ Data directory exists" -ForegroundColor Green
}

if (!(Test-Path "uploads")) { 
    New-Item -ItemType Directory -Path "uploads" -Force | Out-Null
    Write-Host "✅ Created uploads directory" -ForegroundColor Green
} else {
    Write-Host "✅ Uploads directory exists" -ForegroundColor Green
}

# Set environment
Write-Host "`nSetting environment..." -ForegroundColor Yellow
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:ADOBE_CLIENT_ID = "demo-client-id"
$env:ADOBE_CLIENT_SECRET = "demo-client-secret"
Write-Host "✅ Environment variables set" -ForegroundColor Green

# Start backend with detailed output
Write-Host "`nStarting backend..." -ForegroundColor Yellow
Write-Host "Command: java -jar target/Adobe1B.jar" -ForegroundColor Gray
Write-Host "Profile: $env:SPRING_PROFILES_ACTIVE" -ForegroundColor Gray
Write-Host "Port: 8080" -ForegroundColor Gray
Write-Host ""

# Start the application
java -jar target/Adobe1B.jar
