import { NextResponse } from "next/server";
import { runMockScan } from "@/lib/scanEngine";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing ?url" }, { status: 400 });
  }
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const parsed = new URL(normalized);
    if (!parsed.hostname.includes(".")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    // Simulate scan latency (feels like real work)
    await new Promise((r) => setTimeout(r, 600));
    const result = runMockScan(parsed.toString());
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
}
