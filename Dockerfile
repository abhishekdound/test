# Multi-stage build for Adobe India Hackathon 2025
# Frontend: Next.js, Backend: Spring Boot

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY Frontend/package*.json ./
COPY Frontend/next.config.mjs ./
COPY Frontend/tailwind.config.ts ./
COPY Frontend/tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY Frontend/ ./

# Build the application
RUN npm run build

# Stage 2: Build Backend
FROM maven:3.9.4-eclipse-temurin-17 AS backend-builder

WORKDIR /app/backend

# Copy pom.xml and download dependencies
COPY Backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code
COPY Backend/src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine

# Install Node.js for serving frontend
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copy built backend JAR
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/public /app/frontend/public
COPY --from=frontend-builder /app/frontend/package*.json /app/frontend/

# Install frontend dependencies for runtime
WORKDIR /app/frontend
RUN npm ci --only=production

# Create directories for uploads and data
RUN mkdir -p /app/uploads /app/data /app/uploads/audio

# Copy startup script
WORKDIR /app
COPY start-app.sh ./
RUN chmod +x start-app.sh

# Expose port 8080 as required by hackathon
EXPOSE 8080

# Set environment variables
ENV SERVER_PORT=8080
ENV SPRING_PROFILES_ACTIVE=production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/frontend/health || exit 1

# Start both frontend and backend
CMD ["./start-app.sh"]

