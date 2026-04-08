import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "VulnCheck — How vulnerable is your website, really?",
  description:
    "See how vulnerable your website REALLY is — before hackers do. Free 30-second security scan based on OWASP Top 10.",
  openGraph: {
    title: "VulnCheck — How vulnerable is your website, really?",
    description:
      "Most apps are vulnerable. Check yours in 30 seconds. Built for founders & developers.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
