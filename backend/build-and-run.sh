#!/bin/bash

# U_Drone Flask Backend - Docker Build and Run Script

set -e

echo "🚀 Building U_Drone Flask Backend Docker Image..."

# Build the Docker image
docker build -t udrone-backend:latest .

echo "✅ Docker image built successfully!"

echo "🐳 Starting U_Drone Flask Backend container..."

# Run the container
docker run -d \
  --name udrone-backend \
  -p 5000:5000 \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/map_tiles:/app/map_tiles" \
  -v "$(pwd)/logs:/app/logs" \
  --restart unless-stopped \
  udrone-backend:latest

echo "✅ Container started successfully!"
echo "🌐 Application is running at http://localhost:5000"
echo "📊 Health check available at http://localhost:5000/health"
echo "📝 API status available at http://localhost:5000/api/status"

echo ""
echo "📋 Useful commands:"
echo "  View logs: docker logs udrone-backend"
echo "  Stop container: docker stop udrone-backend"
echo "  Remove container: docker rm udrone-backend"
echo "  View container status: docker ps"
