# VulnCheck

> How secure is your website — really?

A SaaS application for automated website security audits. Built for founders who don't speak CVE and developers who ship AI-generated code.

**Engine version:** `2.0.0` (real passive scanner)

## Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Node.js API routes (tls, dns modules)
- Real passive security scanner (23 checks)
- Stripe Checkout (test mode) — one-off $9 + Pro $29/mo
- "Coming Soon" feature cards with waitlist email capture
- Payment persistence via localStorage (MVP)
- Mock scan engine available via `?mode=mock`
- EN/CS localization with auto-detection
- PDF export via `@media print`

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

## Project structure

```
app/
  page.tsx                Landing page (hero, pricing, coming soon, FAQ, thank-you modal)
  scan/page.tsx           Results page (score ring, findings, meta panel, paywall)
  globals.css             Dark theme + print/PDF styles
  api/scan/route.ts       Scan API — real engine (default) or mock (?mode=mock)
  api/checkout/route.ts   Stripe Checkout (direct API, no SDK)
  api/waitlist/route.ts   Waitlist email capture (POST)
components/
  ScanForm.tsx            URL input on landing
  ResultsView.tsx         Score ring, findings list, meta panel, PDF export
  ComingSoonSection.tsx   "Coming soon" feature cards + waitlist email inputs
  Paywall.tsx             Upsell modal (one-off / pro)
  LanguageSwitcher.tsx    EN/CS toggle
lib/
  i18n.tsx                Localization dictionaries (EN + CS)
  scanEngine.ts           Deterministic mock scan engine (v1.0)
  scanner/
    types.ts              Shared types + ENGINE_VERSION constant
    checks.ts             All passive security check functions
    index.ts              Scan orchestrator (parallel execution, scoring)
```

---

## Scan Engine v2.0

The real scan engine (`lib/scanner/`) performs **23 passive security checks** against a target URL. All checks are non-invasive — no payloads, no exploitation, no authentication bypass attempts. The engine only inspects publicly visible HTTP responses, headers, TLS handshakes, DNS records, and common paths.

### How it works

1. **Phase 1 — Parallel info gathering:** Fetches the HTTPS page, resolves IP via DNS, inspects TLS certificate via `tls.connect()`, and checks HTTP-to-HTTPS redirect behavior — all in parallel.
2. **Phase 2 — Parallel checks:** Runs all 23 checks concurrently against the gathered data.
3. **Aggregation:** Deduplicates findings by `checkId`, sorts by severity, calculates score/grade.
4. **Meta extraction:** Fingerprints technologies, collects TLS/cert details, measures response time.

Every scan result includes `engineVersion` so results can be compared across engine upgrades.

### Check categories

#### 1. Transport Security (HTTPS / TLS)

| Check ID | Severity | OWASP | What it detects |
|---|---|---|---|
| `cert-invalid` | Critical | A02:2021 | TLS certificate is not trusted (self-signed, expired, wrong host) |
| `cert-expiring` | Medium | A02:2021 | Certificate expires within 30 days |
| `http-no-redirect` | High | A02:2021 | HTTP does not redirect to HTTPS, or serves content directly |

#### 2. Security Headers

| Check ID | Severity | OWASP | What it detects |
|---|---|---|---|
| `no-hsts` | Medium | A02:2021 | Missing `Strict-Transport-Security` header |
| `hsts-short` | Low | A02:2021 | HSTS `max-age` less than 6 months (15768000s) |
| `no-csp` | High | A05:2021 | Missing `Content-Security-Policy` header |
| `no-x-frame-options` | Medium | A05:2021 | Missing `X-Frame-Options` and no `frame-ancestors` in CSP |
| `no-x-content-type-options` | Medium | A05:2021 | Missing `X-Content-Type-Options: nosniff` |
| `no-referrer-policy` | Low | A05:2021 | Missing `Referrer-Policy` header |
| `no-permissions-policy` | Low | A05:2021 | Missing `Permissions-Policy` (or `Feature-Policy`) header |

#### 3. Server Information Leakage

| Check ID | Severity | OWASP | What it detects |
|---|---|---|---|
| `server-banner` | Low | A05:2021 | `Server` header reveals version number |
| `x-powered-by` | Low | A05:2021 | `X-Powered-By` header present (leaks framework info) |

#### 4. Cookie Security

| Check ID | Severity | OWASP | What it detects |
|---|---|---|---|
| `cookies-insecure` | Medium | A07:2021 | Cookies missing `Secure`, `HttpOnly`, or `SameSite` flags |

#### 5. CORS Misconfiguration

| Check ID | Severity | OWASP | What it detects |
|---|---|---|---|
| `cors-wildcard` | Medium/High | A01:2021 | `Access-Control-Allow-Origin: *` or reflects attacker origin. Elevated to High if `Allow-Credentials: true` |

