// Deterministic mock scan engine.
// Same URL → same result. Text content lives in lib/i18n.tsx,
// keyed by the numeric `key` in each finding so the client can localize.

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  key: number;        // index into the localized findings dict
  severity: Severity;
  owasp: string;      // e.g. "A03:2021"
  evidence?: string;  // realistic evidence string (kept English, technical)
}

export interface ScanResult {
  url: string;
  hostname: string;
  scannedAt: string;
  score: number;            // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  tone: "safe" | "warn" | "danger";
  percentile: number;       // "more vulnerable than X% of sites"
  findings: Finding[];
  counts: { critical: number; high: number; medium: number; low: number };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pool metadata. Text content is in i18n dict (scan.findings[key]).
type PoolItem = { key: number; severity: Severity; owasp: string; evidence: string };

const POOL: PoolItem[] = [
  { key: 0, severity: "critical", owasp: "A02:2021", evidence: "GET http://{host}/ → 200 OK (no redirect to https)" },
  { key: 1, severity: "high", owasp: "A05:2021", evidence: "Response headers: (no Content-Security-Policy)" },
  { key: 2, severity: "medium", owasp: "A05:2021", evidence: "No X-Frame-Options header. CSP missing frame-ancestors." },
  { key: 3, severity: "high", owasp: "A03:2021", evidence: "/?q=<svg/onload=1> → payload appears unescaped in response body" },
  { key: 4, severity: "critical", owasp: "A03:2021", evidence: "/api/search?q=' → 500 (error contains 'syntax')" },
  { key: 5, severity: "critical", owasp: "A05:2021", evidence: "GET /.env → 200 OK (non-empty body)" },
  { key: 6, severity: "high", owasp: "A06:2021", evidence: "jquery 1.8.3 detected (CVE-2020-11022, CVE-2020-11023)" },
  { key: 7, severity: "medium", owasp: "A01:2021", evidence: "Access-Control-Allow-Origin: * observed on authenticated endpoint" },
  { key: 8, severity: "medium", owasp: "A02:2021", evidence: "No Strict-Transport-Security header on /" },
  { key: 9, severity: "high", owasp: "A01:2021", evidence: "GET /admin → 200 OK (login form reachable publicly)" },
  { key: 10, severity: "low", owasp: "A05:2021", evidence: "Server: nginx/1.14.0 · X-Powered-By: Express" },
  { key: 11, severity: "medium", owasp: "A07:2021", evidence: "Set-Cookie: sid=...; (no HttpOnly, no Secure)" },
  { key: 12, severity: "high", owasp: "A07:2021", evidence: "POST /login accepted 50 rapid requests without throttling" },
];

export function runMockScan(rawUrl: string): ScanResult {
  const u = new URL(rawUrl);
  const host = u.hostname.toLowerCase();
  const seed = hash(host);
  const rnd = mulberry32(seed);

  // Pick 4–9 findings
  const count = 4 + Math.floor(rnd() * 6);
  const indexes = POOL.map((_, i) => i);
  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  const picked: Finding[] = indexes.slice(0, count).map((i) => {
    const p = POOL[i];
    return {
      id: `F-${p.key}`,
      key: p.key,
      severity: p.severity,
      owasp: p.owasp,
      evidence: p.evidence.replace("{host}", host),
    };
  });

  const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  picked.sort((a, b) => order[a.severity] - order[b.severity]);

  const deductions: Record<Severity, number> = { critical: 18, high: 11, medium: 6, low: 2, info: 0 };
  let score = 100;
  for (const f of picked) score -= deductions[f.severity];
  score -= Math.floor(rnd() * 6);
  score = Math.max(12, Math.min(97, score));

  const grade: ScanResult["grade"] =
    score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "F";
  const tone: ScanResult["tone"] = score >= 80 ? "safe" : score >= 55 ? "warn" : "danger";

  const percentile = Math.max(3, Math.min(97, 100 - score + Math.floor(rnd() * 10) - 5));

  const counts = {
    critical: picked.filter((f) => f.severity === "critical").length,
    high: picked.filter((f) => f.severity === "high").length,
    medium: picked.filter((f) => f.severity === "medium").length,
    low: picked.filter((f) => f.severity === "low").length,
  };

  return {
    url: rawUrl,
    hostname: host,
    scannedAt: new Date().toISOString(),
    score,
    grade,
    tone,
    percentile,
    findings: picked,
    counts,
  };
}
