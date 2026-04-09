"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ScanResult, Finding, Severity, ScanMeta } from "@/lib/scanner/types";
import { format, useT, type Dict } from "@/lib/i18n";
import Paywall from "./Paywall";
import LanguageSwitcher from "./LanguageSwitcher";
import ComingSoonSection from "./ComingSoonSection";

type AnyFinding = Finding & { key?: number; checkId?: string };

const SEVERITY_STYLES: Record<Severity, { chip: string; dot: string }> = {
  critical: { chip: "bg-danger/15 text-danger border-danger/30", dot: "bg-danger" },
  high: { chip: "bg-orange-500/15 text-orange-300 border-orange-500/30", dot: "bg-orange-400" },
  medium: { chip: "bg-warn/15 text-warn border-warn/30", dot: "bg-warn" },
  low: { chip: "bg-blue-500/15 text-blue-300 border-blue-500/30", dot: "bg-blue-400" },
  info: { chip: "bg-white/10 text-white/60 border-white/20", dot: "bg-white/40" },
};

function resolveFindingText(
  f: AnyFinding,
  t: Dict,
): { title: string; summary: string; impact: string; fix: string; category: string } {
  // Real scan findings use checkId
  if (f.checkId && t.scan.checks[f.checkId]) {
    return t.scan.checks[f.checkId];
  }
  // Mock findings use numeric key
  if (f.key !== undefined && t.scan.findings[f.key]) {
    return t.scan.findings[f.key];
  }
  // Fallback
  return {
    title: f.checkId || `Finding ${f.id}`,
    summary: f.evidence || "",
    impact: "",
    fix: "",
    category: "",
  };
}

