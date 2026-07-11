"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useLang } from "@/app/lib/LangContext";
import { getListingSide, getCommercialBadgeLabel, COMMERCIAL_BADGE_CLASS } from "@/app/lib/listingBadge";

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

const pageTitle: Record<Lang, string> = {
  tr: "Kaydettiklerim",
  en: "Saved Listings",
  fa: "آگهی‌های ذخیره‌شده",
  ar: "الإعلانات المحفوظة",
  de: "Gespeicherte Inserate",
  ru: "Сохранённые объявления",
};

const emptyTitle: Record<Lang, string> = {
  tr: "Henüz kaydettiğiniz ilan yok",
  en: "No saved listings yet",
  fa: "هنوز آگهی ذخیره نشده",
  ar: "لا إعلانات محفوظة بعد",
  de: "Keine gespeicherten Inserate",
  ru: "Нет сохранённых объявлений",
};

const emptySubtitle: Record<Lang, string> = {
  tr: "Beğendiğiniz ilanları kaydedin, burada görün",
  en: "Save listings you like, find them here",
  fa: "آگهی‌های موردعلاقه را ذخیره کنید",
  ar: "احفظ الإعلانات التي تعجبك وجدها هنا",
  de: "Speichern Sie Inserate, die Ihnen gefallen",
  ru: "Сохраняйте понравившиеся объявления",
};

const browseCta: Record<Lang, string> = {
  tr: "İlanlara Göz At",
  en: "Browse Listings",
  fa: "مرور آگهی‌ها",
  ar: "تصفح الإعلانات",
  de: "Inserate durchsuchen",
  ru: "Просмотр объявлений",
};

const removeLabel: Record<Lang, string> = {
  tr: "× Kaldır",
  en: "× Remove",
  fa: "× حذف",
  ar: "× إزالة",
  de: "× Entfernen",
  ru: "× Удалить",
};

const viewDetail: Record<Lang, string> = {
  tr: "Detayı Gör →",
  en: "View Details →",
  fa: "مشاهده →",
  ar: "عرض التفاصيل →",
  de: "Details →",
  ru: "Подробнее →",
};

const countLabel: Record<Lang, string> = {
  tr: "ilan",
  en: "listings",
  fa: "آگهی",
  ar: "إعلان",
  de: "Inserate",
  ru: "объявл.",
};

