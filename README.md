# Adobe Learn Platform

A comprehensive AI-powered document analysis and learning platform built with Spring Boot backend and Next.js frontend.

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- Maven 3.6+

### Running the Application

#### Option 1: Using the provided script (Recommended)
```bash
# Make the script executable (Linux/Mac)
chmod +x run-app.sh

# Run the application
./run-app.sh
```

#### Option 2: Manual startup

**Backend (Spring Boot)**
```bash
cd Backend
./mvnw clean package -DskipTests
java -jar target/Adobe1B.jar
```

**Frontend (Next.js)**
```bash
cd Frontend
npm install
npm run dev
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend Health**: http://localhost:8080/api/frontend/health

## 🏗️ Architecture

### Backend (Spring Boot)
- **Port**: 8080
- **Framework**: Spring Boot 3.x
- **Database**: H2 (in-memory/file)
- **Key Controllers**:
  - `FrontendIntegrationController`: Handles frontend API requests
  - `AdobeChallengeController`: Core Adobe Challenge functionality
  - `DocumentAnalysisController`: Document processing and analysis

### Frontend (Next.js)
- **Port**: 3000
- **Framework**: Next.js 14 with TypeScript
- **UI**: Tailwind CSS + Radix UI components
- **Key Features**:
  - Document upload and analysis
  - AI-powered insights generation
  - Podcast generation from insights
  - Knowledge graph visualization

## 🔗 Backend-Frontend Integration

### API Endpoints

#### Frontend Integration Endpoints (`/api/frontend/`)
- `POST /analyze` - Upload and analyze PDF documents
- `GET /status/{jobId}` - Get analysis job status
- `POST /insights/{jobId}` - Generate insights for a document
- `POST /podcast/{jobId}` - Generate podcast from insights
- `GET /health` - Health check endpoint

#### Adobe Challenge Endpoints (`/api/adobe/`)
- `POST /analyze` - Full Adobe Challenge analysis
- `GET /related-sections/{jobId}/{sectionId}` - Get related sections
- `GET /accuracy/{jobId}` - Get section accuracy validation
- `GET /performance` - Get performance metrics

### Integration Flow

1. **Document Upload**: Frontend sends PDF files to `/api/frontend/analyze`
2. **Job Processing**: Backend processes documents asynchronously
3. **Status Polling**: Frontend polls `/api/frontend/status/{jobId}` for completion
4. **Results Display**: Analysis results are displayed in the frontend UI
5. **Additional Features**: Users can generate insights and podcasts

### Error Handling
- **Backend Unavailable**: Frontend gracefully falls back to mock data
- **Network Issues**: Automatic retry with exponential backoff
- **File Validation**: Proper error messages for invalid files

## 🎯 Key Features

### Document Analysis
- PDF text extraction and processing
- AI-powered content analysis
- Section identification and categorization
- Related content discovery

### AI Insights
- LLM-powered insights generation
- Context-aware analysis
- Confidence scoring
- Source attribution

### Podcast Generation
- Text-to-speech conversion
- Natural language processing
- Audio file generation
- Transcript creation

### Knowledge Graph
- Interactive visualization
- Document relationship mapping
- Concept clustering
- Visual navigation

## 🔧 Configuration

### Backend Configuration (`application.yml`)
```yaml
server:
  port: 8080
  address: 0.0.0.0

app:
  analysis:
    enhanced:
      enabled: true
      max-sections-per-document: 5
      confidence-threshold: 0.7

cors:
  allowed-origins: "http://localhost:3000,http://0.0.0.0:3000"
```

### Frontend Configuration
- API base URL: Configured in `Frontend/lib/api.ts`
- Environment variables: Set in `.env.local`
- CORS: Handled by backend configuration

## 🐳 Docker Support

### Running with Docker Compose
```bash
cd Backend
docker-compose up -d
```

### Docker Configuration
- Backend service on port 8080
- Optional PostgreSQL for production
- Optional Redis for caching
- Nginx for load balancing (production)

## 📊 Performance Requirements

### Adobe Challenge Compliance
- **Analysis Time**: ≤10 seconds for base features
- **Navigation Time**: <2 seconds for related sections
- **Accuracy**: >80% for at least 3 sections
- **Browser Support**: Chrome compatible
- **Base App**: CPU only (no GPU required)

### Monitoring
- Real-time performance metrics
- Operation timing and validation
- Error tracking and logging
- Health check endpoints

## 🧪 Testing

### Backend Tests
```bash
cd Backend
./mvnw test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

### Integration Tests
- API endpoint testing
- End-to-end workflow validation
- Performance benchmarking
- Error scenario testing

## 🚨 Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check Java version (requires 17+)
   - Verify port 8080 is available
   - Check application logs

2. **Frontend not connecting to backend**
   - Verify backend is running on port 8080
   - Check CORS configuration
   - Review network connectivity

3. **File upload issues**
   - Ensure files are PDF format
   - Check file size limits (100MB max)
   - Verify upload directory permissions

4. **Analysis timeout**
   - Check backend resources
   - Review analysis service logs
   - Verify external API dependencies

### Logs
- **Backend**: Check `backend.log` or console output
- **Frontend**: Check browser console and `frontend.log`
- **Docker**: Use `docker-compose logs`

## 📝 Development

### Adding New Features
1. Backend: Add new endpoints in appropriate controller
2. Frontend: Create new API calls in `api.ts`
3. UI: Add components and integrate with state management
4. Testing: Add unit and integration tests

### Code Structure
```
├── Backend/
│   ├── src/main/java/com/adobe/hackathon/
│   │   ├── controller/     # REST API endpoints
│   │   ├── service/        # Business logic
│   │   ├── model/          # Data models
│   │   └── config/         # Configuration
│   └── src/main/resources/ # Configuration files
├── Frontend/
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript definitions
└── docs/                   # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the Adobe Challenge and follows Adobe's development guidelines.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review application logs
3. Create an issue with detailed information
4. Include system information and error messages
