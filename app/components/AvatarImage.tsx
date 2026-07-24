"use client";

// Avatar <img> with a variant-safe loading chain, so a missing / 404 responsive
// variant never leaves a broken image. Callers pass the ORIGINAL (un-suffixed)
// avatar URL as stored on the profile plus the variant they want; this component
// owns the fallback ladder:
//
//   1. the responsive variant (_thumb.webp / _card.webp via the imageVariants helpers)
//   2. on error → the original stored URL (covers avatars uploaded before/after the
//      variant migration, or a variant that simply never got generated / 404s)
//   3. on error again — or when there is no url at all — → `fallback`, which is the
//      surface's existing placeholder node (initials chip, SeekerCardVisual, …)
//
// This is a safety net only: the happy path still serves the variant. Keeping the
// ladder in one component is what makes it consistent instead of copy-pasted onError
// handlers per render site.

import { useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { getAvatarThumbUrl, getAvatarCardUrl } from "@/app/lib/imageVariants";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  /** Original (un-suffixed) avatar URL as stored on the profile. */
  url: string | null | undefined;
  /** Which responsive variant to try first — "thumb" (≤64px renders) or "card" (larger). */
  size?: "thumb" | "card";
  /** Rendered when there is no url, or when both the variant and the original fail to load. */
  fallback?: ReactNode;
};

export default function AvatarImage({ url, size = "thumb", fallback = null, ...imgProps }: Props) {
  // Keyed by url so the retry state resets when the avatar changes — matters when a
  // single element instance is reused across list items / peers.
  const [failed, setFailed] = useState<{ url: string; stage: 1 | 2 } | null>(null);

  if (!url) return <>{fallback}</>;

  const stage = failed && failed.url === url ? failed.stage : 0;
  if (stage === 2) return <>{fallback}</>;

  const variantSrc = size === "card" ? getAvatarCardUrl(url) : getAvatarThumbUrl(url);
  const hasVariant = variantSrc !== url; // false for passthrough (non-avatar / preview) URLs
  const src = stage === 0 ? variantSrc : url;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...imgProps}
      src={src}
      onError={() => setFailed({ url, stage: stage === 0 && hasVariant ? 1 : 2 })}
    />
  );
}
