// Simple health check test
const testHealthCheck = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/frontend/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend Health Check SUCCESS:', data);
      return true;
    } else {
      console.log('❌ Backend Health Check FAILED:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend Health Check ERROR:', error.message);
    return false;
  }
};

// Run the test
testHealthCheck();
