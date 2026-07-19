@echo off
title QuickShopp Startup Script
echo ===================================================
echo           QUICKSHOPP STARTUP INTERFACE
echo ===================================================
echo.
echo [1/2] Launching Node.js Express + MongoDB Backend...
start cmd /k "echo Starting backend... && cd backend && npm install && npm start"

echo.
echo [2/2] Launching React + Vite Frontend Dev Server...
start cmd /k "echo Starting frontend... && cd frontend && npm install && npm run dev"

echo.
echo ===================================================
echo Startup complete! Check the new terminal windows.
echo ===================================================
pause