const listingTypeTrans: Record<string, Record<string, string>> = {
  has_place: { tr: "Ev Sahibi", en: "Host", fa: "صاحب‌خانه", ar: "صاحب المنزل", de: "Vermieter", ru: "Арендодатель" },
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
  user_id: string | null;
  listing_category: string | null;
  has_place: boolean | null;
  needs_place: boolean | null;
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
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});

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
      .select("id, type, city, country_code, rent, max_budget, currency, photos, house_type, rooms, seeker_age, occupation, user_id, listing_category, has_place, needs_place")
      .in("id", ids)
      .then(async ({ data }) => {
        const fetched = (data as SavedListing[]) ?? [];
        setListings(fetched);

        const needsPlaceUserIds = fetched
          .filter((item) => getListingSide(item) === "needs_place")
          .map((item) => item.user_id)
          .filter(Boolean) as string[];

        if (needsPlaceUserIds.length > 0) {
          const { data: avatars } = await supabase
            .from("profiles")
            .select("user_id, avatar_url")
            .in("user_id", needsPlaceUserIds);

          if (avatars) {
            const map: Record<string, string> = {};
            for (const a of avatars) {
              if (a.user_id && a.avatar_url) map[a.user_id] = a.avatar_url;
            }
            setAvatarMap(map);
          }
        }

        setLoading(false);
      });
  }, []);

  function remove(id: string) {
    const next = savedIds.filter((x) => x !== id);
    setSavedIds(next);
    setListings((prev) => prev.filter((item) => item.id !== id));
    try { localStorage.setItem("sefira-saved", JSON.stringify(next)); } catch { /* ignore */ }
  }

  const isRtl = l === "fa" || l === "ar";

  return (
    <div className="min-h-screen bg-stone-50" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-bold text-gray-900 text-lg flex-1">{pageTitle[l] ?? pageTitle.en}</h1>
        {listings.length > 0 && (
          <span className="bg-orange-100 text-orange-700 text-xs rounded-full px-2 py-1 font-medium">
            {listings.length} {countLabel[l] ?? countLabel.en}
          </span>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-stone-200 rounded-2xl aspect-square" />
            ))}
          </div>
        ) : savedIds.length === 0 || listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="text-6xl">🔖</span>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-lg">{emptyTitle[l] ?? emptyTitle.en}</p>
              <p className="text-gray-500 text-sm mt-1">{emptySubtitle[l] ?? emptySubtitle.en}</p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              {browseCta[l] ?? browseCta.en}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((listing) => {
              const avatarUrl =
                getListingSide(listing) === "needs_place" && listing.user_id
                  ? avatarMap[listing.user_id]
                  : null;

              return (
                <div
                  key={listing.id}
                  className="rounded-2xl shadow-sm border border-stone-100 overflow-hidden bg-white"
                >
                  {/* Image area */}
                  <div className="aspect-square relative">
                    {listing.type === "has_place" ? (
                      listing.photos?.[0] ? (
                        <Image src={listing.photos[0]} alt={listing.city} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-stone-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                          </svg>
                        </div>
                      )
                    ) : avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={listing.city} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="white" className="w-12 h-12 opacity-80">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>
                    )}

                    {/* Type badge */}
                    {(() => {
                      const side = getListingSide(listing);
                      if (!side) return null;
                      const isCommercial = listing.listing_category === "commercial";
                      const label = isCommercial
                        ? getCommercialBadgeLabel(side, lang as "tr" | "en" | "fa" | "ar" | "de" | "ru")
                        : listingTypeTrans[side]?.[lang] || side;
                      const colorClass = isCommercial
                        ? COMMERCIAL_BADGE_CLASS[side]
                        : side === "has_place" ? "bg-emerald-500" : "bg-blue-500";
                      return (
                        <span className={`absolute top-2 start-2 text-white text-xs px-2 py-1 rounded-full font-medium ${colorClass}`}>
                          {label}
                        </span>
                      );
                    })()}

                    {/* Remove button */}
                    <button
                      onClick={() => remove(listing.id)}
                      className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded-full hover:bg-black/70 transition-colors"
                    >
                      {removeLabel[l] ?? removeLabel.en}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-sm">{countryFlag(listing.country_code)}</span>
                      <p className="font-bold text-sm text-gray-900 truncate">{listing.city}</p>
                    </div>

                    {listing.type === "has_place" ? (
                      <>
                        {listing.rent && listing.currency && (
                          <p className="text-orange-600 font-bold text-sm">
                            {listing.rent} {listing.currency}/ay
                          </p>
                        )}
                        {(listing.house_type || listing.rooms) && (
                          <p className="text-stone-500 text-xs mt-0.5">
                            {[listing.house_type, listing.rooms ? `${listing.rooms} oda` : null].filter(Boolean).join(" • ")}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {listing.max_budget && listing.currency && (
                          <p className="text-orange-600 font-bold text-sm">
                            Max: {listing.max_budget} {listing.currency}/ay
                          </p>
                        )}
                        {(listing.seeker_age || listing.occupation) && (
                          <p className="text-stone-500 text-xs mt-0.5">
                            {[listing.seeker_age, listing.occupation].filter(Boolean).join(" • ")}
                          </p>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => {
                        try { sessionStorage.setItem("sefira-scroll", String(window.scrollY)); } catch { /* ignore */ }
                        router.push(`/listings/${listing.id}`);
                      }}
                      className="text-orange-600 text-xs font-medium mt-1.5 block"
                    >
                      {viewDetail[l] ?? viewDetail.en}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
