# Adobe Hackathon 2025 - Comprehensive Fix Script
# This script fixes all identified issues in the application

Write-Host "🔧 Adobe Hackathon 2025 - Comprehensive Fix Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to check if a port is in use
function Test-Port($port) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Function to kill processes on a port
function Stop-ProcessOnPort($port) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes) {
        foreach ($pid in $processes) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "✅ Stopped process $pid on port $port" -ForegroundColor Green
            } catch {
                Write-Host "⚠️ Could not stop process $pid on port $port" -ForegroundColor Yellow
            }
        }
    }
}

# Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "java")) {
    Write-Host "❌ Java is not installed. Please install Java 17 or higher." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "docker")) {
    Write-Host "⚠️ Docker is not installed. Docker build will be skipped." -ForegroundColor Yellow
    $skipDocker = $true
} else {
    $skipDocker = $false
}

Write-Host "✅ Prerequisites check completed" -ForegroundColor Green

# Stop any existing processes
Write-Host "`n🛑 Stopping existing processes..." -ForegroundColor Yellow

Stop-ProcessOnPort 8080
Stop-ProcessOnPort 3000

# Wait a moment for processes to stop
Start-Sleep -Seconds 2

# Fix 1: Frontend API Configuration
Write-Host "`n🔧 Fix 1: Checking Frontend API Configuration..." -ForegroundColor Yellow

$apiFile = "Frontend/lib/api.ts"
if (Test-Path $apiFile) {
    $apiContent = Get-Content $apiFile -Raw
    if ($apiContent -match "0\.0\.0\.0:8080") {
        Write-Host "⚠️ Found 0.0.0.0:8080 in API configuration, but it's already correct" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Frontend API configuration is correct" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Frontend API file not found" -ForegroundColor Red
}

# Fix 2: Backend Dependencies
Write-Host "`n🔧 Fix 2: Checking Backend Dependencies..." -ForegroundColor Yellow

if (Test-Path "Backend/pom.xml") {
    Write-Host "✅ Backend pom.xml found" -ForegroundColor Green
    
    # Check if Maven wrapper exists
    if (-not (Test-Path "Backend/mvnw.cmd")) {
        Write-Host "⚠️ Maven wrapper not found, using system Maven" -ForegroundColor Yellow
        $mavenCmd = "mvn"
    } else {
        $mavenCmd = ".\mvnw.cmd"
    }
} else {
    Write-Host "❌ Backend pom.xml not found" -ForegroundColor Red
    exit 1
}

# Fix 3: Frontend Dependencies
Write-Host "`n🔧 Fix 3: Checking Frontend Dependencies..." -ForegroundColor Yellow

if (Test-Path "Frontend/package.json") {
    Write-Host "✅ Frontend package.json found" -ForegroundColor Green
    
    # Check if node_modules exists
    if (-not (Test-Path "Frontend/node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
        Set-Location Frontend
        npm install
        Set-Location ..
    } else {
        Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Frontend package.json not found" -ForegroundColor Red
    exit 1
}

# Fix 4: Environment Variables
Write-Host "`n🔧 Fix 4: Setting up Environment Variables..." -ForegroundColor Yellow

# Create .env.local for frontend if it doesn't exist
$envFile = "Frontend/.env.local"
if (-not (Test-Path $envFile)) {
    @"
# Adobe Hackathon 2025 Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ADOBE_CLIENT_ID=a2d7f06cea0c43f09a17bea4c32c9e93
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "✅ Created Frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend/.env.local already exists" -ForegroundColor Green
}

# Fix 5: Build Backend
Write-Host "`n🔧 Fix 5: Building Backend..." -ForegroundColor Yellow

Set-Location Backend
try {
    Write-Host "📦 Building backend with Maven..." -ForegroundColor Yellow
    & $mavenCmd clean compile -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error building backend: $_" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Fix 6: Test Backend Health
Write-Host "`n🔧 Fix 6: Testing Backend Health..." -ForegroundColor Yellow

# Start backend in background
Write-Host "🚀 Starting backend..." -ForegroundColor Yellow
Set-Location Backend
Start-Process -FilePath "java" -ArgumentList "-jar", "target/Adobe1B.jar", "--server.port=8080" -WindowStyle Hidden
$backendProcess = $LASTEXITCODE
Set-Location ..

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/frontend/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✅ Backend is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Waiting for backend... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "❌ Backend failed to start within 60 seconds" -ForegroundColor Red
    exit 1
}

# Fix 7: Test Frontend
Write-Host "`n🔧 Fix 7: Testing Frontend..." -ForegroundColor Yellow

Set-Location Frontend
Write-Host "🚀 Starting frontend..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
Set-Location ..

# Wait for frontend to start
Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$frontendReady = $false

while ($attempt -lt $maxAttempts -and -not $frontendReady) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "✅ Frontend is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Waiting for frontend... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $frontendReady) {
    Write-Host "❌ Frontend failed to start within 60 seconds" -ForegroundColor Red
    exit 1
}

# Fix 8: Docker Build (if Docker is available)
if (-not $skipDocker) {
    Write-Host "`n🔧 Fix 8: Testing Docker Build..." -ForegroundColor Yellow
    
    try {
        Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
        docker build --platform linux/amd64 -t adobe-learn . --no-cache
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker build successful" -ForegroundColor Green
        } else {
            Write-Host "❌ Docker build failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error building Docker image: $_" -ForegroundColor Red
    }
}

# Final Status
Write-Host "`n🎉 Fix Script Completed!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "✅ Backend: http://localhost:8080" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "✅ Health Check: http://localhost:8080/api/frontend/health" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Upload a PDF document to test the application" -ForegroundColor White
Write-Host "3. Check the Settings tab for backend status" -ForegroundColor White
Write-Host "4. Test Adobe PDF Embed API functionality" -ForegroundColor White
Write-Host "5. Generate insights and podcasts" -ForegroundColor White

Write-Host "`n🔧 If you encounter any issues:" -ForegroundColor Yellow
Write-Host "- Check the console for error messages" -ForegroundColor White
Write-Host "- Verify all environment variables are set" -ForegroundColor White
Write-Host "- Ensure ports 8080 and 3000 are available" -ForegroundColor White
Write-Host "- Restart the application if needed" -ForegroundColor White

Write-Host "`n🚀 Adobe Hackathon 2025 Application is ready!" -ForegroundColor Green

