# Adobe Hackathon 2025 - Integration Check
Write-Host "Adobe Hackathon 2025 - Integration Check" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check Java processes
Write-Host "`nChecking Java processes..." -ForegroundColor Yellow
$javaProcesses = tasklist | findstr java
if ($javaProcesses) {
    Write-Host "✅ Java processes running:" -ForegroundColor Green
    $javaProcesses | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ No Java processes found" -ForegroundColor Red
}

# Check Node processes
Write-Host "`nChecking Node processes..." -ForegroundColor Yellow
$nodeProcesses = tasklist | findstr node
if ($nodeProcesses) {
    Write-Host "✅ Node processes running:" -ForegroundColor Green
    $nodeProcesses | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ No Node processes found" -ForegroundColor Red
}

# Check ports
Write-Host "`nChecking ports..." -ForegroundColor Yellow
$port8080 = netstat -ano | findstr ":8080"
$port3000 = netstat -ano | findstr ":3000"

if ($port8080) {
    Write-Host "✅ Port 8080 is in use:" -ForegroundColor Green
    Write-Host "   $port8080" -ForegroundColor Gray
} else {
    Write-Host "❌ Port 8080 is not in use" -ForegroundColor Red
}

if ($port3000) {
    Write-Host "✅ Port 3000 is in use:" -ForegroundColor Green
    Write-Host "   $port3000" -ForegroundColor Gray
} else {
    Write-Host "❌ Port 3000 is not in use" -ForegroundColor Red
}

# Test backend endpoints
Write-Host "`nTesting backend endpoints..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-WebRequest -Uri "http://localhost:8080/test" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend test endpoint: $($testResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend test endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/frontend/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend health endpoint: $($healthResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test frontend
Write-Host "`nTesting frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Frontend returned status $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nIntegration Summary:" -ForegroundColor Cyan
Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor White
Write-Host "Backend URL: http://localhost:8080" -ForegroundColor White
Write-Host "Health Check: http://localhost:8080/api/frontend/health" -ForegroundColor White
Write-Host "Test Endpoint: http://localhost:8080/test" -ForegroundColor White
Write-Host "H2 Console: http://localhost:8080/h2-console" -ForegroundColor White
