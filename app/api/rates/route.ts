import { NextResponse } from "next/server";

// Same-origin proxy for exchange rates so the browser never calls a third-party
// API directly (avoids CORS and keeps the provider swappable server-side).
//
// Provider: frankfurter.app — ECB data, no API key, no documented rate limit;
// rates update ~once per business day, so the upstream call is cached for 1h.
// Response shape mirrors what the client (app/lib/currency.ts) expects:
//   { base: "USD", rates: { TRY: <number>, EUR: <number> } }
export async function GET() {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=TRY,EUR",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) {
      return NextResponse.json({ error: "upstream error" }, { status: 502 });
    }
    const json = await res.json();
    const TRY = json?.rates?.TRY;
    const EUR = json?.rates?.EUR;
    if (typeof TRY !== "number" || typeof EUR !== "number") {
      return NextResponse.json({ error: "unexpected shape" }, { status: 502 });
    }
    return NextResponse.json({ base: "USD", rates: { TRY, EUR } });
  } catch (e: unknown) {
    console.error("[api/rates] fetch failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
