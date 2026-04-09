// Server-only: all passive security checks.
// Each function returns CheckResult[] — only findings for detected issues.

import * as tls from "tls";
import * as dns from "dns";
import { CheckResult } from "./types";

// ── Helpers ─────────────────────────────────────────────────────────

const FETCH_TIMEOUT = 4000;

async function fetchSafe(
  url: string,
  opts: RequestInit & { redirect?: RequestRedirect } = {},
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: {
        "User-Agent": "VulnCheck/1.0 (security-scanner)",
        ...(opts.headers || {}),
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function h(res: Response, name: string): string | null {
  return res.headers.get(name);
}

// ── 1. Transport Security ───────────────────────────────────────────

export interface CertInfo {
  valid: boolean;
  protocol: string | null;
  cipher: string | null;
  issuer: string | null;
  subject: string | null;
  validTo: string | null;
  daysLeft: number | null;
}

export function checkCertificate(hostname: string): Promise<CertInfo> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      443,
      hostname,
      { servername: hostname, rejectUnauthorized: false, timeout: 4000 },
      () => {
        const cert = socket.getPeerCertificate();
        const proto = socket.getProtocol?.() ?? null;
        const ciph = socket.getCipher?.()?.name ?? null;
        let daysLeft: number | null = null;
        if (cert.valid_to) {
          daysLeft = Math.floor(
            (new Date(cert.valid_to).getTime() - Date.now()) / 86400000,
          );
        }
        resolve({
          valid: socket.authorized,
          protocol: proto,
          cipher: ciph,
          issuer: cert.issuer?.O || cert.issuer?.CN || null,
          subject: cert.subject?.CN || null,
          validTo: cert.valid_to || null,
          daysLeft,
        });
        socket.end();
      },
    );
    socket.on("error", () =>
      resolve({
        valid: false,
        protocol: null,
        cipher: null,
        issuer: null,
        subject: null,
        validTo: null,
        daysLeft: null,
      }),
    );
    socket.setTimeout(4000, () => {
      socket.destroy();
      resolve({
        valid: false,
        protocol: null,
        cipher: null,
        issuer: null,
        subject: null,
        validTo: null,
        daysLeft: null,
      });
    });
  });
}

export function checkTransportFindings(
  cert: CertInfo,
  httpRes: Response | null,
): CheckResult[] {
  const results: CheckResult[] = [];

  // Cert invalid
  if (!cert.valid && cert.protocol !== null) {
    results.push({
      checkId: "cert-invalid",
      severity: "critical",
      owasp: "A02:2021",
      evidence: `TLS handshake completed but certificate is not trusted (self-signed or expired)`,
    });
  }

  // Cert expiring soon
  if (cert.daysLeft !== null && cert.daysLeft >= 0 && cert.daysLeft <= 30) {
    results.push({
      checkId: "cert-expiring",
      severity: "medium",
      owasp: "A02:2021",
      evidence: `Certificate expires in ${cert.daysLeft} days (${cert.validTo})`,
    });
  }

  // HTTP doesn't redirect to HTTPS
  if (httpRes) {
    const loc = h(httpRes, "location") || "";
    const status = httpRes.status;
    const redirectsToHttps =
      (status >= 300 && status < 400 && loc.startsWith("https://")) ||
      status === 200; // some sites serve HTTPS directly on HTTP port via HSTS preload
    if (status >= 200 && status < 400 && !loc.startsWith("https://") && status !== 200) {
      // redirect that doesn't go to HTTPS
      results.push({
        checkId: "http-no-redirect",
        severity: "high",
        owasp: "A02:2021",
        evidence: `HTTP ${status} → ${loc || "(no Location header)"}`,
      });
    } else if (status === 200) {
      // HTTP serves content directly — no redirect
      results.push({
        checkId: "http-no-redirect",
        severity: "high",
        owasp: "A02:2021",
        evidence: `HTTP request returned 200 OK — no redirect to HTTPS`,
      });
    }
  }

  return results;
}