#### 6. Exposed Sensitive Paths

| Check ID | Severity | OWASP | Paths probed |
|---|---|---|---|
| `env-exposed` | Critical | A05:2021 | `/.env` |
| `git-exposed` | Critical | A05:2021 | `/.git/HEAD` |
| `ds-store-exposed` | Low | A05:2021 | `/.DS_Store` |
| `admin-exposed` | High | A01:2021 | `/admin`, `/wp-admin/`, `/wp-login.php` |
| `debug-exposed` | High/Medium | A05:2021 | `/phpinfo.php`, `/server-status`, `/debug` |

Also checks `/.well-known/security.txt` (positive signal, not a finding).

#### 7. DNS Security

| Check ID | Severity | OWASP | What it detects |
|---|---|---|---|
| `no-spf` | Medium | A07:2021 | No SPF (`v=spf1`) TXT record |
| `no-dmarc` | Medium | A07:2021 | No DMARC record at `_dmarc.{hostname}` |

#### 8. Content Analysis

| Check ID | Severity | OWASP | What it detects |
|---|---|---|---|
| `mixed-content` | Medium | A02:2021 | HTTP resources loaded on HTTPS page (`src=`, `href=`, `action=` pointing to `http://`) |
| `outdated-library` | High | A06:2021 | Known outdated JS libraries: jQuery < 3.5, Bootstrap < 5.0, AngularJS < 1.8 |

### Technology Fingerprinting

The engine also identifies technologies from:
- `Server` and `X-Powered-By` response headers
- Cookie names (`PHPSESSID` → PHP, `JSESSIONID` → Java, `__cfduid` → Cloudflare, etc.)
- HTML patterns (`wp-content` → WordPress, `__next` → Next.js, `data-reactroot` → React, etc.)
- `<meta name="generator">` tag

### Scoring

```
Base score: 100

Deductions per finding:
  Critical  -15
  High      -10
  Medium     -5
  Low        -2
  Info        0

Final score = clamp(0, 100)

Grade:  A+ (>=95)  A (>=85)  B (>=70)  C (>=55)  D (>=40)  F (<40)
Tone:   safe (>=75)  warn (>=50)  danger (<50)
```

### Scan Meta (included in every result)

- Resolved IP address
- Server software and framework (`Server`, `X-Powered-By`)
- TLS protocol and cipher suite
- Certificate issuer, subject, expiry, days remaining
- HTTP redirect chain
- Response time (ms)
- HTTP status code
- Detected technologies

---

## Mock Engine v1.0

The original mock engine (`lib/scanEngine.ts`) is still available via `?mode=mock`. It hashes the hostname with FNV-1a and seeds a Mulberry32 PRNG to deterministically pick 4-9 findings from a pool of 13 OWASP-flavored issues. Same URL always produces the same score — useful for demos and testing the UI without hitting real targets.

## API

```
GET  /api/scan?url=https://example.com          → real scan (engine v2.0)
GET  /api/scan?url=https://example.com&mode=mock → mock scan (engine v1.0)
POST /api/checkout                               → Stripe Checkout session
POST /api/waitlist                               → email capture for coming soon features
```

### Scan API

Response includes `engineVersion` and `mode` fields to identify which engine produced the result.

### Checkout API

Uses direct `fetch` to Stripe API (not the SDK — SDK has connection issues on Vercel serverless). Creates a Checkout Session for one-off ($9) or subscription ($29/mo).

```
POST /api/checkout
Content-Type: application/json

{ "url": "https://example.com", "plan": "oneoff" }   → one-time $9
{ "url": "https://example.com", "plan": "pro" }      → recurring $29/mo
{ "url": "landing-page-purchase", "plan": "oneoff" }  → from pricing card (no scan URL)
```

Returns `{ url: "https://checkout.stripe.com/..." }` — client redirects there.

### Waitlist API

```
POST /api/waitlist
Content-Type: application/json

{ "email": "user@company.com", "feature": "monitoring" }
```

Valid feature tags: `monitoring`, `fix-service`, `cicd`, `ai-scan`, `score-tracking`, `advanced-reports`

Returns `{ ok: true }`. In-memory storage for MVP.

---

## Payments

### Stripe Integration

- Direct Stripe REST API calls from `/api/checkout` (no SDK)
- Test mode: use card `4242 4242 4242 4242`, any expiry, any CVC
- Products configured via env vars: `STRIPE_PRODUCT_ONEOFF`, `STRIPE_PRODUCT_PRO`
- After payment, Stripe redirects back with `?unlocked=1` (results) or `?purchased=plan` (landing)

### Payment Persistence (current: localStorage MVP)

After Stripe payment, `vc_paid` is stored in localStorage:
```json
{ "plan": "oneoff", "ts": 1712678400000 }
```
All subsequent scans auto-unlock the full report without paywall.

