// Shared "owner / seeker" badge logic for listing cards. Single source of truth for
// the commercial wording/colors and — most importantly — for correctly deriving which
// side a listing is on regardless of which schema it uses.

export type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";
export type ListingSide = "has_place" | "needs_place";

interface BadgeSourceListing {
  type?: string | null;
  has_place?: boolean | null;
  needs_place?: boolean | null;
}

// Residential listings store the side as a string in `type` ("has_place"/"needs_place").
// Commercial listings never populate `type` at all — they use two booleans instead
// (`has_place`/`needs_place`). Every card that checked `type` only was therefore always
// falling through to "not has_place" for commercial rows: an always-blue pill with no
// matching label (since the lookup table is keyed by `type`, and `type` is null/undefined
// for commercial). That's the root cause of the empty rectangle. This derives the side
// from whichever schema the listing actually uses.
export function getListingSide(listing: BadgeSourceListing): ListingSide | null {
  if (listing.type === "has_place" || listing.has_place === true) return "has_place";
  if (listing.type === "needs_place" || listing.needs_place === true) return "needs_place";
  return null;
}

export const COMMERCIAL_BADGE_LABELS: Record<ListingSide, Record<Lang, string>> = {
  has_place: { tr: "Alan Sahibi", en: "Space Owner", fa: "صاحب فضا", ar: "مالك المساحة", de: "Anbieter", ru: "Владелец" },
  needs_place: { tr: "Alan Arıyor", en: "Looking for Space", fa: "جویای فضا", ar: "يبحث عن مساحة", de: "Sucht Fläche", ru: "Ищет помещение" },
};

// White-text pill classes. Both the commercial and the residential badge now sit on
// the brand pair — orange #f97316 for the side that HAS the space, deep slate for the
// side that WANTS one — instead of the old emerald/blue gradients, which read as a
// second, unrelated palette on top of every card photo. The /90 alpha plus
// `backdrop-blur-sm` is what keeps the label legible over a bright photo without an
// opaque block. Commercial and residential share the pair; the wording is what
// distinguishes them ("Alan Sahibi" vs "Ev Sahibi").
export const COMMERCIAL_BADGE_CLASS: Record<ListingSide, string> = {
  has_place: "bg-orange-500/90 backdrop-blur-sm",
  needs_place: "bg-slate-800/85 backdrop-blur-sm",
};

// Residential equivalent — previously duplicated inline as `bg-emerald-500` /
// `bg-blue-500` in five different card renderers.
export const RESIDENTIAL_BADGE_CLASS: Record<ListingSide, string> = {
  has_place: "bg-orange-500/90 backdrop-blur-sm",
  needs_place: "bg-slate-800/85 backdrop-blur-sm",
};

/** Badge classes for either category, so no card has to branch on colour itself. */
export function getBadgeClass(side: ListingSide, isCommercial: boolean): string {
  return isCommercial ? COMMERCIAL_BADGE_CLASS[side] : RESIDENTIAL_BADGE_CLASS[side];
}

export function getCommercialBadgeLabel(side: ListingSide, lang: Lang): string {
  return COMMERCIAL_BADGE_LABELS[side][lang] ?? COMMERCIAL_BADGE_LABELS[side].tr;
}