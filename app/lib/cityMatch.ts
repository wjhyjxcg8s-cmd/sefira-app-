// Normalizes Turkish/diacritic characters and case so city names compare
// consistently regardless of script quirks (İstanbul vs istanbul, etc).
export function normalizeCity(str: string): string {
  return str
    .trim()
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
}

// Bidirectional contains check: matches "Washington DC" (query) against a
// listing stored as "Washington" (city.includes(query) is false, but
// query.includes(city) is true), and vice versa for the opposite case.
export function cityMatches(a: string, b: string): boolean {
  const na = normalizeCity(a);
  const nb = normalizeCity(b);
  if (!na || !nb) return false;
  return na.includes(nb) || nb.includes(na);
}
