"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useLang } from "@/app/lib/LangContext";

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";
type WizardCategory = "residential" | "commercial";
type UserIntent = "has_home" | "needs_home";
type Screen =
  | "category"
  | "intent"
  | "confirm"
  | "loc-country"
  | "loc-city"
  | "loc-district"
  | "loc-neighborhood"
  | "results";

const PRIORITY_COUNTRY_CODES = ["TR", "US", "IR", "DE", "RU", "AE", "SA", "GB"];
const OTHER_COUNTRY_CODES = [
  "AF", "AL", "DZ", "AD", "AO", "AR", "AM", "AU", "AT", "AZ", "BH", "BD",
  "BY", "BE", "BO", "BA", "BR", "BG", "KH", "CA", "CL", "CN", "CO", "HR",
  "CU", "CY", "CZ", "DK", "EG", "EE", "ET", "FI", "FR", "GE", "GH", "GR",
  "HU", "IN", "ID", "IQ", "IE", "IL", "IT", "JP", "JO", "KZ", "KE", "KW",
  "KG", "LV", "LB", "LY", "LT", "LU", "MY", "MX", "MD", "MN", "MA", "NL",
  "NZ", "NG", "MK", "NO", "OM", "PK", "PS", "PE", "PH", "PL", "PT", "QA",
  "RO", "RS", "SG", "SK", "SI", "ES", "ZA", "KR", "SE", "CH", "SY", "TJ",
  "TH", "TN", "TM", "UA", "UZ", "VE", "VN", "YE",
];

const ORDERED_COUNTRY_CODES: string[] = (() => {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const code of [...PRIORITY_COUNTRY_CODES, ...OTHER_COUNTRY_CODES]) {
    if (!seen.has(code)) {
      seen.add(code);
      ordered.push(code);
    }
  }
  return ordered;
})();

const LANG_MAP: Record<Lang, string> = { tr: "tr", en: "en", fa: "fa", ar: "ar", de: "de", ru: "ru" };

function getCountryName(code: string, lang: Lang): string {
  try {
    const displayNames = new Intl.DisplayNames([LANG_MAP[lang] || "en"], { type: "region" });
    return displayNames.of(code) || code;
  } catch {
    return code;
  }
}

function codeToFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
}

function normalize(s: string): string {
  return (s || "").toLowerCase().trim();
}

function filterSuggestions(list: string[], query: string, max = 8): string[] {
  const q = normalize(query);
  if (!q) return list.slice(0, max);
  const starts = list.filter((x) => normalize(x).startsWith(q));
  const includes = list.filter((x) => !normalize(x).startsWith(q) && normalize(x).includes(q));
  return [...starts, ...includes].slice(0, max);
}

