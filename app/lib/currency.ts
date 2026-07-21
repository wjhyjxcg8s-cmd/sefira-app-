// Shared currency utilities — imported by page + components
export type Currency = "TRY" | "USD" | "EUR";

// TRY is the internal base: each rate = TRY per 1 unit of that currency.
// Fallback values reflect approximate 2025-2026 market rates.
const FALLBACK_RATES: Record<Currency, number> = {
  TRY: 1,
  USD: 36,  // 1 USD ≈ 36 TRY (2025-2026 approximate)
  EUR: 39,  // 1 EUR ≈ 39 TRY (2025-2026 approximate)
};

export const CURRENCY_RATES: Record<Currency, number> = { ...FALLBACK_RATES };

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

let _ratesCached = false;

/**
 * Pulls live rates via the same-origin /api/rates proxy (backed by ECB data),
 * using USD as base. Going through our own route avoids browser CORS failures
 * and keeps the upstream provider swappable without touching the client.
 * The proxy returns { base: "USD", rates: { TRY, EUR } } — TRY/EUR per 1 USD.
 * Patches CURRENCY_RATES in-place; idempotent after first success.
 */
export async function fetchLiveRates(): Promise<void> {
  if (_ratesCached) return;
  try {
    const res = await fetch("/api/rates");
    if (!res.ok) return;
    const json = await res.json();

    console.log("[Sefira currency] raw API response:", json);

    const tryRate: unknown = json?.rates?.TRY; // TRY per 1 USD (direct)
    const eurRate: unknown = json?.rates?.EUR; // EUR per 1 USD

    if (
      typeof tryRate !== "number" ||
      typeof eurRate !== "number" ||
      eurRate === 0
    ) {
      console.warn(
        "[Sefira currency] unexpected rate shape — keeping fallback.",
        { tryRate, eurRate },
      );
      return;
    }

    CURRENCY_RATES.TRY = 1;
    CURRENCY_RATES.USD = tryRate;           // TRY per 1 USD (direct from API)
    CURRENCY_RATES.EUR = tryRate / eurRate; // TRY per 1 EUR = (TRY/USD) ÷ (EUR/USD)

    console.log("[Sefira currency] rates applied:", {
      "1 USD →": `${CURRENCY_RATES.USD.toFixed(2)} TRY`,
      "1 EUR →": `${CURRENCY_RATES.EUR.toFixed(2)} TRY`,
    });

    _ratesCached = true;
  } catch (err) {
    console.error("[Sefira currency] fetch failed — using fallback.", err);
  }
}

export function convertPrice(
  price: number,
  from: "USD" | "EUR",
  to: Currency,
): number {
  const inTRY = price * CURRENCY_RATES[from];
  return Math.round(inTRY / CURRENCY_RATES[to]);
}

export function displayPrice(
  price: number,
  from: "USD" | "EUR",
  to: Currency,
): string {
  const n = convertPrice(price, from, to);
  return `${CURRENCY_SYMBOLS[to]}${n.toLocaleString()}`;
}

/** Converts a "700–1000" (EUR-based) range string to the target currency. */
export function convertBudgetRange(range: string, to: Currency): string {
  const sym = CURRENCY_SYMBOLS[to];
  const parts = range
    .split(/[–—-]/)
    .map((s) => parseInt(s.replace(/[\s ,]/g, ""), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const min = convertPrice(parts[0], "EUR", to);
    const max = convertPrice(parts[1], "EUR", to);
    const fmt = (n: number) =>
      n >= 10000
        ? `${sym}${Math.round(n / 1000)}K`
        : `${sym}${n.toLocaleString("en-US")}`;
    return `${fmt(min)}–${fmt(max)}`;
  }
  return `€${range}`;
}
