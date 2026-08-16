"use client";

import { useState } from "react";

/**
 * A country flag that renders on every platform.
 *
 * Flag emoji (🇹🇷) are regional-indicator PAIRS, and Windows ships no font that
 * composes them into a flag glyph — so on every Windows browser they fall back to
 * the two letters the pair is built from ("TR"). That is the whole of the "flags
 * show as letter pairs" bug: the emoji were correct, the platform just cannot draw
 * them. iOS/Android/macOS were always fine, which is why it only ever reproduced on
 * desktop.
 *
 * The SVGs are served from our own /flags (see scripts/sync-flags.mjs) — no CSS
 * framework, no JS payload, no third-party origin.
 *
 * Sizing: `width` is the drawn width in px and the box is 4:3, matching the ~20×15
 * advance box a flag emoji occupies at a 16px font size, so swapping one for the
 * other does not move the layout on platforms that were rendering real flags.
 */
export default function CountryFlag({
  code,
  width = 20,
  className = "",
  title,
}: {
  /** ISO 3166-1 alpha-2, any case. "all"/empty/unknown renders the globe fallback. */
  code?: string | null;
  width?: number;
  className?: string;
  title?: string;
}) {
  const [failed, setFailed] = useState(false);
  const normalized = typeof code === "string" ? code.trim().toLowerCase() : "";
  const isCountry = /^[a-z]{2}$/.test(normalized);
  const height = Math.round((width * 3) / 4);

  // "All countries", an unknown code, or a 404 on a code we don't ship a file for:
  // the globe is a glyph every platform can draw, so the fallback never repeats the
  // bug this component exists to fix.
  if (!isCountry || failed) {
    return (
      <span
        aria-hidden={title ? undefined : "true"}
        role={title ? "img" : undefined}
        aria-label={title}
        className={`inline-flex shrink-0 items-center justify-center align-middle ${className}`}
        style={{ width, height, fontSize: width * 0.9, lineHeight: 1 }}
      >
        🌍
      </span>
    );
  }

  return (
    // A static same-origin SVG at a fixed size: next/image would add an optimizer
    // round-trip and a layout wrapper for a ~500-byte vector that needs neither.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${normalized}.svg`}
      alt={title ?? ""}
      aria-hidden={title ? undefined : "true"}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 rounded-[2px] object-cover align-middle ring-1 ring-black/10 ${className}`}
      style={{ width, height }}
    />
  );
}
