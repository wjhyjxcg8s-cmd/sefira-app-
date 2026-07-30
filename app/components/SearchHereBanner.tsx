"use client";

import type { Lang } from "@/app/lib/LangContext";

// The "search at this depth, don't go deeper" affordance shared by every location
// picker (homepage sheet, hero wizard step 3, /search-wizard). It lives here rather
// than in each picker's own translation table so the six labels have one home and
// the pinned-banner look stays identical across entry points.
const SEARCH_HERE: Record<Lang, string> = {
  tr: "Bu konumda ara",
  en: "Search this location",
  fa: "جستجو در این موقعیت",
  ar: "ابحث في هذا الموقع",
  de: "Hier suchen",
  ru: "Искать здесь",
};

// Second line on the city step: says out loud that the city is optional, so the
// banner reads as a real search and not as an "abandon" action.
const CITY_OPTIONAL: Record<Lang, string> = {
  tr: "Şehir seçmek zorunlu değil",
  en: "Choosing a city is optional",
  fa: "انتخاب شهر اختیاری است",
  ar: "اختيار المدينة اختياري",
  de: "Die Stadtauswahl ist optional",
  ru: "Выбор города необязателен",
};

export default function SearchHereBanner({
  lang,
  value,
  onClick,
  showOptionalHint = false,
  className = "",
}: {
  lang: Lang;
  // What the search will cover — a country name on the city step, "City, Country"
  // deeper down.
  value: string;
  onClick: () => void;
  showOptionalHint?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-start gap-0.5 rounded-xl bg-orange-500 px-4 py-3 text-start transition-transform active:scale-[0.98] ${className}`}
    >
      <span className="text-[14px] font-bold text-white">{SEARCH_HERE[lang]}</span>
      <span className="w-full truncate text-[12px] text-orange-100">{value}</span>
      {showOptionalHint && (
        <span className="w-full truncate text-[11px] text-orange-100/90">{CITY_OPTIONAL[lang]}</span>
      )}
    </button>
  );
}
