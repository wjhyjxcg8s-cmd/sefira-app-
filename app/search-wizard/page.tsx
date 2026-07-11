"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useLang } from "@/app/lib/LangContext";
import { tierByLocation } from "./locationTiers";
import {
  getCountryName,
  getOrderedCountryCodes,
  codeToFlag,
  normalize,
  loadTurkiyeData,
  loadIranCounties,
  loadRussiaCities,
  loadStatesOfCountry,
  loadWorldCities,
  loadCitiesOfState,
  type StateOption,
} from "@/app/lib/locationData";
import { getListingSide, getCommercialBadgeLabel, COMMERCIAL_BADGE_CLASS } from "@/app/lib/listingBadge";
import { COMMERCIAL_TYPES, COMMERCIAL_TYPE_BY_SLUG } from "@/app/lib/commercialTypes";

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";
type WizardCategory = "residential" | "commercial";
type UserIntent = "has_home" | "needs_home";
type Screen =
  | "category"
  | "intent"
  | "commercial-type"
  | "confirm"
  | "loc-country"
  | "loc-city"
  | "loc-district"
  | "loc-neighborhood"
  | "results";

function filterSuggestions(list: string[], query: string): string[] {
  const q = normalize(query);
  if (!q) return list;
  const starts = list.filter((x: string) => normalize(x).startsWith(q));
  const includes = list.filter((x: string) => !normalize(x).startsWith(q) && normalize(x).includes(q));
  return [...starts, ...includes];
}

// 14 commercial space types — shared with the listing detail page and create-commercial-listing.

