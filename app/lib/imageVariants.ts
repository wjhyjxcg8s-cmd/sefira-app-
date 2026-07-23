// Responsive-variant URL helpers for images stored in Supabase.
//
// Listing photos (bucket `listing-photos`) get two siblings at upload time
// (app/api/upload-photo/route.ts) — {basename}_thumb.webp (w400) and
// {basename}_card.webp (w800). Avatars (bucket `avatars`) get one —
// {basename}_thumb.webp (w200) via app/api/upload-avatar/route.ts. Existing files
// are backfilled by scripts/generate-image-variants.mjs.
//
// These helpers rewrite a public original URL to the matching sibling, and are
// each scoped to their own bucket path: a URL that isn't from the expected bucket
// (external image, the wrong bucket, an empty string) is returned unchanged.

const LISTING_MARKER = "/listing-photos/";
const AVATAR_MARKER = "/avatars/";

/** True only for public URLs that live in the listing-photos bucket. */
export function listingPhotoUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.includes(LISTING_MARKER);
}

function isAvatarUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.includes(AVATAR_MARKER);
}

// Insert `suffix` before the filename extension and force `.webp`, preserving any
// query string / hash (e.g. the avatar cache-buster `?v=…`). No bucket guard —
// callers gate on the appropriate bucket check first.
function insertVariantSuffix(url: string, suffix: "_thumb" | "_card"): string {
  const cut = url.search(/[?#]/);
  const path = cut === -1 ? url : url.slice(0, cut);
  const tail = cut === -1 ? "" : url.slice(cut);

  const dot = path.lastIndexOf(".");
  const slash = path.lastIndexOf("/");
  const stem = dot > slash ? path.slice(0, dot) : path; // strip filename extension only

  return `${stem}${suffix}.webp${tail}`;
}

/** 400px-wide listing thumbnail sibling (card grids, small previews). */
export function getThumbUrl(url: string): string {
  return listingPhotoUrl(url) ? insertVariantSuffix(url, "_thumb") : url;
}

/** 800px-wide listing sibling (inline detail galleries). */
export function getCardUrl(url: string): string {
  return listingPhotoUrl(url) ? insertVariantSuffix(url, "_card") : url;
}

/** 200px-wide avatar thumbnail sibling (nav, cards, message lists, …). */
export function getAvatarThumbUrl(url: string): string {
  return isAvatarUrl(url) ? insertVariantSuffix(url, "_thumb") : url;
}

/** 512px-wide avatar sibling (mid-size renders: hero avatars, rec cards, …). */
export function getAvatarCardUrl(url: string): string {
  return isAvatarUrl(url) ? insertVariantSuffix(url, "_card") : url;
}
