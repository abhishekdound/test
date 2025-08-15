# Adobe Hackathon 2025 - Application Status Test
Write-Host "Adobe Hackathon 2025 - Application Status" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if services are running
Write-Host "`nChecking Application Status..." -ForegroundColor Yellow

# Check Frontend (Port 3000)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running on http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Frontend returned status $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend is not accessible" -ForegroundColor Red
}

# Check Backend (Port 8080)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/frontend/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running on http://localhost:8080" -ForegroundColor Green
        Write-Host "   Health check: $($response.Content)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Backend returned status $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend is not accessible" -ForegroundColor Red
}

# Check ports
Write-Host "`nPort Status:" -ForegroundColor Yellow
$ports = netstat -ano | findstr ":3000\|:8080"
if ($ports) {
    Write-Host "✅ Ports in use:" -ForegroundColor Green
    $ports | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ No services found on ports 3000 or 8080" -ForegroundColor Red
}

# Check processes
Write-Host "`nProcess Status:" -ForegroundColor Yellow
$javaProcesses = tasklist | findstr "java"
$nodeProcesses = tasklist | findstr "node"

if ($javaProcesses) {
    Write-Host "✅ Java processes running:" -ForegroundColor Green
    $javaProcesses | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ No Java processes found" -ForegroundColor Red
}

if ($nodeProcesses) {
    Write-Host "✅ Node processes running:" -ForegroundColor Green
    $nodeProcesses | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ No Node processes found" -ForegroundColor Red
}

Write-Host "`nApplication URLs:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend: http://localhost:8080" -ForegroundColor White
Write-Host "Health Check: http://localhost:8080/api/frontend/health" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Test the Adobe PDF Embed API functionality" -ForegroundColor White
Write-Host "3. Upload PDF files to test bulk upload" -ForegroundColor White
Write-Host "4. Generate insights and podcasts" -ForegroundColor White
