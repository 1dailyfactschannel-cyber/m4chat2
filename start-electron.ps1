$ErrorActionPreference = 'SilentlyContinue'

$mockupProcess = Start-Process -FilePath "pnpm" -ArgumentList "run", "dev" -WorkingDirectory "D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\mockup-sandbox" -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 5

$electronProcess = Start-Process -FilePath "node" -ArgumentList "D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\electron-app\node_modules\electron\cli.js", "." -WorkingDirectory "D:\Project\m4chat2-replit-agent\m4chat2-replit-agent\artifacts\electron-app" -PassThru -WindowStyle Normal

Write-Host "Started mockup-sandbox and electron"

Start-Sleep -Seconds 10

if ($mockupProcess.HasExited) { Write-Host "mockup-sandbox exited: $($mockupProcess.ExitCode)" }
if ($electronProcess.HasExited) { Write-Host "electron exited: $($electronProcess.ExitCode)" }