const T: Record<Lang, {
  step1Title: string; residential: string; commercial: string;
  step2Title: string;
  hasHomeResidential: string; needsHomeResidential: string;
  hasHomeCommercial: string; needsHomeCommercial: string;
  confirmMsgResidential: string; confirmMsgCommercial: string;
  continueBtn: string;
  commercialTypeTitle: string;
  countryLabel: string; cityLabel: string; districtLabel: string; neighborhoodLabel: string;
  searchBtn: string; skipBtn: string; resultsTitle: string;
  noResults: string; noResultsSub: string; createListingBtn: string;
  messageBtn: string;
}> = {
  tr: {
    step1Title: "Ne arıyorsunuz?", residential: "Konut / Ev Arkadaşı", commercial: "Ticari Alan",
    step2Title: "Durumunuz nedir?",
    hasHomeResidential: "Evim var, ev arkadaşı arıyorum", needsHomeResidential: "Evim yok, oda veya ev arıyorum",
    hasHomeCommercial: "Alanım var, kiracı arıyorum", needsHomeCommercial: "Alanım yok, uygun bir alan arıyorum",
    confirmMsgResidential: "Bu soruları yanıtlayarak evinize en uygun kişiyi bulabilirsiniz.",
    confirmMsgCommercial: "Bu soruları yanıtlayarak alanınıza en uygun kiracıyı bulabilirsiniz.",
    continueBtn: "Devam Et",
    commercialTypeTitle: "Alan türünü seçin",
    countryLabel: "Ülke seçin", cityLabel: "Şehir / İl", districtLabel: "İlçe (isteğe bağlı)", neighborhoodLabel: "Mahalle (isteğe bağlı)",
    searchBtn: "Ara", skipBtn: "Atla", resultsTitle: "Sonuçlar",
    noResults: "Sonuç bulunamadı", noResultsSub: "Farklı bir konum deneyin veya kendi ilanınızı oluşturun.", createListingBtn: "İlan Ver",
    messageBtn: "Mesaj",
  },
  en: {
    step1Title: "What are you looking for?", residential: "Home / Roommate", commercial: "Commercial Space",
    step2Title: "What is your situation?",
    hasHomeResidential: "I have a home, looking for a roommate", needsHomeResidential: "I don't have a home, looking for a place",
    hasHomeCommercial: "I have a space, looking for a tenant", needsHomeCommercial: "I don't have a space, looking for one",
    confirmMsgResidential: "By answering a few questions, you can find the right person for your home.",
    confirmMsgCommercial: "By answering a few questions, you can find the right tenant for your space.",
    continueBtn: "Continue",
    commercialTypeTitle: "Select space type",
    countryLabel: "Select country", cityLabel: "City", districtLabel: "District (optional)", neighborhoodLabel: "Neighborhood (optional)",
    searchBtn: "Search", skipBtn: "Skip", resultsTitle: "Results",
    noResults: "No results found", noResultsSub: "Try a different location or create your own listing.", createListingBtn: "Post a Listing",
    messageBtn: "Message",
  },
  fa: {
    step1Title: "دنبال چه می‌گردید؟", residential: "خانه / هم‌خانه", commercial: "فضای تجاری",
    step2Title: "وضعیت شما چیست؟",
    hasHomeResidential: "خانه دارم، دنبال هم‌خانه می‌گردم", needsHomeResidential: "خانه ندارم، دنبال خانه یا اتاق می‌گردم",
    hasHomeCommercial: "فضا دارم، دنبال مستأجر می‌گردم", needsHomeCommercial: "فضا ندارم، دنبال فضای مناسب می‌گردم",
    confirmMsgResidential: "با پاسخ به چند سوال، می‌توانید فرد مناسب را برای خانه‌تان پیدا کنید.",
    confirmMsgCommercial: "با پاسخ به چند سوال، می‌توانید مستأجر مناسب را برای فضای‌تان پیدا کنید.",
    continueBtn: "ادامه",
    commercialTypeTitle: "نوع فضا را انتخاب کنید",
    countryLabel: "کشور را انتخاب کنید", cityLabel: "شهر", districtLabel: "منطقه (اختیاری)", neighborhoodLabel: "محله (اختیاری)",
    searchBtn: "جستجو", skipBtn: "رد کردن", resultsTitle: "نتایج",
    noResults: "نتیجه‌ای یافت نشد", noResultsSub: "مکان دیگری را امتحان کنید یا آگهی خودتان را ثبت کنید.", createListingBtn: "ثبت آگهی",
    messageBtn: "پیام",
  },
  ar: {
    step1Title: "ماذا تبحث عن؟", residential: "مسكن / شريك سكن", commercial: "مساحة تجارية",
    step2Title: "ما هو وضعك؟",
    hasHomeResidential: "لديّ منزل وأبحث عن شريك سكن", needsHomeResidential: "ليس لديّ منزل وأبحث عن مكان",
    hasHomeCommercial: "لديّ مساحة وأبحث عن مستأجر", needsHomeCommercial: "ليس لديّ مساحة وأبحث عن واحدة مناسبة",
    confirmMsgResidential: "بالإجابة عن بعض الأسئلة، يمكنك إيجاد الشخص المناسب لمنزلك.",
    confirmMsgCommercial: "بالإجابة عن بعض الأسئلة، يمكنك إيجاد المستأجر المناسب لمساحتك.",
    continueBtn: "متابعة",
    commercialTypeTitle: "اختر نوع المساحة",
    countryLabel: "اختر الدولة", cityLabel: "المدينة", districtLabel: "الحي (اختياري)", neighborhoodLabel: "الحارة (اختياري)",
    searchBtn: "بحث", skipBtn: "تخطى", resultsTitle: "النتائج",
    noResults: "لا توجد نتائج", noResultsSub: "جرّب موقعاً آخر أو أنشئ إعلانك الخاص.", createListingBtn: "أضف إعلاناً",
    messageBtn: "رسالة",
  },
  de: {
    step1Title: "Was suchen Sie?", residential: "Wohnung / Mitbewohner", commercial: "Gewerbefläche",
    step2Title: "Was trifft auf Sie zu?",
    hasHomeResidential: "Ich habe eine Wohnung und suche einen Mitbewohner", needsHomeResidential: "Ich habe keine Wohnung und suche eine",
    hasHomeCommercial: "Ich habe eine Fläche und suche einen Mieter", needsHomeCommercial: "Ich habe keine Fläche und suche eine passende",
    confirmMsgResidential: "Beantworten Sie ein paar Fragen, um die passende Person für Ihre Wohnung zu finden.",
    confirmMsgCommercial: "Beantworten Sie ein paar Fragen, um den passenden Mieter für Ihre Fläche zu finden.",
    continueBtn: "Weiter",
    commercialTypeTitle: "Flächentyp auswählen",
    countryLabel: "Land auswählen", cityLabel: "Stadt", districtLabel: "Bezirk (optional)", neighborhoodLabel: "Viertel (optional)",
    searchBtn: "Suchen", skipBtn: "Überspringen", resultsTitle: "Ergebnisse",
    noResults: "Keine Ergebnisse gefunden", noResultsSub: "Versuchen Sie einen anderen Ort oder erstellen Sie Ihr eigenes Inserat.", createListingBtn: "Inserat aufgeben",
    messageBtn: "Nachricht",
  },
  ru: {
    step1Title: "Что вы ищете?", residential: "Жильё / Сосед", commercial: "Коммерческое помещение",
    step2Title: "Какова ваша ситуация?",
    hasHomeResidential: "У меня есть жильё, ищу соседа", needsHomeResidential: "У меня нет жилья, ищу комнату или квартиру",
    hasHomeCommercial: "У меня есть помещение, ищу арендатора", needsHomeCommercial: "У меня нет помещения, ищу подходящее",
    confirmMsgResidential: "Ответив на несколько вопросов, вы найдёте подходящего человека для вашего жилья.",
    confirmMsgCommercial: "Ответив на несколько вопросов, вы найдёте подходящего арендатора для вашего помещения.",
    continueBtn: "Продолжить",
    commercialTypeTitle: "Выберите тип помещения",
    countryLabel: "Выберите страну", cityLabel: "Город", districtLabel: "Район (необязательно)", neighborhoodLabel: "Микрорайон (необязательно)",
    searchBtn: "Искать", skipBtn: "Пропустить", resultsTitle: "Результаты",
    noResults: "Результатов не найдено", noResultsSub: "Попробуйте другое место или создайте своё объявление.", createListingBtn: "Разместить объявление",
    messageBtn: "Сообщение",
  },
};

