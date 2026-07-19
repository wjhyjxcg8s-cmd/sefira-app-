"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import type { Lang } from "@/app/lib/LangContext";
import {
  getOrderedCountryCodes,
  getCountryName,
  codeToFlag,
  normalize,
  filterSuggestions,
  loadTurkiyeData,
  loadIranCounties,
  loadRussiaCities,
  loadStatesOfCountry,
  loadWorldCities,
  loadCitiesOfState,
  type StateOption,
} from "@/app/lib/locationData";
import { COMMERCIAL_TYPES } from "@/app/lib/commercialTypes";

export type SheetMode = "location" | "category" | null;

export interface LocationSubmit {
  country?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
}

export interface CategorySubmit {
  category: "residential" | "commercial";
  commercialType?: string;
}

interface SearchSheetProps {
  mode: SheetMode;
  lang: Lang;
  onClose: () => void;
  onSubmitLocation: (params: LocationSubmit) => void;
  onSubmitCategory: (params: CategorySubmit) => void;
}

type LocationStep = "country" | "city" | "district" | "neighborhood";
type CategoryStep = "category" | "commercialType";

const T: Record<Lang, {
  locationTitle: string; categoryTitle: string; back: string; close: string;
  countrySearchPlaceholder: string; citySearchPlaceholder: string;
  districtSearchPlaceholder: string; neighborhoodSearchPlaceholder: string;
  loading: string; searchHere: string;
  residentialLabel: string; residentialSub: string;
  commercialLabel: string; commercialSub: string;
  commercialTypeTitle: string; searchAllCommercial: string;
}> = {
  tr: {
    locationTitle: "Konum Seç", categoryTitle: "Kategori Seç", back: "Geri", close: "Kapat",
    countrySearchPlaceholder: "Ülke ara...", citySearchPlaceholder: "Şehir ara...",
    districtSearchPlaceholder: "İlçe ara...", neighborhoodSearchPlaceholder: "Mahalle ara...",
    loading: "Yükleniyor…", searchHere: "Bu konumda ara",
    residentialLabel: "Konut", residentialSub: "Ev, oda ve ev arkadaşı ilanları",
    commercialLabel: "Ticari", commercialSub: "Ofis, dükkan ve diğer alanlar",
    commercialTypeTitle: "Alan Türünü Seçin", searchAllCommercial: "Tüm Ticari İlanları Ara",
  },
  en: {
    locationTitle: "Choose Location", categoryTitle: "Choose Category", back: "Back", close: "Close",
    countrySearchPlaceholder: "Search country...", citySearchPlaceholder: "Search city...",
    districtSearchPlaceholder: "Search district...", neighborhoodSearchPlaceholder: "Search neighborhood...",
    loading: "Loading…", searchHere: "Search this location",
    residentialLabel: "Residential", residentialSub: "Homes, rooms and roommate listings",
    commercialLabel: "Commercial", commercialSub: "Offices, shops and other spaces",
    commercialTypeTitle: "Select Space Type", searchAllCommercial: "Search All Commercial Listings",
  },
  fa: {
    locationTitle: "انتخاب موقعیت", categoryTitle: "انتخاب دسته‌بندی", back: "بازگشت", close: "بستن",
    countrySearchPlaceholder: "جستجوی کشور...", citySearchPlaceholder: "جستجوی شهر...",
    districtSearchPlaceholder: "جستجوی منطقه...", neighborhoodSearchPlaceholder: "جستجوی محله...",
    loading: "در حال بارگذاری…", searchHere: "جستجو در این موقعیت",
    residentialLabel: "مسکونی", residentialSub: "آگهی‌های خانه، اتاق و هم‌خانه",
    commercialLabel: "تجاری", commercialSub: "دفتر، مغازه و سایر فضاها",
    commercialTypeTitle: "نوع فضا را انتخاب کنید", searchAllCommercial: "جستجوی همه آگهی‌های تجاری",
  },
  ar: {
    locationTitle: "اختر الموقع", categoryTitle: "اختر الفئة", back: "رجوع", close: "إغلاق",
    countrySearchPlaceholder: "ابحث عن دولة...", citySearchPlaceholder: "ابحث عن مدينة...",
    districtSearchPlaceholder: "ابحث عن حي...", neighborhoodSearchPlaceholder: "ابحث عن حارة...",
    loading: "جارٍ التحميل…", searchHere: "ابحث في هذا الموقع",
    residentialLabel: "سكني", residentialSub: "إعلانات المنازل والغرف وشريك السكن",
    commercialLabel: "تجاري", commercialSub: "مكاتب ومحلات ومساحات أخرى",
    commercialTypeTitle: "اختر نوع المساحة", searchAllCommercial: "ابحث في جميع الإعلانات التجارية",
  },
  de: {
    locationTitle: "Ort wählen", categoryTitle: "Kategorie wählen", back: "Zurück", close: "Schließen",
    countrySearchPlaceholder: "Land suchen...", citySearchPlaceholder: "Stadt suchen...",
    districtSearchPlaceholder: "Bezirk suchen...", neighborhoodSearchPlaceholder: "Viertel suchen...",
    loading: "Wird geladen…", searchHere: "Hier suchen",
    residentialLabel: "Wohnen", residentialSub: "Wohnungen, Zimmer und Mitbewohner-Inserate",
    commercialLabel: "Gewerbe", commercialSub: "Büros, Läden und andere Flächen",
    commercialTypeTitle: "Flächentyp auswählen", searchAllCommercial: "Alle Gewerbeinserate durchsuchen",
  },
  ru: {
    locationTitle: "Выбрать локацию", categoryTitle: "Выбрать категорию", back: "Назад", close: "Закрыть",
    countrySearchPlaceholder: "Поиск страны...", citySearchPlaceholder: "Поиск города...",
    districtSearchPlaceholder: "Поиск района...", neighborhoodSearchPlaceholder: "Поиск микрорайона...",
    loading: "Загрузка…", searchHere: "Искать здесь",
    residentialLabel: "Жильё", residentialSub: "Дома, комнаты и объявления соседей",
    commercialLabel: "Коммерция", commercialSub: "Офисы, магазины и другие помещения",
    commercialTypeTitle: "Выберите тип помещения", searchAllCommercial: "Искать все коммерческие объявления",
  },
};

