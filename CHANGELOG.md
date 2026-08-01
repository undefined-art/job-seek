# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Backend unit tests (`backend/main_test.go`) covering JSON cleaning, file
  extraction, Ollama integration, health, and analysis endpoints.
- CI pipeline (GitHub Actions) that vets, formats, builds, and tests the Go
  backend and type-checks, lints, and builds the Next.js frontend.
- Docker healthchecks for all services and a `depends_on` chain that waits for
  Ollama and the backend before starting downstream services.
- `NEXT_PUBLIC_API_URL` build argument so the frontend image can target the
  correct backend URL at build time.
- `.dockerignore` files for both backend and frontend.
- Security, support, contributing, code of conduct, notice, and changelog
  documents.

### Changed

- `OLLAMA_URL`, `MODEL_NAME`, `PORT`, and `CORS_ORIGIN` are now configurable
  via environment variables instead of hard-coded constants.
- HTTP client used for Ollama calls now enforces a 60-second timeout.
- Request body size is capped (10MB upload / 11MB request) to prevent
  resource exhaustion.
- `docker-compose.yml` no longer bind-mounts source directories over the built
  images (previously it shadowed the compiled binary and the Next.js standalone
  build, which would have broken `docker compose up --build`).
- Frontend Dockerfile now installs all dependencies (dev dependencies are
  required for `next build`) and builds a standalone output.
- Next.js config now emits a standalone build (`output: 'standalone'`) and
  enables `strict-origin-when-cross-origin` for the Referrer-Policy header.
- The compiled `backend/main` binary was removed from version control.
- Removed the deprecated `experimental.appDir` and `swcMinify` options.

### Fixed

- `next lint` no longer requires interactive ESLint setup (added `.eslintrc.json`).
- Unescaped apostrophe in `AnalysisResults.tsx` that failed the build.
