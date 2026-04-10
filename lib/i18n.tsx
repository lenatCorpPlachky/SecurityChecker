"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "cs";

// Simple {placeholder} template formatter
export function format(tpl: string, vars: Record<string, string | number> = {}) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

type FindingDict = {
  title: string;
  summary: string;
  impact: string;
  fix: string;
  category: string;
};

export type Dict = {
  nav: { how: string; pricing: string; faq: string; scanFree: string };
  hero: {
    liveTicker: string;
    titleLine1: string;
    titleLine2: string;
    subtitleBefore: string;
    subtitleStrong: string;
    subtitleAfter: string;
    placeholder: string;
    ctaIdle: string;
    ctaLoading: string;
    fineprint: string;
    invalidUrl: string;
  };
  proof: { prefix: string; items: string[] };
  stats: { big: string; label: string; danger?: boolean }[];
  how: {
    title: string;
    subtitle: string;
    steps: { title: string; body: string }[];
  };
  verify: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    body: string;
    doYouTrust: string;
    questionLabel: string;
    cards: { who: string; pain: string; question: string }[];
    cta: string;
    fineprint: string;
  };
  audience: {
    founders: { tag: string; title: string; body: string; bullets: string[] };
    devs: { tag: string; title: string; body: string; bullets: string[] };
  };
  pricing: {
    title: string;
    popular: string;
    plans: {
      name: string;
      price: string;
      tag: string;
      cta: string;
      features: string[];
    }[];
  };
  faq: { title: string; items: { q: string; a: string }[] };
  finalCta: { titleLine1: string; titleLine2: string; subtitle: string; cta: string };
  footer: string;
  langLabel: string;
  scan: {
    back: string;
    kicker: string;
    scannedAtLabel: string;
    share: string;
    shareCopied: string;
    scanning: { steps: string[] };
    score: {
      outOf: string;
      gradeLabel: string;
      toneDanger: string;
      toneWarn: string;
      toneSafe: string;
      benchmarkMin: string;
      benchmarkMax: string;
      benchmarkText: string; // with {percentile}
    };
    headline: { danger: string; warn: string; safe: string }; // with {host}
    subline: { danger: string; warn: string; safe: string }; // with {percentile}
    counts: { critical: string; high: string; medium: string; low: string };
    severity: { critical: string; high: string; medium: string; low: string; info: string };
    sections: {
      topThree: string;
      allIssues: string;
      totalSuffix: string; // with {n}
      moreHidden: string; // with {n}
    };
    finding: { impactLabel: string; fixLabel: string; evidenceLabel: string };
    unlock: {
      kicker: string; // with {n}
      title: string;
      body: string;
      cta: string;
      fineprint: string;
    };
    final: { title: string; body: string; cta: string };
    error: { title: string; cta: string; generic: string };
    findings: Record<number, FindingDict>;
    checks: Record<string, FindingDict>;
    metaLabels: {
      ip: string;
      server: string;
      tls: string;
      cert: string;
      certExpires: string;
      certDaysLeft: string;
      responseTime: string;
      statusCode: string;
      technologies: string;
      redirectChain: string;
      scanDuration: string;
      downloadPdf: string;
    };
    passedLabel: string;
    passedChecks: Record<string, string>;
  };
  paywall: {
    kicker: string;
    title: string;
    body: string;
    oneoffTab: string;
    proTab: string;
    benefits: string[];
    proBenefits: string[];
    ctaOneoff: string;
    ctaPro: string;
    ctaLoading: string;
    fineprint: string;
    close: string;
  };
  comingSoon: {
    kicker: string;
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    ctaLabel: string;
    successLabel: string;
    badgeLabel: string;
    features: { tag: string; title: string; body: string }[];
  };
  purchase: {
    successBanner: string;
    thankTitle: string;
    thankSubtitle: string;
    thankBody: string;
    thankCta: string;
    planOneoff: string;
    planPro: string;
    receiptNote: string;
  };
};

