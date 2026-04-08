# VulnCheck

> How secure is your website — really?

A high-conversion SaaS MVP for automated website security audits. Built for
founders who don't speak CVE and developers who ship AI-generated code.

## Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Edge API routes
- Deterministic mock scan engine (no real scanning performed)
- Mock Stripe checkout (swap for real Stripe)

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

## Structure

```
app/
  page.tsx            Landing page (hero, pricing, FAQ, final CTA)
  scan/page.tsx       Results page (score, findings, paywall)
  api/scan/route.ts   Mock scan API
  api/checkout/route.ts  Mock Stripe checkout
components/
  ScanForm.tsx        URL input on landing
  ResultsView.tsx     Score ring, findings, blurred locked section
  Paywall.tsx         Upsell modal
lib/
  scanEngine.ts       Deterministic mock scan (OWASP-flavored pool)
```

## How the mock scan works

`lib/scanEngine.ts` hashes the hostname and seeds a PRNG to pick 4–9
findings from a realistic OWASP Top 10 pool. Same URL → same score.
This makes results shareable and reproducible without touching the
target site.

## Free vs paid

- **Free:** score + top 3 findings + benchmark percentile
- **Paid ($9):** full list + business impact + fix instructions + PDF
- **Pro ($29/mo):** unlimited scans + monitoring + CI/CD hooks

## Growth hooks wired in (TODO surfaces)

- Shareable result URLs (already deterministic per host)
- Public leaderboard: "most vulnerable sites of the week"
- "Compare your score" vs competitors
- GitHub App / CLI ("vibe coding safety check")
- Investor-ready PDF export

## Going real

To replace the mock engine with real checks:

1. Swap `runMockScan` in `lib/scanEngine.ts` with a real scanner that
   probes headers, TLS, a short wordlist of paths, and a library
   fingerprint (e.g. Wappalyzer patterns).
2. Wire `app/api/checkout/route.ts` to real Stripe Checkout Sessions.
3. Add a DB (e.g. Postgres + Prisma) to persist scan history and
   unlock state by email or Stripe customer id.
