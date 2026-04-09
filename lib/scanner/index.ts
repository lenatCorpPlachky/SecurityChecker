// Main scan orchestrator. Runs all checks in parallel, aggregates findings,
// calculates score, builds meta info.
//
// We disable TLS verification for outbound requests because:
// 1. We're a security scanner — we need to inspect sites with expired/self-signed certs
// 2. We check cert validity via TLS module separately and report it as a finding
// 3. This runs server-side only, not in user's browser
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import type { Finding, ScanMeta, ScanResult, Severity } from "./types";
import { ENGINE_VERSION } from "./types";
import {
  checkCertificate,
  checkTransportFindings,
  checkSecurityHeaders,
  checkServerInfo,
  checkCookies,
  checkCors,
  checkExposedPaths,
  checkDns,
  checkContent,
  fingerprintTechnologies,
  resolveIp,
} from "./checks";

const FETCH_TIMEOUT = 8000;

function safeFetch(
  url: string,
  opts: RequestInit & { redirect?: RequestRedirect } = {},
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  return fetch(url, {
    ...opts,
    signal: controller.signal,
    headers: { "User-Agent": "VulnCheck/1.0 (security-scanner)", ...(opts.headers as Record<string, string> || {}) },
  })
    .catch(() => null)
    .finally(() => clearTimeout(timer));
}

export async function runScan(rawUrl: string): Promise<ScanResult> {
  const start = Date.now();
  const u = new URL(rawUrl);
  const hostname = u.hostname.toLowerCase();
  const baseHttps = `https://${hostname}`;
  const baseHttp = `http://${hostname}`;

  // ── Phase 1: parallel info gathering ──────────────────────────────

  const [mainRes, ip, cert, httpRes] = await Promise.all([
    safeFetch(baseHttps, { redirect: "follow" }),
    resolveIp(hostname),
    checkCertificate(hostname),
    safeFetch(baseHttp, { redirect: "manual" }),
  ]);

  if (!mainRes) {
    throw new Error(`Could not connect to ${hostname}`);
  }

  // Read body for content analysis (limit to first 500KB)
  const body = await mainRes
    .clone()
    .text()
    .then((t) => t.slice(0, 512_000))
    .catch(() => "");

  // Track redirect chain
  const redirectChain: string[] = [];
  if (mainRes.redirected) {
    redirectChain.push(baseHttps, mainRes.url);
  }

  // ── Phase 2: parallel checks ──────────────────────────────────────

  const [
    transportFindings,
    headerFindings,
    serverFindings,
    cookieFindings,
    corsFindings,
    pathFindings,
    dnsFindings,
    contentFindings,
  ] = await Promise.all([
    Promise.resolve(checkTransportFindings(cert, httpRes)),
    Promise.resolve(checkSecurityHeaders(mainRes)),
    Promise.resolve(checkServerInfo(mainRes)),
    Promise.resolve(checkCookies(mainRes)),
    checkCors(baseHttps),
    checkExposedPaths(baseHttps),
    checkDns(hostname),
    Promise.resolve(checkContent(body, baseHttps)),
  ]);

  // ── Aggregate findings ────────────────────────────────────────────

  const allChecks = [
    ...transportFindings,
    ...headerFindings,
    ...serverFindings,
    ...cookieFindings,
    ...corsFindings,
    ...pathFindings,
    ...dnsFindings,
    ...contentFindings,
  ];

  // Deduplicate by checkId
  const seen = new Set<string>();
  const deduped = allChecks.filter((c) => {
    if (seen.has(c.checkId)) return false;
    seen.add(c.checkId);
    return true;
  });

  // Sort by severity
  const order: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };
  deduped.sort((a, b) => order[a.severity] - order[b.severity]);

  const findings: Finding[] = deduped.map((c) => ({
    ...c,
    id: `chk-${c.checkId}`,
  }));

  // ── Score calculation ─────────────────────────────────────────────

  const deductions: Record<Severity, number> = {
    critical: 15,
    high: 10,
    medium: 5,
    low: 2,
    info: 0,
  };
  let score = 100;
  for (const f of findings) {
    score -= deductions[f.severity];
  }
  score = Math.max(0, Math.min(100, score));

  const grade: ScanResult["grade"] =
    score >= 95
      ? "A+"
      : score >= 85
        ? "A"
        : score >= 70
          ? "B"
          : score >= 55
            ? "C"
            : score >= 40
              ? "D"
              : "F";

  const tone: ScanResult["tone"] =
    score >= 75 ? "safe" : score >= 50 ? "warn" : "danger";

  // Percentile estimate (simple heuristic)
  const percentile = Math.max(3, Math.min(97, 100 - score));

  // ── Counts ────────────────────────────────────────────────────────

  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  for (const f of findings) counts[f.severity]++;

  // ── Meta ──────────────────────────────────────────────────────────

  const technologies = fingerprintTechnologies(mainRes, body);

  const meta: ScanMeta = {
    ip,
    server: mainRes.headers.get("server"),
    poweredBy: mainRes.headers.get("x-powered-by"),
    tlsProtocol: cert.protocol,
    tlsCipher: cert.cipher,
    certIssuer: cert.issuer,
    certSubject: cert.subject,
    certExpires: cert.validTo,
    certDaysLeft: cert.daysLeft,
    redirectChain,
    responseTimeMs: Date.now() - start,
    statusCode: mainRes.status,
    technologies,
  };

  return {
    url: rawUrl,
    hostname,
    scannedAt: new Date().toISOString(),
    scanDurationMs: Date.now() - start,
    score,
    grade,
    tone,
    percentile,
    findings,
    counts,
    meta,
    mode: "real",
    engineVersion: ENGINE_VERSION,
  };
}
