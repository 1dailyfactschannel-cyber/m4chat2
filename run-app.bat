@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║           Запуск m4chat2 Desktop Application              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

:: Check if already running
tasklist /FI "IMAGENAME eq electron.exe" 2>nul | findstr electron.exe >nul
if %ERRORLEVEL% == 0 (
    echo ⚠ Electron уже запущен. Закройте текущее окно и попробуйте снова.
    pause
    exit /b 1
)

:: Kill any hanging node processes from previous runs
taskkill /F /FI "WINDOWTITLE eq m4chat2-api*" 2>nul
taskkill /F /FI "WINDOWTITLE eq m4chat2-web*" 2>nul

echo [1/3] Запуск API сервера на порту 8080...
start "m4chat2-api" cmd /c "cd /d D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\api-server ^&^& set PORT=8080 ^& node --enable-source-maps ./dist/index.mjs ^& pause"
timeout /t 3 /nobreak >nul

echo [2/3] Запуск Web сервера на порту 8081...
start "m4chat2-web" cmd /c "cd /d D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\mockup-sandbox ^&^& call pnpm exec vite dev --port 8081 --base / ^& pause"
timeout /t 5 /nobreak >nul

echo [3/3] Запуск Electron...
cd /d D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\electron-app
set NODE_ENV=development
echo.
echo Приложение запускается...
node .\node_modules\electron\cli.js .

echo.
echo Закрытие серверов...
taskkill /F /FI "WINDOWTITLE eq m4chat2-api*" 2>nul
taskkill /F /FI "WINDOWTITLE eq m4chat2-web*" 2>nul
echo Готово.
