@echo off
echo Starting ChatGPT WebSocket Chat Application...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "python start.py"

echo.
echo Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this launcher...
pause > nul 