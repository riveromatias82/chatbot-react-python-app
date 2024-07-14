#!/bin/bash

echo "Starting ChatGPT WebSocket Chat Application..."
echo

echo "Starting Backend Server..."
cd backend
python start.py &
BACKEND_PID=$!

echo
echo "Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers..."

# Function to cleanup on exit
cleanup() {
    echo
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handler
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 