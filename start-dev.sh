#!/bin/bash

# Adobe Learn Platform - Development Startup Script
# This script starts both the backend and frontend in development mode

echo "🚀 Starting Adobe Learn Platform..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use. Please stop the service using port $1 and try again."
        exit 1
    fi
}

# Check if ports are available
echo "🔍 Checking port availability..."
check_port 8080
check_port 3000

# Function to start backend
start_backend() {
    echo "🔧 Starting Spring Boot Backend..."
    cd Backend
    
    # Check if Maven is installed
    if ! command -v mvn &> /dev/null; then
        echo "❌ Maven is not installed. Please install Maven first."
        exit 1
    fi
    
    # Check if Java 17+ is installed
    java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$java_version" -lt 17 ]; then
        echo "❌ Java 17 or higher is required. Current version: $java_version"
        exit 1
    fi
    
    echo "✅ Java version: $(java -version 2>&1 | head -n 1)"
    echo "✅ Maven version: $(mvn -version | head -n 1)"
    
    # Start backend in background
    mvn spring-boot:run > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "📝 Backend PID: $BACKEND_PID"
    echo "📄 Backend logs: backend.log"
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            echo "✅ Backend is running on http://localhost:8080"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Backend failed to start within 30 seconds"
            kill $BACKEND_PID 2>/dev/null
            exit 1
        fi
        sleep 1
    done
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Next.js Frontend..."
    cd Frontend
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    
    echo "✅ Node.js version: $(node --version)"
    echo "✅ npm version: $(npm --version)"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend in background
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "📝 Frontend PID: $FRONTEND_PID"
    echo "📄 Frontend logs: frontend.log"
    
    # Wait for frontend to start
    echo "⏳ Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Frontend is running on http://localhost:3000"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Frontend failed to start within 30 seconds"
            kill $FRONTEND_PID 2>/dev/null
            exit 1
        fi
        sleep 1
    done
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        echo "🛑 Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "🛑 Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start services
start_backend
start_frontend

echo ""
echo "🎉 Adobe Learn Platform is running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8080"
echo "📊 Health:   http://localhost:8080/actuator/health"
echo "📚 API Docs: http://localhost:8080/api/analysis/api-docs"
echo ""
echo "📄 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Keep script running
wait
