#!/bin/bash

echo "Starting Civitas Services..."
echo

echo "Starting Python Photo Verification Service..."
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 photo_verification_api.py &
PYTHON_PID=$!

echo "Waiting for Python service to start..."
sleep 5

echo "Starting Node.js Server..."
npm run dev:server &
NODE_PID=$!

echo
echo "Services are starting..."
echo "Python Verification Service: http://localhost:8000"
echo "Node.js Server: http://localhost:3001"
echo
echo "Press Ctrl+C to stop all services..."

# Wait for interrupt signal
trap "echo 'Stopping services...'; kill $PYTHON_PID $NODE_PID; exit" INT

# Keep script running
wait
