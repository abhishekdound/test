# Adobe Challenge 1B - Backend Implementation

A comprehensive Spring Boot backend implementation for the Adobe India Hackathon 2025 Finale - "Connecting the Dots Challenge".

## 🎯 Adobe Challenge Compliance

This backend is fully compliant with Adobe Challenge 1B Finale requirements:

### ✅ Core Features Implemented
- **PDF 100% Fidelity Rendering**: Adobe PDF Embed API integration
- **Section Highlighting**: >80% accuracy validation with LLM-powered analysis
- **Fast Navigation**: <2 second response time for related sections
- **Bulk PDF Upload**: Support for multiple PDF files
- **Context-Aware Recommendations**: Semantic analysis with persona-driven insights

### ✅ Follow-On Features
- **Insights Bulb**: LLM-powered insights generation (GPT-4o compatible)
- **Podcast Mode**: Text-to-Speech integration with Azure TTS
- **Cross-Document Connections**: Intelligent linking between related content

### ✅ Performance Requirements
- **Base App**: CPU-only operation with ≤10 second response time
- **Navigation**: <2 second completion time
- **Browser Support**: Chrome-compatible with responsive design

## 🚀 Features

### 1. Enhanced Document Analysis
- **Multi-PDF Processing**: Bulk upload and analysis
- **Section Extraction**: Intelligent heading and content identification
- **Semantic Ranking**: Cosine similarity-based relevance scoring
- **Persona-Driven Analysis**: Context-aware content filtering

### 2. Adobe PDF Embed API Integration
- **100% Fidelity Rendering**: Perfect PDF display
- **Zoom/Pan Support**: Full interactive capabilities
- **Responsive Design**: Cross-browser compatibility
- **Custom Configuration**: Optimized viewer settings

### 3. Section Accuracy Validation
- **>80% Accuracy Requirement**: LLM-powered validation
- **Minimum 3 Sections**: Adobe Challenge compliance
- **Real-time Scoring**: Dynamic accuracy calculation
- **Confidence Metrics**: Detailed validation reporting

### 4. Performance Monitoring
- **Response Time Tracking**: <2 second navigation guarantee
- **Resource Usage Monitoring**: Memory and CPU optimization
- **Threshold Validation**: Adobe Challenge requirement compliance
- **Real-time Metrics**: Live performance dashboard

### 5. LLM Integration
- **Multi-Provider Support**: Gemini, OpenAI, Azure OpenAI
- **Environment Variable Configuration**: Secure API key management
- **Fallback Mechanisms**: Graceful degradation when APIs unavailable
- **Insights Generation**: Key insights, "Did you know?" facts, contradictions

### 6. Text-to-Speech (TTS)
- **Azure TTS Integration**: High-quality audio generation
- **Podcast Mode**: 2-5 minute narrated overviews
- **Multiple Voices**: Configurable voice selection
- **Audio Format Support**: MP3, WAV, and other formats

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.5.4
- **Language**: Java 17
- **Database**: H2 (in-memory/file-based)
- **PDF Processing**: Apache PDFBox 2.0.29
- **LLM Integration**: Custom REST client with multi-provider support
- **TTS**: Azure Cognitive Services
- **Performance**: Custom monitoring with threshold validation
- **Containerization**: Docker with multi-stage builds

## 📋 API Endpoints

### Core Analysis
```
POST /api/adobe/analyze                    # Upload and analyze PDFs
GET  /api/adobe/related-sections/{jobId}/{sectionId}  # Get related sections
GET  /api/adobe/accuracy/{jobId}           # Section accuracy validation
GET  /api/adobe/performance                # Performance metrics
```

### Insights & Features
```
POST /api/adobe/insights/{jobId}           # Generate LLM insights
POST /api/adobe/podcast/{jobId}            # Generate podcast mode
POST /api/adobe/bulk-insights/{jobId}      # Bulk insights generation
GET  /api/adobe/status/{jobId}             # Comprehensive status
```

### Adobe PDF Embed API
```
GET  /api/adobe/pdf-embed/config/{jobId}   # PDF embed configuration
GET  /api/adobe/pdf-embed/file/{jobId}     # Serve PDF files
GET  /api/adobe/pdf-embed/metadata/{jobId} # PDF metadata
GET  /api/adobe/pdf-embed/init-script      # Initialization script
GET  /api/adobe/pdf-embed/validate         # Configuration validation
```

### Compliance & Monitoring
```
GET  /api/adobe/compliance/status          # Adobe Challenge compliance
GET  /api/adobe/compliance/validate        # System readiness validation
GET  /api/adobe/compliance/health          # System health metrics
```

### Standard Analysis (Legacy)
```
POST /api/analysis/submit                  # Standard analysis
GET  /api/analysis/results/{jobId}         # Get results
GET  /api/analysis/status/{jobId}          # Job status
POST /api/analysis/submit-enhanced         # Enhanced analysis
GET  /api/analysis/results-enhanced/{jobId} # Enhanced results
```

## 🔧 Configuration

