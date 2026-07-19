// Filter predicates extracted from app/search-wizard/page.tsx's runSearch() (~lines 366-386).
// Mechanical lift — same predicates, same semantics. The only addition versus the wizard's
// inline version is that a null/empty selector here means "no filter" (pass-through), since
// callers outside the wizard (e.g. /search) can legitimately have no category/type chosen yet.

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
