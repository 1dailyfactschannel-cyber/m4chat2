@echo off
echo Starting m4chat2 desktop app...
echo.

REM Start Vite dev server in background
echo Starting Vite dev server on port 8081...
start "Vite Dev Server" cmd /c "cd /d D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\mockup-sandbox && pnpm exec vite dev --port 8081 --base /__mockup"

REM Wait for server to start
echo Waiting for server to be ready...
timeout /t 5 /nobreak >nul

REM Start Electron
echo Starting Electron...
cd /d D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\electron-app
set NODE_ENV=development
node .\node_modules\electron\cli.js .

REM Clean up - kill vite server when electron closes
taskkill /FI "WINDOWTITLE eq Vite Dev Server" /F >nul 2>&1
