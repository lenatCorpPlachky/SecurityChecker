import { NextResponse } from "next/server";

// Mock Stripe checkout.
// In production: create a Stripe Checkout Session and return session.url
// Here we just return a success URL that unlocks the report via query param.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { url, plan } = body as { url?: string; plan?: string };
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const redirect = `/scan?url=${encodeURIComponent(url)}&unlocked=1&plan=${encodeURIComponent(
    plan || "oneoff",
  )}`;

  // Pretend we're talking to Stripe
  await new Promise((r) => setTimeout(r, 400));

  return NextResponse.json({ url: redirect });
}
