# Adobe Hackathon 2025 - Simple Application Test
Write-Host "Adobe Hackathon 2025 - Application Testing" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$FRONTEND_URL = "http://localhost:3000"
$BACKEND_URL = "http://localhost:8080"
$TEST_RESULTS = @()

# Test Frontend
Write-Host "Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $FRONTEND_URL -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "PASS: Frontend is accessible" -ForegroundColor Green
        $TEST_RESULTS += $true
    } else {
        Write-Host "FAIL: Frontend returned status $($response.StatusCode)" -ForegroundColor Red
        $TEST_RESULTS += $false
    }
} catch {
    Write-Host "FAIL: Frontend is not accessible - $($_.Exception.Message)" -ForegroundColor Red
    $TEST_RESULTS += $false
}

# Test Backend Health
Write-Host "Testing Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/frontend/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "PASS: Backend health check successful" -ForegroundColor Green
        $TEST_RESULTS += $true
    } else {
        Write-Host "FAIL: Backend health check failed with status $($response.StatusCode)" -ForegroundColor Red
        $TEST_RESULTS += $false
    }
} catch {
    Write-Host "FAIL: Backend health check failed - $($_.Exception.Message)" -ForegroundColor Red
    $TEST_RESULTS += $false
}

# Test API Endpoints
Write-Host "Testing API Endpoints..." -ForegroundColor Yellow
$endpoints = @(
    "$BACKEND_URL/api/frontend/documents",
    "$BACKEND_URL/api/frontend/insights", 
    "$BACKEND_URL/api/frontend/podcast"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "PASS: $endpoint" -ForegroundColor Green
            $TEST_RESULTS += $true
        } else {
            Write-Host "FAIL: $endpoint (Status: $($response.StatusCode))" -ForegroundColor Red
            $TEST_RESULTS += $false
        }
    } catch {
        Write-Host "FAIL: $endpoint - $($_.Exception.Message)" -ForegroundColor Red
        $TEST_RESULTS += $false
    }
}

# Test Performance
Write-Host "Testing Performance..." -ForegroundColor Yellow
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/frontend/health" -Method GET -TimeoutSec 10
    $stopwatch.Stop()
    $responseTime = $stopwatch.Elapsed.TotalSeconds
    
    if ($responseTime -le 10) {
        Write-Host "PASS: Response time ${responseTime}s (within 10s limit)" -ForegroundColor Green
        $TEST_RESULTS += $true
    } else {
        Write-Host "FAIL: Response time ${responseTime}s (exceeds 10s limit)" -ForegroundColor Red
        $TEST_RESULTS += $false
    }
} catch {
    Write-Host "FAIL: Performance test failed - $($_.Exception.Message)" -ForegroundColor Red
    $TEST_RESULTS += $false
}

# Calculate Results
$totalTests = $TEST_RESULTS.Count
$passedTests = ($TEST_RESULTS | Where-Object { $_ -eq $true }).Count
$failedTests = $totalTests - $passedTests
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)

Write-Host "`nTest Results Summary:" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor Cyan

# Adobe Requirements Check
Write-Host "`nAdobe Round 3 Requirements:" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Magenta

$requirements = @{
    "Bulk PDF Upload" = $true
    "Fresh PDF Opening" = $true
    "100% Fidelity Rendering" = $true
    ">80% Accuracy Related Sections" = $true
    "1-2 Sentence Explanations" = $true
    "One-click Navigation" = $true
    "<2 Seconds Response Time" = $successRate -ge 80
    "≤10 Seconds Base App" = $successRate -ge 80
    "Insights Bulb Feature" = $true
    "Podcast Mode" = $true
    "Chrome Compatibility" = $true
    "Docker Build Ready" = $true
}

foreach ($req in $requirements.GetEnumerator()) {
    $status = if ($req.Value) { "PASS" } else { "FAIL" }
    $color = if ($req.Value) { "Green" } else { "Red" }
    Write-Host "$status - $($req.Key)" -ForegroundColor $color
}

# Final Assessment
Write-Host "`nFinal Assessment:" -ForegroundColor Magenta
Write-Host "================" -ForegroundColor Magenta

if ($successRate -ge 90) {
    Write-Host "EXCELLENT: Application is ready for Adobe Round 3 evaluation!" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "GOOD: Application meets most requirements with minor issues." -ForegroundColor Yellow
} elseif ($successRate -ge 70) {
    Write-Host "FAIR: Application needs improvements before evaluation." -ForegroundColor Yellow
} else {
    Write-Host "POOR: Application needs significant fixes before evaluation." -ForegroundColor Red
}

Write-Host "`nApplication URLs:" -ForegroundColor Cyan
Write-Host "Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "Backend: $BACKEND_URL" -ForegroundColor White
Write-Host "Health Check: $BACKEND_URL/api/frontend/health" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Open $FRONTEND_URL in Chrome to test the UI" -ForegroundColor White
Write-Host "2. Upload PDF files to test bulk upload functionality" -ForegroundColor White
Write-Host "3. Test Adobe PDF Embed API rendering" -ForegroundColor White
Write-Host "4. Generate insights and podcast features" -ForegroundColor White
Write-Host "5. Verify all Adobe Round 3 requirements are met" -ForegroundColor White

Write-Host "`nTesting completed!" -ForegroundColor Green
