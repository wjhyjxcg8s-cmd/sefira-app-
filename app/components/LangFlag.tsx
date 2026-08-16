"use client";

import type { Lang } from "@/app/lib/LangContext";
import CountryFlag from "@/app/components/CountryFlag";

// Which country's flag stands for each UI language.
const LANG_COUNTRY: Record<Lang, string> = {
  tr: "tr",
  en: "gb",
  fa: "ir",
  ar: "sa",
  de: "de",
  ru: "ru",
};

/**
 * The language switcher's flag. Now a thin alias over [CountryFlag] — it used to
 * carry six hand-drawn SVGs, written when this was the only place that needed a
 * flag Windows could actually render; the real flag set covers it accurately.
 *
 * `width` is the drawn width in px; the box is 4:3. Decorative — the adjacent
 * language code is the accessible label.
 */
export default function LangFlag({ lang, width = 20 }: { lang: Lang; width?: number }) {
  return <CountryFlag code={LANG_COUNTRY[lang]} width={width} />;
}
