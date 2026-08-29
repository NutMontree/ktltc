@echo off
title Cloudflare DB Tunnel (db.ktltc.site)
color 0B
echo ==========================================================
echo   Starting Cloudflare Tunnel to db.ktltc.site:27017 ...
echo ==========================================================
echo.

where cloudflared >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    cloudflared access tcp --hostname db.ktltc.site --url localhost:27017
) else if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" (
    "C:\Program Files (x86)\cloudflared\cloudflared.exe" access tcp --hostname db.ktltc.site --url localhost:27017
) else if exist "C:\Program Files\cloudflared\cloudflared.exe" (
    "C:\Program Files\cloudflared\cloudflared.exe" access tcp --hostname db.ktltc.site --url localhost:27017
) else (
    echo [ERROR] cloudflared.exe not found!
    echo Please install cloudflared using: winget install --id Cloudflare.cloudflared
)
pause
