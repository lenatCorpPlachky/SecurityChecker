"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/lib/i18n";

export default function ScanForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { t } = useT();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function normalize(raw: string): string | null {
    const v = raw.trim();
    if (!v) return null;
    const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try {
      const u = new URL(withProto);
      if (!u.hostname.includes(".")) return null;
      return u.toString();
    } catch {
      return null;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = normalize(url);
    if (!normalized) {
      setError(t.hero.invalidUrl);
      return;
    }
    setLoading(true);
    router.push(`/scan?url=${encodeURIComponent(normalized)}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div
        className={`flex flex-col sm:flex-row gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 ${
          compact ? "" : "shadow-[0_0_60px_rgba(99,102,241,0.15)]"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 pl-3">
          <span className="text-white/40">🌐</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder={t.hero.placeholder}
            className="w-full bg-transparent outline-none py-3 text-base placeholder:text-white/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-white text-ink font-bold px-6 py-3 hover:bg-white/90 transition disabled:opacity-60"
        >
          {loading ? t.hero.ctaLoading : t.hero.ctaIdle}
        </button>
      </div>
      {error && <div className="mt-2 text-sm text-danger">{error}</div>}
    </form>
  );
}