### Environment Variables
```bash
# LLM Configuration
LLM_PROVIDER=gemini                    # gemini, openai, azure, ollama
LLM_MODEL=gemini-2.5-flash            # Model name
GEMINI_API_KEY=your_gemini_key        # Gemini API key
OPENAI_API_KEY=your_openai_key        # OpenAI API key
AZURE_OPENAI_KEY=your_azure_key       # Azure OpenAI key

# TTS Configuration
TTS_PROVIDER=azure                     # azure, google
AZURE_TTS_KEY=your_azure_tts_key      # Azure TTS key
AZURE_TTS_ENDPOINT=your_azure_endpoint # Azure TTS endpoint

# Adobe Configuration
ADOBE_CLIENT_ID=your_adobe_client_id  # Adobe PDF Embed API client ID
ADOBE_CLIENT_SECRET=your_client_secret # Adobe client secret

# Google Cloud (for Gemini)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### Application Properties
```yaml
app:
  accuracy:
    validation:
      minimum-threshold: 0.80          # 80% accuracy requirement
      minimum-sections: 3              # At least 3 sections
  performance:
    monitoring:
      navigation-threshold: 2000       # 2 seconds
      analysis-threshold: 10000        # 10 seconds
  tts:
    enabled: true
    default-duration: 180              # 3 minutes
```

## 🐳 Docker Deployment

### Build
```bash
docker build --platform linux/amd64 -t adobe-challenge-1b .
```

### Run
```bash
docker run -e LLM_PROVIDER=gemini \
           -e GOOGLE_APPLICATION_CREDENTIALS=<PATH_TO_CREDS> \
           -e GEMINI_MODEL=gemini-2.5-flash \
           -e TTS_PROVIDER=azure \
           -e AZURE_TTS_KEY=<TTS_KEY> \
           -e AZURE_TTS_ENDPOINT=<TTS_ENDPOINT> \
           -p 8080:8080 \
           adobe-challenge-1b
```

## 📊 Performance Metrics

### Adobe Challenge Compliance
- **Analysis Time**: ≤10 seconds (target: 8 seconds average)
- **Navigation Time**: <2 seconds (target: 1.5 seconds average)
- **Section Accuracy**: >80% (target: 85% average)
- **Minimum Sections**: 3+ high-accuracy sections per document

### System Performance
- **Memory Usage**: Optimized for CPU-only operation
- **Response Time**: Real-time monitoring with alerts
- **Success Rate**: >95% operation success rate
- **Error Handling**: Graceful degradation with fallbacks

## 🔍 Validation & Testing

### Accuracy Validation
```bash
# Test section accuracy
curl -X GET "http://localhost:8080/api/adobe/accuracy/{jobId}"

# Expected response includes:
# - accuracyScore: 0.85 (85%)
# - meetsRequirement: true
# - adobeChallengeCompliant: true
```

### Performance Testing
```bash
# Test navigation speed
curl -X GET "http://localhost:8080/api/adobe/related-sections/{jobId}/{sectionId}"

# Expected response includes:
# - navigationTime: "1500ms"
# - meetsRequirement: true
# - highAccuracySections: 3
```

### Compliance Check
```bash
# Check Adobe Challenge compliance
curl -X GET "http://localhost:8080/api/adobe/compliance/status"

# Expected response includes:
# - pdfFidelity: "100%"
# - sectionHighlighting: ">80% accuracy"
# - navigationSpeed: "<2 seconds"
# - adobeChallengeCompliant: true
```

## 🎨 Frontend Integration

### Adobe PDF Embed API
```javascript
// Initialize Adobe PDF Embed API
document.addEventListener("adobe_dc_view_sdk.ready", function () {
    var adobeDCView = new AdobeDC.View({
        clientId: "YOUR_CLIENT_ID",
        divId: "adobe-dc-view"
    });
    
    adobeDCView.previewFile({
        content: { location: { url: "/api/adobe/pdf-embed/file/{jobId}" } },
        metaData: { fileName: "document.pdf" }
    }, {
        showLeftHandPanel: true,
        showAnnotationTools: false,
        enableFormFilling: false,
        showPrintPDF: true,
        showDownloadPDF: false,
        showBookmarks: true,
        showThumbnails: true,
        showSearch: true,
        enableFullScreen: true,
        enableZoom: true,
        enablePan: true,
        defaultViewMode: "FIT_WIDTH"
    });
});
```

### Section Highlighting
```javascript
// Get high-accuracy sections
fetch(`/api/adobe/related-sections/${jobId}/${sectionId}`)
    .then(response => response.json())
    .then(data => {
        if (data.adobeChallengeCompliant) {
            // Display sections with >80% accuracy
            data.relatedSections.forEach(section => {
                // Highlight section in PDF viewer
                highlightSection(section);
            });
        }
    });
```

## 🔒 Security Features

- **Environment Variable Configuration**: No hardcoded API keys
- **Input Validation**: Comprehensive file and parameter validation
- **Error Handling**: Secure error messages without information leakage
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: Built-in request throttling
- **Health Checks**: Docker health check integration

## 📈 Monitoring & Logging

### Performance Monitoring
- Real-time operation tracking
- Threshold violation alerts
- Success/failure rate monitoring
- Resource usage tracking

### Logging Levels
- **INFO**: General application events
- **DEBUG**: Performance and accuracy validation details
- **WARN**: Threshold violations and fallbacks
- **ERROR**: System failures and exceptions

## 🚀 Getting Started

1. **Clone the repository**
2. **Set environment variables**
3. **Build with Maven**: `./mvnw clean package`
4. **Run with Docker**: `docker-compose up`
5. **Access the API**: `http://localhost:8080`
6. **Check compliance**: `http://localhost:8080/api/adobe/compliance/status`

## 📝 License

This project is developed for the Adobe India Hackathon 2025 Finale.

## 🤝 Contributing

This is a hackathon project. For questions or issues, please refer to the Adobe Challenge documentation.

---

**Adobe Challenge 1B Backend** - Ready for the Finale! 🎉
