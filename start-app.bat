@echo off
echo Starting m4chat2 desktop app...
echo.

REM Set environment variables
set NODE_ENV=development
set PORT=8080

REM Start API server in background
echo Starting API server on port 8080...
start "API Server" cmd /c "cd /d D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\api-server && node --enable-source-maps ./dist/index.mjs"

REM Wait for API to start
echo Waiting for API server...
timeout /t 3 /nobreak >nul

REM Start Vite dev server on port 8081
echo Starting Vite dev server on port 8081...
start "Vite Dev Server" cmd /c "cd /d D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\mockup-sandbox && pnpm exec vite dev --port 8081 --base /"

REM Wait for server to start
echo Waiting for web server...
timeout /t 5 /nobreak >nul

REM Start Electron
echo Starting Electron...
cd /d D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\electron-app
set NODE_ENV=development
node .\node_modules\electron\cli.js .

REM Clean up when Electron closes
echo Shutting down servers...
taskkill /FI "WINDOWTITLE eq API Server" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Vite Dev Server" /F >nul 2>&1
echo Done.
