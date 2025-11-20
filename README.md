# FramerMode – Real-Time Claim Analysis

FramerMode is a Windows-friendly, production-ready app that extracts claims from text, verifies them via live web search, and computes a trust score with evidence links.

## Quick Start (Windows)

- Prerequisites:
  - Node.js 18+ (includes native `fetch`) on Windows
  - PowerShell terminal
- Install dependencies:
  - `npm install`
- Run the server (dev mode):
  - `npx tsx server/index.ts`
- Open the app:
  - The server logs `serving on http://127.0.0.1:5000` (or your host:port). Open that URL.

# Trust Score Analyzer

A full-stack TypeScript app that analyzes text for factual claims and computes a trust score based on evidence gathered from reputable sources.

## Getting Started

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Start in production: `npm run start`

## Environment Variables (Windows)

Set ephemeral env vars in the current PowerShell session:

- `$env:PORT = "5000"`
- `$env:HOST = "127.0.0.1"`
- `$env:USE_MEM_STORAGE = "false"`
- `$env:DATA_DIR = "c:\\path\\to\\data"`
- `$env:EVIDENCE_VALIDATE = "true"`
- `$env:ANALYZE_RATE_LIMIT_WINDOW_MS = "120000"`
- `$env:ANALYZE_RATE_LIMIT_MAX = "20"`
- `$env:VITE_LOGIN_URL = "https://example.com/login"`
- `$env:SESSION_SECRET = "replace-with-a-long-random-string"`

Or persist using `setx` (reopen terminal after):

- `setx BING_API_KEY "YOUR_KEY"`
- `setx USE_MEM_STORAGE "false"`
- `setx DATA_DIR "c:\\path\\to\\data"`
- `setx EVIDENCE_VALIDATE "true"`
- `setx ANALYZE_RATE_LIMIT_WINDOW_MS "120000"`
- `setx ANALYZE_RATE_LIMIT_MAX "20"`
- `setx VITE_LOGIN_URL "https://example.com/login"`
- `setx SESSION_SECRET "replace-with-a-long-random-string"`

## Authentication

Session-based auth is implemented using `express-session` and `passport-local`. Cookies are `httpOnly` and `sameSite=lax` with `secure` in production.

- `POST /api/auth/register` — registers a new user (email, password) and logs them in.
- `POST /api/auth/login` — authenticates with email and password, sets session cookie.
- `POST /api/auth/logout` — logs out and clears session.
- `GET /api/auth/me` — returns current user `{ id, email }`; `401` if not logged in.

Client requests send cookies via `credentials: "include"` so auth works on Windows localhost.

## How It Works

- Claim extraction: splits input into sentences and filters out non-claims.
- Verification: performs live web search (Bing, if configured) or uses reputable search result pages as a fallback.
- Evidence validation: quickly checks evidence URLs (HEAD/GET) and filters dead links.
- Scoring: keyword match weighted by domain reputation; computes an overall trust score.
- Storage: file-backed JSON store in `DATA_DIR` to persist analyses across restarts.
- Protection: simple per-IP rate limit on `/api/analyze` to prevent abuse.

## Files Touched

- `server/claim-extractor.ts`
  - Live web search via Bing API with safe fallback.
  - Domain allowlist, domain quality weighting, and HTTP validation of links.
  - Function-level comments.
- `server/routes.ts`
  - Awaited async verification.
  - Added per-IP rate limiter middleware for `/api/analyze`.
  - Function-level comments.
- `server/storage.ts`
  - Implemented `FileStorage` for persistent analyses.
  - Kept `MemStorage` for dev/testing and made selection via env.
- `server/users.ts`
  - Added file-backed user store with scrypt password hashing.
- `server/auth.ts`
  - Added session + local strategy auth endpoints.
- `server/index.ts`
  - Initialized auth before routes.
- `client/src/pages/login.tsx`
  - Bound local login form to `/api/auth/login` with error handling.
- `client/src/pages/home.tsx`
  - Shows auth status in header and provides logout.

## Production Notes

- Use HTTPS and a production reverse proxy (e.g., IIS or Nginx) to front the Node server.
- Consider enabling process monitoring (e.g., PM2 or Windows Services).
- If adding stricter evidence validation, consider per-domain fetch timeouts and retry logic.

## Troubleshooting

- If evidence links show as unavailable, verify `BING_API_KEY` or network access; set `EVIDENCE_VALIDATE=false` to skip link checks.
- If history does not persist, ensure `DATA_DIR` exists and is writable.
- On Windows, prefer `127.0.0.1` host binding for reliable HMR/dev.# Framer-mode