// ── 2. Security Headers ─────────────────────────────────────────────

export function checkSecurityHeaders(res: Response): CheckResult[] {
  const results: CheckResult[] = [];

  // HSTS
  const hsts = h(res, "strict-transport-security");
  if (!hsts) {
    results.push({
      checkId: "no-hsts",
      severity: "medium",
      owasp: "A02:2021",
      evidence: "No Strict-Transport-Security header",
    });
  } else {
    const maxAge = parseInt(hsts.match(/max-age=(\d+)/)?.[1] || "0", 10);
    if (maxAge < 15768000) {
      results.push({
        checkId: "hsts-short",
        severity: "low",
        owasp: "A02:2021",
        evidence: `HSTS max-age=${maxAge} (< 6 months / 15768000)`,
      });
    }
  }

  // CSP
  if (!h(res, "content-security-policy")) {
    results.push({
      checkId: "no-csp",
      severity: "high",
      owasp: "A05:2021",
      evidence: "No Content-Security-Policy header",
    });
  }

  // X-Frame-Options
  const xfo = h(res, "x-frame-options");
  const csp = h(res, "content-security-policy") || "";
  if (!xfo && !csp.includes("frame-ancestors")) {
    results.push({
      checkId: "no-x-frame-options",
      severity: "medium",
      owasp: "A05:2021",
      evidence: "No X-Frame-Options header and no frame-ancestors in CSP",
    });
  }

  // X-Content-Type-Options
  if (!h(res, "x-content-type-options")) {
    results.push({
      checkId: "no-x-content-type-options",
      severity: "medium",
      owasp: "A05:2021",
      evidence: "No X-Content-Type-Options header (should be 'nosniff')",
    });
  }

  // Referrer-Policy
  if (!h(res, "referrer-policy")) {
    results.push({
      checkId: "no-referrer-policy",
      severity: "low",
      owasp: "A05:2021",
      evidence: "No Referrer-Policy header",
    });
  }

  // Permissions-Policy
  if (!h(res, "permissions-policy") && !h(res, "feature-policy")) {
    results.push({
      checkId: "no-permissions-policy",
      severity: "low",
      owasp: "A05:2021",
      evidence: "No Permissions-Policy header",
    });
  }

  return results;
}

// ── 3. Server Info Leakage ──────────────────────────────────────────

export function checkServerInfo(res: Response): CheckResult[] {
  const results: CheckResult[] = [];
  const server = h(res, "server") || "";
  if (/\d/.test(server)) {
    results.push({
      checkId: "server-banner",
      severity: "low",
      owasp: "A05:2021",
      evidence: `Server: ${server}`,
    });
  }
  const powered = h(res, "x-powered-by");
  if (powered) {
    results.push({
      checkId: "x-powered-by",
      severity: "low",
      owasp: "A05:2021",
      evidence: `X-Powered-By: ${powered}`,
    });
  }
  return results;
}

// ── 4. Cookie Security ──────────────────────────────────────────────

export function checkCookies(res: Response): CheckResult[] {
  const cookies = res.headers.getSetCookie?.() ?? [];
  if (cookies.length === 0) return [];

  const issues: string[] = [];
  for (const c of cookies) {
    const lower = c.toLowerCase();
    const name = c.split("=")[0].trim();
    if (!lower.includes("secure")) issues.push(`${name}: missing Secure`);
    if (!lower.includes("httponly")) issues.push(`${name}: missing HttpOnly`);
    if (!lower.includes("samesite")) issues.push(`${name}: missing SameSite`);
  }
  if (issues.length === 0) return [];

  return [
    {
      checkId: "cookies-insecure",
      severity: "medium",
      owasp: "A07:2021",
      evidence: issues.slice(0, 5).join("; "),
    },
  ];
}

// ── 5. CORS ─────────────────────────────────────────────────────────

