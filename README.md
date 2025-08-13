# Adobe Learn Platform - Frontend & Backend Integration

This project consists of a Spring Boot backend and a Next.js frontend that work together to provide an AI-powered document analysis and learning platform.

## Project Structure

```
├── Backend/                 # Spring Boot application
│   ├── src/main/java/com/adobe/hackathon/
│   │   ├── controller/      # REST API controllers
│   │   ├── service/         # Business logic services
│   │   ├── model/          # Data models and DTOs
│   │   ├── repository/     # Data access layer
│   │   ├── config/         # Configuration classes
│   │   └── util/           # Utility classes
│   ├── src/main/resources/
│   │   └── application.yml # Application configuration
│   └── pom.xml            # Maven dependencies
├── Frontend/               # Next.js application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utility libraries
│   ├── hooks/            # Custom React hooks
│   └── package.json      # Node.js dependencies
└── README.md             # This file
```

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Maven 3.6 or higher
- npm or pnpm

## Quick Start

### 1. Start the Backend

```bash
cd Backend

# Install dependencies (if needed)
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Start the Frontend

```bash
cd Frontend

# Install dependencies
npm install
# or
pnpm install

# Run the development server
npm run dev
# or
pnpm dev
```

The frontend will start on `http://localhost:3000`

## API Integration

### Backend API Endpoints

The backend provides the following main API endpoints:

#### Core Analysis Endpoints
- `POST /api/adobe/analyze` - Upload and analyze PDF documents
- `GET /api/adobe/status/{jobId}` - Get analysis job status
- `GET /api/adobe/performance` - Get performance metrics

#### Insights & Related Content
- `POST /api/adobe/insights/{jobId}` - Generate AI insights
- `GET /api/adobe/related-sections/{jobId}/{sectionId}` - Get related sections
- `POST /api/adobe/bulk-insights/{jobId}` - Generate bulk insights

#### Podcast Generation
- `POST /api/adobe/podcast/{jobId}` - Generate audio podcast from documents

#### Frontend Integration
- `GET /api/frontend/document-viewer/{jobId}` - Get document viewer configuration
- `GET /api/frontend/highlighted-sections/{jobId}` - Get highlighted sections
- `GET /api/frontend/pdf-embed/{jobId}` - Get PDF embed configuration

#### PDF Embed API
- `GET /api/pdf-embed/config/{jobId}` - Get Adobe PDF Embed configuration
- `GET /api/pdf-embed/file/{jobId}` - Get PDF file
- `GET /api/pdf-embed/metadata/{jobId}` - Get PDF metadata

### Frontend API Service

The frontend uses a centralized API service (`Frontend/lib/api.ts`) that provides:

- Type-safe API calls
- Error handling
- Request/response interceptors
- Automatic retry logic

### Custom Hooks

The frontend includes custom React hooks for API integration:

- `useFileUpload()` - Handle file uploads with progress
- `useInsightsGeneration()` - Generate AI insights
- `usePodcastGeneration()` - Generate podcasts
- `useRelatedSections()` - Get related content
- `useJobPolling()` - Poll job status
- `useMultiApi()` - Manage multiple API calls

## Configuration

### Backend Configuration

The backend configuration is in `Backend/src/main/resources/application.yml`:

```yaml
server:
  port: 8080
  address: 0.0.0.0

cors:
  allowed-origins: "http://localhost:3000,http://localhost:8080"
  allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
  allowed-headers: "*"

app:
  analysis:
    enhanced:
      enabled: true
      max-sections-per-document: 5
      confidence-threshold: 0.7
```

### Frontend Configuration

The frontend configuration is in `Frontend/next.config.mjs`:

```javascript
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  },
}
```

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the Backend directory:

```env
ADOBE_CLIENT_ID=your_adobe_client_id
ADOBE_CLIENT_SECRET=your_adobe_client_secret
GOOGLE_APPLICATION_CREDENTIALS=path_to_google_credentials.json
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region
```

### Frontend Environment Variables

Create a `.env.local` file in the Frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ADOBE_CLIENT_ID=your_adobe_client_id
```

## Development Workflow

### 1. File Upload Flow

1. User selects PDF files in the frontend
2. Frontend calls `POST /api/adobe/analyze` with files and analysis parameters
3. Backend processes files and returns a job ID
4. Frontend polls job status using `GET /api/adobe/status/{jobId}`
5. When complete, frontend displays results

### 2. Insights Generation Flow

1. User clicks "Generate Insights" button
2. Frontend calls `POST /api/adobe/insights/{jobId}`
3. Backend generates AI insights using LLM
4. Frontend displays insights in a modal

### 3. Podcast Generation Flow

1. User clicks "Generate Podcast" button
2. Frontend calls `POST /api/adobe/podcast/{jobId}`
3. Backend generates audio using TTS service
4. Frontend displays audio player with generated podcast

## Error Handling

### Backend Error Handling

- Global exception handler in `@ControllerAdvice`
- Structured error responses with error codes
- Logging with SLF4J
- Performance monitoring and metrics

### Frontend Error Handling

- Centralized error handling in API service
- User-friendly error messages
- Retry logic for failed requests
- Loading states and error states

## Performance Optimization

### Backend Performance

- Async processing for long-running operations
- Caching with Spring Cache
- Database connection pooling
- File upload size limits and validation

### Frontend Performance

- React.memo for component optimization
- Lazy loading of components
- Image optimization
- Bundle splitting

## Testing

### Backend Testing

```bash
cd Backend
mvn test
```

### Frontend Testing

```bash
cd Frontend
npm run test
```

## Deployment

### Backend Deployment

```bash
cd Backend
mvn clean package
java -jar target/Adobe1B.jar
```

### Frontend Deployment

```bash
cd Frontend
npm run build
npm start
```

## Docker Deployment

### Backend Docker

```bash
cd Backend
docker build -t adobe-backend .
docker run -p 8080:8080 adobe-backend
```

### Frontend Docker

```bash
cd Frontend
docker build -t adobe-frontend .
docker run -p 3000:3000 adobe-frontend
```

### Docker Compose

```bash
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS configuration is correct in both frontend and backend
2. **Port Conflicts**: Check if ports 3000 and 8080 are available
3. **File Upload Issues**: Verify file size limits and multipart configuration
4. **API Connection**: Check if backend is running and accessible

### Debug Mode

#### Backend Debug

Add to `application.yml`:
```yaml
logging:
  level:
    com.adobe.hackathon: DEBUG
    org.springframework.web: DEBUG
```

#### Frontend Debug

Add to browser console:
```javascript
localStorage.setItem('debug', 'true')
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
