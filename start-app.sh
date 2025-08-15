#!/bin/bash

# Startup script for Adobe India Hackathon 2025
# Runs both backend (Spring Boot) and frontend (Next.js) on port 8080

set -e

echo "Starting Adobe Learn Platform for Hackathon 2025..."

# Create necessary directories
mkdir -p /app/uploads /app/data /app/uploads/audio

# Start backend Spring Boot application
echo "Starting Spring Boot backend..."
java -jar /app/app.jar --server.port=8080 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
for i in {1..30}; do
    if curl -f http://localhost:8080/api/frontend/health > /dev/null 2>&1; then
        echo "Backend is ready!"
        break
    fi
    echo "Waiting for backend... ($i/30)"
    sleep 2
done

# Start frontend Next.js application
echo "Starting Next.js frontend..."
cd /app/frontend

# Set environment variables for frontend
export PORT=3000
export HOSTNAME=0.0.0.0

# Start Next.js in production mode
npm start &
FRONTEND_PID=$!

# Wait for frontend to start
echo "Waiting for frontend to start..."
for i in {1..30}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "Frontend is ready!"
        break
    fi
    echo "Waiting for frontend... ($i/30)"
    sleep 2
done

# Set up reverse proxy to serve frontend on port 8080
echo "Setting up reverse proxy..."
cat > /app/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server localhost:8080;
    }
    
    upstream frontend {
        server localhost:3000;
    }
    
    server {
        listen 8080;
        server_name localhost;
        
        # Serve frontend static files
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Proxy API calls to backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Serve static files from frontend
        location /_next/ {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

# Install nginx if not available
if ! command -v nginx &> /dev/null; then
    echo "Installing nginx..."
    apk add --no-cache nginx
fi

# Start nginx
echo "Starting nginx reverse proxy..."
nginx -c /app/nginx.conf

echo "Adobe Learn Platform is running on http://localhost:8080"
echo "Backend API: http://localhost:8080/api/"
echo "Frontend: http://localhost:8080/"

# Function to handle shutdown
cleanup() {
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    nginx -s quit 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Keep the script running
wait

