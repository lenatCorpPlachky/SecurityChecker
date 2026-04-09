import { NextResponse } from "next/server";
import { runScan } from "@/lib/scanner/index";
import { ENGINE_VERSION } from "@/lib/scanner/types";
import { runMockScan } from "@/lib/scanEngine";

// Node.js runtime required for tls/dns modules
export const maxDuration = 25; // seconds (Vercel Pro)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const mode = searchParams.get("mode"); // ?mode=mock for demo

  if (!url) {
    return NextResponse.json({ error: "Missing ?url" }, { status: 400 });
  }

  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const parsed = new URL(normalized);
    if (!parsed.hostname.includes(".")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (mode === "mock") {
      await new Promise((r) => setTimeout(r, 600));
      const result = runMockScan(parsed.toString());
      return NextResponse.json({ ...result, mode: "mock", engineVersion: ENGINE_VERSION });
    }

    const result = await runScan(parsed.toString());
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
