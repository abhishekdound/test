# Start Adobe Backend in a new window
Write-Host "Starting Adobe Backend in a new window..." -ForegroundColor Cyan

# Navigate to Backend directory
$backendPath = Join-Path $PSScriptRoot "Backend"
Set-Location $backendPath

# Check if JAR exists
if (!(Test-Path "target/Adobe1B.jar")) {
    Write-Host "❌ JAR file not found. Please build the project first." -ForegroundColor Red
    exit 1
}

# Create directories
if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" -Force | Out-Null }
if (!(Test-Path "uploads")) { New-Item -ItemType Directory -Path "uploads" -Force | Out-Null }

Write-Host "✅ Starting backend..." -ForegroundColor Green
Write-Host "   Backend will be available at: http://localhost:8080" -ForegroundColor Gray
Write-Host "   Health check: http://localhost:8080/api/frontend/health" -ForegroundColor Gray

# Start the backend in a new window
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$backendPath`" && set SPRING_PROFILES_ACTIVE=dev && set ADOBE_CLIENT_ID=demo-client-id && set ADOBE_CLIENT_SECRET=demo-client-secret && java -jar target/Adobe1B.jar" -WindowStyle Normal

Write-Host "✅ Backend started in new window!" -ForegroundColor Green
Write-Host "   Keep that window open to keep the backend running." -ForegroundColor Yellow
