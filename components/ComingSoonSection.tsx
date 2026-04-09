"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

type FeatureTag =
  | "monitoring"
  | "fix-service"
  | "cicd"
  | "ai-scan"
  | "score-tracking"
  | "advanced-reports";

const ICONS: Record<FeatureTag, string> = {
  monitoring: "\u{1F514}",
  "fix-service": "\u{1F527}",
  cicd: "\u{1F680}",
  "ai-scan": "\u{1F916}",
  "score-tracking": "\u{1F4C8}",
  "advanced-reports": "\u{1F4CB}",
};

export default function ComingSoonSection({ variant }: { variant: "landing" | "results" }) {
  const { t } = useT();

  return (
    <section
      className={
        variant === "landing"
          ? "bg-[#08080F] border-y border-white/5"
          : "mt-12 no-print"
      }
    >
      <div
        className={
          variant === "landing" ? "mx-auto max-w-6xl px-6 py-24" : ""
        }
      >
        <div className="text-center mb-12">
          <div className="inline-block text-xs uppercase tracking-widest text-brand font-bold">
            {t.comingSoon.kicker}
          </div>
          <h2 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">
            {t.comingSoon.title}
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">
            {t.comingSoon.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.comingSoon.features.map((feature, i) => (
            <ComingSoonCard
              key={feature.tag}
              tag={feature.tag as FeatureTag}
              title={feature.title}
              body={feature.body}
              badgeLabel={t.comingSoon.badgeLabel}
              ctaLabel={t.comingSoon.ctaLabel}
              successLabel={t.comingSoon.successLabel}
              emailPlaceholder={t.comingSoon.emailPlaceholder}
              highlight={i === 0 || i === 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComingSoonCard({
  tag,
  title,
  body,
  badgeLabel,
  ctaLabel,
  successLabel,
  emailPlaceholder,
  highlight,
}: {
  tag: FeatureTag;
  title: string;
  body: string;
  badgeLabel: string;
  ctaLabel: string;
  successLabel: string;
  emailPlaceholder: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-7 border transition ${
        highlight
          ? "border-brand/30 bg-brand/5"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{ICONS[tag]}</span>
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold border border-white/10 rounded-full px-2.5 py-0.5">
          {badgeLabel}
        </span>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">{body}</p>
      <div className="mt-5 pt-5 border-t border-white/5">
        <WaitlistInput
          feature={tag}
          ctaLabel={ctaLabel}
          successLabel={successLabel}
          placeholder={emailPlaceholder}
        />
      </div>
    </div>
  );
}

function WaitlistInput({
  feature,
  ctaLabel,
  successLabel,
  placeholder,
}: {
  feature: FeatureTag;
  ctaLabel: string;
  successLabel: string;
  placeholder: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), feature }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm text-safe">
        <span>&#10003;</span>
        <span>{successLabel}</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        required
        className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm placeholder:text-white/30 outline-none focus:border-white/20 transition"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-semibold px-4 py-2 hover:bg-white/15 transition disabled:opacity-60"
      >
        {status === "loading" ? "..." : ctaLabel}
      </button>
    </form>
  );
}
