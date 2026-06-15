# ColabRise Landing Page — PRD

## Original Problem Statement
> Build a bold dark 3D-effect landing page for ColabRise (an influencer marketing co.) — gradient blobs, mouse-tilt 3D cards, floating phone mockups, animated marquee, glass-morphism, and a hero gradient in pink→violet→cyan.

User selected defaults across all clarifying questions.

## Architecture
- **Frontend**: React 19 + Tailwind + framer-motion + react-fast-marquee + react-parallax-tilt + shadcn (Accordion, sonner toaster). Fonts: Outfit (display) + DM Sans (body).
- **Backend**: FastAPI + Motor (async MongoDB). All routes prefixed `/api`. Two collections: `status_checks`, `leads`.
- **Routing**: Single-page landing (`/`).

## User Personas
- **Brand marketing leads / DTC founders**: scanning the page, want a quick signal of legitimacy + book a strategy call.
- **Creators / partners**: secondary, browse before reaching out.

## Core Requirements (static)
- Dark theme, void background `#030305`.
- Hero with pink→violet→cyan gradient, floating 3D phones, blobs.
- Animated infinite marquee of brand-style logotypes.
- Mouse-tilt 3D service & case-study cards.
- Glass-morphism navbar (sticky, scroll-aware).
- Pricing with featured Pro tier (gradient border).
- FAQ accordion (shadcn).
- Lead capture form → POST `/api/leads` (MongoDB), success state UI.

## What's Been Implemented (2026-06-15)
- Backend `POST/GET /api/leads` (Pydantic LeadCreate + EmailStr) with MongoDB persistence.
- All 8 landing sections: Navbar, Hero (gradient text + floating phones + blobs + stats), BrandMarquee, Services (5-card bento, tilt), CaseStudies (image cards + tilt), Pricing (3 tiers, featured Pro), FAQ (5 Qs, accordion), LeadForm (name/email/company/budget chips/message → backend + success state), Footer (giant background wordmark).
- Backend regression suite at `/app/backend/tests/test_colabrise.py` (5/5 green).
- Testing agent ran full e2e — backend 100%, frontend 100%, 0 issues.

## Prioritized Backlog
- **P1**: Basic rate-limit / honeypot on `/api/leads` (currently public/spammable).
- **P1**: Lock down `CORS_ORIGINS` from `*` in production env.
- **P2**: Admin route + dashboard to view captured leads.
- **P2**: Replace stock Unsplash phone preview with branded creator content.
- **P2**: Add email notification (Resend / SendGrid) on new lead.
- **P3**: A/B test hero CTA copy.
- **P3**: Internationalisation pass.

## Test Credentials
n/a — no auth in this MVP.