const EN: Dict = {
  nav: { how: "How it works", pricing: "Pricing", faq: "FAQ", scanFree: "Scan free" },
  hero: {
    liveTicker: "12,847 websites scanned this week · 9 of 10 failed",
    titleLine1: "Your devs said it's secure.",
    titleLine2: "Are you sure?",
    subtitleBefore:
      "Verify the app your IT team, agency, freelancer — or AI — just built you. One link. ",
    subtitleStrong: "30 seconds.",
    subtitleAfter: " Brutally honest answers.",
    placeholder: "yourwebsite.com",
    ctaIdle: "Scan now (free)",
    ctaLoading: "Scanning…",
    fineprint: "Free scan · Based on OWASP Top 10 · No credit card required",
    invalidUrl: "Please enter a valid website URL.",
  },
  proof: {
    prefix: "Trusted by founders at",
    items: ["YC startups", "Indie Hackers", "Product Hunt", "GitHub devs"],
  },
  stats: [
    { big: "73%", label: "of websites ship with at least one high-severity vulnerability" },
    { big: "11 sec", label: "average time between a new site being indexed and a bot probing it" },
    { big: "$4.45M", label: "average cost of a breach in 2024 (IBM)", danger: true },
  ],
  how: {
    title: "Three steps. Brutal honesty.",
    subtitle:
      "Think of it as Lighthouse — but for hacking risk. Built for founders who don't speak CVE, and developers who ship fast.",
    steps: [
      { title: "Paste your URL", body: "Any public website. We don't touch your infra, your code, or your users." },
      { title: "We scan the surface", body: "Headers, TLS, exposed endpoints, common injection surfaces, outdated libs, OWASP Top 10." },
      { title: "Get your score", body: "0–100. Top issues. Plain-English fixes. Shareable. Fixable. Today." },
    ],
  },
  verify: {
    kicker: "Trust, but verify",
    titleLine1: "Someone told you your app is secure.",
    titleLine2: "That's not the same as it being secure.",
    body:
      "Developers say \"it's fine.\" AI says \"looks good.\" Agencies send invoices. Nobody wants to be the one who finds the holes. Until a stranger on the internet does — for free — at 3am.",
    doYouTrust: "Do you trust…",
    questionLabel: "The question nobody's asking",
    cards: [
      {
        who: "Your IT team",
        pain: "They promised it was done properly. But they also promised last month's launch would be on time.",
        question: "Did they ship with HTTPS, CSP, and proper auth — or did they just ship?",
      },
      {
        who: "Your agency / freelancer",
        pain: "They built fast, invoiced faster, and moved on to the next client. Security wasn't on the quote.",
        question: "What did they actually harden — and what did they leave for future-you to deal with?",
      },
      {
        who: "Your AI coding tool",
        pain: "Cursor, Claude, Copilot, v0 — they ship working features. They also ship XSS, SQLi, exposed keys, and broken auth without blinking.",
        question: "Is the code you just vibe-coded safe to put in front of real users?",
      },
    ],
    cta: "Verify my app now — free →",
    fineprint: "Takes 30 seconds. Doesn't touch your code. Doesn't need your team's permission.",
  },
  audience: {
    founders: {
      tag: "FOR FOUNDERS & NON-TECHNICAL OWNERS",
      title: "You paid for an app. Did you pay for a liability?",
      body:
        "You can't read code. You shouldn't have to. Get a plain-English security grade for the thing your team, agency, or AI just built — and find out what a breach would actually cost your business.",
      bullets: [
        "One number. Zero jargon.",
        "Know exactly what to ask your devs on Monday",
        "Business-impact framing — not CVE gibberish",
        "Investor-ready PDF for diligence & board decks",
      ],
    },
    devs: {
      tag: "FOR DEVELOPERS & VIBE CODERS",
      title: "Your AI said it's fine. It isn't.",
      body:
        "LLMs ship XSS, SQLi, exposed .env files, and broken auth with confidence. Run VulnCheck before you push to prod — and before your non-technical founder runs it for you.",
      bullets: [
        "Pre-deployment safety check for AI-generated code",
        "Actionable, OWASP-mapped fixes",
        "Catch the bugs your linter won't",
        "CI/CD integration (coming soon)",
      ],
    },
  },
  pricing: {
    title: "Fair pricing. Unfair clarity.",
    popular: "Popular",
    plans: [
      {
        name: "Free",
        price: "$0",
        tag: "Lead magnet",
        cta: "Scan now",
        features: [
          "1 scan per day",
          "Security score (0–100)",
          "Top 3 vulnerabilities",
          "Benchmark vs other sites",
        ],
      },
      {
        name: "One-off",
        price: "$9",
        tag: "Per full report",
        cta: "Unlock a report",
        features: [
          "Full vulnerability list",
          "Detailed fix instructions",
          "OWASP-based explanations",
          "Exportable PDF report",
        ],
      },
      {
        name: "Pro",
        price: "$29",
        tag: "/ month",
        cta: "Start monitoring",
        features: [
          "Unlimited scans",
          "Continuous monitoring",
          "Slack / email alerts",
          "CI/CD integration",
          "Priority fix guidance",
        ],
      },
    ],
  },
  faq: {
    title: "Questions?",
    items: [
      { q: "Is the scan safe to run on my production site?", a: "Yes. VulnCheck only performs passive, non-intrusive checks on publicly exposed surfaces. No payloads, no brute force, no account creation." },
      { q: "Do you store my website data?", a: "We store the URL and the scan result so you can share it. Nothing else. No code, no traffic, no user data." },
      { q: "How is this different from OWASP ZAP or Burp?", a: "Those are pro tools for security engineers. VulnCheck is for founders and developers who want a single score and a todo list — in 30 seconds." },
      { q: "I used Cursor / Claude / Copilot to build my app. Is it safe?", a: "Probably not. AI-generated code frequently ships with XSS, SQLi, weak auth, and missing security headers. Run a scan before you ship." },
    ],
  },
  finalCta: {
    titleLine1: "The people who built your app",
    titleLine2: "won't be the ones who find the holes.",
    subtitle: "Attackers will. Or you can. Right now. For free.",
    cta: "Run my free scan →",
  },
  footer: "Built for founders & developers worldwide.",
  langLabel: "Language",
  scan: {
    back: "← Scan another site",
    kicker: "Security report",
    scannedAtLabel: "Scanned",
    share: "Share report ↗",
    shareCopied: "Copied!",
    scanning: {
      steps: [
        "Resolving DNS…",
        "Checking TLS & certificates…",
        "Inspecting HTTP security headers…",
        "Probing OWASP Top 10 surfaces…",
        "Fingerprinting libraries & versions…",
        "Compiling your security score…",
      ],
    },
    score: {
      outOf: "/ 100 · Grade {grade}",
      gradeLabel: "Grade",
      toneDanger: "Danger",
      toneWarn: "Warning",
      toneSafe: "Looking good",
      benchmarkMin: "Most secure",
      benchmarkMax: "Most vulnerable",
      benchmarkText: "You are more vulnerable than {percentile}% of websites we've scanned.",
    },
    headline: {
      danger: "{host} is exposed. Attackers would have an easy day.",
      warn: "{host} has real gaps. Fixable, but not safe to ignore.",
      safe: "{host} looks solid — but don't get comfortable.",
    },
    subline: {
      danger:
        "You are more vulnerable than {percentile}% of websites we've scanned. Fix the criticals first.",
      warn:
        "You are more vulnerable than {percentile}% of websites. Most developers miss these.",
      safe: "You are more secure than {inverse}% of websites. A few quick wins remain.",
    },
    counts: { critical: "Critical", high: "High", medium: "Medium", low: "Low" },
    severity: { critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info" },
    sections: {
      topThree: "Your top 3 issues",
      allIssues: "All issues",
      totalSuffix: "{n} total",
      moreHidden: "{n} more hidden",
    },
    finding: {
      impactLabel: "Business impact",
      fixLabel: "How to fix",
      evidenceLabel: "evidence",
    },
    unlock: {
      kicker: "{n} more vulnerabilities hidden",
      title: "Unlock your full security report",
      body: "Complete vulnerability list, OWASP-mapped fix instructions, and a shareable PDF export.",
      cta: "Unlock full report — $9",
      fineprint: "One-time payment · Instant access · PDF included",
    },
    final: {
      title: "Attackers don't wait. Why should you?",
      body:
        "Most of these issues take less than an hour to fix. The cost of ignoring them is measured in customers, revenue, and trust.",
      cta: "Unlock full report",
    },
    error: {
      title: "We couldn't scan that URL",
      cta: "Try another URL",
      generic: "Something went wrong. Try again.",
    },
    findings: {
      0: {
        category: "Cryptographic Failures",
        title: "Missing HTTPS / insecure transport",
        summary:
          "Your site accepts plain HTTP. Traffic can be intercepted or tampered with on the wire.",
        impact:
          "Attackers on public Wi-Fi can steal sessions, inject scripts, or redirect users.",
        fix:
          "Force HTTPS site-wide, enable HSTS with a 1-year max-age, and redirect all port 80 traffic to 443.",
      },
      1: {
        category: "Security Misconfiguration",
        title: "Missing Content-Security-Policy header",
        summary:
          "No CSP header detected. Your biggest defense against XSS is turned off.",
        impact:
          "Any XSS bug becomes a full account takeover surface. Stolen sessions, leaked tokens, defacement.",
        fix:
          "Add Content-Security-Policy: default-src 'self'; start strict, relax per-directive only as needed.",
      },
      2: {
        category: "Security Misconfiguration",
        title: "Missing X-Frame-Options / frame-ancestors",
        summary:
          "Your pages can be embedded in an iframe on any site. Clickjacking surface is open.",
        impact:
          "Attackers can trick logged-in users into clicking hidden buttons (transfer, delete, approve).",
        fix: "Return X-Frame-Options: DENY or set frame-ancestors 'none' in your CSP.",
      },
      3: {
        category: "Injection",
        title: "Reflected XSS risk in query parameters",
        summary:
          "At least one page reflects URL parameters into HTML without escaping.",
        impact:
          "An attacker can craft a link that runs JavaScript in your users' browsers — session hijack, phishing, data theft.",
        fix:
          "Escape all user-controlled output. Use framework auto-escaping (React/Vue). Never use innerHTML with untrusted data.",
      },
      4: {
        category: "Injection",
        title: "Possible SQL injection surface",
        summary:
          "An endpoint returned a database-like error when probed with a quote character.",
        impact: "Full database dump, credential theft, or complete server takeover.",
        fix:
          "Use parameterized queries / prepared statements. Never concatenate user input into SQL. Add a WAF as defense-in-depth.",
      },
      5: {
        category: "Security Misconfiguration",
        title: "Exposed .env / dotfile on public path",
        summary:
          "Common secret file paths respond with content instead of 404.",
        impact:
          "API keys, DB credentials, Stripe secrets — anything in your .env is now public.",
        fix:
          "Never deploy .env. Add explicit deny rules for dotfiles in your web server / CDN. Rotate any exposed secrets NOW.",
      },
      6: {
        category: "Vulnerable Components",
        title: "Outdated JavaScript library with known CVEs",
        summary:
          "Your site loads an old version of a common JS library with public exploits.",
        impact:
          "Prototype pollution, XSS, or RCE depending on the library. Easy to weaponize from public CVE databases.",
        fix:
          "Upgrade to the latest minor version. Run `npm audit` or Snyk in CI. Pin and monitor.",
      },
      7: {
        category: "Broken Access Control",
        title: "Weak or missing CORS configuration",
        summary:
          "Your API returns Access-Control-Allow-Origin: * with credentials enabled or echoes any origin.",
        impact:
          "Malicious sites can make authenticated requests on behalf of your users.",
        fix:
          "Lock CORS to an allowlist. Never combine Allow-Origin: * with Allow-Credentials: true.",
      },
      8: {
        category: "Cryptographic Failures",
        title: "Missing Strict-Transport-Security (HSTS)",
        summary:
          "HSTS header is missing. Browsers will still accept downgraded HTTP on first visit.",
        impact:
          "First-visit MITM attacks can strip HTTPS before the browser sees your cert.",
        fix:
          "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload. Submit to hstspreload.org.",
      },
      9: {
        category: "Broken Access Control",
        title: "Admin endpoint exposed to public internet",
        summary:
          "A /admin or /wp-admin style path is reachable without authentication banner or IP restriction.",
        impact:
          "Automated bots bruteforce these 24/7. Weak password = full takeover.",
        fix:
          "Put admin behind SSO, IP allowlist, or a VPN. At minimum, rate-limit and enforce MFA.",
      },
      10: {
        category: "Security Misconfiguration",
        title: "Verbose server banner leaks stack info",
        summary:
          "Response headers advertise exact versions of your server and framework.",
        impact:
          "Gives attackers a shortcut: they know exactly which exploits to try.",
        fix:
          "Strip / generalize Server and X-Powered-By headers at your reverse proxy.",
      },
      11: {
        category: "Identification & Auth Failures",
        title: "Cookies missing Secure / HttpOnly / SameSite",
        summary:
          "Session cookies are missing one or more protective flags.",
        impact:
          "Enables cookie theft via XSS and CSRF via cross-site navigation.",
        fix: "Set Secure; HttpOnly; SameSite=Lax (or Strict) on all auth cookies.",
      },
      12: {
        category: "Identification & Auth Failures",
        title: "No rate limiting on login endpoint",
        summary:
          "Login endpoint accepts unlimited attempts from the same IP.",
        impact:
          "Credential stuffing, brute force, account takeover at scale.",
        fix:
          "Add rate limiting (per IP + per account). Lock accounts after N failures. Add CAPTCHA on anomaly.",
      },
    },
    checks: {
      "http-no-redirect": {
        category: "Transport Security",
        title: "HTTP does not redirect to HTTPS",
        summary: "Requests over plain HTTP are served without redirecting to a secure connection.",
        impact: "All traffic can be intercepted — sessions stolen, pages modified, credentials captured in transit.",
        fix: "Configure your server or CDN to 301-redirect all HTTP traffic to HTTPS.",
      },
      "cert-invalid": {
        category: "Transport Security",
        title: "TLS certificate is invalid or untrusted",
        summary: "The certificate presented by the server is self-signed, expired, or otherwise untrusted.",
        impact: "Browsers show a scary warning; users may leave or attackers can MITM the connection.",
        fix: "Obtain a valid certificate from a trusted CA (e.g. Let's Encrypt). Ensure it covers your hostname.",
      },
      "cert-expiring": {
        category: "Transport Security",
        title: "TLS certificate expiring soon",
        summary: "Your certificate expires within 30 days.",
        impact: "If it lapses, your site goes down or shows security warnings.",
        fix: "Renew the certificate now. Set up auto-renewal via your CA or hosting platform.",
      },
      "no-hsts": {
        category: "Security Headers",
        title: "Missing Strict-Transport-Security (HSTS)",
        summary: "Without HSTS, browsers will still accept a downgraded HTTP connection on first visit.",
        impact: "First-visit MITM attacks can strip HTTPS before your browser ever sees the certificate.",
        fix: "Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload.",
      },
      "hsts-short": {
        category: "Security Headers",
        title: "HSTS max-age too short",
        summary: "The HSTS header has a max-age under 6 months.",
        impact: "Browsers forget the HSTS policy quickly, leaving a window for downgrade attacks.",
        fix: "Set max-age to at least 31536000 (1 year).",
      },
      "no-csp": {
        category: "Security Headers",
        title: "Missing Content-Security-Policy",
        summary: "No CSP header detected — your biggest defense against XSS is turned off.",
        impact: "Any XSS bug becomes a full account-takeover surface. Stolen sessions, leaked tokens, defacement.",
        fix: "Add Content-Security-Policy: default-src 'self'; and tighten per directive as needed.",
      },
      "no-x-frame-options": {
        category: "Security Headers",
        title: "Missing X-Frame-Options / frame-ancestors",
        summary: "Your pages can be embedded in iframes on any site — clickjacking is possible.",
        impact: "Attackers trick logged-in users into clicking hidden UI (transfer, delete, approve).",
        fix: "Return X-Frame-Options: DENY or add frame-ancestors 'none' to your CSP.",
      },
      "no-x-content-type-options": {
        category: "Security Headers",
        title: "Missing X-Content-Type-Options",
        summary: "Without nosniff, browsers may MIME-sniff responses and execute unexpected content.",
        impact: "A file uploaded as text could be interpreted as JavaScript.",
        fix: "Add X-Content-Type-Options: nosniff to all responses.",
      },
      "no-referrer-policy": {
        category: "Security Headers",
        title: "Missing Referrer-Policy",
        summary: "Full referrer URLs may leak sensitive paths and tokens to third parties.",
        impact: "URLs with session tokens or internal paths are sent in the Referer header to external sites.",
        fix: "Add Referrer-Policy: strict-origin-when-cross-origin (or stricter).",
      },
      "no-permissions-policy": {
        category: "Security Headers",
        title: "Missing Permissions-Policy",
        summary: "Browser features like camera, microphone, and geolocation are not explicitly restricted.",
        impact: "Injected scripts could access powerful browser APIs.",
        fix: "Add Permissions-Policy: camera=(), microphone=(), geolocation=() etc.",
      },
      "server-banner": {
        category: "Server Configuration",
        title: "Server header reveals version info",
        summary: "The Server header advertises exact software and version numbers.",
        impact: "Attackers know exactly which exploits to try against your stack.",
        fix: "Strip or generalize the Server header at your reverse proxy or CDN.",
      },
      "x-powered-by": {
        category: "Server Configuration",
        title: "X-Powered-By header exposed",
        summary: "The response includes an X-Powered-By header revealing your framework.",
        impact: "Gives attackers a shortcut to identify known vulnerabilities in your stack.",
        fix: "Remove the X-Powered-By header. Most frameworks have a simple config toggle.",
      },
      "cookies-insecure": {
        category: "Cookie Security",
        title: "Cookies missing security flags",
        summary: "One or more cookies are missing Secure, HttpOnly, or SameSite attributes.",
        impact: "Enables cookie theft via XSS and CSRF via cross-site navigation.",
        fix: "Set Secure; HttpOnly; SameSite=Lax (or Strict) on all authentication cookies.",
      },
      "cors-wildcard": {
        category: "CORS Policy",
        title: "Overly permissive CORS configuration",
        summary: "Your API reflects any origin or uses Access-Control-Allow-Origin: *.",
        impact: "Malicious sites can make authenticated requests on behalf of your users.",
        fix: "Lock CORS to an explicit allowlist. Never combine wildcard with credentials.",
      },
      "env-exposed": {
        category: "Exposed Files",
        title: "Exposed .env file on public path",
        summary: "The /.env path returns a 200 response — secrets may be publicly readable.",
        impact: "API keys, database credentials, Stripe secrets — everything in your .env is now public.",
        fix: "Block dotfile access at your web server. Rotate ALL exposed secrets immediately.",
      },
      "git-exposed": {
        category: "Exposed Files",
        title: "Exposed .git directory",
        summary: "The /.git/HEAD path is accessible — your full source code history may be downloadable.",
        impact: "Attackers can reconstruct your entire codebase, find secrets in commit history.",
        fix: "Block /.git/ access at your web server. Review git history for leaked secrets.",
      },
      "ds-store-exposed": {
        category: "Exposed Files",
        title: "Exposed .DS_Store file",
        summary: "A macOS .DS_Store file is accessible, leaking directory structure.",
        impact: "Reveals internal file and folder names, helping attackers map your site.",
        fix: "Block dotfile access at your web server. Add .DS_Store to .gitignore.",
      },
      "admin-exposed": {
        category: "Exposed Files",
        title: "Admin panel publicly accessible",
        summary: "An admin or login page is reachable without IP restriction.",
        impact: "Automated bots bruteforce these 24/7. Weak password = full takeover.",
        fix: "Put admin behind SSO, IP allowlist, or VPN. Enforce MFA and rate-limiting.",
      },
      "debug-exposed": {
        category: "Exposed Files",
        title: "Debug or status endpoint exposed",
        summary: "A debug, phpinfo, or server-status page is publicly accessible.",
        impact: "Reveals internal config, PHP settings, server internals — a goldmine for attackers.",
        fix: "Remove or restrict access to debug endpoints in production.",
      },
      "no-spf": {
        category: "DNS Security",
        title: "No SPF record",
        summary: "No SPF TXT record found — anyone can send email pretending to be your domain.",
        impact: "Phishing emails from your domain will pass basic checks, damaging your reputation.",
        fix: "Add a TXT record: v=spf1 include:_spf.yourprovider.com -all",
      },
      "no-dmarc": {
        category: "DNS Security",
        title: "No DMARC record",
        summary: "No DMARC policy found at _dmarc.yourdomain — email authentication is incomplete.",
        impact: "Without DMARC, you have no visibility into who's spoofing your domain.",
        fix: "Add a TXT record at _dmarc.yourdomain: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain",
      },
      "mixed-content": {
        category: "Content Security",
        title: "Mixed content: HTTP resources on HTTPS page",
        summary: "Your HTTPS page loads resources over plain HTTP.",
        impact: "Those resources can be tampered with in transit, potentially injecting scripts.",
        fix: "Change all resource URLs to HTTPS. Use protocol-relative URLs or CSP upgrade-insecure-requests.",
      },
      "outdated-library": {
        category: "Content Security",
        title: "Outdated JavaScript library detected",
        summary: "A known-vulnerable version of a JavaScript library was found.",
        impact: "Public exploits exist for this version — XSS, prototype pollution, or worse.",
        fix: "Upgrade to the latest version. Run npm audit in CI to catch future regressions.",
      },
    },
    metaLabels: {
      ip: "IP Address",
      server: "Server",
      tls: "TLS Protocol",
      cert: "Certificate",
      certExpires: "Cert expires",
      certDaysLeft: "Days left",
      responseTime: "Response time",
      statusCode: "Status code",
      technologies: "Technologies",
      redirectChain: "Redirects",
      scanDuration: "Scan duration",
      downloadPdf: "Download PDF",
    },
    passedLabel: "Passed checks",
    passedChecks: {
      "http-no-redirect": "HTTPS redirect configured correctly",
      "cert-invalid": "Valid and trusted TLS certificate",
      "cert-expiring": "Certificate not expiring soon",
      "no-hsts": "Strict-Transport-Security (HSTS) present",
      "hsts-short": "HSTS max-age is sufficient",
      "no-csp": "Content-Security-Policy header present",
      "no-x-frame-options": "X-Frame-Options / frame-ancestors set",
      "no-x-content-type-options": "X-Content-Type-Options: nosniff set",
      "no-referrer-policy": "Referrer-Policy header present",
      "no-permissions-policy": "Permissions-Policy header present",
      "server-banner": "Server version not exposed",
      "x-powered-by": "X-Powered-By header not present",
      "cookies-insecure": "Cookies have proper security flags",
      "cors-wildcard": "CORS properly configured",
      "env-exposed": ".env file not publicly accessible",
      "git-exposed": ".git directory not exposed",
      "ds-store-exposed": ".DS_Store file not exposed",
      "admin-exposed": "Admin panel not publicly accessible",
      "debug-exposed": "Debug endpoints not exposed",
      "no-spf": "SPF record configured",
      "no-dmarc": "DMARC record configured",
      "mixed-content": "No mixed content detected",
      "outdated-library": "No outdated libraries detected",
    },
  },
  paywall: {
    kicker: "Unlock",
    title: "Get the full security report",
    body:
      "Every vulnerability. Every fix. A shareable PDF for your team or investors.",
    oneoffTab: "One-off $9",
    proTab: "Pro $29/mo",
    benefits: [
      "Full vulnerability list",
      "OWASP-mapped fix instructions",
      "Exportable PDF report",
    ],
    proBenefits: [
      "Unlimited scans",
      "Continuous monitoring & alerts",
      "CI/CD integration",
    ],
    ctaOneoff: "Pay $9 & unlock",
    ctaPro: "Start Pro — $29/mo",
    ctaLoading: "Redirecting…",
    fineprint: "Secure checkout · Instant access · 7-day money-back guarantee",
    close: "Close",
  },
  comingSoon: {
    kicker: "Coming soon",
    title: "We're just getting started.",
    subtitle:
      "These features are being built right now. Leave your email and be the first to know when they launch.",
    emailPlaceholder: "you@company.com",
    ctaLabel: "Notify me",
    successLabel: "You're on the list!",
    badgeLabel: "Coming soon",
    features: [
      {
        tag: "monitoring",
        title: "Continuous Monitoring",
        body: "Your site could become vulnerable tomorrow. Get alerted the moment a new threat appears — before attackers find it.",
      },
      {
        tag: "fix-service",
        title: "Fix It For Me",
        body: "Don't have a security engineer? Don't want to deal with this? We'll fix all your vulnerabilities for you. One click, done.",
      },
      {
        tag: "cicd",
        title: "CI/CD Integration",
        body: "Scan your app before every deploy. Block vulnerable code from ever reaching production.",
      },
      {
        tag: "ai-scan",
        title: "AI Code Security Scanner",
        body: "Built with AI? Paste your code and detect vulnerabilities instantly. Developers using this ship safer code.",
      },
      {
        tag: "score-tracking",
        title: "Security Score Tracking",
        body: "Track your security posture over time. See if your fixes actually work — or if things are getting worse.",
      },
      {
        tag: "advanced-reports",
        title: "Advanced Reports",
        body: "Investor-ready security reports. Beautiful PDFs for board decks, due diligence, and compliance audits.",
      },
    ],
  },
  purchase: {
    successBanner: "Payment successful! Your full report is unlocked.",
    thankTitle: "Thank you for your purchase!",
    thankSubtitle: "You're one step ahead of the attackers.",
    thankBody: "Your plan is now active. Scan any website to get the full security report with detailed fix instructions, OWASP explanations, and exportable PDF.",
    thankCta: "Scan your first site",
    planOneoff: "One-off Report",
    planPro: "Pro Plan",
    receiptNote: "A receipt has been sent to your email by Stripe.",
  },
};

const CS: Dict = {
  nav: { how: "Jak to funguje", pricing: "Ceník", faq: "FAQ", scanFree: "Skenovat zdarma" },
  hero: {
    liveTicker: "12 847 webů naskenováno tento týden · 9 z 10 neprošlo",
    titleLine1: "Vaši vývojáři říkají, že je to bezpečné.",
    titleLine2: "Jste si jistí?",
    subtitleBefore:
      "Ověřte si aplikaci, kterou vám právě postavil váš IT tým, agentura, freelancer — nebo AI. Jeden odkaz. ",
    subtitleStrong: "30 sekund.",
    subtitleAfter: " Brutálně upřímné odpovědi.",
    placeholder: "vasweb.cz",
    ctaIdle: "Skenovat teď (zdarma)",
    ctaLoading: "Skenuji…",
    fineprint: "Sken zdarma · Postaveno na OWASP Top 10 · Bez platební karty",
    invalidUrl: "Zadejte prosím platnou adresu webu.",
  },
  proof: {
    prefix: "Používají to zakladatelé z",
    items: ["YC startupů", "Indie Hackers", "Product Hunt", "GitHub komunity"],
  },
  stats: [
    { big: "73 %", label: "webů jde do produkce s alespoň jednou závažnou zranitelností" },
    { big: "11 sekund", label: "průměrný čas, než bot poprvé osahá nově zaindexovaný web" },
    { big: "4,45M $", label: "průměrné náklady na únik dat v roce 2024 (IBM)", danger: true },
  ],
  how: {
    title: "Tři kroky. Brutální upřímnost.",
    subtitle:
      "Představte si Lighthouse — ale pro riziko hacknutí. Postaveno pro zakladatele, kteří nemluví jazykem CVE, a pro vývojáře, kteří pracují rychle.",
    steps: [
      { title: "Vložte URL", body: "Jakýkoli veřejný web. Nesáhneme si na vaši infrastrukturu, kód, ani na uživatele." },
      { title: "Proskenujeme povrch", body: "Hlavičky, TLS, odhalené endpointy, typická místa pro injection, zastaralé knihovny, OWASP Top 10." },
      { title: "Dostanete skóre", body: "0–100. Hlavní problémy. Srozumitelné opravy. Ke sdílení. K opravě. Ještě dnes." },
    ],
  },
  verify: {
    kicker: "Důvěřuj, ale prověřuj",
    titleLine1: "Někdo vám řekl, že je váš web bezpečný.",
    titleLine2: "To ale neznamená, že bezpečný opravdu je.",
    body:
      "Vývojáři říkají „to je v pohodě“. AI říká „vypadá to dobře“. Agentury posílají faktury. Nikdo nechce být ten, kdo najde díry. Dokud to zdarma ve tři ráno neudělá cizinec z internetu.",
    doYouTrust: "Věříte…",
    questionLabel: "Otázka, kterou si nikdo neklade",
    cards: [
      {
        who: "svému IT týmu",
        pain: "Slíbili, že to udělají pořádně. Stejně tak slíbili, že minulý release bude včas.",
        question: "Nasadili skutečně HTTPS, CSP a pořádnou autentizaci — nebo jen nasadili?",
      },
      {
        who: "své agentuře / freelancerovi",
        pain: "Postavili to rychle, ještě rychleji vyfakturovali a přešli ke klientovi dalšímu. Bezpečnost v cenové nabídce nebyla.",
        question: "Co vlastně opravdu zabezpečili — a co nechali jako dárek pro vaše budoucí já?",
      },
      {
        who: "svému AI nástroji",
        pain: "Cursor, Claude, Copilot, v0 — ty vám dodají funkční ficurky. Stejně tak vám bez mrknutí oka dodají XSS, SQLi, odhalené klíče a rozbitou autentizaci.",
        question: "Je kód, který jste si právě „vibe-codnuli“, opravdu bezpečné pustit na reálné uživatele?",
      },
    ],
    cta: "Ověřit můj web teď — zdarma →",
    fineprint: "Trvá to 30 sekund. Nesáhne si to na váš kód. Nepotřebujete povolení od týmu.",
  },
  audience: {
    founders: {
      tag: "PRO ZAKLADATELE A NETECHNICKÉ MAJITELE",
      title: "Zaplatili jste za aplikaci. Zaplatili jste i za riziko?",
      body:
        "Nemusíte umět číst kód. A ani byste neměli. Získejte srozumitelné bezpečnostní hodnocení toho, co vám váš tým, agentura nebo AI právě postavili — a zjistěte, kolik by vás únik dat doopravdy stál.",
      bullets: [
        "Jedno číslo. Nula žargonu.",
        "V pondělí budete přesně vědět, na co se vývojářů zeptat",
        "Dopad na byznys — ne CVE hatmatilka",
        "PDF pro investory, due diligence a boardy",
      ],
    },
    devs: {
      tag: "PRO VÝVOJÁŘE A VIBE CODERY",
      title: "Vaše AI říká, že je to v pohodě. Není.",
      body:
        "LLMka vám bez mrknutí oka dodají XSS, SQLi, odhalené .env a rozbitou autentizaci. Spusťte VulnCheck dřív, než to nasadíte do produkce — a dřív, než to na vás spustí váš netechnický zakladatel.",
      bullets: [
        "Kontrola bezpečnosti AI-generovaného kódu před deploymentem",
        "Konkrétní kroky namapované na OWASP",
        "Odhalí chyby, na které linter nestačí",
        "Integrace do CI/CD (již brzy)",
      ],
    },
  },
  pricing: {
    title: "Férová cena. Nefér jasno.",
    popular: "Oblíbené",
    plans: [
      {
        name: "Zdarma",
        price: "0 $",
        tag: "Lead magnet",
        cta: "Skenovat teď",
        features: [
          "1 sken denně",
          "Bezpečnostní skóre (0–100)",
          "Top 3 zranitelnosti",
          "Srovnání s ostatními weby",
        ],
      },
      {
        name: "Jednorázově",
        price: "9 $",
        tag: "Za plný report",
        cta: "Odemknout report",
        features: [
          "Kompletní seznam zranitelností",
          "Detailní instrukce k opravě",
          "Vysvětlení podle OWASP",
          "Exportovatelný PDF report",
        ],
      },
      {
        name: "Pro",
        price: "29 $",
        tag: "/ měsíčně",
        cta: "Spustit monitoring",
        features: [
          "Neomezené skenování",
          "Průběžný monitoring",
          "Upozornění na Slack / e-mail",
          "Integrace do CI/CD",
          "Prioritní vedení při opravách",
        ],
      },
    ],
  },
  faq: {
    title: "Otázky?",
    items: [
      { q: "Je bezpečné pustit sken na produkční web?", a: "Ano. VulnCheck dělá jen pasivní, neinvazivní kontroly na veřejně dostupných místech. Žádné payloady, žádný brute force, žádné zakládání účtů." },
      { q: "Ukládáte si data mého webu?", a: "Ukládáme URL a výsledek skenu, abyste ho mohli sdílet. Nic jiného. Žádný kód, žádný provoz, žádná uživatelská data." },
      { q: "V čem je to jiné než OWASP ZAP nebo Burp?", a: "To jsou profi nástroje pro bezpečnostní inženýry. VulnCheck je pro zakladatele a vývojáře, kteří chtějí jedno skóre a to-do list — za 30 sekund." },
      { q: "Postavil jsem aplikaci s Cursor / Claude / Copilotem. Je to bezpečné?", a: "Pravděpodobně ne. AI-generovaný kód často míří do produkce s XSS, SQLi, slabou autentizací a chybějícími bezpečnostními hlavičkami. Skenujte dřív, než nasadíte." },
    ],
  },
  finalCta: {
    titleLine1: "Lidi, co vám postavili aplikaci,",
    titleLine2: "nebudou ti, kdo najdou díry.",
    subtitle: "Najdou je útočníci. Nebo vy. Hned teď. Zdarma.",
    cta: "Spustit můj sken zdarma →",
  },
  footer: "Postaveno pro zakladatele a vývojáře po celém světě.",
  langLabel: "Jazyk",
  scan: {
    back: "← Skenovat jiný web",
    kicker: "Bezpečnostní report",
    scannedAtLabel: "Skenováno",
    share: "Sdílet report ↗",
    shareCopied: "Zkopírováno!",
    scanning: {
      steps: [
        "Překládám DNS…",
        "Kontroluji TLS a certifikáty…",
        "Zkoumám HTTP bezpečnostní hlavičky…",
        "Osahávám povrch podle OWASP Top 10…",
        "Identifikuji knihovny a verze…",
        "Počítám vaše bezpečnostní skóre…",
      ],
    },
    score: {
      outOf: "/ 100 · Známka {grade}",
      gradeLabel: "Známka",
      toneDanger: "Nebezpečí",
      toneWarn: "Varování",
      toneSafe: "Vypadá to dobře",
      benchmarkMin: "Nejbezpečnější",
      benchmarkMax: "Nejzranitelnější",
      benchmarkText: "Jste zranitelnější než {percentile} % webů, které jsme skenovali.",
    },
    headline: {
      danger: "{host} je odhalený. Útočníci by to měli jako procházku růžovým sadem.",
      warn: "{host} má reálné mezery. Opravitelné, ale nedá se to ignorovat.",
      safe: "{host} vypadá solidně — ale neusínejte na vavřínech.",
    },
    subline: {
      danger:
        "Jste zranitelnější než {percentile} % webů, které jsme skenovali. Opravte nejdřív ty kritické.",
      warn:
        "Jste zranitelnější než {percentile} % webů. Většina vývojářů tyto věci přehlíží.",
      safe: "Jste bezpečnější než {inverse} % webů. Pár rychlých vylepšení ještě zbývá.",
    },
    counts: { critical: "Kritické", high: "Vysoké", medium: "Střední", low: "Nízké" },
    severity: { critical: "Kritická", high: "Vysoká", medium: "Střední", low: "Nízká", info: "Info" },
    sections: {
      topThree: "Vaše TOP 3 problémy",
      allIssues: "Všechny problémy",
      totalSuffix: "celkem {n}",
      moreHidden: "dalších {n} skrytých",
    },
    finding: {
      impactLabel: "Dopad na byznys",
      fixLabel: "Jak to opravit",
      evidenceLabel: "důkaz",
    },
    unlock: {
      kicker: "dalších {n} zranitelností je skryto",
      title: "Odemkněte kompletní bezpečnostní report",
      body:
        "Kompletní seznam zranitelností, instrukce k opravě podle OWASP a PDF export ke sdílení.",
      cta: "Odemknout kompletní report — 9 $",
      fineprint: "Jednorázová platba · Okamžitý přístup · PDF v ceně",
    },
    final: {
      title: "Útočníci nečekají. Proč byste měli vy?",
      body:
        "Většina těchto problémů zabere méně než hodinu opravy. Cena za jejich ignorování se měří v zákaznících, tržbách a důvěře.",
      cta: "Odemknout kompletní report",
    },
    error: {
      title: "Tuto URL se nám nepodařilo naskenovat",
      cta: "Zkusit jinou URL",
      generic: "Něco se pokazilo. Zkuste to znovu.",
    },
    findings: {
      0: {
        category: "Kryptografická selhání",
        title: "Chybí HTTPS / nezabezpečený přenos",
        summary:
          "Váš web přijímá prostý HTTP. Provoz lze odposlechnout nebo pozměnit na cestě.",
        impact:
          "Útočníci na veřejné Wi-Fi mohou krást relace, vkládat skripty nebo přesměrovávat uživatele.",
        fix:
          "Vynucujte HTTPS na celém webu, zapněte HSTS s max-age na 1 rok a přesměrujte veškerý provoz z portu 80 na 443.",
      },
      1: {
        category: "Špatná konfigurace",
        title: "Chybí hlavička Content-Security-Policy",
        summary:
          "Žádná CSP hlavička. Vaše největší obrana proti XSS je vypnutá.",
        impact:
          "Jakákoli XSS chyba se stává plnou branou k převzetí účtu. Ukradené relace, uniklé tokeny, defacement.",
        fix:
          "Přidejte Content-Security-Policy: default-src 'self'; začněte přísně a uvolňujte po jednotlivých direktivách podle potřeby.",
      },
      2: {
        category: "Špatná konfigurace",
        title: "Chybí X-Frame-Options / frame-ancestors",
        summary:
          "Vaše stránky lze vložit do iframe na libovolném webu. Povrch pro clickjacking je otevřený.",
        impact:
          "Útočníci mohou přinutit přihlášené uživatele kliknout na skryté tlačítko (převod, smazat, schválit).",
        fix: "Vracejte X-Frame-Options: DENY nebo nastavte frame-ancestors 'none' v CSP.",
      },
      3: {
        category: "Injection",
        title: "Riziko reflected XSS v query parametrech",
        summary:
          "Minimálně jedna stránka vkládá URL parametry do HTML bez escapování.",
        impact:
          "Útočník může vytvořit odkaz, který spustí JavaScript v prohlížečích vašich uživatelů — únos relace, phishing, krádež dat.",
        fix:
          "Escapujte veškerý uživatelem kontrolovaný výstup. Používejte automatické escapování frameworku (React/Vue). Nikdy nepoužívejte innerHTML s nedůvěryhodnými daty.",
      },
      4: {
        category: "Injection",
        title: "Možná SQL injection",
        summary:
          "Endpoint vrátil databázovou chybu, když jsme ho otestovali uvozovkou.",
        impact:
          "Plný dump databáze, krádež přihlašovacích údajů nebo kompletní převzetí serveru.",
        fix:
          "Používejte parametrizované dotazy / prepared statements. Nikdy nespojujte uživatelský vstup do SQL. Přidejte WAF jako další obrannou vrstvu.",
      },
      5: {
        category: "Špatná konfigurace",
        title: "Odhalený .env / dotfile na veřejné cestě",
        summary:
          "Běžné cesty k tajným souborům odpovídají obsahem místo 404.",
        impact:
          "API klíče, přihlašovací údaje k DB, Stripe tajemství — vše ve vašem .env je nyní veřejné.",
        fix:
          "Nikdy nenasazujte .env. Přidejte explicitní deny pravidla pro dotfiles ve web serveru / CDN. IHNED rotujte všechna odhalená tajemství.",
      },
      6: {
        category: "Zranitelné komponenty",
        title: "Zastaralá JavaScript knihovna se známými CVE",
        summary:
          "Váš web načítá starou verzi běžné JS knihovny s veřejnými exploity.",
        impact:
          "Prototype pollution, XSS nebo RCE podle knihovny. Snadno zneužitelné z veřejných CVE databází.",
        fix:
          "Upgradujte na nejnovější minor verzi. Pusťte `npm audit` nebo Snyk v CI. Pinněte a sledujte.",
      },
      7: {
        category: "Rozbité řízení přístupu",
        title: "Slabá nebo chybějící CORS konfigurace",
        summary:
          "Vaše API vrací Access-Control-Allow-Origin: * s povolenými credentials nebo vrací libovolný origin.",
        impact:
          "Škodlivé weby mohou jménem vašich uživatelů posílat autentizované požadavky.",
        fix:
          "Zamkněte CORS na allowlist. Nikdy nekombinujte Allow-Origin: * s Allow-Credentials: true.",
      },
      8: {
        category: "Kryptografická selhání",
        title: "Chybí Strict-Transport-Security (HSTS)",
        summary:
          "HSTS hlavička chybí. Prohlížeče při první návštěvě stále akceptují downgrade na HTTP.",
        impact:
          "MITM útoky při první návštěvě mohou strhnout HTTPS dřív, než prohlížeč vůbec uvidí váš certifikát.",
        fix:
          "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload. Odešlete na hstspreload.org.",
      },
      9: {
        category: "Rozbité řízení přístupu",
        title: "Admin endpoint vystavený na veřejný internet",
        summary:
          "Cesta typu /admin nebo /wp-admin je dostupná bez autentizačního banneru nebo IP omezení.",
        impact:
          "Automatizovaní boti je bruteforce-ují 24/7. Slabé heslo = plné převzetí.",
        fix:
          "Schovejte admin za SSO, IP allowlist nebo VPN. Minimálně omezte počet pokusů a vynuťte MFA.",
      },
      10: {
        category: "Špatná konfigurace",
        title: "Banner serveru prozrazuje stack",
        summary:
          "Response hlavičky inzerují přesné verze serveru a frameworku.",
        impact:
          "Dává útočníkům zkratku: vědí přesně, jaké exploity vyzkoušet.",
        fix:
          "Odstraňte / zobecněte hlavičky Server a X-Powered-By na reverzní proxy.",
      },
      11: {
        category: "Selhání identifikace a autentizace",
        title: "Cookies bez Secure / HttpOnly / SameSite",
        summary:
          "Session cookies chybí jeden nebo více ochranných flagů.",
        impact:
          "Umožňuje krádež cookies přes XSS a CSRF přes navigaci napříč weby.",
        fix: "Nastavte Secure; HttpOnly; SameSite=Lax (nebo Strict) na všechny autentizační cookies.",
      },
      12: {
        category: "Selhání identifikace a autentizace",
        title: "Žádný rate limiting na login endpointu",
        summary:
          "Login endpoint akceptuje neomezený počet pokusů ze stejné IP.",
        impact:
          "Credential stuffing, brute force, převzetí účtů ve velkém měřítku.",
        fix:
          "Přidejte rate limiting (na IP + na účet). Uzamkněte účty po N neúspěších. Přidejte CAPTCHA při anomálii.",
      },
    },
    checks: {
      "http-no-redirect": {
        category: "Zabezpečení přenosu",
        title: "HTTP nepřesměrovává na HTTPS",
        summary: "Požadavky přes HTTP se zpracovávají bez přesměrování na zabezpečené spojení.",
        impact: "Veškerý provoz lze odposlechnout — ukradené relace, pozměněné stránky, zachycené přihlašovací údaje.",
        fix: "Nakonfigurujte server nebo CDN na 301 přesměrování veškerého HTTP provozu na HTTPS.",
      },
      "cert-invalid": {
        category: "Zabezpečení přenosu",
        title: "TLS certifikát je neplatný nebo nedůvěryhodný",
        summary: "Certifikát je self-signed, prošlý, nebo jinak nedůvěryhodný.",
        impact: "Prohlížeče zobrazí bezpečnostní varování; uživatelé odejdou nebo útočníci mohou provést MITM.",
        fix: "Získejte platný certifikát od důvěryhodné CA (např. Let's Encrypt). Zajistěte pokrytí vašeho hostname.",
      },
      "cert-expiring": {
        category: "Zabezpečení přenosu",
        title: "TLS certifikát brzy vyprší",
        summary: "Váš certifikát vyprší do 30 dnů.",
        impact: "Pokud vyprší, web přestane fungovat nebo zobrazí bezpečnostní varování.",
        fix: "Obnovte certifikát hned. Nastavte automatické obnovování přes vaši CA nebo hosting.",
      },
      "no-hsts": {
        category: "Bezpečnostní hlavičky",
        title: "Chybí Strict-Transport-Security (HSTS)",
        summary: "Bez HSTS prohlížeče stále akceptují downgrade na HTTP při první návštěvě.",
        impact: "MITM útoky při první návštěvě mohou strhnout HTTPS dříve, než prohlížeč uvidí certifikát.",
        fix: "Přidejte Strict-Transport-Security: max-age=31536000; includeSubDomains; preload.",
      },
      "hsts-short": {
        category: "Bezpečnostní hlavičky",
        title: "HSTS max-age je příliš krátký",
        summary: "Hlavička HSTS má max-age kratší než 6 měsíců.",
        impact: "Prohlížeče HSTS politiku rychle zapomenou, čímž vzniká okno pro downgrade útoky.",
        fix: "Nastavte max-age alespoň na 31536000 (1 rok).",
      },
      "no-csp": {
        category: "Bezpečnostní hlavičky",
        title: "Chybí Content-Security-Policy",
        summary: "Žádná CSP hlavička — vaše největší obrana proti XSS je vypnutá.",
        impact: "Jakákoli XSS chyba se stává branou k převzetí účtu. Ukradené relace, uniklé tokeny.",
        fix: "Přidejte Content-Security-Policy: default-src 'self'; a zpřísňujte podle potřeby.",
      },
      "no-x-frame-options": {
        category: "Bezpečnostní hlavičky",
        title: "Chybí X-Frame-Options / frame-ancestors",
        summary: "Vaše stránky lze vložit do iframe na libovolném webu — clickjacking je možný.",
        impact: "Útočníci mohou přimět přihlášené uživatele kliknout na skryté prvky.",
        fix: "Vracejte X-Frame-Options: DENY nebo přidejte frame-ancestors 'none' do CSP.",
      },
      "no-x-content-type-options": {
        category: "Bezpečnostní hlavičky",
        title: "Chybí X-Content-Type-Options",
        summary: "Bez nosniff prohlížeče mohou MIME-sniffovat odpovědi a spustit neočekávaný obsah.",
        impact: "Soubor nahraný jako text může být interpretován jako JavaScript.",
        fix: "Přidejte X-Content-Type-Options: nosniff ke všem odpovědím.",
      },
      "no-referrer-policy": {
        category: "Bezpečnostní hlavičky",
        title: "Chybí Referrer-Policy",
        summary: "Plné referrer URL mohou prozradit citlivé cesty a tokeny třetím stranám.",
        impact: "URL s session tokeny nebo interními cestami se posílají v Referer hlavičce externím webům.",
        fix: "Přidejte Referrer-Policy: strict-origin-when-cross-origin (nebo přísnější).",
      },
      "no-permissions-policy": {
        category: "Bezpečnostní hlavičky",
        title: "Chybí Permissions-Policy",
        summary: "Funkce prohlížeče jako kamera, mikrofon a geolokace nejsou explicitně omezeny.",
        impact: "Injektované skripty mohou přistupovat k silným API prohlížeče.",
        fix: "Přidejte Permissions-Policy: camera=(), microphone=(), geolocation=() atd.",
      },
      "server-banner": {
        category: "Konfigurace serveru",
        title: "Banner serveru prozrazuje verzi",
        summary: "Hlavička Server inzeruje přesné verze softwaru.",
        impact: "Útočníci vědí přesně, jaké exploity vyzkoušet.",
        fix: "Odstraňte nebo zobecněte hlavičku Server na reverzní proxy nebo CDN.",
      },
      "x-powered-by": {
        category: "Konfigurace serveru",
        title: "Hlavička X-Powered-By je odhalena",
        summary: "Odpověď obsahuje X-Powered-By prozrazující váš framework.",
        impact: "Dává útočníkům zkratku k identifikaci známých zranitelností.",
        fix: "Odstraňte hlavičku X-Powered-By. Většina frameworků má jednoduchý konfigurační přepínač.",
      },
      "cookies-insecure": {
        category: "Zabezpečení cookies",
        title: "Cookies bez bezpečnostních příznaků",
        summary: "Jeden nebo více cookies postrádá příznak Secure, HttpOnly nebo SameSite.",
        impact: "Umožňuje krádež cookies přes XSS a CSRF přes navigaci napříč weby.",
        fix: "Nastavte Secure; HttpOnly; SameSite=Lax (nebo Strict) na všechny autentizační cookies.",
      },
      "cors-wildcard": {
        category: "CORS politika",
        title: "Příliš volná konfigurace CORS",
        summary: "Vaše API odráží libovolný origin nebo používá Access-Control-Allow-Origin: *.",
        impact: "Škodlivé weby mohou jménem vašich uživatelů posílat autentizované požadavky.",
        fix: "Zamkněte CORS na explicitní allowlist. Nikdy nekombinujte wildcard s credentials.",
      },
      "env-exposed": {
        category: "Odhalené soubory",
        title: "Odhalený .env soubor na veřejné cestě",
        summary: "Cesta /.env vrací odpověď 200 — tajemství mohou být veřejně čitelná.",
        impact: "API klíče, přihlašovací údaje k DB, Stripe tajemství — vše v .env je teď veřejné.",
        fix: "Zablokujte přístup k dotfiles na web serveru. IHNED rotujte všechna odhalená tajemství.",
      },
      "git-exposed": {
        category: "Odhalené soubory",
        title: "Odhalený .git adresář",
        summary: "Cesta /.git/HEAD je přístupná — celá historie zdrojového kódu může být ke stažení.",
        impact: "Útočníci mohou rekonstruovat celý codebase a najít tajemství v historii commitů.",
        fix: "Zablokujte přístup k /.git/ na web serveru. Zkontrolujte historii gitu na uniklá tajemství.",
      },
      "ds-store-exposed": {
        category: "Odhalené soubory",
        title: "Odhalený .DS_Store soubor",
        summary: "macOS .DS_Store soubor je přístupný, prozrazuje strukturu adresářů.",
        impact: "Odhaluje interní názvy souborů a složek a pomáhá útočníkům zmapovat web.",
        fix: "Zablokujte přístup k dotfiles na web serveru. Přidejte .DS_Store do .gitignore.",
      },
      "admin-exposed": {
        category: "Odhalené soubory",
        title: "Admin panel veřejně přístupný",
        summary: "Admin nebo přihlašovací stránka je dosažitelná bez IP omezení.",
        impact: "Automatizovaní boti je bruteforcují 24/7. Slabé heslo = plné převzetí.",
        fix: "Schovejte admin za SSO, IP allowlist nebo VPN. Vynuťte MFA a rate-limiting.",
      },
      "debug-exposed": {
        category: "Odhalené soubory",
        title: "Debug nebo status endpoint odhalen",
        summary: "Debug, phpinfo nebo server-status stránka je veřejně přístupná.",
        impact: "Odhaluje interní konfiguraci, PHP nastavení, interní údaje serveru.",
        fix: "Odstraňte nebo omezte přístup k debug endpointům v produkci.",
      },
      "no-spf": {
        category: "DNS zabezpečení",
        title: "Žádný SPF záznam",
        summary: "Nebyl nalezen SPF TXT záznam — kdokoli může posílat e-maily za vaši doménu.",
        impact: "Phishingové e-maily z vaší domény projdou základními kontrolami a poškodí vaši reputaci.",
        fix: "Přidejte TXT záznam: v=spf1 include:_spf.vasprovider.com -all",
      },
      "no-dmarc": {
        category: "DNS zabezpečení",
        title: "Žádný DMARC záznam",
        summary: "Na _dmarc.vasedomena nebyla nalezena DMARC politika — autentizace e-mailu je neúplná.",
        impact: "Bez DMARC nemáte přehled o tom, kdo zneužívá vaši doménu.",
        fix: "Přidejte TXT záznam na _dmarc.vasedomena: v=DMARC1; p=quarantine; rua=mailto:dmarc@vasedomena",
      },
      "mixed-content": {
        category: "Zabezpečení obsahu",
        title: "Smíšený obsah: HTTP zdroje na HTTPS stránce",
        summary: "Vaše HTTPS stránka načítá zdroje přes plain HTTP.",
        impact: "Tyto zdroje mohou být pozměněny při přenosu a potenciálně vložit skripty.",
        fix: "Změňte všechny URL zdrojů na HTTPS. Použijte CSP upgrade-insecure-requests.",
      },
      "outdated-library": {
        category: "Zabezpečení obsahu",
        title: "Detekována zastaralá JavaScript knihovna",
        summary: "Byla nalezena verze JavaScript knihovny se známými zranitelnostmi.",
        impact: "Pro tuto verzi existují veřejné exploity — XSS, prototype pollution nebo horší.",
        fix: "Upgradujte na nejnovější verzi. Pusťte npm audit v CI, abyste zachytili budoucí regrese.",
      },
    },
    metaLabels: {
      ip: "IP adresa",
      server: "Server",
      tls: "TLS protokol",
      cert: "Certifikát",
      certExpires: "Certifikát vyprší",
      certDaysLeft: "Zbývá dní",
      responseTime: "Doba odezvy",
      statusCode: "Stavový kód",
      technologies: "Technologie",
      redirectChain: "Přesměrování",
      scanDuration: "Doba skenu",
      downloadPdf: "Stáhnout PDF",
    },
    passedLabel: "Prošlo kontrolou",
    passedChecks: {
      "http-no-redirect": "HTTPS přesměrování správně nakonfigurováno",
      "cert-invalid": "Platný a důvěryhodný TLS certifikát",
      "cert-expiring": "Certifikát nevyprší v blízké době",
      "no-hsts": "Hlavička Strict-Transport-Security (HSTS) přítomna",
      "hsts-short": "HSTS max-age je dostatečný",
      "no-csp": "Hlavička Content-Security-Policy přítomna",
      "no-x-frame-options": "X-Frame-Options / frame-ancestors nastaveno",
      "no-x-content-type-options": "X-Content-Type-Options: nosniff nastaveno",
      "no-referrer-policy": "Hlavička Referrer-Policy přítomna",
      "no-permissions-policy": "Hlavička Permissions-Policy přítomna",
      "server-banner": "Verze serveru není odhalena",
      "x-powered-by": "Hlavička X-Powered-By není přítomna",
      "cookies-insecure": "Cookies mají správné bezpečnostní flagy",
      "cors-wildcard": "CORS správně nakonfigurován",
      "env-exposed": "Soubor .env není veřejně dostupný",
      "git-exposed": "Adresář .git není odhalen",
      "ds-store-exposed": "Soubor .DS_Store není odhalen",
      "admin-exposed": "Admin panel není veřejně dostupný",
      "debug-exposed": "Debug endpointy nejsou odhaleny",
      "no-spf": "SPF záznam nakonfigurován",
      "no-dmarc": "DMARC záznam nakonfigurován",
      "mixed-content": "Žádný mixed content detekován",
      "outdated-library": "Žádné zastaralé knihovny detekovány",
    },
  },
  paywall: {
    kicker: "Odemknout",
    title: "Získejte kompletní bezpečnostní report",
    body:
      "Každá zranitelnost. Každá oprava. PDF ke sdílení s týmem nebo investory.",
    oneoffTab: "Jednorázově 9 $",
    proTab: "Pro 29 $/měs",
    benefits: [
      "Kompletní seznam zranitelností",
      "Instrukce k opravě podle OWASP",
      "Exportovatelný PDF report",
    ],
    proBenefits: [
      "Neomezené skenování",
      "Průběžný monitoring a upozornění",
      "Integrace do CI/CD",
    ],
    ctaOneoff: "Zaplatit 9 $ a odemknout",
    ctaPro: "Spustit Pro — 29 $/měs",
    ctaLoading: "Přesměrovávám…",
    fineprint: "Bezpečná platba · Okamžitý přístup · 7 dní na vrácení peněz",
    close: "Zavřít",
  },
  comingSoon: {
    kicker: "Již brzy",
    title: "Teprve začínáme.",
    subtitle:
      "Na těchto funkcích se právě pracuje. Nechte nám e-mail a budete první, kdo se dozví, až je spustíme.",
    emailPlaceholder: "vy@firma.cz",
    ctaLabel: "Dejte mi vědět",
    successLabel: "Máme vás na seznamu!",
    badgeLabel: "Již brzy",
    features: [
      {
        tag: "monitoring",
        title: "Průběžný monitoring",
        body: "Váš web se může stát zranitelným zítra. Dostanete upozornění ve chvíli, kdy se objeví nová hrozba — dřív, než ji najdou útočníci.",
      },
      {
        tag: "fix-service",
        title: "Opravíme to za vás",
        body: "Nemáte bezpečnostního inženýra? Nechcete se tím zabývat? Všechny zranitelnosti opravíme za vás. Jedno kliknutí, hotovo.",
      },
      {
        tag: "cicd",
        title: "CI/CD integrace",
        body: "Skenujte aplikaci před každým deployem. Zablokujte zranitelný kód dřív, než se dostane do produkce.",
      },
      {
        tag: "ai-scan",
        title: "AI skener kódu",
        body: "Postaveno s AI? Vložte svůj kód a okamžitě odhalte zranitelnosti. Vývojáři, kteří tohle používají, šíří bezpečnější kód.",
      },
      {
        tag: "score-tracking",
        title: "Sledování bezpečnostního skóre",
        body: "Sledujte svůj bezpečnostní stav v čase. Zjistěte, jestli vaše opravy fungují — nebo jestli se to zhoršuje.",
      },
      {
        tag: "advanced-reports",
        title: "Pokročilé reporty",
        body: "Bezpečnostní reporty připravené pro investory. Krásná PDF pro board decky, due diligence a compliance audity.",
      },
    ],
  },
  purchase: {
    successBanner: "Platba proběhla úspěšně! Váš kompletní report je odemčen.",
    thankTitle: "Děkujeme za nákup!",
    thankSubtitle: "Jste o krok napřed před útočníky.",
    thankBody: "Váš plán je nyní aktivní. Naskenujte jakýkoliv web a získejte kompletní bezpečnostní report s podrobnými instrukcemi k opravě, OWASP vysvětleními a exportovatelným PDF.",
    thankCta: "Naskenovat první web",
    planOneoff: "Jednorázový report",
    planPro: "Pro plán",
    receiptNote: "Potvrzení o platbě vám bylo zasláno e-mailem od Stripe.",
  },
};

export const dict: Record<Lang, Dict> = { en: EN, cs: CS };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: EN });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang");
      if (stored === "en" || stored === "cs") {
        setLangState(stored);
        return;
      }
      if (navigator.language?.toLowerCase().startsWith("cs")) {
        setLangState("cs");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dict[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  return useContext(LanguageContext);
}
