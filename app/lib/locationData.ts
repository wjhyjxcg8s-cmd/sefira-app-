// Shared location-cascade data source for the listing-creation forms and the search
// wizard. Country list/order/normalize are copied verbatim from app/create-listing's
// established convention so every entry point presents the identical set.

export type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

// ── Countries — identical set/order to app/create-listing & app/create-commercial-listing ──
export const TOP_COUNTRY_CODES = ["TR", "IR", "DE", "AE", "GB", "RU", "US", "FR", "ES"];
export const OTHER_COUNTRY_CODES = [
  "AF", "AL", "DZ", "AD", "AO", "AR", "AM", "AU", "AT", "AZ", "BH", "BD",
  "BY", "BE", "BO", "BA", "BR", "BG", "KH", "CA", "CL", "CN", "CO", "HR",
  "CU", "CY", "CZ", "DK", "EG", "EE", "ET", "FI", "GE", "GH", "GR", "HU",
  "IN", "ID", "IQ", "IE", "IL", "IT", "JP", "JO", "KZ", "KE", "KW", "KG",
  "LV", "LB", "LY", "LT", "LU", "MY", "MX", "MD", "MN", "MA", "NL", "NZ",
  "NG", "MK", "NO", "OM", "PK", "PS", "PE", "PH", "PL", "PT", "QA", "RO",
  "SA", "RS", "SG", "SK", "SI", "ZA", "KR", "SE", "CH", "SY", "TJ", "TH",
  "TN", "TM", "UA", "UZ", "VE", "VN", "YE",
];

export const LANG_MAP: Record<Lang, string> = { tr: "tr", en: "en", fa: "fa", ar: "ar", de: "de", ru: "ru" };

export function getCountryName(code: string, lang: string): string {
  try {
    const displayNames = new Intl.DisplayNames([LANG_MAP[lang as Lang] || "en"], { type: "region" });
    return displayNames.of(code) || code;
  } catch {
    return code;
  }
}

export function codeToFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
}

// TOP countries first (fixed priority order), then the rest alphabetized by localized
// name — same two-tier convention as create-listing's `sortedOthers` + `allCodes`.
export function getOrderedCountryCodes(lang: string): string[] {
  const sortedOthers = [...OTHER_COUNTRY_CODES].sort((a, b) =>
    getCountryName(a, lang).localeCompare(getCountryName(b, lang))
  );
  return [...TOP_COUNTRY_CODES, ...sortedOthers];
}

// ── Normalize — Turkish-aware (İ/ı and the rest of the Turkish alphabet), then NFD
// diacritic-stripping for everything else. Copied from create-listing's fuller version
// (create-commercial-listing's local copy is a thinner subset of this one).
export function normalize(str: string): string {
  return (str || "")
    .replace(/İ/g, "I").replace(/ı/g, "i")
    .replace(/Ş/g, "S").replace(/ş/g, "s")
    .replace(/Ğ/g, "G").replace(/ğ/g, "g")
    .replace(/Ü/g, "U").replace(/ü/g, "u")
    .replace(/Ö/g, "O").replace(/ö/g, "o")
    .replace(/Ç/g, "C").replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function filterSuggestions(list: string[], query: string): string[] {
  const q = normalize(query);
  if (!q) return list;
  const starts = list.filter((x) => normalize(x).startsWith(q));
  const includes = list.filter((x) => !normalize(x).startsWith(q) && normalize(x).includes(q));
  return [...starts, ...includes];
}

// ── Turkey — il -> ilçe -> mahalle (81 il, full nesting, no truncation) ──
export async function loadTurkiyeData(): Promise<Record<string, Record<string, string[]>>> {
  const res = await fetch("/turkiye-data.json");
  return res.json();
}

// ── Iran — county-level city list. The raw file mixes provinces/counties/cities/rural
// areas/districts in one flat array; "county" (482 entries) is the granularity that
// matches a colloquial Iranian city (e.g. Tehran), so we scope to that type only.
export async function loadIranCounties(): Promise<string[]> {
  const res = await fetch("/iran-cities.json");
  const json: { name: string; type?: string }[] = await res.json();
  const names = json.filter((c) => c.type === "county").map((c) => c.name);
  return Array.from(new Set(names)).sort();
}

// ── Russia — flat city list (1102 entries) ──
export async function loadRussiaCities(): Promise<string[]> {
  const res = await fetch("/russia-cities.json");
  const json: { name: string }[] = await res.json();
  return Array.from(new Set(json.map((c) => c.name))).sort();
}

// ── Generic countries — state/province level, via country-state-city ──
export interface StateOption {
  name: string;
  isoCode: string;
}

export async function loadStatesOfCountry(isoCode: string): Promise<StateOption[]> {
  try {
    const res = await fetch(`/api/states?country=${encodeURIComponent(isoCode)}`);
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

// Real-world city names for a country (keyed by English country name), when available —
// deeper/more useful than bare state names, so this is preferred as the "city" step.
export async function loadWorldCities(countryEnglishName: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/cities?country=${encodeURIComponent(countryEnglishName)}`);
    const json: string[] = await res.json();
    return Array.isArray(json) ? Array.from(new Set(json)).sort() : [];
  } catch {
    return [];
  }
}

// Cities within a specific state — the district-equivalent depth used when a country
// has no world-cities.json coverage and we fell back to state names as the "city" step.
export async function loadCitiesOfState(countryIso: string, stateIso: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/cities-of-state?country=${encodeURIComponent(countryIso)}&state=${encodeURIComponent(stateIso)}`);
    const json: string[] = await res.json();
    return Array.isArray(json) ? Array.from(new Set(json)).sort() : [];
  } catch {
    return [];
  }
}