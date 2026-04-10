# VulnCheck

> How secure is your website — really? | Jak bezpečný je váš web — doopravdy?

---

## English

A SaaS app for automated website security audits. Built for founders who don't speak CVE and developers who ship AI-generated code.

**Engine version:** `2.0.0`

### Stack

- Next.js 14 (App Router) + TypeScript + TailwindCSS
- Real passive scanner — 23 security checks (OWASP Top 10)
- Stripe Checkout (test mode) — one-off $9 / Pro $29/mo
- Payment persistence via localStorage (MVP before Supabase)
- Scan history with score tracking over time
- Full report for paid users (passed + failed checks)
- Share report (native share on mobile, clipboard fallback)
- Coming Soon feature cards with waitlist email capture
- PDF export via browser print
- EN/CS localization with auto-detection
- Mock engine available via `?mode=mock`

### Run locally

```bash
npm install
npm run dev
```

### Project structure

```
app/
  page.tsx                Landing (hero, pricing, coming soon, FAQ, thank-you modal)
  scan/page.tsx           Results (score, findings, passed checks, history, paywall)
  globals.css             Dark theme + print styles
  api/scan/route.ts       Scan API — real engine or mock (?mode=mock)
  api/checkout/route.ts   Stripe Checkout (direct REST API, no SDK)
  api/waitlist/route.ts   Waitlist email capture
components/
  ScanForm.tsx            URL input on landing
  ResultsView.tsx         Score ring, findings, passed checks, scan history, PDF
  ComingSoonSection.tsx   Coming Soon cards + waitlist emails
  Paywall.tsx             Upsell modal (one-off / pro)
  LanguageSwitcher.tsx    EN/CS toggle
lib/
  i18n.tsx                Full EN + CS dictionaries
  scanEngine.ts           Mock engine (v1.0)
  scanner/
    types.ts              Types + ENGINE_VERSION
    checks.ts             All 23 passive check functions
    index.ts              Scan orchestrator
```

### Scan Engine v2.0

23 passive security checks. Non-invasive — no payloads, no exploitation. Only inspects publicly visible HTTP responses, headers, TLS, DNS, and common paths.

**How it works:**
1. Parallel info gathering — HTTPS fetch, DNS resolve, TLS inspect, redirect check
2. Parallel checks — all 23 run concurrently
3. Aggregation — deduplicate, sort by severity, calculate score/grade
4. Meta extraction — technologies, TLS/cert details, response time

#### Checks

| # | Check ID | Severity | Category |
|---|---|---|---|
| 1 | `cert-invalid` | Critical | Transport Security |
| 2 | `cert-expiring` | Medium | Transport Security |
| 3 | `http-no-redirect` | High | Transport Security |
| 4 | `no-hsts` | Medium | Security Headers |
| 5 | `hsts-short` | Low | Security Headers |
| 6 | `no-csp` | High | Security Headers |
| 7 | `no-x-frame-options` | Medium | Security Headers |
| 8 | `no-x-content-type-options` | Medium | Security Headers |
| 9 | `no-referrer-policy` | Low | Security Headers |
| 10 | `no-permissions-policy` | Low | Security Headers |
| 11 | `server-banner` | Low | Server Config |
| 12 | `x-powered-by` | Low | Server Config |
| 13 | `cookies-insecure` | Medium | Cookie Security |
| 14 | `cors-wildcard` | Medium/High | CORS |
| 15 | `env-exposed` | Critical | Exposed Files |
| 16 | `git-exposed` | Critical | Exposed Files |
| 17 | `ds-store-exposed` | Low | Exposed Files |
| 18 | `admin-exposed` | High | Exposed Files |
| 19 | `debug-exposed` | High/Medium | Exposed Files |
| 20 | `no-spf` | Medium | DNS Security |
| 21 | `no-dmarc` | Medium | DNS Security |
| 22 | `mixed-content` | Medium | Content Security |
| 23 | `outdated-library` | High | Content Security |

#### Scoring

```
Base: 100.  Critical -15, High -10, Medium -5, Low -2, Info 0.
Grade: A+ (>=95)  A (>=85)  B (>=70)  C (>=55)  D (>=40)  F (<40)
```

### Features

#### Full Report (paid users)
Paid users see **all checks** — both failed (red) and passed (green). The passed checks section shows every security control that is correctly configured, so the client sees the complete picture of what they're paying for.

