# 2good2breal - Product Requirements Document

## Original Problem Statement
2good2breal is a dating profile verification service. Full-stack application (React frontend, FastAPI backend, MongoDB) allowing users to submit dating profiles for AI-driven verification (Gemini via Emergent LLM) and manual Admin review.

## Core Features Implemented
1. 4-step client submission wizard (Info, Photos, Activity, Observations)
2. AI-powered profile analysis (Gemini) - runs in background
3. Admin dashboard with 3 tabs: Profile Submissions, Profile Seeker, Comparator
4. Stripe payment integration
5. Email notifications (Resend) via contact@2good2breal.com
6. Multi-language support (EN/FR)
7. DOCX/PDF report generation
8. **Profile Seeker** with SerpAPI integration (web search + reverse image + AI analysis)
9. **Photo Comparator** with AI-powered facial analysis (Gemini)
10. Admin stored in MongoDB (auto-seed on login - works on serverless)

## Architecture (Refactored - June 18, 2026)
- Frontend: React + Tailwind + Shadcn/UI
- Backend: FastAPI - **Modular architecture**
  - `server.py` (81 lines) - App entry point, middleware, router includes
  - `config.py` - DB connection, env vars, constants
  - `models/` - Pydantic models (user, analysis, payment, admin, seeker)
  - `utils/auth.py` - Auth helpers (hash, tokens, JWT verification)
  - `services/` - Business logic (AI, email, PDF, DOCX)
  - `routes/` - API routes (auth, admin, analysis, filters, dashboard, payments, seeker, health)
- Database: MongoDB
- Integrations: Stripe, Resend, Gemini (Emergent LLM), SerpAPI

## Key API Endpoints
- POST /api/auth/register, /api/auth/login, /api/auth/me
- POST /api/auth/forgot-password, /api/auth/reset-password
- POST /api/admin/login
- GET/POST /api/admin/analyses, /api/admin/analyses/{id}/report
- GET /api/admin/analyses/{id}/submission-pdf, /submission-docx, /download-docx
- POST /api/admin/analyses/{id}/send-report
- POST /api/analyze
- GET /api/analyses, /api/analyses/{id}
- POST/GET/PUT/DELETE /api/filters
- GET /api/stats
- GET /api/packages, POST /api/checkout, GET /api/checkout/status/{id}
- GET /api/credits, /api/transactions
- POST /api/webhook/stripe
- GET/POST /api/seeker/profiles, /api/seeker/comparisons
- POST /api/seeker/compare-photos, /api/seeker/profiles/{id}/search
- GET /api/seeker/profiles/{id}/report-pdf
- POST /api/seeker/comparator-pdf
- POST /api/refund-request

## Completed Work
- All core features (auth, payments, submissions, admin dashboard)
- Profile Seeker with SerpAPI
- Photo Comparator with Gemini
- PDF/DOCX generation
- Multi-language (EN/FR)
- **Backend refactoring: server.py 4334 → 81 lines** (June 18, 2026)

## Backlog
- P1: Refactor AnalyzePage.jsx (~1900 lines) into smaller components
- P2: Migrate auth tokens from localStorage to HttpOnly cookies
- P3: Fix React Hook dependency warnings (stale closures)
- Blocked: Resend domain verification (waiting on user DNS setup)
