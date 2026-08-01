# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue
in Job Seek, please do **not** open a public issue. Instead, report it
privately by opening a draft security advisory at:

<https://github.com/undefined-art/job-seek/security/advisories/new>

Please include as much of the following information as possible:

- The type of issue (e.g., buffer overflow, SQL injection, cross-site scripting)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Response Times

You can expect an acknowledgment within 3 business days and a more detailed
response within 10 business days. We will keep you informed of our progress
as we work toward a resolution.

## Scope

The following are in scope:

- The Go backend under `backend/`
- The Next.js frontend under `frontend/`
- Docker configuration and CI workflows

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Security Considerations

This project intentionally:

- Processes CV data **locally** using Ollama; no data leaves your machine
- Processes uploaded files **in memory only**; files are never stored on disk
- Rejects DOC/DOCX uploads for security reasons (unsafe parsing). Convert to
  PDF or paste the text directly instead
- Enforces a maximum upload size of 10MB
- Sends requests to Ollama with a 60-second timeout
