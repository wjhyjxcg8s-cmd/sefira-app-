"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useLang } from "@/app/lib/LangContext";

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

const pageTitle: Record<Lang, string> = {
  tr: "Kaydettiklerim",
  en: "Saved Listings",
  fa: "آگهی‌های ذخیره‌شده",
  ar: "الإعلانات المحفوظة",
  de: "Gespeicherte Inserate",
  ru: "Сохранённые объявления",
};

const emptyMsg: Record<Lang, string> = {
  tr: "Henüz kaydettiğiniz ilan yok",
  en: "No saved listings yet",
  fa: "هنوز آگهی ذخیره نشده",
  ar: "لا إعلانات محفوظة بعد",
  de: "Keine gespeicherten Inserate",
  ru: "Нет сохранённых объявлений",
};

const removeLabel: Record<Lang, string> = {
  tr: "× Kaldır",
  en: "× Remove",
  fa: "× حذف",
  ar: "× إزالة",
  de: "× Entfernen",
  ru: "× Удалить",
};

const listingTypeTrans: Record<string, Record<string, string>> = {
  has_place: { tr: "Ev Sahibi", en: "Host", fa: "صاحب‌خانه", ar: "المضيف", de: "Vermieter", ru: "Владелец" },
  needs_place: { tr: "Kiracı", en: "Tenant", fa: "مستأجر", ar: "مستأجر", de: "Mieter", ru: "Арендатор" },
};

interface SavedListing {
  id: string;
  type: string;
  city: string;
  country_code: string | null;
  rent: number | null;
  max_budget: number | null;
  currency: string | null;
  photos: string[] | null;
  house_type: string | null;
  rooms: number | null;
  seeker_age: string | null;
  occupation: string | null;
}

function countryFlag(code: string | null) {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
}

export default function SavedPage() {
  const router = useRouter();
  const { lang } = useLang();
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const l = lang as Lang;

  useEffect(() => {
    let ids: string[] = [];
    try {
      const raw = localStorage.getItem("sefira-saved");
      if (raw) ids = JSON.parse(raw);
    } catch { /* ignore */ }
    setSavedIds(ids);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    supabase
      .from("listings")
      .select("id, type, city, country_code, rent, max_budget, currency, photos, house_type, rooms, seeker_age, occupation")
      .in("id", ids)
      .then(({ data }) => {
        setListings((data as SavedListing[]) ?? []);
        setLoading(false);
      });
  }, []);

  function remove(id: string) {
    const next = savedIds.filter((x) => x !== id);
    setSavedIds(next);
    setListings((prev) => prev.filter((item) => item.id !== id));
    try { localStorage.setItem("sefira-saved", JSON.stringify(next)); } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-bold text-gray-900 text-lg">{pageTitle[l] ?? pageTitle.en}</h1>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-48" />
            ))}
          </div>
        ) : savedIds.length === 0 || listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl">🔖</span>
            <p className="text-gray-500 font-medium text-center">{emptyMsg[l] ?? emptyMsg.en}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow relative"
              >
                {/* Remove button */}
                <button
                  onClick={() => remove(listing.id)}
                  className="absolute top-2 right-2 z-10 text-xs bg-black/40 text-white px-2 py-1 rounded-full hover:bg-black/60 transition-colors backdrop-blur-sm"
                >
                  {removeLabel[l] ?? removeLabel.en}
                </button>

                <div
                  className="cursor-pointer"
                  onClick={() => {
                    try { sessionStorage.setItem("sefira-scroll", String(window.scrollY)); } catch { /* ignore */ }
                    router.push(`/listings/${listing.id}`);
                  }}
                >
                  {/* Photo area */}
                  <div className="aspect-video bg-gray-100 relative">
                    {listing.photos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.photos[0]} alt={listing.city} className="w-full h-full object-cover" />
                    ) : listing.type === "needs_place" ? (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="white" className="w-12 h-12 opacity-80">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-stone-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full font-medium ${listing.type === "has_place" ? "bg-emerald-500" : "bg-blue-500"}`}>
                      {listingTypeTrans[listing.type]?.[lang] || listing.type}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{countryFlag(listing.country_code)}</span>
                      <p className="font-bold text-sm text-gray-900 truncate">{listing.city}</p>
                    </div>

                    {listing.type === "has_place" ? (
                      <>
                        {listing.rent && listing.currency && (
                          <p className="text-orange-500 font-bold text-sm mt-1">
                            {listing.rent} {listing.currency}/ay
                          </p>
                        )}
                        {(listing.house_type || listing.rooms) && (
                          <p className="text-gray-500 text-xs mt-1">
                            {[listing.house_type, listing.rooms ? `${listing.rooms} oda` : null].filter(Boolean).join(" • ")}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {listing.max_budget && listing.currency && (
                          <p className="text-orange-500 font-bold text-sm mt-1">
                            Max: {listing.max_budget} {listing.currency}/ay
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {listing.seeker_age && (
                            <span className="text-gray-500 text-xs">{listing.seeker_age}</span>
                          )}
                          {listing.occupation && (
                            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                              {listing.occupation}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
