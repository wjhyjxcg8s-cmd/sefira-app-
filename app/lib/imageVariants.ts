// Responsive-variant URL helpers for listing photos.
//
// Every listing photo in the `listing-photos` bucket has two siblings created at
// upload time (app/api/upload-photo/route.ts) and backfilled by the one-off
// scripts/generate-image-variants.mjs migration:
//   original:  {basename}.webp
//   thumb:     {basename}_thumb.webp   (width 400)
//   card:      {basename}_card.webp    (width 800)
//
// These helpers rewrite a public original URL to the matching sibling. They only
// touch URLs from the listing-photos bucket — anything else (avatars, stories,
// external/Unsplash images, empty strings) is returned unchanged.

const BUCKET_MARKER = "/listing-photos/";

/** True only for public URLs that live in the listing-photos bucket. */
export function listingPhotoUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.includes(BUCKET_MARKER);
}

function withVariant(url: string, suffix: "_thumb" | "_card"): string {
  if (!listingPhotoUrl(url)) return url;

  // Preserve any query string / hash (e.g. cache-busting params).
  const cut = url.search(/[?#]/);
  const path = cut === -1 ? url : url.slice(0, cut);
  const tail = cut === -1 ? "" : url.slice(cut);

  // Strip the filename's extension only (a dot after the last slash).
  const dot = path.lastIndexOf(".");
  const slash = path.lastIndexOf("/");
  const stem = dot > slash ? path.slice(0, dot) : path;

  return `${stem}${suffix}.webp${tail}`;
}

/** 400px-wide thumbnail sibling (card grids, small previews). */
export function getThumbUrl(url: string): string {
  return withVariant(url, "_thumb");
}

/** 800px-wide sibling (inline detail galleries). */
export function getCardUrl(url: string): string {
  return withVariant(url, "_card");
}
