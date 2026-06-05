"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI"
);

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

const turkishCities = ["istanbul", "ankara", "izmir", "bursa", "adana", "antalya", "konya", "gaziantep", "mersin", "diyarbakır", "kayseri", "eskişehir", "trabzon", "ağrı", "ceyhan", "diyadin"];
const germanCities = ["berlin", "munich", "hamburg", "frankfurt", "cologne", "stuttgart", "düsseldorf", "dortmund", "münchen"];
const usCities = ["new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia", "san antonio", "san diego", "dallas"];
const russianCities = ["moscow", "saint petersburg", "novosibirsk", "yekaterinburg", "nizhny novgorod", "kazan", "moskva"];
const uaeCities = ["dubai", "abu dhabi", "sharjah", "ajman"];
const iranianCities = ["tehran", "mashhad", "isfahan", "ahvaz", "tabriz", "shiraz", "qom", "karaj"];

const cityMap: Record<string, string[]> = {
  TR: turkishCities,
  DE: germanCities,
  US: usCities,
  RU: russianCities,
  AE: uaeCities,
  IR: iranianCities,
};

function filterByCountry(listings: any[], countryCode: string) {
  if (countryCode === "all") return listings;
  return listings.filter((l) => {
    if (l.country_code) return l.country_code === countryCode;
    const location = ((l.city || "") + " " + (l.district || "")).toLowerCase();
    const cities = cityMap[countryCode] || [];
    return cities.some((c) => location.includes(c));
  });
}

const countries = [
  { code: "all", flag: "🌍", name: { tr: "Tümü", en: "All", fa: "همه", ar: "الكل", de: "Alle", ru: "Все" } },
  { code: "US", flag: "🇺🇸", name: { tr: "Amerika", en: "USA", fa: "آمریکا", ar: "أمريكا", de: "USA", ru: "США" } },
  { code: "TR", flag: "🇹🇷", name: { tr: "Türkiye", en: "Turkey", fa: "ترکیه", ar: "تركيا", de: "Türkei", ru: "Турция" } },
  { code: "DE", flag: "🇩🇪", name: { tr: "Almanya", en: "Germany", fa: "آلمان", ar: "ألمانيا", de: "Deutschland", ru: "Германия" } },
  { code: "RU", flag: "🇷🇺", name: { tr: "Rusya", en: "Russia", fa: "روسیه", ar: "روسيا", de: "Russland", ru: "Россия" } },
  { code: "AE", flag: "🇦🇪", name: { tr: "BAE", en: "UAE", fa: "امارات", ar: "الإمارات", de: "VAE", ru: "ОАЭ" } },
  { code: "GB", flag: "🇬🇧", name: { tr: "İngiltere", en: "UK", fa: "انگلیس", ar: "بريطانيا", de: "UK", ru: "Великобритания" } },
  { code: "FR", flag: "🇫🇷", name: { tr: "Fransa", en: "France", fa: "فرانسه", ar: "فرنسا", de: "Frankreich", ru: "Франция" } },
  { code: "CA", flag: "🇨🇦", name: { tr: "Kanada", en: "Canada", fa: "کانادا", ar: "كندا", de: "Kanada", ru: "Канада" } },
  { code: "IR", flag: "🇮🇷", name: { tr: "İran", en: "Iran", fa: "ایران", ar: "إيران", de: "Iran", ru: "Иран" } },
  { code: "NL", flag: "🇳🇱", name: { tr: "Hollanda", en: "Netherlands", fa: "هلند", ar: "هولندا", de: "Niederlande", ru: "Нидерланды" } },
  { code: "SE", flag: "🇸🇪", name: { tr: "İsveç", en: "Sweden", fa: "سوئد", ar: "السويد", de: "Schweden", ru: "Швеция" } },
];