function screenToStep(s: Screen): number {
  if (s === "category") return 1;
  if (s === "intent" || s === "commercial-type") return 2;
  if (s === "confirm") return 3;
  return 4; // loc-country, loc-city, loc-district, loc-neighborhood, results
}

const listingTypeTrans: Record<string, Record<Lang, string>> = {
  has_place: { tr: "Sahip", en: "Owner", fa: "صاحب", ar: "المالك", de: "Anbieter", ru: "Владелец" },
  needs_place: { tr: "Arayan", en: "Seeker", fa: "جویا", ar: "الباحث", de: "Suchend", ru: "Искатель" },
};

interface ListingProfile {
  display_name?: string | null;
  avatar_url?: string | null;
  gender?: string | null;
}

interface Listing {
  id: string;
  type?: string | null;
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  rent?: number | null;
  currency?: string | null;
  photos?: string[] | null;
  house_type?: string | null;
  rooms?: number | null;
  smoking?: boolean | null;
  furnished?: boolean | null;
  elevator?: boolean | null;
  current_residents?: number | null;
  user_id: string;
  country_code?: string | null;
  country?: string | null;
  max_budget?: number | null;
  seeker_age?: number | null;
  seeker_gender?: string | null;
  occupation?: string | null;
  about_text?: string | null;
  listing_category?: string | null;
  has_place?: boolean | null;
  needs_place?: boolean | null;
  commercial_type?: string | null;
  square_meters?: number | null;
  profile?: ListingProfile | null;
}

