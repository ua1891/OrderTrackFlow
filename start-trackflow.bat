@echo off
title TrackFlow Launcher
color 0B

echo ========================================================
echo               TrackFlow - Startup System
echo ========================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in your system PATH!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    echo After installing, you may need to restart your computer before running this file.
    pause
    exit /b
)

echo Node.js detected successfully! Starting setup...
echo.

:: Start Backend in a new window
echo [SERVER] Initializing Backend API and Database...
start "TrackFlow - Backend Engine" cmd /k "cd backend && (if not exist node_modules (echo Installing backend dependencies... && call npm install)) && echo Setting up database... && call npx prisma generate && call npx prisma db push --accept-data-loss && echo Starting server... && npm run dev"

:: Start Frontend in a new window
echo [UI FRONTEND] Initializing the Dashboard UI...
start "TrackFlow - Frontend Dashboard" cmd /k "cd frontend && (if not exist node_modules (echo Installing frontend dependencies... && call npm install)) && echo Starting dashboard... && npm run dev"

echo.
echo Waiting 10 seconds for the servers to boot up fully...
timeout /t 10 /nobreak >nul

:: Automatically open browser
echo [BROWSER] Opening TrackFlow...
start http://localhost:5173
start http://localhost:5174

echo.
echo ========================================================
echo TrackFlow is now running! 
echo. 
echo IMPORTANT: Please keep the TWO new black command windows 
echo open, as they are running the server and the frontend.
echo.
echo You can safely close this launcher window.
echo ========================================================
pause