#### Scan History
Every scan is saved to localStorage. The results page shows:
- **Same-host timeline** — score changes over time with delta arrows (improvement tracking)
- **Other scanned sites** — clickable links to previous scans
- Up to 50 entries stored

#### Share Report
Native share on mobile, clipboard copy on desktop with "Copied!" feedback, prompt fallback as last resort.

#### Stripe Payments
- Direct REST API calls (no SDK — SDK has issues on Vercel serverless)
- Test card: `4242 4242 4242 4242`
- After payment: redirect back with `?unlocked=1`, stored in localStorage as `vc_paid`

#### Post-Purchase UX
- Green success banner on results page
- Thank-you modal on landing page with plan name and CTA
- All subsequent scans auto-unlock

#### Coming Soon (UI only)
6 feature cards with waitlist email capture: Continuous Monitoring, Fix It For Me, CI/CD Integration, AI Code Scanner, Score Tracking, Advanced Reports.

### API

```
GET  /api/scan?url=https://example.com            → real scan
GET  /api/scan?url=https://example.com&mode=mock   → mock scan
POST /api/checkout  { url, plan }                  → Stripe session
POST /api/waitlist  { email, feature }             → email capture
```

### Roadmap: Supabase Auth + Database

- [ ] Supabase project + magic link login
- [ ] `payments` table + Stripe webhook
- [ ] `scans` table (replace localStorage history)
- [ ] `waitlist` table (replace in-memory store)
- [ ] User dashboard (`/dashboard`) with scan history + plan status
- [ ] Remove localStorage fallback

---

## Česky

SaaS aplikace pro automatizované bezpečnostní audity webů. Postaveno pro zakladatele, kteří nemluví jazykem CVE, a pro vývojáře, kteří nasazují kód generovaný AI.

**Verze enginu:** `2.0.0`

### Stack

- Next.js 14 (App Router) + TypeScript + TailwindCSS
- Reálný pasivní skener — 23 bezpečnostních kontrol (OWASP Top 10)
- Stripe Checkout (testovací režim) — jednorázově $9 / Pro $29/měs
- Persistence plateb přes localStorage (MVP před Supabase)
- Historie skenů se sledováním skóre v čase
- Kompletní report pro platící uživatele (prošlé + neprošlé kontroly)
- Sdílení reportu (nativní sdílení na mobilu, kopírování do schránky)
- Coming Soon karty s odběrem e-mailů na waitlist
- PDF export přes tisk prohlížeče
- EN/CS lokalizace s automatickou detekcí
- Mock engine dostupný přes `?mode=mock`

### Spuštění lokálně

```bash
npm install
npm run dev
```

### Struktura projektu

```
app/
  page.tsx                Landing (hero, ceník, coming soon, FAQ, děkovací modal)
  scan/page.tsx           Výsledky (skóre, nálezy, prošlé kontroly, historie, paywall)
  globals.css             Tmavý motiv + tiskové styly
  api/scan/route.ts       Scan API — reálný engine nebo mock (?mode=mock)
  api/checkout/route.ts   Stripe Checkout (přímé REST API, bez SDK)
  api/waitlist/route.ts   Odběr e-mailů na waitlist
components/
  ScanForm.tsx            Vstup URL na landingu
  ResultsView.tsx         Skóre, nálezy, prošlé kontroly, historie skenů, PDF
  ComingSoonSection.tsx   Coming Soon karty + waitlist e-maily
  Paywall.tsx             Upsell modal (jednorázově / pro)
  LanguageSwitcher.tsx    Přepínač EN/CS
lib/
  i18n.tsx                Kompletní EN + CS slovníky
  scanEngine.ts           Mock engine (v1.0)
  scanner/
    types.ts              Typy + ENGINE_VERSION
    checks.ts             Všech 23 funkcí pasivních kontrol
    index.ts              Orchestrátor skenů
```

### Scan Engine v2.0

23 pasivních bezpečnostních kontrol. Neinvazivní — žádné payloady, žádná exploitace. Kontroluje pouze veřejně viditelné HTTP odpovědi, hlavičky, TLS, DNS a běžné cesty.

**Jak to funguje:**
1. Paralelní sběr informací — HTTPS fetch, DNS resolve, TLS inspekce, kontrola přesměrování
2. Paralelní kontroly — všech 23 běží souběžně
3. Agregace — deduplikace, řazení dle závažnosti, výpočet skóre/známky
4. Extrakce metadat — technologie, TLS/certifikát, doba odezvy