export default function ResultsView() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useT();
  const url = params.get("url") || "";
  const unlocked = params.get("unlocked") === "1";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"scanning" | "done">("scanning");
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!url) {
      router.replace("/");
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}`, { cache: "no-store" });
        const data = await res.json();
        if (cancel) return;
        if (!res.ok) {
          setError(data?.error || t.scan.error.generic);
          return;
        }
        // Small delay so animation feels real
        setTimeout(() => !cancel && (setResult(data), setPhase("done")), 500);
      } catch {
        if (!cancel) setError(t.scan.error.generic);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [url, router, t.scan.error.generic]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="flex justify-end mb-6"><LanguageSwitcher /></div>
        <h1 className="text-3xl font-bold">{t.scan.error.title}</h1>
        <p className="mt-3 text-white/60">{error}</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-white text-ink px-6 py-3 font-semibold">
          {t.scan.error.cta}
        </Link>
      </div>
    );
  }

  if (phase === "scanning" || !result) {
    return <ScanningState url={url} />;
  }

  const findings: AnyFinding[] = result.findings || [];
  const visibleFindings = unlocked ? findings : findings.slice(0, 3);
  const lockedFindings = unlocked ? [] : findings.slice(3);
  const meta: ScanMeta | undefined = result.meta;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:py-16" id="report">
      <div className="flex items-center justify-between no-print">
        <Link href="/" className="text-xs text-white/50 hover:text-white">{t.scan.back}</Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => window.print()}
            className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs px-3 py-1.5"
          >
            {t.scan.metaLabels.downloadPdf}
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="mt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs tracking-widest text-white/40 uppercase">{t.scan.kicker}</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-black truncate">{result.hostname}</h1>
          <div className="text-xs text-white/40 mt-1">
            {t.scan.scannedAtLabel} {new Date(result.scannedAt).toLocaleString()}
            {result.scanDurationMs && (
              <span className="ml-2">· {t.scan.metaLabels.scanDuration}: {(result.scanDurationMs / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="self-start md:self-end rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-sm px-4 py-2 no-print"
        >
          {t.scan.share}
        </button>
      </div>

      {/* SCORE CARD */}
      <ScoreCard result={result} t={t} />

      {/* META PANEL (real scan only) */}
      {meta && <MetaPanel meta={meta} t={t} />}

      {/* COUNTS STRIP */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <CountPill label={t.scan.counts.critical} value={result.counts?.critical ?? 0} severity="critical" />
        <CountPill label={t.scan.counts.high} value={result.counts?.high ?? 0} severity="high" />
        <CountPill label={t.scan.counts.medium} value={result.counts?.medium ?? 0} severity="medium" />
        <CountPill label={t.scan.counts.low} value={result.counts?.low ?? 0} severity="low" />
        {(result.counts?.info ?? 0) > 0 && (
          <CountPill label="Info" value={result.counts.info} severity="info" />
        )}
      </div>

      {/* FINDINGS */}
      <div className="mt-10">
        <h2 className="text-xl font-bold">
          {unlocked ? t.scan.sections.allIssues : t.scan.sections.topThree}
          <span className="ml-2 text-white/40 text-sm font-normal">
            {unlocked
              ? format(t.scan.sections.totalSuffix, { n: findings.length })
              : findings.length > 3
                ? format(t.scan.sections.moreHidden, { n: findings.length - 3 })
                : format(t.scan.sections.totalSuffix, { n: findings.length })}
          </span>
        </h2>

        <div className="mt-5 space-y-4">
          {visibleFindings.map((f) => (
            <FindingCard key={f.id} f={f} unlocked={unlocked} t={t} />
          ))}
        </div>

        {lockedFindings.length > 0 && (
          <div className="relative mt-6">
            <div className="space-y-4 blur-lock">
              {lockedFindings.map((f) => (
                <FindingCard key={f.id} f={f} unlocked={false} t={t} />
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass rounded-2xl px-6 py-8 max-w-md text-center">
                <div className="text-xs uppercase tracking-widest text-white/40">
                  {format(t.scan.unlock.kicker, { n: lockedFindings.length })}
                </div>
                <h3 className="mt-2 text-2xl font-bold">{t.scan.unlock.title}</h3>
                <p className="mt-2 text-sm text-white/60">{t.scan.unlock.body}</p>
                <button
                  onClick={() => setShowPaywall(true)}
                  className="mt-5 inline-block rounded-full bg-white text-ink font-bold px-6 py-3 hover:scale-[1.02] transition"
                >
                  {t.scan.unlock.cta}
                </button>
                <div className="mt-3 text-[11px] text-white/40">{t.scan.unlock.fineprint}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EMOTIONAL FOOTER */}
      <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10 text-center no-print">
        <h3 className="text-2xl md:text-3xl font-bold">{t.scan.final.title}</h3>
        <p className="mt-3 text-white/60 max-w-xl mx-auto">{t.scan.final.body}</p>
        {!unlocked && (
          <button
            onClick={() => setShowPaywall(true)}
            className="mt-6 rounded-full bg-white text-ink font-bold px-6 py-3"
          >
            {t.scan.final.cta}
          </button>
        )}
      </div>

      {/* WHAT'S NEXT — Coming soon features */}
      <ComingSoonSection variant="results" />

      {showPaywall && <Paywall url={url} onClose={() => setShowPaywall(false)} />}
    </div>
  );
}

// ── Scanning animation ──────────────────────────────────────────────

function ScanningState({ url }: { url: string }) {
  const { t } = useT();
  const steps = t.scan.scanning.steps;
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % steps.length), 600);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="mx-auto relative h-32 w-32 rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
        <div className="absolute inset-x-0 h-1 bg-brand animate-scan" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl">🛡️</div>
      </div>
      <div className="mt-8 text-sm text-white/40 font-mono">{url}</div>
      <div className="mt-2 text-lg text-white/80">{steps[i]}</div>
      <p className="mt-3 text-xs text-white/30">Real-time passive analysis — no payloads sent</p>
      <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand to-danger shimmer w-full" />
      </div>
    </div>
  );
}

// ── Score Card ──────────────────────────────────────────────────────

function ScoreCard({ result, t }: { result: ScanResult; t: Dict }) {
  const { score, tone, grade, percentile, hostname } = result;
  const ringColor = tone === "danger" ? "#FF3B3B" : tone === "warn" ? "#FFB020" : "#22C55E";
  const dash = (score / 100) * 283;

  const headline = format(t.scan.headline[tone], { host: hostname });
  const subline = format(t.scan.subline[tone], { percentile, inverse: 100 - percentile });
  const toneLabel =
    tone === "danger" ? t.scan.score.toneDanger
    : tone === "warn" ? t.scan.score.toneWarn
    : t.scan.score.toneSafe;

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 md:p-10">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative h-48 w-48 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
            <circle
              cx="50" cy="50" r="45"
              stroke={ringColor}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} 283`}
              style={{ transition: "stroke-dasharray 1.2s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-black" style={{ color: ringColor }}>{score}</div>
            <div className="text-xs text-white/50 mt-1">{format(t.scan.score.outOf, { grade })}</div>
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="text-xs tracking-widest uppercase" style={{ color: ringColor }}>{toneLabel}</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold leading-tight">{headline}</h2>
          <p className="mt-3 text-white/70">{subline}</p>
          <div className="mt-5">
            <div className="flex justify-between text-[11px] text-white/40 mb-1">
              <span>{t.scan.score.benchmarkMin}</span>
              <span>{t.scan.score.benchmarkMax}</span>
            </div>
            <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="absolute top-0 bottom-0 w-[3px] bg-white" style={{ left: `${percentile}%` }} />
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-safe via-warn to-danger opacity-40 w-full" />
            </div>
            <div className="mt-2 text-xs text-white/50">{format(t.scan.score.benchmarkText, { percentile })}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Meta Panel ──────────────────────────────────────────────────────

function MetaPanel({ meta, t }: { meta: ScanMeta; t: Dict }) {
  const ml = t.scan.metaLabels;
  const items: { label: string; value: string | null | undefined }[] = [
    { label: ml.ip, value: meta.ip },
    { label: ml.server, value: meta.server },
    { label: ml.statusCode, value: meta.statusCode != null ? String(meta.statusCode) : null },
    { label: ml.tls, value: meta.tlsProtocol },
    { label: ml.cert, value: meta.certIssuer ? `${meta.certSubject || "*"} (${meta.certIssuer})` : null },
    { label: ml.certExpires, value: meta.certExpires ? new Date(meta.certExpires).toLocaleDateString() : null },
    { label: ml.certDaysLeft, value: meta.certDaysLeft != null ? `${meta.certDaysLeft}d` : null },
    { label: ml.responseTime, value: meta.responseTimeMs ? `${meta.responseTimeMs}ms` : null },
  ];

  const hasTech = meta.technologies && meta.technologies.length > 0;
  const hasRedirects = meta.redirectChain && meta.redirectChain.length > 0;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
      <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-3">
        Scan details
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {items.map(
          (item) =>
            item.value && (
              <div key={item.label}>
                <div className="text-[10px] text-white/40">{item.label}</div>
                <div className="font-mono text-white/80 truncate">{item.value}</div>
              </div>
            ),
        )}
      </div>

      {hasTech && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="text-[10px] text-white/40 mb-1.5">{ml.technologies}</div>
          <div className="flex flex-wrap gap-1.5">
            {meta.technologies.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-white/70"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasRedirects && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-[10px] text-white/40 mb-1">{ml.redirectChain}</div>
          <div className="text-xs font-mono text-white/50">
            {meta.redirectChain.join(" → ")}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Count Pill ──────────────────────────────────────────────────────

function CountPill({
  label, value, severity,
}: {
  label: string; value: number; severity: Severity;
}) {
  const s = SEVERITY_STYLES[severity];
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${s.chip}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

// ── Finding Card ────────────────────────────────────────────────────

function FindingCard({ f, unlocked, t }: { f: AnyFinding; unlocked: boolean; t: Dict }) {
  const s = SEVERITY_STYLES[f.severity];
  const text = resolveFindingText(f, t);
  const severityLabel = t.scan.severity[f.severity];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6 finding-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold border px-2 py-0.5 rounded-full ${s.chip}`}>
              {severityLabel}
            </span>
            <span className="text-[10px] font-mono text-white/40">{f.owasp}</span>
            {text.category && <span className="text-[10px] text-white/40">{text.category}</span>}
          </div>
          <h3 className="mt-2 text-lg font-bold">{text.title}</h3>
          <p className="mt-1 text-sm text-white/60">{text.summary}</p>
        </div>
      </div>

      {unlocked && (text.impact || text.fix) && (
        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
          {text.impact && (
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{t.scan.finding.impactLabel}</div>
              <div className="text-white/80">{text.impact}</div>
            </div>
          )}
          {text.fix && (
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{t.scan.finding.fixLabel}</div>
              <div className="text-white/80">{text.fix}</div>
            </div>
          )}
          {f.evidence && (
            <div className="md:col-span-2 rounded-xl bg-black/40 border border-white/5 p-4 font-mono text-[12px] text-white/60">
              <span className="text-white/30">{t.scan.finding.evidenceLabel} ›</span> {f.evidence}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