**Limitations:**
- Lost if user clears browser data
- Doesn't work across devices/browsers
- No scan history
- No account management

These limitations will be resolved by the Supabase migration (see roadmap below).

## Free vs Paid

- **Free:** score + top 3 findings + benchmark percentile
- **Paid ($9):** full finding list + business impact + fix instructions + PDF export
- **Pro ($29/mo):** unlimited scans + monitoring + CI/CD hooks (planned)

## Localization

Full EN and CS translations for all 23 check IDs (title, summary, impact, fix instructions) plus all UI strings. Language auto-detected from browser, switchable via toggle.

---

## Coming Soon Features (UI-only, not functional)

Six features visible in the UI as "Coming Soon" cards with waitlist email capture. Shown on both the landing page (between Pricing and FAQ) and results page (after findings).

| Feature | Tag | Description |
|---|---|---|
| Continuous Monitoring | `monitoring` | Get alerted when your site becomes vulnerable |
| Fix It For Me | `fix-service` | We fix all your vulnerabilities for you |
| CI/CD Integration | `cicd` | Scan your app before every deploy |
| AI Code Scanner | `ai-scan` | Paste code and detect vulnerabilities instantly |
| Score Tracking | `score-tracking` | Track security posture over time |
| Advanced Reports | `advanced-reports` | Investor-ready PDFs for board decks and compliance |

Each card has: emoji icon, localized "Coming soon" badge, emotional copy, email input + "Notify me" CTA. Hidden from PDF export.

---

## Post-Purchase Experience

- **Results page:** Green success banner "Payment successful! Your full report is unlocked."
- **Landing page:** Thank-you modal with checkmark, plan name, CTA to scan first site, receipt note
- All subsequent scans auto-unlock via localStorage persistence

---

## Roadmap: Supabase Auth + Database

The current MVP uses localStorage for payment persistence, which is fragile. The next major milestone is migrating to Supabase for proper user accounts, payment tracking, and scan history.

### TODO: Authentication

- [ ] Set up Supabase project (free tier)
- [ ] Install `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs`
- [ ] Create Supabase client (`lib/supabase.ts`) with env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Implement magic link email login (passwordless — lowest friction for SaaS)
- [ ] Create `/login` page with email input, "Send magic link" CTA
- [ ] Add auth middleware to protect paid features
- [ ] Add user avatar/email in nav bar when logged in
- [ ] Add logout button
- [ ] Store session in Supabase Auth (replaces localStorage `vc_paid`)

### TODO: Database Schema

- [ ] `users` table (managed by Supabase Auth)
- [ ] `payments` table: `id`, `user_id`, `stripe_session_id`, `plan` (oneoff/pro), `amount`, `status`, `created_at`
- [ ] `scans` table: `id`, `user_id`, `url`, `hostname`, `score`, `grade`, `findings_json`, `meta_json`, `engine_version`, `created_at`
- [ ] `waitlist` table: `id`, `email`, `feature`, `created_at` (replace in-memory store)
- [ ] Row Level Security (RLS) policies: users can only read their own scans/payments

### TODO: Stripe Webhook

- [ ] Create `POST /api/webhook` route for Stripe webhook events
- [ ] Handle `checkout.session.completed` → insert into `payments` table
- [ ] Handle `customer.subscription.deleted` → deactivate Pro plan
- [ ] Verify webhook signature with `STRIPE_WEBHOOK_SECRET`
- [ ] Remove localStorage payment persistence — use DB as source of truth

### TODO: User Dashboard

- [ ] Create `/dashboard` page (protected, requires login)
- [ ] Show list of past scans with score, grade, date, hostname
- [ ] Click a scan to view full results (load from `scans` table)
- [ ] Show current plan status (Free / One-off / Pro) from `payments` table
- [ ] Show payment history
- [ ] "Scan new site" CTA button
- [ ] For Pro users: show scan count this month, next billing date

### TODO: Scan History Storage

- [ ] After each scan completes, save full result to `scans` table (linked to user)
- [ ] Limit free users to 1 scan/day (check `scans` table count)
- [ ] Pro users: unlimited scans
- [ ] One-off users: unlimited scans for the purchased URL only, or all URLs (decide)

### TODO: Waitlist Migration

- [ ] Create `waitlist` table in Supabase
- [ ] Update `POST /api/waitlist` to insert into DB instead of in-memory array
- [ ] Add admin view or Supabase dashboard query to export waitlist emails by feature

### Suggested Implementation Order

1. Supabase project setup + env vars
2. Auth (magic link login + `/login` page + nav bar)
3. Database schema + RLS policies
4. Stripe webhook → `payments` table
5. Save scan results → `scans` table
6. User dashboard (`/dashboard`)
7. Waitlist migration to DB
8. Remove localStorage fallback
