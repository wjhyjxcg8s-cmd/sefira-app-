// Shared currency utilities — imported by page + components
export type Currency = "TRY" | "USD" | "EUR";

// How many TRY equals one unit of each currency
export const CURRENCY_RATES: Record<Currency, number> = {
  TRY: 1,
  USD: 32,  // 1 USD ≈ 32 TRY
  EUR: 35,  // 1 EUR ≈ 35 TRY
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

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

/** Converts a "700–1 000" (EUR-based) range string to the target currency. */
export function convertBudgetRange(range: string, to: Currency): string {
  const sym = CURRENCY_SYMBOLS[to];
  // Split on any dash variant: en-dash, em-dash, or plain hyphen
  const parts = range
    .split(/[–—-]/)
    .map((s) => parseInt(s.replace(/[\s  ,]/g, ""), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const min = convertPrice(parts[0], "EUR", to);
    const max = convertPrice(parts[1], "EUR", to);
    const fmt = (n: number) =>
      n >= 10000 ? `${sym}${Math.round(n / 1000)}K` : `${sym}${n.toLocaleString("en-US")}`;
    return `${fmt(min)}–${fmt(max)}`;
  }
  return `€${range}`;
}
