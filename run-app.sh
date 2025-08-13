
#!/bin/bash

echo "🚀 Starting Adobe Learn Platform..."

# Function to check if a port is in use
check_port() {
    if netstat -tuln | grep ":$1 " > /dev/null 2>&1; then
        echo "⚠️ Port $1 is in use, attempting to free it..."
        pkill -f ":$1" 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=60
    local attempt=1
    
    echo "⏳ Waiting for $name to start..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $name is running!"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $name failed to start within 2 minutes"
    return 1
}

# Check and free ports
check_port 8080
check_port 3000

# Start backend
echo "🔧 Starting Spring Boot Backend..."
cd Backend
if [ ! -f "target/Adobe1B.jar" ]; then
    echo "📦 Building backend..."
    ./mvnw clean package -DskipTests
fi

java -jar target/Adobe1B.jar \
    --server.address=0.0.0.0 \
    --server.port=8080 \
    --logging.level.com.adobe.hackathon=INFO > ../backend.log 2>&1 &

BACKEND_PID=$!
echo "📝 Backend PID: $BACKEND_PID"

# Wait for backend
if ! wait_for_service "http://0.0.0.0:8080/actuator/health" "Backend"; then
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🎨 Starting Next.js Frontend..."
cd ../Frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

npm run dev -- --hostname 0.0.0.0 --port 3000 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "📝 Frontend PID: $FRONTEND_PID"

# Wait for frontend
if ! wait_for_service "http://0.0.0.0:3000" "Frontend"; then
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Adobe Learn Platform is running!"
echo ""
echo "📱 Frontend: http://0.0.0.0:3000"
echo "🔧 Backend:  http://0.0.0.0:8080"
echo "📊 Health:   http://0.0.0.0:8080/actuator/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
