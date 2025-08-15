#!/bin/bash

echo "🧪 Testing Backend-Frontend Integration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not running${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_api() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name... "
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed${NC}"
        return 1
    fi
}

# Check if services are running
echo "📋 Checking service status..."
check_service "http://localhost:3000" "Frontend (Next.js)"
check_service "http://localhost:8080/api/frontend/health" "Backend (Spring Boot)"

echo ""
echo "🔗 Testing API endpoints..."

# Test backend endpoints
test_api "http://localhost:8080/api/frontend/health" "Backend Health"
test_api "http://localhost:8080/api/adobe/performance" "Backend Performance"

# Test frontend endpoints
test_api "http://localhost:3000/api/test-integration" "Frontend Integration Test"

echo ""
echo "🌐 Testing integration..."

# Test the integration endpoint
INTEGRATION_RESPONSE=$(curl -s "http://localhost:3000/api/test-integration" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Integration test successful${NC}"
    echo "Response:"
    echo "$INTEGRATION_RESPONSE" | jq '.' 2>/dev/null || echo "$INTEGRATION_RESPONSE"
else
    echo -e "${RED}❌ Integration test failed${NC}"
fi

echo ""
echo "📊 Summary:"
echo "- Frontend: http://localhost:3000"
echo "- Backend:  http://localhost:8080"
echo "- Health:   http://localhost:8080/api/frontend/health"
echo "- Test:     http://localhost:3000/api/test-integration"

echo ""
echo "🎯 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Upload a PDF file to test the full integration"
echo "3. Check the browser console for any errors"
echo "4. Monitor backend logs for processing information"
