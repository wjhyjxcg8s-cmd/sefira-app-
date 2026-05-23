// Shared currency utilities — imported by page + components
export type Currency = "TRY" | "USD" | "EUR";

// Approximate fallback rates (how many TRY = 1 unit of each currency).
// These are replaced in-place by fetchLiveRates() on first call.
const FALLBACK_RATES: Record<Currency, number> = {
  TRY: 1,
  USD: 32,
  EUR: 35,
};

export const CURRENCY_RATES: Record<Currency, number> = { ...FALLBACK_RATES };

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

let _ratesCached = false;

/**
 * Pulls EUR-based rates from frankfurter.app and patches CURRENCY_RATES in-place.
 * Idempotent — skips the network call on subsequent invocations.
 * Silently keeps FALLBACK_RATES on any error.
 */
export async function fetchLiveRates(): Promise<void> {
  if (_ratesCached) return;
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=EUR");
    if (!res.ok) return;
    const json = await res.json();
    const tryRate: unknown = json?.rates?.TRY;
    const usdRate: unknown = json?.rates?.USD;
    if (
      typeof tryRate !== "number" ||
      typeof usdRate !== "number" ||
      usdRate === 0
    ) return;
    CURRENCY_RATES.TRY = 1;
    CURRENCY_RATES.EUR = tryRate;            // 1 EUR → X TRY
    CURRENCY_RATES.USD = tryRate / usdRate;  // 1 USD → (EUR→TRY ÷ EUR→USD) TRY
    _ratesCached = true;
  } catch {
    // network failure — keep fallback rates
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
    .map((s) => parseInt(s.replace(/[\s  ,]/g, ""), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const min = convertPrice(parts[0], "EUR", to);
    const max = convertPrice(parts[1], "EUR", to);
    const fmt = (n: number) =>
      n >= 10000 ? `${sym}${Math.round(n / 1000)}K` : `${sym}${n.toLocaleString("en-US")}`;
    return `${fmt(min)}–${fmt(max)}`;
  }
  return `€${range}`;
}
