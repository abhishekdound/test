# 🧠 LLM Insights Testing Guide

## Overview
This guide will help you test the complete LLM insight generation functionality with text selection and Gemini API integration.

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)
```bash
# Run the automated startup script
start-services.bat
```

### Option 2: Manual Startup
```bash
# Terminal 1: Start Backend
cd Backend
java -jar target/Adobe1B.jar

# Terminal 2: Start Frontend  
cd Frontend
npm run dev
```

## 🧪 Testing Methods

### 1. Interactive HTML Test Page
Open `test-insights.html` in your browser for a comprehensive testing interface.

**Features:**
- ✅ Real-time text selection detection
- ✅ Manual text input option
- ✅ Service status monitoring
- ✅ Three different insight generation methods
- ✅ Visual feedback and error handling

### 2. Node.js Test Script
```bash
# Install dependencies (if needed)
npm install node-fetch

# Run the test script
node test-insights.js
```

### 3. Browser-based Testing
1. Open `http://localhost:3000` (main application)
2. Upload a PDF or use the demo content
3. Select text in the PDF viewer
4. Click "Generate Insights" button

## 🔧 What's Being Tested

### Text Selection Detection
- **Automatic Detection**: Multiple event listeners capture text selection
- **Adobe PDF iframe**: Special handling for Adobe PDF Embed API
- **Manual Input**: Fallback option for manual text entry
- **Visual Feedback**: Real-time display of selected text

### LLM Insights Generation
- **Backend LLM Service**: Uses your `InsightsBulbService` with Gemini integration
- **Frontend API**: Next.js API route with fallback chain
- **Direct Gemini API**: Direct integration for testing
- **Error Handling**: Comprehensive error handling and fallbacks

### API Endpoints Tested
1. `POST /api/frontend/insights/demo` - Backend LLM service
2. `POST /api/generate-insights` - Frontend API route
3. Direct Gemini API calls

## 📊 Expected Results

### Successful Text Selection
```
✅ Text selected: "Artificial Intelligence (AI) is transforming healthcare..."
```

### Successful Backend Insights
```json
{
  "success": true,
  "jobId": "demo-1234567890",
  "persona": "researcher",
  "source": "LLM-Powered Insights Bulb",
  "insights": {
    "keyInsights": ["AI is revolutionizing healthcare...", "..."],
    "didYouKnow": ["Interesting fact about AI...", "..."],
    "connections": ["Connection to broader concepts...", "..."],
    "inspirations": ["Innovation opportunities...", "..."],
    "contradictions": ["Alternative perspectives...", "..."]
  }
}
```

### Successful Frontend Insights
```json
{
  "insights": [
    {
      "id": "key-1",
      "type": "key_point",
      "title": "Key Insight 1",
      "content": "AI is transforming healthcare...",
      "confidence": 90,
      "sources": ["LLM Analysis"],
      "relatedConcepts": ["key points", "main ideas"]
    }
  ]
}
```

## 🔍 Troubleshooting

### Backend Not Starting
```bash
# Check if port 8080 is available
netstat -ano | findstr :8080

# Kill any existing Java processes
taskkill /f /im java.exe

# Rebuild and start
cd Backend
mvn clean package -DskipTests
java -jar target/Adobe1B.jar
```

### Frontend Not Starting
```bash
# Check if port 3000 is available
netstat -ano | findstr :3000

# Install dependencies
cd Frontend
npm install

# Start development server
npm run dev
```

### Text Selection Not Working
1. **Check Browser Console**: Look for JavaScript errors
2. **Try Manual Input**: Use the "Manual Input" button
3. **Check Adobe Client ID**: Ensure `NEXT_PUBLIC_ADOBE_CLIENT_ID` is set
4. **Test with Simple Text**: Try selecting text from the test page first

### Insights Not Generating
1. **Check API Key**: Verify Gemini API key is configured
2. **Check Network**: Ensure both services are running
3. **Check Console**: Look for API error messages
4. **Try Direct API**: Test direct Gemini API call first

## 🎯 Test Scenarios

### Scenario 1: Basic Text Selection
1. Open `test-insights.html`
2. Select text from the sample content
3. Verify text appears in "Selected Text" box
4. Click "Backend LLM Insights"
5. Verify insights are generated

### Scenario 2: Manual Text Input
1. Click "Manual Input" button
2. Enter custom text in the textarea
3. Click "Use This Text"
4. Generate insights using any method

### Scenario 3: PDF Text Selection
1. Open main application at `http://localhost:3000`
2. Upload a PDF file
3. Select text in the PDF viewer
4. Click "Generate Insights" in the Insights panel

### Scenario 4: Error Handling
1. Stop the backend service
2. Try generating insights
3. Verify fallback to direct Gemini API works
4. Verify error messages are displayed

## 📈 Performance Testing

### Response Time Targets
- **Backend LLM Service**: < 10 seconds
- **Frontend API**: < 15 seconds (includes fallback chain)
- **Direct Gemini API**: < 5 seconds

### Load Testing
```bash
# Test multiple concurrent requests
for i in {1..5}; do
  node test-insights.js &
done
```

## 🔐 Security Testing

### API Key Security
- ✅ API key not exposed in frontend code
- ✅ Environment variable usage
- ✅ Fallback mechanisms in place

### CORS Configuration
- ✅ Backend allows frontend origin
- ✅ Proper headers configured
- ✅ Error handling for CORS issues

## 📝 Logging and Debugging

### Backend Logs
```bash
# Check backend logs
tail -f Backend/logs/application.log
```

### Frontend Console
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');
```

### Network Tab
- Check API requests in browser DevTools
- Verify request/response format
- Monitor for CORS errors

## ✅ Success Criteria

### Text Selection
- [ ] Text selection detected automatically
- [ ] Manual input works as fallback
- [ ] Visual feedback provided
- [ ] Works with Adobe PDF Embed API

### LLM Insights
- [ ] Backend LLM service generates insights
- [ ] Frontend API works with fallbacks
- [ ] Direct Gemini API integration works
- [ ] Error handling graceful
- [ ] Response time within targets

### Integration
- [ ] Frontend-backend communication works
- [ ] CORS properly configured
- [ ] API key management secure
- [ ] Fallback chain functional

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Text Selection**: Immediate visual feedback when text is selected
2. **Service Status**: Green indicators for both backend and frontend
3. **Insights Generation**: Structured insights with multiple categories
4. **Error Handling**: Graceful fallbacks when services are unavailable
5. **Performance**: Response times within acceptable limits

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Backend 404 | Service not started | Start backend with `java -jar target/Adobe1B.jar` |
| CORS Error | Frontend can't reach backend | Check CORS configuration in backend |
| API Key Error | Invalid or missing key | Verify `GEMINI_API_KEY` environment variable |
| Text Not Selected | Adobe PDF iframe issue | Use manual input or check iframe detection |
| Slow Response | LLM service timeout | Check network and API key validity |

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify all services are running
4. Test with the provided test files
5. Check network connectivity and API key validity