export async function checkCors(url: string): Promise<CheckResult[]> {
  const res = await fetchSafe(url, {
    headers: { Origin: "https://evil-attacker.example.com" },
  });
  if (!res) return [];

  const acao = h(res, "access-control-allow-origin");
  if (!acao) return [];

  if (
    acao === "*" ||
    acao === "https://evil-attacker.example.com" ||
    acao === "null"
  ) {
    const creds = h(res, "access-control-allow-credentials");
    return [
      {
        checkId: "cors-wildcard",
        severity: creds === "true" ? "high" : "medium",
        owasp: "A01:2021",
        evidence: `Access-Control-Allow-Origin: ${acao}${creds === "true" ? " with Allow-Credentials: true" : ""}`,
      },
    ];
  }
  return [];
}

// ── 6. Exposed Paths ────────────────────────────────────────────────

const SENSITIVE_PATHS: {
  path: string;
  checkId: string;
  severity: CheckResult["severity"];
  owasp: string;
}[] = [
  { path: "/.env", checkId: "env-exposed", severity: "critical", owasp: "A05:2021" },
  { path: "/.git/HEAD", checkId: "git-exposed", severity: "critical", owasp: "A05:2021" },
  { path: "/.DS_Store", checkId: "ds-store-exposed", severity: "low", owasp: "A05:2021" },
  { path: "/admin", checkId: "admin-exposed", severity: "high", owasp: "A01:2021" },
  { path: "/wp-admin/", checkId: "admin-exposed", severity: "high", owasp: "A01:2021" },
  { path: "/wp-login.php", checkId: "admin-exposed", severity: "high", owasp: "A01:2021" },
  { path: "/phpinfo.php", checkId: "debug-exposed", severity: "high", owasp: "A05:2021" },
  { path: "/server-status", checkId: "debug-exposed", severity: "high", owasp: "A05:2021" },
  { path: "/debug", checkId: "debug-exposed", severity: "medium", owasp: "A05:2021" },
  { path: "/.well-known/security.txt", checkId: "_positive", severity: "info", owasp: "" },
];

export async function checkExposedPaths(
  baseUrl: string,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const seen = new Set<string>();

  const checks = SENSITIVE_PATHS.map(async (p) => {
    const res = await fetchSafe(`${baseUrl}${p.path}`, {
      method: "HEAD",
      redirect: "follow",
    });
    if (!res) return;

    if (p.checkId === "_positive") return; // security.txt is positive, skip

    if (res.status >= 200 && res.status < 300 && !seen.has(p.checkId)) {
      seen.add(p.checkId);
      results.push({
        checkId: p.checkId,
        severity: p.severity,
        owasp: p.owasp,
        evidence: `${p.path} → ${res.status} ${res.statusText}`,
      });
    }
  });

  await Promise.allSettled(checks);
  return results;
}

// ── 7. DNS Security ─────────────────────────────────────────────────

function resolveTxt(hostname: string): Promise<string[][]> {
  return new Promise((resolve) => {
    dns.resolveTxt(hostname, (err, records) => {
      resolve(err ? [] : records);
    });
  });
}

export async function checkDns(hostname: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const [rootTxt, dmarcTxt] = await Promise.all([
    resolveTxt(hostname),
    resolveTxt(`_dmarc.${hostname}`),
  ]);

  const flat = rootTxt.map((r) => r.join(""));
  const hasSPF = flat.some((r) => r.startsWith("v=spf1"));
  if (!hasSPF) {
    results.push({
      checkId: "no-spf",
      severity: "medium",
      owasp: "A07:2021",
      evidence: `No SPF TXT record found for ${hostname}`,
    });
  }

  const dmarcFlat = dmarcTxt.map((r) => r.join(""));
  const hasDMARC = dmarcFlat.some((r) => r.startsWith("v=DMARC1"));
  if (!hasDMARC) {
    results.push({
      checkId: "no-dmarc",
      severity: "medium",
      owasp: "A07:2021",
      evidence: `No DMARC record at _dmarc.${hostname}`,
    });
  }

  return results;
}

// ── 8. Content Analysis ─────────────────────────────────────────────

