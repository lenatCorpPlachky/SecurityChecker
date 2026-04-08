"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

export default function Paywall({ url, onClose }: { url: string; onClose: () => void }) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"oneoff" | "pro">("oneoff");

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0c12] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t.paywall.close}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-xl"
        >
          ×
        </button>

        <div className="text-xs uppercase tracking-widest text-brand">{t.paywall.kicker}</div>
        <h2 className="mt-2 text-2xl font-black leading-tight">{t.paywall.title}</h2>
        <p className="mt-2 text-sm text-white/60">{t.paywall.body}</p>

        <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setPlan("oneoff")}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              plan === "oneoff" ? "bg-white text-ink" : "text-white/70"
            }`}
          >
            {t.paywall.oneoffTab}
          </button>
          <button
            onClick={() => setPlan("pro")}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              plan === "pro" ? "bg-white text-ink" : "text-white/70"
            }`}
          >
            {t.paywall.proTab}
          </button>
        </div>

        <ul className="mt-6 space-y-2 text-sm">
          {t.paywall.benefits.map((b) => (
            <li key={b} className="flex gap-2"><span className="text-safe">✓</span>{b}</li>
          ))}
          {plan === "pro" &&
            t.paywall.proBenefits.map((b) => (
              <li key={b} className="flex gap-2"><span className="text-safe">✓</span>{b}</li>
            ))}
        </ul>

        <button
          onClick={checkout}
          disabled={loading}
          className="mt-7 w-full rounded-full bg-white text-ink font-bold py-3 hover:bg-white/90 transition disabled:opacity-60"
        >
          {loading ? t.paywall.ctaLoading : plan === "oneoff" ? t.paywall.ctaOneoff : t.paywall.ctaPro}
        </button>

        <div className="mt-3 text-[11px] text-center text-white/40">{t.paywall.fineprint}</div>
      </div>
    </div>
  );
}
