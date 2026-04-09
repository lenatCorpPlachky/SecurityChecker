# VulnCheck

> How secure is your website — really?

A SaaS application for automated website security audits. Built for founders who don't speak CVE and developers who ship AI-generated code.

**Engine version:** `2.0.0` (real passive scanner)

## Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Node.js API routes (tls, dns modules)
- Real passive security scanner (23 checks)
- Mock scan engine available via `?mode=mock`
- EN/CS localization with auto-detection
- PDF export via `@media print`
- "Coming Soon" feature cards with waitlist email capture

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

## Project structure

```
app/
  page.tsx                Landing page (hero, pricing, coming soon, FAQ, trust section)
  scan/page.tsx           Results page (score ring, findings, meta panel, coming soon, paywall)
  globals.css             Dark theme + print/PDF styles
  api/scan/route.ts       Scan API — real engine (default) or mock (?mode=mock)
  api/checkout/route.ts   Mock Stripe checkout
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
POST /api/waitlist                               → email capture for coming soon features
```

### Scan API

Response includes `engineVersion` and `mode` fields to identify which engine produced the result.

### Waitlist API

```
POST /api/waitlist
Content-Type: application/json

{
  "email": "user@company.com",
  "feature": "monitoring"
}
```

Valid feature tags: `monitoring`, `fix-service`, `cicd`, `ai-scan`, `score-tracking`, `advanced-reports`

Returns `{ ok: true }` on success. Deduplicates by email + feature pair.

Storage: in-memory for MVP (resets on restart). Production: replace with Supabase, Planetscale, or any DB.

## Free vs Paid

- **Free:** score + top 3 findings + benchmark percentile
- **Paid ($9):** full finding list + business impact + fix instructions + PDF export
- **Pro ($29/mo):** unlimited scans + monitoring + CI/CD hooks (planned)

---

## Coming Soon Features (UI-only, not functional)

Six features are visible in the UI as "Coming Soon" cards, each with a waitlist email capture form. They appear in two places:
- **Landing page** — between Pricing and FAQ sections
- **Results page** — after scan findings and emotional footer

Goal: increase perceived product value, capture emails, validate demand before building.

| Feature | Tag | Description |
|---|---|---|
| Continuous Monitoring | `monitoring` | Get alerted when your site becomes vulnerable to new threats |
| Fix It For Me | `fix-service` | We fix all your vulnerabilities for you — one click, done |
| CI/CD Integration | `cicd` | Scan your app before every deploy, block vulnerable code |
| AI Code Scanner | `ai-scan` | Paste code and detect vulnerabilities instantly |
| Score Tracking | `score-tracking` | Track security posture over time, see if fixes work |
| Advanced Reports | `advanced-reports` | Investor-ready PDFs for board decks and compliance |

Each card includes:
- Emoji icon + localized "Coming soon" badge
- Emotional copy (EN + CS)
- Email input + "Notify me" CTA button
- Green checkmark confirmation on signup
- Hidden from PDF export via `no-print`

---

## Growth & Lead Generation

The product is designed as a conversion funnel:

1. **Landing page** — fear-driven emotional copy, social proof, free scan CTA
2. **Free scan** — score + top 3 issues create urgency ("You are less secure than 61% of sites")
3. **Paywall** — unlock full report for $9 or subscribe Pro at $29/mo
4. **Coming Soon cards** — capture emails for 6 upcoming features, tagged by interest
5. **Shareable results** — benchmark comparison drives referral traffic

Key UX patterns:
- "Trust but verify" section targets founders who outsource to IT teams, agencies, freelancers, or AI
- Dual audience cards (founders vs developers) with tailored messaging
- Emotional urgency: "Attackers don't wait. Why should you?"
- Coming Soon cards after scan results — highest emotional engagement moment

## Localization

Full EN and CS translations for all 23 check IDs (title, summary, impact, fix instructions) plus all UI strings. Language auto-detected from browser, switchable via toggle.
