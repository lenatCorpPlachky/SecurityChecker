# Changelog

All notable changes to the VulnCheck scan engine are documented here.

Format follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`
- **MAJOR** — breaking changes to scan result schema or scoring algorithm
- **MINOR** — new checks added, existing checks improved
- **PATCH** — bug fixes, threshold tweaks, evidence formatting

---

## [2.1.0] — 2026-04-09

### Feature: "Coming Soon" Cards + Waitlist Email Capture

#### Added
- **6 "Coming Soon" feature cards** visible on both landing page and results page
  - Continuous Monitoring, Fix It For Me, CI/CD Integration, AI Code Scanner, Score Tracking, Advanced Reports
  - Each card has emoji icon, localized badge, emotional copy, email input form
- **`POST /api/waitlist`** endpoint for email capture
  - Accepts `{ email, feature }` with validation
  - Deduplicates by email + feature pair
  - In-memory storage (MVP)
  - Valid feature tags: `monitoring`, `fix-service`, `cicd`, `ai-scan`, `score-tracking`, `advanced-reports`
- **`ComingSoonSection` component** with `variant` prop for landing vs results styling
- **Full EN + CS translations** for all Coming Soon copy (`comingSoon` block in i18n)
- Cards hidden from PDF export via `no-print` class

#### Changed
- Landing page: Coming Soon section inserted between Pricing and FAQ
- Results page: Coming Soon section inserted after emotional footer, before paywall

---

## [2.0.0] — 2026-04-09

### Engine: Real Passive Scanner

Complete replacement of the mock engine with a real passive security scanner.

#### Added — 23 passive checks
- **Transport Security:** `cert-invalid`, `cert-expiring`, `http-no-redirect`
- **Security Headers:** `no-hsts`, `hsts-short`, `no-csp`, `no-x-frame-options`, `no-x-content-type-options`, `no-referrer-policy`, `no-permissions-policy`
- **Server Info:** `server-banner`, `x-powered-by`
- **Cookies:** `cookies-insecure` (Secure/HttpOnly/SameSite)
- **CORS:** `cors-wildcard` (wildcard or reflected origin, credential escalation)
- **Exposed Paths:** `env-exposed`, `git-exposed`, `ds-store-exposed`, `admin-exposed`, `debug-exposed`
- **DNS:** `no-spf`, `no-dmarc`
- **Content:** `mixed-content`, `outdated-library` (jQuery, Bootstrap, AngularJS)

#### Added — Scan metadata
- IP address resolution (dns.resolve4)
- TLS protocol and cipher suite (tls.connect)
- Certificate details: issuer, subject, expiry, days remaining
- HTTP redirect chain tracking
- Response time measurement
- Technology fingerprinting (headers, cookies, HTML patterns, meta generator)

#### Added — Engine versioning
- `ENGINE_VERSION` constant in `lib/scanner/types.ts`
- `engineVersion` field in every scan result (real and mock)

#### Changed
- API route switched from Edge Runtime to Node.js (requires `tls`, `dns` modules)
- `maxDuration` set to 25s for Vercel serverless
- Findings use `checkId: string` instead of `key: number`
- Score calculation based on real severity deductions (not PRNG)

#### Infrastructure
- `NODE_TLS_REJECT_UNAUTHORIZED=0` for scanning sites with non-standard CA chains
- Parallel execution: Phase 1 (fetch + DNS + TLS) and Phase 2 (all checks) run concurrently
- 8s timeout on main fetches, 4s timeout on path probes

---

## [1.0.0] — 2026-04-08

### Engine: Deterministic Mock Scanner

Initial release with mock scan engine for MVP/demo purposes.

#### Added
- Deterministic scan results seeded from hostname hash (FNV-1a + Mulberry32 PRNG)
- Pool of 13 OWASP Top 10 findings with weighted severity distribution
- Same URL always produces the same score and findings
- Score range 25-95, grade A+ through F
- EN and CS localization for all finding descriptions

#### Notes
- No real network requests to target — purely algorithmic
- Still available via `?mode=mock` query parameter
