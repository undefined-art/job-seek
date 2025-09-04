#!/bin/bash

# Job Seek - Production Script
# This script starts the application in production mode using Docker

set -e

echo "🚀 Starting Job Seek in production mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

echo ""
echo "🎉 Application started successfully!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8080"
echo "🤖 Ollama:   http://localhost:11434"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""

# Wait a moment for services to start
sleep 5

# Check if services are healthy
echo "🔍 Checking service health..."

# Check Ollama
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is healthy"
else
    echo "⚠️  Ollama is starting up (this may take a few minutes)"
fi

# Check Backend
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend is starting up"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️  Frontend is starting up"
fi

echo ""
echo "🎯 Ready to use! Open http://localhost:3000 in your browser"