const OUTDATED_LIBS: { pattern: RegExp; name: string; maxSafe: string }[] = [
  { pattern: /jquery[.-](\d)\.(\d+)/i, name: "jQuery", maxSafe: "3.5" },
  { pattern: /bootstrap[.-](\d)\.(\d+)/i, name: "Bootstrap", maxSafe: "5.0" },
  { pattern: /angular(?:\.min)?\.js.*?(\d+)\.(\d+)/i, name: "AngularJS", maxSafe: "1.8" },
];

export function checkContent(body: string, baseUrl: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Mixed content
  if (baseUrl.startsWith("https://")) {
    const httpRefs = body.match(/(?:src|href|action)=["']http:\/\/[^"']+/gi);
    if (httpRefs && httpRefs.length > 0) {
      results.push({
        checkId: "mixed-content",
        severity: "medium",
        owasp: "A02:2021",
        evidence: `${httpRefs.length} HTTP resource(s): ${httpRefs.slice(0, 3).map((r) => r.replace(/^.*=["']/, "").slice(0, 60)).join(", ")}`,
      });
    }
  }

  // Outdated libraries
  for (const lib of OUTDATED_LIBS) {
    const m = body.match(lib.pattern);
    if (m) {
      const found = `${m[1]}.${m[2]}`;
      const [majSafe, minSafe] = lib.maxSafe.split(".").map(Number);
      const [majFound, minFound] = [Number(m[1]), Number(m[2])];
      if (majFound < majSafe || (majFound === majSafe && minFound < minSafe)) {
        results.push({
          checkId: "outdated-library",
          severity: "high",
          owasp: "A06:2021",
          evidence: `${lib.name} ${found} detected (upgrade to >= ${lib.maxSafe})`,
        });
      }
    }
  }

  return results;
}

// ── 9. Technology Fingerprinting ────────────────────────────────────

const TECH_COOKIE_MAP: Record<string, string> = {
  PHPSESSID: "PHP",
  JSESSIONID: "Java",
  ASP_NET_SessionId: "ASP.NET",
  __cfduid: "Cloudflare",
  ARRAffinity: "Azure",
  _gh_sess: "GitHub",
};

const TECH_HTML_PATTERNS: [RegExp, string][] = [
  [/wp-content|wp-includes/i, "WordPress"],
  [/__next/i, "Next.js"],
  [/ng-app|ng-controller/i, "AngularJS"],
  [/<div id="__nuxt"/i, "Nuxt.js"],
  [/<div id="app".*?data-v-/i, "Vue.js"],
  [/react-root|data-reactroot|_reactListening/i, "React"],
  [/Shopify\.theme/i, "Shopify"],
  [/content="Drupal/i, "Drupal"],
  [/content="Joomla/i, "Joomla"],
  [/content="Hugo/i, "Hugo"],
  [/content="Gatsby/i, "Gatsby"],
];

export function fingerprintTechnologies(
  res: Response,
  body: string,
): string[] {
  const techs = new Set<string>();

  // Server header
  const server = h(res, "server");
  if (server) techs.add(server.split("/")[0]);

  // X-Powered-By
  const powered = h(res, "x-powered-by");
  if (powered) techs.add(powered.split("/")[0]);

  // Cookies
  const cookies = res.headers.getSetCookie?.() ?? [];
  for (const c of cookies) {
    const name = c.split("=")[0].trim();
    if (TECH_COOKIE_MAP[name]) techs.add(TECH_COOKIE_MAP[name]);
  }

  // HTML patterns
  for (const [re, tech] of TECH_HTML_PATTERNS) {
    if (re.test(body)) techs.add(tech);
  }

  // Meta generator
  const gen = body.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i);
  if (gen) techs.add(gen[1].split(/\s+/)[0]);

  return [...techs];
}

// ── DNS IP resolve ──────────────────────────────────────────────────

export function resolveIp(hostname: string): Promise<string | null> {
  return new Promise((resolve) => {
    dns.resolve4(hostname, (err, addresses) => {
      resolve(err || !addresses.length ? null : addresses[0]);
    });
  });
}