function SearchHereButton({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-3 flex w-full flex-col items-start gap-0.5 rounded-xl bg-orange-500 px-4 py-3 text-start transition-transform active:scale-[0.98]"
    >
      <span className="text-[14px] font-bold text-white">{label}</span>
      <span className="w-full truncate text-[12px] text-orange-100">{value}</span>
    </button>
  );
}

export default function SearchSheet({ mode, lang, onClose, onSubmitLocation, onSubmitCategory }: SearchSheetProps) {
  const t = T[lang];
  const isRtl = lang === "fa" || lang === "ar";
  const dragControls = useDragControls();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [locStep, setLocStep] = useState<LocationStep>("country");
  const [countryCode, setCountryCode] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [turkiyeData, setTurkiyeData] = useState<Record<string, Record<string, string[]>>>({});
  const [iranCities, setIranCities] = useState<string[]>([]);
  const [russiaCities, setRussiaCities] = useState<string[]>([]);
  const [worldCitiesForCountry, setWorldCitiesForCountry] = useState<string[]>([]);
  const [statesOfCountry, setStatesOfCountry] = useState<StateOption[]>([]);
  const [genericDistrictOptions, setGenericDistrictOptions] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [district, setDistrict] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [catStep, setCatStep] = useState<CategoryStep>("category");

  // Reset every time the sheet is (re)opened, in either mode.
  useEffect(() => {
    if (!mode) return;
    setLocStep("country");
    setCountryCode("");
    setCountrySearch("");
    setCity(""); setCitySearch("");
    setDistrict(""); setDistrictSearch("");
    setNeighborhoodSearch("");
    setGenericDistrictOptions([]);
    setCatStep("category");
  }, [mode]);

  useEffect(() => {
    document.body.style.overflow = mode ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mode]);

  if (!mounted) return null;

  const usingStateFallback =
    countryCode !== "TR" && countryCode !== "IR" && countryCode !== "RU" &&
    worldCitiesForCountry.length === 0 && statesOfCountry.length > 0;

  function getCityOptions(): string[] {
    if (countryCode === "TR") return Object.keys(turkiyeData);
    if (countryCode === "IR") return iranCities;
    if (countryCode === "RU") return russiaCities;
    return worldCitiesForCountry.length > 0 ? worldCitiesForCountry : statesOfCountry.map((s) => s.name);
  }

  async function selectCountry(code: string) {
    setCountryCode(code);
    setCity(""); setCitySearch("");
    setDistrict(""); setDistrictSearch("");
    setNeighborhoodSearch("");
    setGenericDistrictOptions([]);
    setLoadingOptions(true);
    if (code === "TR") {
      setTurkiyeData(await loadTurkiyeData());
    } else if (code === "IR") {
      setIranCities(await loadIranCounties());
    } else if (code === "RU") {
      setRussiaCities(await loadRussiaCities());
    } else {
      const englishName = getCountryName(code, "en");
      const [worldCities, states] = await Promise.all([
        loadWorldCities(englishName),
        loadStatesOfCountry(code),
      ]);
      setWorldCitiesForCountry(worldCities);
      setStatesOfCountry(states);
    }
    setLoadingOptions(false);
    setLocStep("city");
  }

  function submitLocation(params: LocationSubmit) {
    onSubmitLocation(params);
    onClose();
  }

  function submitCategory(params: CategorySubmit) {
    onSubmitCategory(params);
    onClose();
  }

  async function confirmCity(name: string) {
    setCity(name);
    if (countryCode === "TR") {
      setLocStep("district");
      return;
    }
    if (usingStateFallback) {
      setLoadingOptions(true);
      const matched = statesOfCountry.find((s) => s.name === name);
      if (matched) setGenericDistrictOptions(await loadCitiesOfState(countryCode, matched.isoCode));
      setLoadingOptions(false);
      setLocStep("district");
      return;
    }
    // No deeper data available for this country — stop here instead of a dead-end screen.
    submitLocation({ country: countryCode, city: name });
  }

  function confirmDistrict(name: string) {
    setDistrict(name);
    if (countryCode === "TR") {
      setLocStep("neighborhood");
      return;
    }
    submitLocation({ country: countryCode, city, district: name });
  }

  function confirmNeighborhood(name: string) {
    submitLocation({ country: countryCode, city, district, neighborhood: name });
  }

  function goBack() {
    if (mode === "category") {
      if (catStep === "commercialType") setCatStep("category");
      return;
    }
    if (locStep === "neighborhood") { setLocStep("district"); return; }
    if (locStep === "district") { setLocStep("city"); return; }
    if (locStep === "city") { setLocStep("country"); return; }
  }

  const orderedCountryCodes = getOrderedCountryCodes(lang);
  const filteredCountries = (() => {
    const q = normalize(countrySearch);
    if (!q) return orderedCountryCodes;
    return orderedCountryCodes.filter(
      (code) => normalize(getCountryName(code, lang)).includes(q) || code.toLowerCase().includes(q)
    );
  })();

  const citySuggestions = filterSuggestions(getCityOptions(), citySearch);
  const districtOptions = countryCode === "TR" ? Object.keys(turkiyeData[city] || {}) : genericDistrictOptions;
  const districtSuggestions = filterSuggestions(districtOptions, districtSearch);
  const neighborhoodOptions = countryCode === "TR" ? (turkiyeData[city]?.[district] || []) : [];
  const neighborhoodSuggestions = filterSuggestions(neighborhoodOptions, neighborhoodSearch);

  const countryName = countryCode ? getCountryName(countryCode, lang) : "";
  const showBack = mode === "category" ? catStep === "commercialType" : locStep !== "country";
  const title = mode === "category"
    ? (catStep === "commercialType" ? t.commercialTypeTitle : t.categoryTitle)
    : t.locationTitle;

  const inputClass =
    "mb-3 w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-[15px] text-gray-900 outline-none focus:border-orange-400";
  const rowClass =
    "rounded-xl px-3 py-2.5 text-start text-[15px] font-medium text-gray-800 active:bg-gray-50";

  return createPortal(
    <AnimatePresence>
      {mode && (
        <>
          {/* Backdrop — same header-overlap lesson as ProfileDrawer: the site nav sits at
              z-[9999], so this must clear it, not match it. onPointerUp only, no onClick:
              a <button>/onClick here would double-fire a synthesized click ~300ms later on
              iOS and paint the default tap-highlight flash. */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="button"
            tabIndex={-1}
            aria-label={t.close}
            onPointerUp={onClose}
            style={{ WebkitTapHighlightColor: "transparent" }}
            className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) onClose();
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            dir={isRtl ? "rtl" : "ltr"}
            className="fixed inset-x-0 bottom-0 z-[10001] flex max-h-[80dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex flex-shrink-0 cursor-grab flex-col items-center pb-2 pt-3 active:cursor-grabbing"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div className="h-1.5 w-10 rounded-full bg-gray-300" />
            </div>

            <div className="flex flex-shrink-0 items-center gap-2 px-4 pb-3">
              {showBack ? (
                <button
                  onClick={goBack}
                  aria-label={t.back}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600"
                >
                  <ChevronLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <div className="w-8 flex-shrink-0" />
              )}
              <span className="flex-1 truncate text-center text-[15px] font-bold text-gray-900">{title}</span>
              <button
                onClick={onClose}
                aria-label={t.close}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
              {mode === "location" && (
                <>
                  {locStep === "country" && (
                    <>
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder={t.countrySearchPlaceholder}
                        dir={isRtl ? "rtl" : "ltr"}
                        className={inputClass}
                      />
                      <div className="flex flex-col gap-1">
                        {filteredCountries.map((code) => (
                          <button key={code} onClick={() => selectCountry(code)} className={`flex items-center gap-3 ${rowClass}`}>
                            <span className="text-xl">{codeToFlag(code)}</span>
                            <span className="truncate">{getCountryName(code, lang)}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {locStep === "city" && (
                    <>
                      <SearchHereButton label={t.searchHere} value={countryName} onClick={() => submitLocation({ country: countryCode })} />
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder={t.citySearchPlaceholder}
                        dir={isRtl ? "rtl" : "ltr"}
                        className={inputClass}
                      />
                      {loadingOptions ? (
                        <p className="py-6 text-center text-sm text-gray-400">{t.loading}</p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {citySuggestions.map((name) => (
                            <button key={name} onClick={() => confirmCity(name)} className={rowClass}>
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {locStep === "district" && (
                    <>
                      <SearchHereButton
                        label={t.searchHere}
                        value={`${city}, ${countryName}`}
                        onClick={() => submitLocation({ country: countryCode, city })}
                      />
                      <input
                        type="text"
                        value={districtSearch}
                        onChange={(e) => setDistrictSearch(e.target.value)}
                        placeholder={t.districtSearchPlaceholder}
                        dir={isRtl ? "rtl" : "ltr"}
                        className={inputClass}
                      />
                      {loadingOptions ? (
                        <p className="py-6 text-center text-sm text-gray-400">{t.loading}</p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {districtSuggestions.map((name) => (
                            <button key={name} onClick={() => confirmDistrict(name)} className={rowClass}>
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {locStep === "neighborhood" && (
                    <>
                      <SearchHereButton
                        label={t.searchHere}
                        value={`${district}, ${city}`}
                        onClick={() => submitLocation({ country: countryCode, city, district })}
                      />
                      <input
                        type="text"
                        value={neighborhoodSearch}
                        onChange={(e) => setNeighborhoodSearch(e.target.value)}
                        placeholder={t.neighborhoodSearchPlaceholder}
                        dir={isRtl ? "rtl" : "ltr"}
                        className={inputClass}
                      />
                      <div className="flex flex-col gap-1">
                        {neighborhoodSuggestions.map((name) => (
                          <button key={name} onClick={() => confirmNeighborhood(name)} className={rowClass}>
                            {name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {mode === "category" && (
                <>
                  {catStep === "category" && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        onClick={() => submitCategory({ category: "residential" })}
                        className="flex flex-col items-start gap-2 rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 text-start transition-transform active:scale-[0.98]"
                      >
                        <span className="text-2xl">🏠</span>
                        <span className="text-[15px] font-bold text-gray-900">{t.residentialLabel}</span>
                        <span className="text-xs text-gray-500">{t.residentialSub}</span>
                      </button>
                      <button
                        onClick={() => setCatStep("commercialType")}
                        className="flex flex-col items-start gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-start transition-transform active:scale-[0.98]"
                      >
                        <span className="text-2xl">🏢</span>
                        <span className="text-[15px] font-bold text-gray-900">{t.commercialLabel}</span>
                        <span className="text-xs text-gray-500">{t.commercialSub}</span>
                      </button>
                    </div>
                  )}

                  {catStep === "commercialType" && (
                    <>
                      <button
                        onClick={() => submitCategory({ category: "commercial" })}
                        className="mb-3 w-full rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-[14px] font-bold text-emerald-700 transition-transform active:scale-[0.98]"
                      >
                        {t.searchAllCommercial}
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        {COMMERCIAL_TYPES.map((ct) => (
                          <button
                            key={ct.slug}
                            onClick={() => submitCategory({ category: "commercial", commercialType: ct.slug })}
                            className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-gray-200 p-3 text-center transition-colors active:border-emerald-400 active:bg-emerald-50"
                          >
                            <span className="text-2xl">{ct.emoji}</span>
                            <span className="text-[11px] font-medium leading-tight text-gray-700">{ct.label[lang]}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
