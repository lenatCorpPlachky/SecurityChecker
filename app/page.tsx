"use client";

import { useState } from "react";
import Link from "next/link";
import ScanForm from "@/components/ScanForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ComingSoonSection from "@/components/ComingSoonSection";
import { useT } from "@/lib/i18n";

export default function LandingPage() {
  const { t } = useT();

  return (
    <main className="relative overflow-hidden">
      {/* ===== NAV ===== */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand to-danger flex items-center justify-center font-black">
            V
          </div>
          <span className="font-bold tracking-tight text-lg">VulnCheck</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#how" className="hover:text-white">{t.nav.how}</a>
          <a href="#pricing" className="hover:text-white">{t.nav.pricing}</a>
          <a href="#faq" className="hover:text-white">{t.nav.faq}</a>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <a
            href="#scan"
            className="rounded-full bg-white text-ink px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
          >
            {t.nav.scanFree}
          </a>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="grid-bg relative">
        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-16 pb-24 md:pt-28 md:pb-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 mb-8">
            <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
            {t.hero.liveTicker}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
            {t.hero.titleLine1}
            <br />
            <span className="bg-gradient-to-r from-danger via-warn to-brand bg-clip-text text-transparent">
              {t.hero.titleLine2}
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            {t.hero.subtitleBefore}
            <strong className="text-white">{t.hero.subtitleStrong}</strong>
            {t.hero.subtitleAfter}
          </p>

          <div id="scan" className="mt-10 max-w-xl mx-auto">
            <ScanForm />
            <p className="mt-3 text-xs text-white/40">{t.hero.fineprint}</p>
          </div>

          {/* SOCIAL PROOF */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-widest text-white/40">
            <span>{t.proof.prefix}</span>
            {t.proof.items.map((item) => (
              <span key={item} className="font-bold text-white/60">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEAR STATS ===== */}
      <section className="relative border-y border-white/5 bg-gradient-to-b from-black to-[#0a0a12]">
        <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-3 gap-8">
          {t.stats.map((s, i) => (
            <Stat key={i} big={s.big} label={s.label} tone={s.danger ? "danger" : undefined} />
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-center">
          {t.how.title}
        </h2>
        <p className="text-center text-white/60 mt-4 max-w-2xl mx-auto">{t.how.subtitle}</p>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {t.how.steps.map((step, i) => (
            <Step
              key={i}
              n={String(i + 1).padStart(2, "0")}
              title={step.title}
              body={step.body}
            />
          ))}
        </div>
      </section>

      {/* ===== TRUST BUT VERIFY ===== */}
      <section className="relative border-y border-white/5 bg-gradient-to-b from-[#0a0a12] to-black">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block text-xs uppercase tracking-widest text-danger font-bold">
              {t.verify.kicker}
            </div>
            <h2 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">
              {t.verify.titleLine1}
              <br />
              <span className="text-white/40">{t.verify.titleLine2}</span>
            </h2>
            <p className="mt-5 text-white/60 text-lg">{t.verify.body}</p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {t.verify.cards.map((c, i) => (
              <VerifyCard
                key={i}
                label={t.verify.doYouTrust}
                questionLabel={t.verify.questionLabel}
                who={c.who}
                pain={c.pain}
                question={c.question}
                accent={i === 1}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="#scan"
              className="inline-block rounded-full bg-white text-ink font-bold px-8 py-4 hover:scale-[1.02] transition"
            >
              {t.verify.cta}
            </a>
            <div className="mt-3 text-xs text-white/40">{t.verify.fineprint}</div>
          </div>
        </div>
      </section>

      {/* ===== DUAL AUDIENCE ===== */}
      <section className="bg-[#08080F] border-y border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-8">
          <AudienceCard {...t.audience.founders} />
          <AudienceCard {...t.audience.devs} accent />
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-center">
          {t.pricing.title}
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {t.pricing.plans.map((p, i) => (
            <PricingCard
              key={i}
              {...p}
              highlight={i === 1}
              popularLabel={t.pricing.popular}
              href="#scan"
              stripePlan={i === 1 ? "oneoff" : i === 2 ? "pro" : undefined}
            />
          ))}
        </div>
      </section>

      {/* ===== COMING SOON ===== */}
      <ComingSoonSection variant="landing" />

      {/* ===== FAQ ===== */}
      <section id="faq" className="bg-[#08080F] border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-center">
            {t.faq.title}
          </h2>
          <div className="mt-12 space-y-4">
            {t.faq.items.map((item, i) => (
              <Faq key={i} q={item.q}>
                {item.a}
              </Faq>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative grid-bg">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            {t.finalCta.titleLine1}
            <br />
            <span className="text-danger">{t.finalCta.titleLine2}</span>
          </h2>
          <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">{t.finalCta.subtitle}</p>
          <div className="mt-10">
            <Link
              href="#scan"
              className="inline-block rounded-full bg-white text-ink px-8 py-4 text-base font-bold hover:scale-[1.02] transition"
            >
              {t.finalCta.cta}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 text-center text-xs text-white/40 py-8">
        © {new Date().getFullYear()} VulnCheck · {t.footer}
      </footer>

      {/*
        GROWTH HOOKS (future work):
        - Shareable result OG images (viral loop)
        - Public leaderboard: "most vulnerable sites of the week"
        - "Compare your score" vs competitors
        - GitHub App / CLI (dev mode)
        - "Investor report" export — PDF for diligence
        - "Vibe coding safety check" mode for LLM-generated apps
      */}
    </main>
  );
}

function Stat({ big, label, tone }: { big: string; label: string; tone?: "danger" }) {
  return (
    <div className="text-center md:text-left">
      <div className={`text-5xl md:text-6xl font-black tracking-tight ${tone === "danger" ? "text-danger" : "text-white"}`}>
        {big}
      </div>
      <div className="mt-3 text-sm text-white/60 max-w-xs">{label}</div>
    </div>
  );
}

function VerifyCard({
  label, questionLabel, who, pain, question, accent,
}: {
  label: string; questionLabel: string; who: string; pain: string; question: string; accent?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-7 border transition ${
        accent
          ? "border-danger/40 bg-danger/5 shadow-[0_0_60px_rgba(255,59,59,0.08)]"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
    >
      <div className="text-xs uppercase tracking-widest text-white/40 font-semibold">{label}</div>
      <div className="mt-1 text-2xl font-black">{who}?</div>
      <p className="mt-4 text-sm text-white/60 leading-relaxed">{pain}</p>
      <div className="mt-5 pt-5 border-t border-white/5">
        <div className="text-[10px] uppercase tracking-widest text-danger font-bold mb-1">
          {questionLabel}
        </div>
        <p className="text-sm text-white font-medium">{question}</p>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="text-xs font-mono text-brand">{n}</div>
      <div className="mt-3 text-xl font-bold">{title}</div>
      <div className="mt-2 text-sm text-white/60">{body}</div>
    </div>
  );
}

function AudienceCard({
  tag, title, body, bullets, accent,
}: {
  tag: string; title: string; body: string; bullets: string[]; accent?: boolean;
}) {
  return (
    <div className={`rounded-3xl p-8 md:p-10 border ${accent ? "border-brand/40 bg-brand/5" : "border-white/10 bg-white/[0.02]"}`}>
      <div className="text-xs tracking-widest text-white/40 font-semibold">{tag}</div>
      <h3 className="mt-4 text-2xl md:text-3xl font-bold leading-tight">{title}</h3>
      <p className="mt-4 text-white/60">{body}</p>
      <ul className="mt-6 space-y-2 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2 items-start">
            <span className="text-brand">→</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingCard({
  name, price, tag, features, cta, href, highlight, popularLabel, stripePlan,
}: {
  name: string; price: string; tag: string; features: string[]; cta: string;
  href: string; highlight?: boolean; popularLabel: string; stripePlan?: "oneoff" | "pro";
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    if (!stripePlan) return; // Free plan — follow href normally
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "landing-page-purchase", plan: stripePlan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-3xl p-8 border ${highlight ? "border-brand bg-gradient-to-b from-brand/15 to-transparent scale-[1.02]" : "border-white/10 bg-white/[0.02]"}`}>
      <div className="flex items-baseline justify-between">
        <div className="text-lg font-bold">{name}</div>
        {highlight && (
          <span className="text-[10px] uppercase tracking-widest bg-brand/30 text-white px-2 py-1 rounded-full">
            {popularLabel}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-end gap-2">
        <div className="text-5xl font-black">{price}</div>
        <div className="text-white/50 text-sm mb-2">{tag}</div>
      </div>
      <ul className="mt-6 space-y-2 text-sm text-white/70">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-safe">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href={href}
        onClick={handleClick}
        className={`mt-8 block text-center rounded-full py-3 font-semibold transition ${
          highlight ? "bg-white text-ink hover:bg-white/90" : "bg-white/10 text-white hover:bg-white/15"
        } ${loading ? "opacity-60 pointer-events-none" : ""}`}
      >
        {loading ? "..." : cta}
      </a>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 open:bg-white/[0.04]">
      <summary className="cursor-pointer list-none flex justify-between items-center font-semibold">
        {q}
        <span className="text-white/40 group-open:rotate-45 transition">+</span>
      </summary>
      <div className="mt-3 text-sm text-white/60">{children}</div>
    </details>
  );
}