const T: Record<Lang, {
  step1Title: string; residential: string; commercial: string;
  step2Title: string; hasHome: string; needsHome: string;
  confirmMsg: string; continueBtn: string;
  countryLabel: string; cityLabel: string; districtLabel: string; neighborhoodLabel: string;
  searchBtn: string; skipBtn: string; resultsTitle: string; noResults: string;
}> = {
  tr: {
    step1Title: "Ne arıyorsunuz?", residential: "Konut / Ev Arkadaşı", commercial: "Ticari Alan",
    step2Title: "Durumunuz nedir?", hasHome: "Evim var, ev arkadaşı arıyorum", needsHome: "Evim yok, oda veya ev arıyorum",
    confirmMsg: "Harika! Birkaç soru daha yanıtlayın, size en uygun ev arkadaşını bulalım.", continueBtn: "Devam Et",
    countryLabel: "Ülke seçin", cityLabel: "Şehir / İl", districtLabel: "İlçe (isteğe bağlı)", neighborhoodLabel: "Mahalle (isteğe bağlı)",
    searchBtn: "Ara", skipBtn: "Atla", resultsTitle: "Sonuçlar", noResults: "Sonuç bulunamadı",
  },
  en: {
    step1Title: "What are you looking for?", residential: "Home / Roommate", commercial: "Commercial Space",
    step2Title: "What is your situation?", hasHome: "I have a home, looking for a roommate", needsHome: "I don't have a home, looking for a place",
    confirmMsg: "Great! Answer a few more questions and we'll find the perfect roommate for you.", continueBtn: "Continue",
    countryLabel: "Select country", cityLabel: "City", districtLabel: "District (optional)", neighborhoodLabel: "Neighborhood (optional)",
    searchBtn: "Search", skipBtn: "Skip", resultsTitle: "Results", noResults: "No results found",
  },
  fa: {
    step1Title: "دنبال چه می‌گردید؟", residential: "خانه / هم‌خانه", commercial: "فضای تجاری",
    step2Title: "وضعیت شما چیست؟", hasHome: "خانه دارم، دنبال هم‌خانه می‌گردم", needsHome: "خانه ندارم، دنبال خانه یا اتاق می‌گردم",
    confirmMsg: "عالی! چند سوال دیگر پاسخ دهید تا هم‌خانه مناسب شما را پیدا کنیم.", continueBtn: "ادامه",
    countryLabel: "کشور را انتخاب کنید", cityLabel: "شهر", districtLabel: "منطقه (اختیاری)", neighborhoodLabel: "محله (اختیاری)",
    searchBtn: "جستجو", skipBtn: "رد کردن", resultsTitle: "نتایج", noResults: "نتیجه‌ای یافت نشد",
  },
  ar: {
    step1Title: "ماذا تبحث عن؟", residential: "مسكن / شريك سكن", commercial: "مساحة تجارية",
    step2Title: "ما هو وضعك؟", hasHome: "لديّ منزل وأبحث عن شريك سكن", needsHome: "ليس لديّ منزل وأبحث عن مكان",
    confirmMsg: "رائع! أجب على بعض الأسئلة الإضافية لنجد لك الشريك المناسب.", continueBtn: "متابعة",
    countryLabel: "اختر الدولة", cityLabel: "المدينة", districtLabel: "الحي (اختياري)", neighborhoodLabel: "الحارة (اختياري)",
    searchBtn: "بحث", skipBtn: "تخطى", resultsTitle: "النتائج", noResults: "لا توجد نتائج",
  },
  de: {
    step1Title: "Was suchen Sie?", residential: "Wohnung / Mitbewohner", commercial: "Gewerbefläche",
    step2Title: "Was trifft auf Sie zu?", hasHome: "Ich habe eine Wohnung und suche einen Mitbewohner", needsHome: "Ich habe keine Wohnung und suche eine",
    confirmMsg: "Super! Beantworte noch ein paar Fragen und wir finden den perfekten Mitbewohner für dich.", continueBtn: "Weiter",
    countryLabel: "Land auswählen", cityLabel: "Stadt", districtLabel: "Bezirk (optional)", neighborhoodLabel: "Viertel (optional)",
    searchBtn: "Suchen", skipBtn: "Überspringen", resultsTitle: "Ergebnisse", noResults: "Keine Ergebnisse gefunden",
  },
  ru: {
    step1Title: "Что вы ищете?", residential: "Жильё / Сосед", commercial: "Коммерческое помещение",
    step2Title: "Какова ваша ситуация?", hasHome: "У меня есть жильё, ищу соседа", needsHome: "У меня нет жилья, ищу комнату или квартиру",
    confirmMsg: "Отлично! Ответьте ещё на несколько вопросов, и мы найдём идеального соседа для вас.", continueBtn: "Продолжить",
    countryLabel: "Выберите страну", cityLabel: "Город", districtLabel: "Район (необязательно)", neighborhoodLabel: "Микрорайон (необязательно)",
    searchBtn: "Искать", skipBtn: "Пропустить", resultsTitle: "Результаты", noResults: "Результатов не найдено",
  },
};

function screenToStep(s: Screen): number {
  if (s === "category") return 1;
  if (s === "intent") return 2;
  if (s === "confirm") return 3;
  return 4; // loc-country, loc-city, loc-district, loc-neighborhood, results
}

