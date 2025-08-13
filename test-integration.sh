
#!/bin/bash

echo "🧪 Testing Adobe Learn Platform Integration..."

# Test backend health
echo "1. Testing Backend Health..."
if curl -s http://0.0.0.0:8080/actuator/health | grep -q "UP"; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Test frontend
echo "2. Testing Frontend..."
if curl -s http://0.0.0.0:3000 > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
    exit 1
fi

# Test API integration
echo "3. Testing API Integration..."
if curl -s http://0.0.0.0:8080/api/analysis/health | grep -q "true"; then
    echo "✅ API integration working"
else
    echo "❌ API integration failed"
    exit 1
fi

echo "🎉 All tests passed! Platform is properly integrated."