function ListingCard({
  listing, lang, onClick, onMessage,
}: {
  listing: Listing; lang: Lang; onClick: () => void; onMessage: () => void;
}) {
  const t = T[lang] ?? T.tr;
  const side = getListingSide(listing);
  const isHasPlace = side === "has_place";
  const isNeedsPlace = side === "needs_place";
  const isCommercial = listing.listing_category === "commercial";
  const commercialType = listing.commercial_type ? COMMERCIAL_TYPE_BY_SLUG[listing.commercial_type] : null;

  return (
    <div
      onClick={onClick}
      className="rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="aspect-video bg-gray-100 relative">
        {listing.photos?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photos[0]} alt={listing.city || ""} className="w-full h-full object-cover" />
        ) : isNeedsPlace && listing.profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-stone-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        )}
        {side && (() => {
          const label = isCommercial ? getCommercialBadgeLabel(side, lang) : listingTypeTrans[side][lang];
          const colorClass = isCommercial ? COMMERCIAL_BADGE_CLASS[side] : isHasPlace ? "bg-emerald-500" : "bg-blue-500";
          return (
            <span className={`absolute top-2 start-2 text-white text-xs px-2 py-1 rounded-full font-medium ${colorClass}`}>
              {isHasPlace ? "🏠" : "🔍"} {label}
            </span>
          );
        })()}
        {isCommercial && commercialType && (
          <span className="absolute bottom-2 end-2 text-white text-xs px-2 py-1 rounded-full font-medium bg-stone-800/70">
            {commercialType.emoji} {commercialType.label[lang]}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onMessage(); }}
          aria-label={t.messageBtn}
          className="absolute bottom-2 start-2 flex items-center gap-1 bg-white/90 backdrop-blur text-orange-600 text-xs font-bold px-2.5 py-1.5 rounded-full shadow active:scale-95 transition"
        >
          💬 {t.messageBtn}
        </button>
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
        {isNeedsPlace && listing.max_budget && listing.currency && (
          <p className="text-orange-500 font-bold text-sm mt-1">{listing.max_budget} {listing.currency}</p>
        )}
        {isCommercial && listing.square_meters && (
          <p className="text-gray-500 text-xs mt-1">{listing.square_meters} m²</p>
        )}
        {!isCommercial && isHasPlace && (listing.house_type || listing.rooms) && (
          <p className="text-gray-500 text-xs mt-1">
            {[listing.house_type, listing.rooms ? `${listing.rooms}` : null].filter(Boolean).join(" • ")}
          </p>
        )}
        {!isCommercial && isNeedsPlace && (listing.seeker_age || listing.occupation) && (
          <p className="text-gray-500 text-xs mt-1">
            {[listing.seeker_age ? `${listing.seeker_age}` : null, listing.occupation].filter(Boolean).join(" • ")}
          </p>
        )}
        {listing.profile?.avatar_url && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.profile.avatar_url} className="w-6 h-6 rounded-full object-cover border border-orange-200" alt="" />
            <span className="text-xs text-gray-500 font-medium truncate">{listing.profile.display_name || ""}</span>
          </div>
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
  const [commercialType, setCommercialType] = useState<string>("");

  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  const [turkiyeData, setTurkiyeData] = useState<Record<string, Record<string, string[]>>>({});
  const [iranCities, setIranCities] = useState<string[]>([]);
  const [russiaCities, setRussiaCities] = useState<string[]>([]);
  // Generic (non-TR/IR/RU) countries: prefer real world-city names; only when a country
  // has no world-cities.json coverage do we fall back to state/province names, in which
  // case a district-equivalent step (cities within that state) becomes available too.
  const [worldCitiesForCountry, setWorldCitiesForCountry] = useState<string[]>([]);
  const [statesOfCountry, setStatesOfCountry] = useState<StateOption[]>([]);
  const [genericDistrictOptions, setGenericDistrictOptions] = useState<string[]>([]);

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
  const [results, setResults] = useState<Listing[]>([]);

  const goTo = (next: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  };

  // "confirm" is a transient, auto-advancing screen — rewinding onto it would just
  // re-trigger the timer and bounce the user straight back forward, so skip over it.
  const goBack = () => {
    if (history.length === 0) {
      router.back();
      return;
    }
    const h = [...history];
    let prev = h.pop() as Screen;
    while (prev === "confirm" && h.length > 0) {
      prev = h.pop() as Screen;
    }
    setHistory(h);
    setScreen(prev);
  };

  async function runSearch() {
    setLoadingResults(true);

    const { data, error } = await supabase
      .from("listings")
      .select("id, type, city, district, neighborhood, rent, currency, photos, house_type, rooms, smoking, furnished, elevator, current_residents, user_id, country_code, country, max_budget, seeker_age, seeker_gender, occupation, about_text, listing_category, has_place, needs_place, commercial_type, square_meters")
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

    // Step 2: opposite-side filter (has vs needs), using the field the category actually stores
    if (userIntent) {
      if (wizardCategory === "commercial") {
        base = base.filter((l) => (userIntent === "has_home" ? l.needs_place === true : l.has_place === true));
      } else {
        const targetType = userIntent === "has_home" ? "needs_place" : "has_place";
        base = base.filter((l) => l.type === targetType);
      }
    }

    // Step 2b: commercial space type, when the user picked one
    if (wizardCategory === "commercial" && commercialType) {
      base = base.filter((l) => l.commercial_type === commercialType);
    }

    // Step 3: location filter with priority tiers (neighborhood > district > city > country)
    const tiered = tierByLocation(base, { city, district, neighborhood, countryCode });

    if (tiered.length === 0) {
      setResults([]);
      setLoadingResults(false);
      return;
    }

    // Enrich with public profile info (avatar/name) for card parity with the homepage feed
    const userIds = Array.from(new Set(tiered.map((l) => l.user_id).filter(Boolean)));
    let profiles: (ListingProfile & { user_id: string })[] = [];
    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles_public")
        .select("user_id, display_name, avatar_url, gender")
        .in("user_id", userIds);
      profiles = profileData || [];
    }

    setResults(
      tiered.map((l) => ({ ...l, profile: profiles.find((p) => p.user_id === l.user_id) || null }))
    );
    setLoadingResults(false);
  }

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  async function selectCountry(code: string) {
    setCountryCode(code);
    setCountryName(getCountryName(code, lang as Lang));
    setCity(""); setCitySearch("");
    setDistrict(""); setDistrictSearch("");
    setNeighborhood(""); setNeighborhoodSearch("");
    setGenericDistrictOptions([]);

    if (code === "TR") {
      if (Object.keys(turkiyeData).length === 0) {
        setTurkiyeData(await loadTurkiyeData());
      }
    } else if (code === "IR") {
      if (iranCities.length === 0) {
        setIranCities(await loadIranCounties());
      }
    } else if (code === "RU") {
      if (russiaCities.length === 0) {
        setRussiaCities(await loadRussiaCities());
      }
    } else {
      // Prefer real world-city names; only fall back to state/province names when a
      // country has no world-cities.json coverage (matches create-listing's preference).
      const englishName = getCountryName(code, "en");
      const [worldCities, states] = await Promise.all([
        loadWorldCities(englishName),
        loadStatesOfCountry(code),
      ]);
      setWorldCitiesForCountry(worldCities);
      setStatesOfCountry(states);
    }
    goTo("loc-city");
  }

  function getCityOptions(): string[] {
    if (countryCode === "TR") return Object.keys(turkiyeData);
    if (countryCode === "IR") return iranCities;
    if (countryCode === "RU") return russiaCities;
    return worldCitiesForCountry.length > 0 ? worldCitiesForCountry : statesOfCountry.map((s) => s.name);
  }

  // Whether the current "city" list is actually state/province names (no real
  // world-city coverage) — in that case a district-equivalent step is available.
  const usingStateFallback =
    countryCode !== "TR" && countryCode !== "IR" && countryCode !== "RU" &&
    worldCitiesForCountry.length === 0 && statesOfCountry.length > 0;

  async function confirmCity(name: string) {
    setCity(name);
    setCitySearch(name);
    setCitySugOpen(false);

    if (countryCode === "TR") {
      goTo("loc-district");
      return;
    }

    if (usingStateFallback) {
      const matched = statesOfCountry.find((s) => s.name === name);
      if (matched) {
        setGenericDistrictOptions(await loadCitiesOfState(countryCode, matched.isoCode));
      }
      goTo("loc-district");
      return;
    }

    goTo("loc-neighborhood");
  }

  function confirmDistrict(name: string) {
    setDistrict(name);
    setDistrictSearch(name);
    setDistrictSugOpen(false);
    setNeighborhood(""); setNeighborhoodSearch("");
    goTo("loc-neighborhood");
  }

  const filteredCountries = (() => {
    const ordered = getOrderedCountryCodes(lang);
    const q = normalize(countrySearch);
    if (!q) return ordered;
    return ordered.filter(
      (code) => normalize(getCountryName(code, lang as Lang)).includes(q) || code.toLowerCase().includes(q)
    );
  })();

  const citySuggestions = filterSuggestions(getCityOptions(), citySearch);
  const districtOptions = countryCode === "TR" ? Object.keys(turkiyeData[city] || {}) : genericDistrictOptions;
  const districtSuggestions = filterSuggestions(districtOptions, districtSearch);
  const neighborhoodOptions = countryCode === "TR" ? turkiyeData[city]?.[district] || [] : [];
  const neighborhoodSuggestions = filterSuggestions(neighborhoodOptions, neighborhoodSearch);

  const optionCardClass = (selected: boolean) =>
    `w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-5 transition-colors ${
      selected ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-400"
    }`;

  const typeCardClass = (selected: boolean) =>
    `flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-center transition-colors ${
      selected ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-400"
    }`;

  const primaryBtnClass =
    "w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity";

  const skipBtnClass = "w-full text-center text-sm font-semibold text-gray-400 hover:text-gray-600 py-2 transition-colors";

  function goAfterIntent(intent: UserIntent) {
    setUserIntent(intent);
    if (wizardCategory === "commercial") {
      goTo("commercial-type");
    } else if (intent === "has_home") {
      goTo("confirm");
    } else {
      goTo("loc-country");
    }
  }

  function goAfterCommercialType(slug: string) {
    setCommercialType(slug);
    if (userIntent === "has_home") {
      goTo("confirm");
    } else {
      goTo("loc-country");
    }
  }

  const locationBreadcrumb = [
    wizardCategory === "commercial" && commercialType
      ? `${COMMERCIAL_TYPE_BY_SLUG[commercialType]?.emoji ?? ""} ${COMMERCIAL_TYPE_BY_SLUG[commercialType]?.label[lang as Lang] ?? ""}`.trim()
      : null,
    countryName, city, district, neighborhood,
  ].filter(Boolean).join(" / ");

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
                    onClick={() => { setWizardCategory("commercial"); goTo("intent"); }}
                  >
                    <span className="text-3xl flex-shrink-0">🏢</span>
                    <span className="font-semibold text-gray-800">{t.commercial}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Intent (wording adapts to category) */}
            {screen === "intent" && (
              <div>
                <h1 className="text-xl font-black text-gray-900 mb-6">{t.step2Title}</h1>
                <div className="flex flex-col gap-3">
                  <button
                    className={optionCardClass(userIntent === "has_home")}
                    onClick={() => goAfterIntent("has_home")}
                  >
                    <span className="text-3xl flex-shrink-0">🔑</span>
                    <span className="font-semibold text-gray-800">
                      {wizardCategory === "commercial" ? t.hasHomeCommercial : t.hasHomeResidential}
                    </span>
                  </button>
                  <button
                    className={optionCardClass(userIntent === "needs_home")}
                    onClick={() => goAfterIntent("needs_home")}
                  >
                    <span className="text-3xl flex-shrink-0">🧳</span>
                    <span className="font-semibold text-gray-800">
                      {wizardCategory === "commercial" ? t.needsHomeCommercial : t.needsHomeResidential}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2b — Commercial space type (14 options) */}
            {screen === "commercial-type" && (
              <div>
                <h1 className="text-xl font-black text-gray-900 mb-6">{t.commercialTypeTitle}</h1>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {COMMERCIAL_TYPES.map((opt) => (
                    <button
                      key={opt.slug}
                      className={typeCardClass(commercialType === opt.slug)}
                      onClick={() => goAfterCommercialType(opt.slug)}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <span className="text-sm font-bold text-gray-800">{opt.label[lang as Lang]}</span>
                    </button>
                  ))}
                </div>
                <button className={skipBtnClass} onClick={() => goAfterCommercialType("")}>
                  {t.skipBtn}
                </button>
              </div>
            )}

            {/* Step 3 — Confirmation */}
            {screen === "confirm" && (
              <div className="flex flex-col items-center text-center pt-10">
                <span className="text-5xl mb-4">🎉</span>
                <p className="text-gray-700 text-base leading-relaxed mb-8">
                  {wizardCategory === "commercial" ? t.confirmMsgCommercial : t.confirmMsgResidential}
                </p>
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
                <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {filteredCountries.map((code) => (
                    <button
                      key={code}
                      onClick={() => selectCountry(code)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-orange-50 transition-colors"
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
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-72">
                      {citySuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => confirmCity(s)}
                          className="w-full text-start px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
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

            {/* Step 4c — District (Turkish ilçe, or the equivalent for a state-fallback country) */}
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
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-72">
                      {districtSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => confirmDistrict(s)}
                          className="w-full text-start px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
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
                      setNeighborhoodSugOpen(true);
                    }}
                    onFocus={() => setNeighborhoodSugOpen(true)}
                    onBlur={() => setTimeout(() => setNeighborhoodSugOpen(false), 150)}
                    placeholder={t.neighborhoodLabel}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors"
                  />
                  {neighborhoodSugOpen && neighborhoodSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-72">
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
                          className="w-full text-start px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
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
            {codeToFlag(countryCode)} {locationBreadcrumb}
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
              <p className="text-gray-500 font-medium mb-1">{t.noResults}</p>
              <p className="text-gray-400 text-sm mb-6">{t.noResultsSub}</p>
              <button
                onClick={() => router.push("/choose-listing-type")}
                className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full px-6 py-3 hover:opacity-90 active:scale-95 transition-all"
              >
                {t.createListingBtn}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  lang={lang as Lang}
                  onClick={() => router.push(`/listings/${listing.id}`)}
                  onMessage={() => router.push(`/messages?userId=${listing.user_id}&listingId=${listing.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}