# Contributing to Job Seek

Thank you for your interest in contributing! Please read this document and the
[Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

## Development Setup

### Backend (Go)

```bash
cd backend
go mod download
go test ./...
go vet ./...
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run type-check
npm run lint
npm run build
```

## Contribution Guidelines

1. **Fork** the repository and create a branch from `main`.
2. **Keep changes focused** — one logical change per pull request.
3. **Write tests** for backend changes (`backend/main_test.go`) and ensure the
   frontend passes `type-check`, `lint`, and `build`.
4. **Run formatting**: `gofmt -w .` for Go files; Prettier conventions for
   frontend files where applicable.
5. **Open a pull request** using the pull request template.

## Commit Messages

Use clear, imperative commit messages. For example:

```
fix: prevent panic when PDF contains no text

The PDF parser could return an empty string for scanned documents.
Return a 400 response with a helpful message instead of panicking.
```

## Reporting Bugs

Please use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
For security issues, see [SECURITY.md](SECURITY.md).
