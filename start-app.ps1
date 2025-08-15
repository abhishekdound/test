Write-Host "Starting Adobe Hackathon Application..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Application starting..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8080" -ForegroundColor White
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this script (services will continue running)" -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