const allCountries = [
  { code: "AF", flag: "🇦🇫", name: "Afganistan" },
  { code: "AL", flag: "🇦🇱", name: "Arnavutluk" },
  { code: "DZ", flag: "🇩🇿", name: "Cezayir" },
  { code: "AR", flag: "🇦🇷", name: "Arjantin" },
  { code: "AM", flag: "🇦🇲", name: "Ermenistan" },
  { code: "AU", flag: "🇦🇺", name: "Avustralya" },
  { code: "AT", flag: "🇦🇹", name: "Avusturya" },
  { code: "AZ", flag: "🇦🇿", name: "Azerbaycan" },
  { code: "BE", flag: "🇧🇪", name: "Belçika" },
  { code: "BR", flag: "🇧🇷", name: "Brezilya" },
  { code: "BG", flag: "🇧🇬", name: "Bulgaristan" },
  { code: "CN", flag: "🇨🇳", name: "Çin" },
  { code: "CZ", flag: "🇨🇿", name: "Çekya" },
  { code: "DK", flag: "🇩🇰", name: "Danimarka" },
  { code: "EG", flag: "🇪🇬", name: "Mısır" },
  { code: "FI", flag: "🇫🇮", name: "Finlandiya" },
  { code: "GE", flag: "🇬🇪", name: "Gürcistan" },
  { code: "GR", flag: "🇬🇷", name: "Yunanistan" },
  { code: "HU", flag: "🇭🇺", name: "Macaristan" },
  { code: "IN", flag: "🇮🇳", name: "Hindistan" },
  { code: "IQ", flag: "🇮🇶", name: "Irak" },
  { code: "IT", flag: "🇮🇹", name: "İtalya" },
  { code: "JP", flag: "🇯🇵", name: "Japonya" },
  { code: "JO", flag: "🇯🇴", name: "Ürdün" },
  { code: "KZ", flag: "🇰🇿", name: "Kazakistan" },
  { code: "KW", flag: "🇰🇼", name: "Kuveyt" },
  { code: "LB", flag: "🇱🇧", name: "Lübnan" },
  { code: "MY", flag: "🇲🇾", name: "Malezya" },
  { code: "MX", flag: "🇲🇽", name: "Meksika" },
  { code: "MA", flag: "🇲🇦", name: "Fas" },
  { code: "NO", flag: "🇳🇴", name: "Norveç" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "PL", flag: "🇵🇱", name: "Polonya" },
  { code: "PT", flag: "🇵🇹", name: "Portekiz" },
  { code: "QA", flag: "🇶🇦", name: "Katar" },
  { code: "RO", flag: "🇷🇴", name: "Romanya" },
  { code: "SA", flag: "🇸🇦", name: "Suudi Arabistan" },
  { code: "RS", flag: "🇷🇸", name: "Sırbistan" },
  { code: "SY", flag: "🇸🇾", name: "Suriye" },
  { code: "CH", flag: "🇨🇭", name: "İsviçre" },
  { code: "TN", flag: "🇹🇳", name: "Tunus" },
  { code: "UA", flag: "🇺🇦", name: "Ukrayna" },
  { code: "UZ", flag: "🇺🇿", name: "Özbekistan" },
  { code: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "YE", flag: "🇾🇪", name: "Yemen" },
];

const subtitles: Record<Lang, string> = {
  tr: "Dünyanın her yerinden en son ilanlar",
  en: "Latest listings from around the world",
  fa: "آخرین آگهی‌ها از سراسر جهان",
  ar: "أحدث الإعلانات من حول العالم",
  de: "Neueste Anzeigen aus aller Welt",
  ru: "Последние объявления со всего мира",
};

const titles: Record<Lang, string> = {
  tr: "Son İlanlar",
  en: "Latest Listings",
  fa: "آخرین آگهی‌ها",
  ar: "أحدث الإعلانات",
  de: "Neueste Anzeigen",
  ru: "Последние объявления",
};

const fixedCodes = new Set(countries.map((c) => c.code));

