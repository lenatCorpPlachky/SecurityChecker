import { NextResponse } from "next/server";

// In-memory store for MVP (same mock pattern as /api/checkout)
// Production: replace with Supabase, Planetscale, or any DB
const waitlist: { email: string; feature: string; timestamp: string }[] = [];

const VALID_FEATURES = [
  "monitoring",
  "fix-service",
  "cicd",
  "ai-scan",
  "score-tracking",
  "advanced-reports",
] as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, feature } = body as { email?: string; feature?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!feature || !VALID_FEATURES.includes(feature as (typeof VALID_FEATURES)[number])) {
    return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
  }

  const exists = waitlist.some(
    (e) => e.email === email && e.feature === feature,
  );
  if (!exists) {
    waitlist.push({ email, feature, timestamp: new Date().toISOString() });
  }

  await new Promise((r) => setTimeout(r, 200));

  return NextResponse.json({ ok: true });
}
