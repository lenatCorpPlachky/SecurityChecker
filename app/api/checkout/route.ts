import { NextResponse } from "next/server";
import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      maxNetworkRetries: 1,
      timeout: 8000,
    });
  }
  return _stripe;
}

export const maxDuration = 15;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { url, plan } = body as { url?: string; plan?: string };

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/+$/, "") || "http://localhost:3000";
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

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: isProPlan ? "subscription" : "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product,
            unit_amount: isProPlan ? 2900 : 900,
            ...(isProPlan ? { recurring: { interval: "month" as const } } : {}),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { scanned_url: url, plan: plan || "oneoff" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
