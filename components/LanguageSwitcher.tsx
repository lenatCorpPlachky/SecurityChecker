"use client";

import { useT, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useT();
  const options: { value: Lang; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "cs", label: "CS" },
  ];
  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 p-0.5 text-xs ${className}`}
      role="group"
      aria-label={t.langLabel}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setLang(o.value)}
          className={`rounded-full px-3 py-1 font-semibold transition ${
            lang === o.value ? "bg-white text-ink" : "text-white/60 hover:text-white"
          }`}
          aria-pressed={lang === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
