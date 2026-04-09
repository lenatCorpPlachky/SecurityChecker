import { NextResponse } from "next/server";

export const maxDuration = 15;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { url, plan } = body as { url?: string; plan?: string };

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY is not set" }, { status: 500 });
  }

  const origin =
    req.headers.get("origin") ||
    req.headers.get("referer")?.replace(/\/+$/, "") ||
    "http://localhost:3000";

  const isLandingPurchase = !url.startsWith("http");
  const successUrl = isLandingPurchase
    ? `${origin}/?purchased=${encodeURIComponent(plan || "oneoff")}`
    : `${origin}/scan?url=${encodeURIComponent(url)}&unlocked=1&plan=${encodeURIComponent(plan || "oneoff")}`;
  const cancelUrl = isLandingPurchase
    ? `${origin}/#pricing`
    : `${origin}/scan?url=${encodeURIComponent(url)}`;

  const isProPlan = plan === "pro";
  const product = isProPlan
    ? process.env.STRIPE_PRODUCT_PRO!
    : process.env.STRIPE_PRODUCT_ONEOFF!;

  const params = new URLSearchParams();
  params.append("mode", isProPlan ? "subscription" : "payment");
  params.append("line_items[0][price_data][currency]", "usd");
  params.append("line_items[0][price_data][product]", product);
  params.append("line_items[0][price_data][unit_amount]", isProPlan ? "2900" : "900");
  if (isProPlan) {
    params.append("line_items[0][price_data][recurring][interval]", "month");
  }
  params.append("line_items[0][quantity]", "1");
  params.append("success_url", successUrl);
  params.append("cancel_url", cancelUrl);
  params.append("metadata[scanned_url]", url);
  params.append("metadata[plan]", plan || "oneoff");

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Stripe API error:", data);
      return NextResponse.json(
        { error: data?.error?.message || "Stripe error" },
        { status: res.status },
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (err) {
    console.error("Stripe fetch error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