export default function LatestListings({ lang = "tr" }: { lang?: Lang }) {
  const [allListings, setAllListings] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [extraPills, setExtraPills] = useState<{ code: string; flag: string; name: string }[]>([]);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("listings")
        .select("id, type, city, district, rent, currency, photos, house_type, rooms, smoking, user_id, country_code")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error || !data || data.length === 0) {
        setAllListings([]);
        setLoading(false);
        return;
      }

      const userIds = data.map((l: any) => l.user_id).filter(Boolean);
      const { data: profiles } = await supabaseClient
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      setAllListings(
        data.map((l: any) => ({
          ...l,
          profile: profiles?.find((p: any) => p.user_id === l.user_id) || null,
        }))
      );
      setLoading(false);
    }
    fetchListings();
  }, []);

  const listings = useMemo(
    () => filterByCountry(allListings, selectedCountry).slice(0, 6),
    [allListings, selectedCountry]
  );

  const filteredModalCountries = useMemo(
    () =>
      allCountries.filter((c) =>
        c.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(modalSearch.toLowerCase())
      ),
    [modalSearch]
  );

  function selectFromModal(country: { code: string; flag: string; name: string }) {
    if (!fixedCodes.has(country.code) && !extraPills.find((p) => p.code === country.code)) {
      setExtraPills((prev) => [...prev, country]);
    }
    setSelectedCountry(country.code);
    setShowCountryModal(false);
    setModalSearch("");
  }

  const pillList = [
    ...countries,
    ...extraPills.map((p) => ({
      code: p.code,
      flag: p.flag,
      name: { tr: p.name, en: p.name, fa: p.name, ar: p.name, de: p.name, ru: p.name } as Record<Lang, string>,
    })),
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 mt-14 mb-14">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2 tracking-tight">
          {titles[lang]}
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">{subtitles[lang]}</p>
      </div>

      {/* Country filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
        {pillList.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCountry(c.code)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              selectedCountry === c.code
                ? "bg-orange-500 text-white shadow-md scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
            }`}
          >
            <span className="text-lg">{c.flag}</span>
            <span>{c.name[lang] || c.name.tr}</span>
          </button>
        ))}

        <button
          onClick={() => setShowCountryModal(true)}
          className="flex items-center gap-1 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
        >
          🌐 + Diğer
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-48" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          {lang === "tr" ? "Bu ülkede ilan yok" :
           lang === "fa" ? "آگهی‌ای در این کشور وجود ندارد" :
           lang === "ar" ? "لا توجد إعلانات في هذا البلد" :
           lang === "de" ? "Keine Anzeigen in diesem Land" :
           lang === "ru" ? "Нет объявлений в этой стране" :
           "No listings in this country"}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="aspect-video bg-gray-100 relative">
                {listing.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.photos[0]}
                    alt={listing.city}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-stone-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {listing.type === "has_place" ? "Ev Sahibi" : "Kiracı"}
                </span>
              </div>

              <div className="p-4">
                <p className="font-bold text-sm text-gray-900">
                  {listing.city}{listing.district ? ` / ${listing.district}` : ""}
                </p>
                {listing.rent && listing.currency && (
                  <p className="text-orange-500 font-bold text-sm mt-1">
                    {listing.rent} {listing.currency}/ay
                  </p>
                )}
                {(listing.house_type || listing.rooms) && (
                  <p className="text-gray-500 text-xs mt-1">
                    {listing.house_type ?? ""}
                    {listing.house_type && listing.rooms ? " • " : ""}
                    {listing.rooms ? `${listing.rooms} oda` : ""}
                  </p>
                )}
                {listing.smoking === false && (
                  <p className="text-gray-400 text-xs mt-1">🚭 Sigara İçilmez</p>
                )}

                {listing.profile?.avatar_url && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.profile.avatar_url}
                      className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                      alt=""
                    />
                    <span className="text-xs text-gray-500 font-medium truncate">
                      {listing.profile.display_name || ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* More countries bottom sheet modal */}
      {showCountryModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowCountryModal(false); setModalSearch(""); } }}
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-900 text-lg">🌍 Ülke Seç</h3>
              <button
                onClick={() => { setShowCountryModal(false); setModalSearch(""); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-3 flex-shrink-0">
              <input
                type="text"
                placeholder="Ülke ara..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                autoFocus
              />
            </div>

            {/* Country grid */}
            <div className="overflow-y-auto px-6 pb-6 flex-1">
              <div className="grid grid-cols-3 gap-2">
                {filteredModalCountries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => selectFromModal(c)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all ${
                      selectedCountry === c.code
                        ? "bg-orange-50 border border-orange-300 text-orange-600"
                        : "bg-gray-50 border border-transparent hover:bg-orange-50 hover:border-orange-200 text-gray-700"
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-xs font-medium leading-tight">{c.name}</span>
                  </button>
                ))}
                {filteredModalCountries.length === 0 && (
                  <p className="col-span-3 text-center text-gray-400 text-sm py-8">Sonuç bulunamadı</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
