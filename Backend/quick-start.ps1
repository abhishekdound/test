# Quick Backend Start
Write-Host "Quick Backend Start..." -ForegroundColor Green

# Check Java
java -version

# Check JAR
if (Test-Path "target/Adobe1B.jar") {
    Write-Host "JAR found: target/Adobe1B.jar" -ForegroundColor Green
} else {
    Write-Host "JAR not found!" -ForegroundColor Red
    exit 1
}

# Create dirs
New-Item -ItemType Directory -Path "data" -Force | Out-Null
New-Item -ItemType Directory -Path "uploads" -Force | Out-Null

# Start backend
Write-Host "Starting backend..." -ForegroundColor Yellow
$env:SPRING_PROFILES_ACTIVE = "dev"
java -jar target/Adobe1B.jar