function ListingCard({ listing, onClick }: { listing: any; onClick: () => void }) {
  const isHasPlace = listing.type === "has_place";
  const isNeedsPlace = listing.type === "needs_place";
  return (
    <div
      onClick={onClick}
      className="rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="aspect-video bg-gray-100 relative">
        {listing.photos?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photos[0]} alt={listing.city || ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-stone-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        )}
        {(isHasPlace || isNeedsPlace) && (
          <span className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full font-medium ${isHasPlace ? "bg-emerald-500" : "bg-blue-500"}`}>
            {isHasPlace ? "🏠" : "🔍"}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-bold text-sm text-gray-900">
          {listing.city}{listing.district ? ` / ${listing.district}` : ""}
        </p>
        {listing.neighborhood && (
          <p className="text-xs text-gray-400 mt-0.5">{listing.neighborhood}</p>
        )}
        {isHasPlace && listing.rent && listing.currency && (
          <p className="text-orange-500 font-bold text-sm mt-1">{listing.rent} {listing.currency}</p>
        )}
        {!isHasPlace && listing.max_budget && listing.currency && (
          <p className="text-orange-500 font-bold text-sm mt-1">{listing.max_budget} {listing.currency}</p>
        )}
        {isHasPlace && (listing.house_type || listing.rooms) && (
          <p className="text-gray-500 text-xs mt-1">
            {[listing.house_type, listing.rooms ? `${listing.rooms}` : null].filter(Boolean).join(" • ")}
          </p>
        )}
        {isNeedsPlace && (listing.seeker_age || listing.occupation) && (
          <p className="text-gray-500 text-xs mt-1">
            {[listing.seeker_age ? `${listing.seeker_age}` : null, listing.occupation].filter(Boolean).join(" • ")}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SearchWizardPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang as Lang] ?? T.tr;
  const isRtl = lang === "fa" || lang === "ar";

  const [screen, setScreen] = useState<Screen>("category");
  const [history, setHistory] = useState<Screen[]>([]);

  const [wizardCategory, setWizardCategory] = useState<WizardCategory | null>(null);
  const [userIntent, setUserIntent] = useState<UserIntent | null>(null);

  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  const [turkiyeData, setTurkiyeData] = useState<Record<string, Record<string, string[]>>>({});
  const [iranCities, setIranCities] = useState<string[]>([]);
  const [russiaCities, setRussiaCities] = useState<string[]>([]);
  const [statesOfCountry, setStatesOfCountry] = useState<string[]>([]);

  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [citySugOpen, setCitySugOpen] = useState(false);

  const [district, setDistrict] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [districtSugOpen, setDistrictSugOpen] = useState(false);

  const [neighborhood, setNeighborhood] = useState("");
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [neighborhoodSugOpen, setNeighborhoodSugOpen] = useState(false);

  const [loadingResults, setLoadingResults] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const goTo = (next: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  };

  const goBack = () => {
    if (history.length === 0) {
      router.back();
      return;
    }
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setScreen(prev);
  };

  // Step 3 — auto-advance after 1.5s
  useEffect(() => {
    if (screen !== "confirm") return;
    const timer = setTimeout(() => goTo("loc-country"), 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Results — run the query once we land on the results screen
  useEffect(() => {
    if (screen !== "results") return;
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  async function selectCountry(code: string) {
    setCountryCode(code);
    setCountryName(getCountryName(code, lang as Lang));
    setCity(""); setCitySearch("");
    setDistrict(""); setDistrictSearch("");
    setNeighborhood(""); setNeighborhoodSearch("");

    if (code === "TR") {
      if (Object.keys(turkiyeData).length === 0) {
        try {
          const res = await fetch("/turkiye-data.json");
          setTurkiyeData(await res.json());
        } catch {}
      }
    } else if (code === "IR") {
      if (iranCities.length === 0) {
        try {
          const res = await fetch("/iran-cities.json");
          const json: { name: string }[] = await res.json();
          setIranCities(json.map((c) => c.name).sort());
        } catch {}
      }
    } else if (code === "RU") {
      if (russiaCities.length === 0) {
        try {
          const res = await fetch("/russia-cities.json");
          const json: { name: string }[] = await res.json();
          setRussiaCities(json.map((c) => c.name).sort());
        } catch {}
      }
    } else {
      try {
        const res = await fetch(`/api/states?country=${encodeURIComponent(code)}`);
        const json: { name: string; isoCode: string }[] = await res.json();
        setStatesOfCountry(Array.isArray(json) ? json.map((s) => s.name) : []);
      } catch {
        setStatesOfCountry([]);
      }
    }
    goTo("loc-city");
  }

  function getCityOptions(): string[] {
    if (countryCode === "TR") return Object.keys(turkiyeData);
    if (countryCode === "IR") return iranCities;
    if (countryCode === "RU") return russiaCities;
    return statesOfCountry;
  }

  function confirmCity(name: string) {
    setCity(name);
    setCitySearch(name);
    setCitySugOpen(false);
    if (countryCode === "TR") {
      goTo("loc-district");
    } else {
      goTo("loc-neighborhood");
    }
  }

  function confirmDistrict(name: string) {
    setDistrict(name);
    setDistrictSearch(name);
    setDistrictSugOpen(false);
    setNeighborhood(""); setNeighborhoodSearch("");
    goTo("loc-neighborhood");
  }

  async function runSearch() {
    setLoadingResults(true);

    const { data, error } = await supabase
      .from("listings")
      .select("id, type, city, district, neighborhood, rent, currency, photos, house_type, rooms, smoking, furnished, elevator, current_residents, user_id, country_code, country, max_budget, seeker_age, seeker_gender, occupation, about_text, listing_category")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) {
      setResults([]);
      setLoadingResults(false);
      return;
    }

    // Step 1: category filter
    let base = data.filter((l) =>
      wizardCategory === "commercial"
        ? l.listing_category === "commercial"
        : l.listing_category !== "commercial"
    );

    // Step 2: type filter (residential only)
    if (wizardCategory === "residential" && userIntent) {
      const targetType = userIntent === "has_home" ? "needs_place" : "has_place";
      base = base.filter((l) => l.type === targetType);
    }

    // Step 3: location filter with priority tiers
    const selectedCityN = normalize(city);
    const selectedDistrictN = normalize(district);
    const selectedNeighborhoodN = normalize(neighborhood);
    const selectedCountryCodeN = (countryCode || "").toUpperCase();

    const tier1 = selectedNeighborhoodN
      ? base.filter((l) => normalize(l.neighborhood).includes(selectedNeighborhoodN))
      : [];
    const tier2 = selectedDistrictN
      ? base.filter((l) => !tier1.includes(l) && normalize(l.district).includes(selectedDistrictN))
      : [];
    const tier3 = base.filter(
      (l) => !tier1.includes(l) && !tier2.includes(l) && normalize(l.city).includes(selectedCityN)
    );
    const tier4 = base.filter(
      (l) =>
        !tier1.includes(l) && !tier2.includes(l) && !tier3.includes(l) &&
        (l.country_code || "").toUpperCase() === selectedCountryCodeN
    );

    setResults([...tier1, ...tier2, ...tier3, ...tier4]);
    setLoadingResults(false);
  }

  const filteredCountries = (() => {
    const q = normalize(countrySearch);
    if (!q) return ORDERED_COUNTRY_CODES;
    return ORDERED_COUNTRY_CODES.filter(
      (code) => normalize(getCountryName(code, lang as Lang)).includes(q) || code.toLowerCase().includes(q)
    );
  })();

  const citySuggestions = filterSuggestions(getCityOptions(), citySearch, 8);
  const districtOptions = countryCode === "TR" ? Object.keys(turkiyeData[city] || {}) : [];
  const districtSuggestions = filterSuggestions(districtOptions, districtSearch, 8);
  const neighborhoodOptions = countryCode === "TR" ? turkiyeData[city]?.[district] || [] : [];
  const neighborhoodSuggestions = filterSuggestions(neighborhoodOptions, neighborhoodSearch, 8);

  const optionCardClass = (selected: boolean) =>
    `w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-5 transition-colors ${
      selected ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-400"
    }`;

  const primaryBtnClass =
    "w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity";

  const skipBtnClass = "w-full text-center text-sm font-semibold text-gray-400 hover:text-gray-600 py-2 transition-colors";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-white">
      <style>{`
        @keyframes wizardSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .wizard-screen { animation: wizardSlide 0.25s ease; }
      `}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
            {isRtl ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
        <div className="flex items-center gap-1.5 mx-auto">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`w-2 h-2 rounded-full transition-colors ${n <= screenToStep(screen) ? "bg-orange-500" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <div className="w-9 flex-shrink-0" />
      </div>

      {screen !== "results" ? (
        <div className="px-5 py-8 max-w-md mx-auto">
          <div key={screen} className="wizard-screen">
            {/* Step 1 — Category */}
            {screen === "category" && (
              <div>
                <h1 className="text-xl font-black text-gray-900 mb-6">{t.step1Title}</h1>
                <div className="flex flex-col gap-3">
                  <button
                    className={optionCardClass(wizardCategory === "residential")}
                    onClick={() => { setWizardCategory("residential"); goTo("intent"); }}
                  >
                    <span className="text-3xl flex-shrink-0">🏠</span>
                    <span className="font-semibold text-gray-800">{t.residential}</span>
                  </button>
                  <button
                    className={optionCardClass(wizardCategory === "commercial")}
                    onClick={() => { setWizardCategory("commercial"); goTo("loc-country"); }}
                  >
                    <span className="text-3xl flex-shrink-0">🏢</span>
                    <span className="font-semibold text-gray-800">{t.commercial}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Intent */}
            {screen === "intent" && (
              <div>
                <h1 className="text-xl font-black text-gray-900 mb-6">{t.step2Title}</h1>
                <div className="flex flex-col gap-3">
                  <button
                    className={optionCardClass(userIntent === "has_home")}
                    onClick={() => { setUserIntent("has_home"); goTo("confirm"); }}
                  >
                    <span className="text-3xl flex-shrink-0">🔑</span>
                    <span className="font-semibold text-gray-800">{t.hasHome}</span>
                  </button>
                  <button
                    className={optionCardClass(userIntent === "needs_home")}
                    onClick={() => { setUserIntent("needs_home"); goTo("loc-country"); }}
                  >
                    <span className="text-3xl flex-shrink-0">🧳</span>
                    <span className="font-semibold text-gray-800">{t.needsHome}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Confirmation */}
            {screen === "confirm" && (
              <div className="flex flex-col items-center text-center pt-10">
                <span className="text-5xl mb-4">🎉</span>
                <p className="text-gray-700 text-base leading-relaxed mb-8">{t.confirmMsg}</p>
                <button className={primaryBtnClass} onClick={() => goTo("loc-country")}>
                  {t.continueBtn}
                </button>
              </div>
            )}

            {/* Step 4a — Country */}
            {screen === "loc-country" && (
              <div>
                <h1 className="text-xl font-black text-gray-900 mb-6">{t.countryLabel}</h1>
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder={t.countryLabel}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors mb-3"
                />
                <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {filteredCountries.map((code) => (
                    <button
                      key={code}
                      onClick={() => selectCountry(code)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors"
                    >
                      <span className="text-xl flex-shrink-0">{codeToFlag(code)}</span>
                      <span className="text-sm text-gray-800">{getCountryName(code, lang as Lang)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4b — City */}
            {screen === "loc-city" && (
              <div>
                <h1 className="text-xl font-black text-gray-900 mb-1">{t.cityLabel}</h1>
                <p className="text-sm text-gray-400 mb-6">
                  {codeToFlag(countryCode)} {countryName}
                </p>
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => { setCitySearch(e.target.value); setCity(e.target.value); setCitySugOpen(true); }}
                    onFocus={() => setCitySugOpen(true)}
                    onBlur={() => setTimeout(() => setCitySugOpen(false), 150)}
                    placeholder={t.cityLabel}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors"
                  />
                  {citySugOpen && citySuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-56">
                      {citySuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => confirmCity(s)}
                          className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className={primaryBtnClass} disabled={!city.trim()} onClick={() => confirmCity(city)}>
                  {t.continueBtn}
                </button>
              </div>
            )}

            {/* Step 4c — District (TR only) */}
            {screen === "loc-district" && (
              <div>
                <h1 className="text-xl font-black text-gray-900 mb-6">{t.districtLabel}</h1>
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={districtSearch}
                    onChange={(e) => { setDistrictSearch(e.target.value); setDistrict(e.target.value); setDistrictSugOpen(true); }}
                    onFocus={() => setDistrictSugOpen(true)}
                    onBlur={() => setTimeout(() => setDistrictSugOpen(false), 150)}
                    placeholder={t.districtLabel}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors"
                  />
                  {districtSugOpen && districtSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-56">
                      {districtSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => confirmDistrict(s)}
                          className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className={primaryBtnClass} disabled={!district.trim()} onClick={() => confirmDistrict(district)}>
                  {t.continueBtn}
                </button>
                <button className={skipBtnClass} onClick={() => { setDistrict(""); setDistrictSearch(""); goTo("loc-neighborhood"); }}>
                  {t.skipBtn}
                </button>
              </div>
            )}

            {/* Step 4d — Neighborhood */}
            {screen === "loc-neighborhood" && (
              <div>
                <h1 className="text-xl font-black text-gray-900 mb-6">{t.neighborhoodLabel}</h1>
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={neighborhoodSearch}
                    onChange={(e) => {
                      setNeighborhoodSearch(e.target.value);
                      setNeighborhood(e.target.value);
                      if (countryCode === "TR") setNeighborhoodSugOpen(true);
                    }}
                    onFocus={() => { if (countryCode === "TR") setNeighborhoodSugOpen(true); }}
                    onBlur={() => setTimeout(() => setNeighborhoodSugOpen(false), 150)}
                    placeholder={t.neighborhoodLabel}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors"
                  />
                  {neighborhoodSugOpen && neighborhoodSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-56">
                      {neighborhoodSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setNeighborhood(s);
                            setNeighborhoodSearch(s);
                            setNeighborhoodSugOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className={primaryBtnClass} onClick={() => goTo("results")}>
                  {t.searchBtn}
                </button>
                <button className={skipBtnClass} onClick={() => { setNeighborhood(""); setNeighborhoodSearch(""); goTo("results"); }}>
                  {t.skipBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6 max-w-6xl mx-auto">
          <h1 className="text-xl font-black text-gray-900 mb-1">{t.resultsTitle}</h1>
          <p className="text-sm text-gray-400 mb-6">
            {codeToFlag(countryCode)} {[countryName, city, district, neighborhood].filter(Boolean).join(" / ")}
          </p>

          {loadingResults ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-48" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 font-medium">{t.noResults}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => router.push(`/listings/${listing.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}