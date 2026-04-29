# Start m4chat2 application
$ErrorActionPreference = 'Stop'

Write-Host "Starting m4chat2 desktop app..." -ForegroundColor Green
Write-Host ""

# Start API Server
Write-Host "Starting API server on port 8080..." -ForegroundColor Cyan
$apiJob = Start-Job -ScriptBlock {
    $env:PORT = 8080
    Set-Location D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\api-server
    node --enable-source-maps ./dist/index.mjs 2>&1
}

# Wait for API
Write-Host "Waiting for API server..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check API
$apiReady = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 2 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $apiReady = $true
        Write-Host "API server is ready!" -ForegroundColor Green
    }
} catch {
    Write-Host "API health check failed, continuing anyway..." -ForegroundColor Yellow
}

# Start Web Server (Vite)
Write-Host "Starting Vite dev server on port 8081..." -ForegroundColor Cyan
$webJob = Start-Job -ScriptBlock {
    Set-Location D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\mockup-sandbox
    .\node_modules\.bin\vite.cmd dev --port 8081 --base / 2>&1
}

# Wait for Web Server
Write-Host "Waiting for web server..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Electron
Write-Host "Starting Electron..." -ForegroundColor Cyan
Set-Location D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\electron-app
$env:NODE_ENV = "development"

# Run Electron and capture output
try {
    & node .\node_modules\electron\cli.js . 2>&1
} finally {
    # Cleanup
    Write-Host "`nShutting down servers..." -ForegroundColor Yellow
    Stop-Job $apiJob -ErrorAction SilentlyContinue
    Stop-Job $webJob -ErrorAction SilentlyContinue
    Remove-Job $apiJob -ErrorAction SilentlyContinue
    Remove-Job $webJob -ErrorAction SilentlyContinue
    Write-Host "Done." -ForegroundColor Green
}
