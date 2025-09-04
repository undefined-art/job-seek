#!/bin/bash

# Job Seek - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Job Seek application..."

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install Ollama first:"
    echo "   Visit: https://ollama.ai/download"
    exit 1
fi

echo "✅ Ollama is installed"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker Compose is installed"

# Pull the required Ollama model
echo "📥 Pulling Ollama model (llama3.2:3b)..."
ollama pull llama3.2:3b

echo "✅ Model downloaded successfully"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Frontend dependencies installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
go mod tidy
cd ..

echo "✅ Backend dependencies installed"

echo ""
echo "🎉 Setup complete! You can now start the application:"
echo ""
echo "   Development mode:"
echo "   ./scripts/dev.sh"
echo ""
echo "   Production mode (Docker):"
echo "   ./scripts/prod.sh"
echo ""
echo "   Or manually:"
echo "   Backend:  cd backend && go run main.go"
echo "   Frontend: cd frontend && npm run dev"
echo ""
