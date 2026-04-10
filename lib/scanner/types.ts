export const ENGINE_VERSION = "2.0.0";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface CheckResult {
  checkId: string;
  severity: Severity;
  owasp: string;
  evidence: string;
  details?: Record<string, unknown>;
}

export interface Finding extends CheckResult {
  id: string; // unique per scan, e.g. "chk-no-csp"
}

export interface ScanMeta {
  ip: string | null;
  server: string | null;
  poweredBy: string | null;
  tlsProtocol: string | null;
  tlsCipher: string | null;
  certIssuer: string | null;
  certSubject: string | null;
  certExpires: string | null;
  certDaysLeft: number | null;
  redirectChain: string[];
  responseTimeMs: number;
  statusCode: number | null;
  technologies: string[];
}

export interface PassedCheck {
  checkId: string;
}

export interface ScanResult {
  url: string;
  hostname: string;
  scannedAt: string;
  scanDurationMs: number;
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  tone: "safe" | "warn" | "danger";
  percentile: number;
  findings: Finding[];
  passed: PassedCheck[];
  counts: Record<Severity, number>;
  meta: ScanMeta;
  mode: "real" | "mock";
  engineVersion: string;
}
