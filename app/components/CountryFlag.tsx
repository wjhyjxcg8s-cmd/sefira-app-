"use client";

import { useState } from "react";
import { codeToFlag } from "@/app/lib/locationData";

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

  // Below lg the emoji is what ships: iOS and Android draw real flag glyphs, and it
  // is what mobile had before the SVG set landed. From lg the SVG takes over, because
  // Windows — where the desktop users are — has no flag glyph at all and falls back
  // to the regional-indicator pair's two letters.
  //
  // The switch is CSS only. A matchMedia hook would have to guess the breakpoint
  // during SSR and would hydrate-mismatch, flashing the wrong glyph on first paint.
  // Both nodes carry the SAME width/height box, so neither breakpoint shifts when the
  // other one's node is the hidden one.
  return (
    <>
      {/* `inline-block` + `overflow-hidden`, not `inline-flex`: a non-visible overflow
          puts the box's baseline at its bottom margin edge — the same rule a replaced
          element like the <img/> follows. As an inline-flex the glyph's own baseline
          leaked into the line box and grew the language pill by 1px. */}
      <span
        aria-hidden={title ? undefined : "true"}
        role={title ? "img" : undefined}
        aria-label={title}
        className={`inline-block shrink-0 overflow-hidden text-center align-middle lg:hidden ${className}`}
        style={{ width, height, fontSize: width * 0.9, lineHeight: `${height}px` }}
      >
        {codeToFlag(normalized)}
      </span>

      {/* A static same-origin SVG at a fixed size: next/image would add an optimizer
          round-trip and a layout wrapper for a ~500-byte vector that needs neither. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/flags/${normalized}.svg`}
        alt={title ?? ""}
        aria-hidden={title ? undefined : "true"}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`hidden shrink-0 rounded-[2px] object-cover align-middle ring-1 ring-black/10 lg:inline-block ${className}`}
        style={{ width, height }}
      />
    </>
  );
}
