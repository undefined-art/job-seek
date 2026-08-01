# Job Seek - Privacy-First CV Analysis

A lightweight, privacy-focused application for CV analysis and cover letter generation using local AI processing.

## Features

- 📄 **File Upload**: Support for PDF format (DOC/DOCX via text input)
- 🔒 **Privacy-First**: All processing happens locally with Ollama
- ⚡ **Ultralight**: Optimized for performance and minimal resource usage
- 🤖 **AI Analysis**: CV scoring, improvement suggestions, and cover letter generation
- 🎨 **Modern UI**: Clean, responsive interface built with Next.js
- 🐳 **Docker Ready**: Easy deployment with Docker Compose

## Quick Start

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**

   ```bash
   ./scripts/setup.sh
   ```

2. **Start in development mode:**

   ```bash
   ./scripts/dev.sh
   ```

3. **Or start in production mode:**
   ```bash
   ./scripts/prod.sh
   ```

### Option 2: Manual Setup

1. **Install Ollama and pull the model:**

   ```bash
   ollama pull llama3.2:3b
   ```

2. **Start the backend:**

   ```bash
   cd backend
   go mod tidy
   go run main.go
   ```

3. **Start the frontend (in a new terminal):**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open http://localhost:3000**

## Docker Deployment

### Production

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps

# Stop services
docker-compose down
```

The Compose file waits for Ollama and the backend to become healthy before
starting downstream services. The frontend image bakes the API URL at build
time via the `NEXT_PUBLIC_API_URL` build argument (defaults to
`http://localhost:8080`, which is reachable from the browser because the
backend publishes port 8080 to the host).

### Local Development (without Docker)

1. Install Ollama and pull the model (see below).
2. Start the backend:

   ```bash
   cd backend
   go mod tidy
   go run main.go
   ```

3. Start the frontend (in a new terminal):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open http://localhost:3000

## Running Tests

```bash
# Backend (Go)
cd backend
go test ./...

# Frontend (Next.js)
cd frontend
npm run type-check
npm run lint
npm run build
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/analyze` - Analyze CV (accepts file upload or text)

### Example API Usage

```bash
# Analyze a file
curl -X POST -F "file=@resume.pdf" http://localhost:8080/api/analyze

# Analyze text
curl -X POST -F "text=Your CV content here..." http://localhost:8080/api/analyze
```

## Configuration

### Environment Variables

| Variable            | Default                    | Description                                     |
| ------------------- | -------------------------- | ----------------------------------------------- |
| `PORT`              | `8080`                     | Backend listen port                             |
| `OLLAMA_URL`        | `http://localhost:11434`   | Ollama server base URL                          |
| `MODEL_NAME`        | `llama3.2:3b`              | Ollama model used for analysis                  |
| `CORS_ORIGIN`       | `http://localhost:3000`    | Comma-separated allowed frontend origins        |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080`  | Backend URL used by the browser                 |

Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

### Ollama Models

The application uses `llama3.2:3b` by default. You can use other models by:

1. Pulling a different model:

   ```bash
   ollama pull llama3.2:1b  # Smaller, faster model
   ollama pull llama3.2:8b  # Larger, more capable model
   ```

2. Updating the `MODEL_NAME` environment variable

## Privacy & Security

- ✅ **100% Local Processing**: All data stays on your machine
- ✅ **No External APIs**: No data sent to external services
- ✅ **Memory-Only Processing**: Files are processed in memory, not stored
- ✅ **Secure Headers**: Security headers configured in Next.js
- ✅ **Input Validation**: File type and size validation
- ✅ **CORS Protection**: Configured for secure cross-origin requests

## Performance Optimizations

- **Streaming File Processing**: Large files processed efficiently
- **Memory Management**: Optimized memory usage for file handling
- **Fast Response Times**: Local AI processing eliminates network latency
- **Minimal Resource Footprint**: Lightweight containers and optimized builds
- **Caching**: Built-in caching for improved performance

## Troubleshooting

### Common Issues

1. **Ollama not responding:**

   ```bash
   ollama serve
   ```

2. **Port conflicts:**

   - Change ports in `docker-compose.yml` or environment variables

3. **Model not found:**

   ```bash
   ollama pull llama3.2:3b
   ```

4. **Permission issues:**

   ```bash
   chmod +x scripts/*.sh
   ```

5. **Analysis returns default response:**
   - Check if Ollama is running: `curl http://localhost:11434/api/tags`
   - Verify model is installed: `ollama list`
   - Check backend health: `curl http://localhost:8080/health`

### Error Handling

The application now provides detailed error messages instead of silent failures:

- **Backend Health Check**: `/health` endpoint shows system status
- **Ollama Connectivity**: Clear error messages when AI service is unavailable
- **File Processing**: Specific errors for unsupported formats or file issues
- **Analysis Errors**: Detailed feedback when AI analysis fails

## License

MIT License - see LICENSE file for details