#### Kontroly

| # | ID kontroly | Závažnost | Kategorie |
|---|---|---|---|
| 1 | `cert-invalid` | Kritická | Zabezpečení přenosu |
| 2 | `cert-expiring` | Střední | Zabezpečení přenosu |
| 3 | `http-no-redirect` | Vysoká | Zabezpečení přenosu |
| 4 | `no-hsts` | Střední | Bezpečnostní hlavičky |
| 5 | `hsts-short` | Nízká | Bezpečnostní hlavičky |
| 6 | `no-csp` | Vysoká | Bezpečnostní hlavičky |
| 7 | `no-x-frame-options` | Střední | Bezpečnostní hlavičky |
| 8 | `no-x-content-type-options` | Střední | Bezpečnostní hlavičky |
| 9 | `no-referrer-policy` | Nízká | Bezpečnostní hlavičky |
| 10 | `no-permissions-policy` | Nízká | Bezpečnostní hlavičky |
| 11 | `server-banner` | Nízká | Konfigurace serveru |
| 12 | `x-powered-by` | Nízká | Konfigurace serveru |
| 13 | `cookies-insecure` | Střední | Bezpečnost cookies |
| 14 | `cors-wildcard` | Střední/Vysoká | CORS |
| 15 | `env-exposed` | Kritická | Odhalené soubory |
| 16 | `git-exposed` | Kritická | Odhalené soubory |
| 17 | `ds-store-exposed` | Nízká | Odhalené soubory |
| 18 | `admin-exposed` | Vysoká | Odhalené soubory |
| 19 | `debug-exposed` | Vysoká/Střední | Odhalené soubory |
| 20 | `no-spf` | Střední | DNS bezpečnost |
| 21 | `no-dmarc` | Střední | DNS bezpečnost |
| 22 | `mixed-content` | Střední | Bezpečnost obsahu |
| 23 | `outdated-library` | Vysoká | Bezpečnost obsahu |

#### Bodování

```
Základ: 100.  Kritická -15, Vysoká -10, Střední -5, Nízká -2, Info 0.
Známka: A+ (>=95)  A (>=85)  B (>=70)  C (>=55)  D (>=40)  F (<40)
```

### Funkce

#### Kompletní report (platící uživatelé)
Platící uživatelé vidí **všechny kontroly** — neprošlé (červené) i prošlé (zelené). Sekce prošlých kontrol ukazuje každý správně nakonfigurovaný bezpečnostní prvek, takže klient vidí kompletní obraz toho, za co platí.

#### Historie skenů
Každý sken se ukládá do localStorage. Stránka výsledků zobrazuje:
- **Časová osa stejného hostu** — změny skóre v čase s šipkami delta (sledování zlepšení)
- **Ostatní skenované weby** — klikatelné odkazy na předchozí skeny
- Až 50 uložených záznamů

#### Sdílení reportu
Nativní sdílení na mobilu, kopírování do schránky na desktopu s potvrzením „Zkopírováno!", prompt jako poslední záchrana.

#### Platby přes Stripe
- Přímá REST API volání (bez SDK — SDK má problémy na Vercel serverless)
- Testovací karta: `4242 4242 4242 4242`
- Po platbě: přesměrování zpět s `?unlocked=1`, uloženo v localStorage jako `vc_paid`

#### UX po nákupu
- Zelený banner úspěchu na stránce výsledků
- Děkovací modal na landing page s názvem plánu a CTA
- Všechny následující skeny se automaticky odemknou

#### Coming Soon (pouze UI)
6 karet s odběrem e-mailů na waitlist: Průběžný monitoring, Opravíme to za vás, CI/CD integrace, AI skener kódu, Sledování skóre, Pokročilé reporty.

### API

```
GET  /api/scan?url=https://example.com            → reálný sken
GET  /api/scan?url=https://example.com&mode=mock   → mock sken
POST /api/checkout  { url, plan }                  → Stripe session
POST /api/waitlist  { email, feature }             → odběr e-mailu
```

### Plán: Supabase Auth + Databáze

- [ ] Supabase projekt + magic link přihlášení
- [ ] Tabulka `payments` + Stripe webhook
- [ ] Tabulka `scans` (nahradí localStorage historii)
- [ ] Tabulka `waitlist` (nahradí in-memory úložiště)
- [ ] Uživatelský dashboard (`/dashboard`) s historií skenů + stav plánu
- [ ] Odstranění localStorage fallbacku
