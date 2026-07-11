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

// White-text pill classes for the commercial badge — a distinct gradient family (green
// family for owner, blue/indigo for seeker) so commercial reads differently from the
// residential solid-color badge at a glance, while sharing the same pill shape.
export const COMMERCIAL_BADGE_CLASS: Record<ListingSide, string> = {
  has_place: "bg-gradient-to-r from-emerald-500 to-teal-600",
  needs_place: "bg-gradient-to-r from-blue-500 to-indigo-600",
};

export function getCommercialBadgeLabel(side: ListingSide, lang: Lang): string {
  return COMMERCIAL_BADGE_LABELS[side][lang] ?? COMMERCIAL_BADGE_LABELS[side].tr;
}