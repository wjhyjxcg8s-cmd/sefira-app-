"use client";

import type { Lang } from "@/app/lib/LangContext";

// Flag emoji (🇹🇷, 🇬🇧, …) are regional-indicator PAIRS, and Windows ships no font
// that composes them into a flag glyph. Chrome on Windows therefore falls back to
// the letters the pair is built from, so "🇹🇷" renders as a literal "TR" — right
// next to the "TR" language code, which is where the "TR TR ▼" duplication in the
// language switcher came from. These inline SVGs are the same flags in a form
// every platform can actually draw, so the pill reads flag + one code everywhere.
//
// 4:3 at a 20×15 viewBox — small enough that the Union Jack's off-centre diagonals
// and the Saudi shahada are suggested rather than drawn to spec.
const FLAGS: Record<Lang, React.ReactNode> = {
  tr: (
    <>
      <rect width="20" height="15" fill="#E30A17" />
      <circle cx="7.5" cy="7.5" r="3.6" fill="#fff" />
      <circle cx="8.8" cy="7.5" r="2.9" fill="#E30A17" />
      <polygon
        points="12.3,5.6 12.73,6.91 14.11,6.91 12.99,7.72 13.42,9.04 12.3,8.23 11.18,9.04 11.61,7.72 10.49,6.91 11.87,6.91"
        fill="#fff"
      />
    </>
  ),
  en: (
    <>
      <rect width="20" height="15" fill="#012169" />
      <path d="M0 0L20 15M20 0L0 15" stroke="#fff" strokeWidth="3" />
      <path d="M0 0L20 15M20 0L0 15" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M10 0v15M0 7.5h20" stroke="#fff" strokeWidth="4" />
      <path d="M10 0v15M0 7.5h20" stroke="#C8102E" strokeWidth="2.4" />
    </>
  ),
  fa: (
    <>
      <rect width="20" height="5" fill="#239F40" />
      <rect y="5" width="20" height="5" fill="#fff" />
      <rect y="10" width="20" height="5" fill="#DA0000" />
      <path d="M10 6.5c.55.6.55 1.55 0 2.15-.55-.6-.55-1.55 0-2.15z" fill="#DA0000" />
    </>
  ),
  ar: (
    <>
      <rect width="20" height="15" fill="#165D31" />
      <path
        d="M4.6 6.2h2.2M7.8 6.2h1.5M10.3 6.2h1.6M12.9 6.2h2.1"
        stroke="#fff"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <rect x="3.6" y="9.4" width="12.8" height="0.9" rx="0.45" fill="#fff" />
    </>
  ),
  de: (
    <>
      <rect width="20" height="5" fill="#000" />
      <rect y="5" width="20" height="5" fill="#DD0000" />
      <rect y="10" width="20" height="5" fill="#FFCE00" />
    </>
  ),
  ru: (
    <>
      <rect width="20" height="5" fill="#fff" />
      <rect y="5" width="20" height="5" fill="#0039A6" />
      <rect y="10" width="20" height="5" fill="#D52B1E" />
    </>
  ),
};

/**
 * `width` is the drawn width in px; height follows the 4:3 ratio. Decorative —
 * the adjacent language code is the accessible label, so this stays aria-hidden.
 */
export default function LangFlag({ lang, width = 20 }: { lang: Lang; width?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10 align-middle"
      style={{ width, height: (width * 3) / 4, lineHeight: 0 }}
    >
      <svg viewBox="0 0 20 15" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {FLAGS[lang]}
      </svg>
    </span>
  );
}
