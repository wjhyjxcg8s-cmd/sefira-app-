// Filter predicates extracted from app/search-wizard/page.tsx's runSearch() (~lines 366-386).
// Mechanical lift — same predicates, same semantics. The only addition versus the wizard's
// inline version is that a null/empty selector here means "no filter" (pass-through), since
// callers outside the wizard (e.g. /search) can legitimately have no category/type chosen yet.

import { normalize } from "@/app/lib/locationData";

export type SearchCategory = "residential" | "commercial" | null;
export type SearchIntent = "has_home" | "needs_home" | null;

interface CategoryFilterable {
  listing_category?: string | null;
}

interface IntentFilterable {
  type?: string | null;
  has_place?: boolean | null;
  needs_place?: boolean | null;
}

interface CommercialTypeFilterable {
  commercial_type?: string | null;
}

// Step 1 (wizard parity): category filter.
export function filterByCategory<T extends CategoryFilterable>(
  listings: T[],
  category: SearchCategory
): T[] {
  if (!category) return listings;
  return listings.filter((l) =>
    category === "commercial"
      ? l.listing_category === "commercial"
      : l.listing_category !== "commercial"
  );
}

// Step 2 (wizard parity): opposite-side filter (has vs needs), using the field the
// category actually stores — residential listings store the side in `type`, commercial
// listings use the `has_place`/`needs_place` booleans instead.
export function filterByIntent<T extends IntentFilterable>(
  listings: T[],
  category: SearchCategory,
  intent: SearchIntent
): T[] {
  if (!intent) return listings;
  if (category === "commercial") {
    return listings.filter((l) =>
      intent === "has_home" ? l.needs_place === true : l.has_place === true
    );
  }
  const targetType = intent === "has_home" ? "needs_place" : "has_place";
  return listings.filter((l) => l.type === targetType);
}

// Step 2b (wizard parity): commercial space type, when one is selected.
export function filterByCommercialType<T extends CommercialTypeFilterable>(
  listings: T[],
  commercialType: string | null | undefined
): T[] {
  if (!commercialType) return listings;
  return listings.filter((l) => l.commercial_type === commercialType);
}

interface LocationFilterable {
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  country_code?: string | null;
}

export interface LocationSelection {
  // ISO-3166-1 alpha-2. Listings carry the country as `country_code`; the localized
  // `country` text column is display-only and is never matched against.
  countryCode?: string | null;
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
}

// Step 3: the one location filter every search entry point uses.
//
// A country is a hard bound — with one selected, nothing outside it can appear, so
// "İstanbul in Türkiye" can no longer pull in a same-named city elsewhere. Below that
// bound the finer selectors only *rank*: neighborhood > district > city > the rest of
// the country, each listing in the highest tier it qualifies for. That keeps the
// broader-country fallback that city-level search has always had.
//
// City (and district/neighborhood) are optional: with only a country selected this
// returns every listing in that country — a complete search, not an empty one. An
// absent city is never a "no results" condition; it simply skips the ranking pass.
export function filterByLocation<T extends LocationFilterable>(
  listings: T[],
  { countryCode, city, district, neighborhood }: LocationSelection
): T[] {
  const code = (countryCode || "").trim().toUpperCase();
  const base = code
    ? listings.filter((l) => (l.country_code || "").toUpperCase() === code)
    : listings;

  const neighborhoodN = normalize(neighborhood || "");
  const districtN = normalize(district || "");
  const cityN = normalize(city || "");

  // Country-only (or no location at all): everything in scope, in its incoming order.
  if (!neighborhoodN && !districtN && !cityN) return base;

  const tier1 = neighborhoodN
    ? base.filter((l) => normalize(l.neighborhood || "").includes(neighborhoodN))
    : [];
  const tier2 = districtN
    ? base.filter((l) => !tier1.includes(l) && normalize(l.district || "").includes(districtN))
    : [];
  const tier3 = cityN
    ? base.filter(
        (l) =>
          !tier1.includes(l) && !tier2.includes(l) && normalize(l.city || "").includes(cityN)
      )
    : [];

  // Same-country listings that matched no finer selector still belong to the search,
  // ranked last. Without a country there is no broader set to fall back on, so a
  // city/district/neighborhood selector filters strictly instead.
  if (!code) return [...tier1, ...tier2, ...tier3];
  const rest = base.filter(
    (l) => !tier1.includes(l) && !tier2.includes(l) && !tier3.includes(l)
  );
  return [...tier1, ...tier2, ...tier3, ...rest];
}
