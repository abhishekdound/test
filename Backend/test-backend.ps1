# Test Backend Startup
Write-Host "Testing Backend Startup..." -ForegroundColor Cyan

# Set working directory
Set-Location "Backend"

# Create directories
if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" -Force | Out-Null }
if (!(Test-Path "uploads")) { New-Item -ItemType Directory -Path "uploads" -Force | Out-Null }

# Set minimal environment
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:ADOBE_CLIENT_ID = "demo-client-id"
$env:ADOBE_CLIENT_SECRET = "demo-client-secret"

Write-Host "Starting with minimal config..." -ForegroundColor Yellow
Write-Host "JAR exists: $(Test-Path 'target/Adobe1B.jar')" -ForegroundColor Gray

# Start in foreground to see output
java -jar target/Adobe1B.jar --spring.profiles.active=dev --server.port=8080 --server.address=localhost
