"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useLang } from "@/app/lib/LangContext";

const supabase = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI"
);

type Filter = "all" | "listings" | "users";

interface Listing {
  id: string;
  title: string;
  city: string;
  price: number | null;
  listing_type: "has_place" | "needs_place";
  photos: string[] | null;
}

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  country: string | null;
}

const translations = {
  tr: {
    title: "Arama",
    placeholder: "Şehir, isim veya ilan ara...",
    filterAll: "Tümü",
    filterListings: "İlanlar",
    filterUsers: "Kullanıcılar",
    sectionListings: "İLANLAR",
    sectionUsers: "KULLANICILAR",
    emptySubtitle: "Şehir, isim veya ilan ara",
    noResults: "Sonuç bulunamadı",
    hasPlace: "Oda Var",
    needsPlace: "Oda Arıyor",
  },
  en: {
    title: "Search",
    placeholder: "Search city, name or listing...",
    filterAll: "All",
    filterListings: "Listings",
    filterUsers: "Users",
    sectionListings: "LISTINGS",
    sectionUsers: "USERS",
    emptySubtitle: "Search city, name or listing",
    noResults: "No results found",
    hasPlace: "Has Place",
    needsPlace: "Needs Place",
  },
  fa: {
    title: "جستجو",
    placeholder: "جستجوی شهر، نام یا آگهی...",
    filterAll: "همه",
    filterListings: "آگهی‌ها",
    filterUsers: "کاربران",
    sectionListings: "آگهی‌ها",
    sectionUsers: "کاربران",
    emptySubtitle: "شهر، اسم، آگهی جستجو کن",
    noResults: "نتیجه‌ای یافت نشد",
    hasPlace: "جا دارم",
    needsPlace: "جا می‌خوام",
  },
  ar: {
    title: "بحث",
    placeholder: "ابحث عن مدينة أو اسم أو إعلان...",
    filterAll: "الكل",
    filterListings: "الإعلانات",
    filterUsers: "المستخدمون",
    sectionListings: "الإعلانات",
    sectionUsers: "المستخدمون",
    emptySubtitle: "ابحث عن مدينة أو اسم أو إعلان",
    noResults: "لا توجد نتائج",
    hasPlace: "لدي مكان",
    needsPlace: "أبحث عن مكان",
  },
  de: {
    title: "Suche",
    placeholder: "Stadt, Name oder Inserat suchen...",
    filterAll: "Alle",
    filterListings: "Inserate",
    filterUsers: "Benutzer",
    sectionListings: "INSERATE",
    sectionUsers: "BENUTZER",
    emptySubtitle: "Stadt, Name oder Inserat suchen",
    noResults: "Keine Ergebnisse gefunden",
    hasPlace: "Platz vorhanden",
    needsPlace: "Suche Platz",
  },
  ru: {
    title: "Поиск",
    placeholder: "Поиск города, имени или объявления...",
    filterAll: "Все",
    filterListings: "Объявления",
    filterUsers: "Пользователи",
    sectionListings: "ОБЪЯВЛЕНИЯ",
    sectionUsers: "ПОЛЬЗОВАТЕЛИ",
    emptySubtitle: "Искать город, имя или объявление",
    noResults: "Ничего не найдено",
    hasPlace: "Есть место",
    needsPlace: "Ищет место",
  },
};

export default function SearchPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];
  const isRTL = lang === "ar" || lang === "fa";

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setListings([]);
      setUsers([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSearched(false);

    const timeout = setTimeout(async () => {
      const q = query.trim();

      if (filter === "all" || filter === "listings") {
        const [{ data: byTitle }, { data: byCity }] = await Promise.all([
          supabase
            .from("listings")
            .select("id, title, city, price, listing_type, photos")
            .ilike("title", `%${q}%`)
            .limit(10),
          supabase
            .from("listings")
            .select("id, title, city, price, listing_type, photos")
            .ilike("city", `%${q}%`)
            .limit(10),
        ]);
        const seen = new Set();
        const listingResults = [...(byTitle || []), ...(byCity || [])].filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setListings(listingResults as Listing[]);
      } else {
        setListings([]);
      }

      if (filter === "all" || filter === "users") {
        const { data } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, country")
          .ilike("display_name", `%${q}%`)
          .limit(8);
        setUsers((data as Profile[]) ?? []);
      } else {
        setUsers([]);
      }
      setLoading(false);
      setSearched(true);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, filter]);

  const hasResults = listings.length > 0 || users.length > 0;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100dvh", backgroundColor: "white" }}>
      {/* Sticky top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
          borderBottom: "1px solid #f3f4f6",
          padding: "12px 16px 14px",
        }}
      >
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#f3f4f6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#374151"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={18}
              height={18}
            >
              {isRTL ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>{t.title}</span>
        </div>

        {/* Search input */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              ...(isRTL ? { right: 14 } : { left: 14 }),
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#9ca3af",
              display: "flex",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={18}
              height={18}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            dir={isRTL ? "rtl" : "ltr"}
            style={{
              width: "100%",
              boxSizing: "border-box",
              paddingTop: 13,
              paddingBottom: 13,
              ...(isRTL
                ? { paddingRight: 44, paddingLeft: 16 }
                : { paddingLeft: 44, paddingRight: 16 }),
              borderRadius: 16,
              border: "2px solid #e5e7eb",
              fontSize: 15,
              outline: "none",
              backgroundColor: "#f9fafb",
              color: "#111827",
              transition: "border-color 0.15s, background-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#f97316";
              e.currentTarget.style.backgroundColor = "white";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.backgroundColor = "#f9fafb";
            }}
          />
        </div>

        {/* Filter chips */}
        <div
          className="search-filter-chips"
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <style>{`.search-filter-chips::-webkit-scrollbar { display: none; }`}</style>
          {(["all", "listings", "users"] as Filter[]).map((f) => {
            const label =
              f === "all" ? t.filterAll : f === "listings" ? t.filterListings : t.filterUsers;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  flexShrink: 0,
                  padding: "7px 18px",
                  borderRadius: 9999,
                  border: "none",
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  backgroundColor: active ? "#f97316" : "#f3f4f6",
                  color: active ? "white" : "#374151",
                  boxShadow: active ? "0 2px 8px rgba(249,115,22,0.35)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: "16px 16px 32px" }}>
        {/* Loading skeleton */}
        {loading && (
          <>
            <style>{`
              @keyframes searchPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.35; }
              }
            `}</style>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      backgroundColor: "#e5e7eb",
                      flexShrink: 0,
                      animation: `searchPulse 1.5s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div
                      style={{
                        height: 15,
                        borderRadius: 8,
                        backgroundColor: "#e5e7eb",
                        width: "65%",
                        animation: `searchPulse 1.5s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                    <div
                      style={{
                        height: 12,
                        borderRadius: 8,
                        backgroundColor: "#e5e7eb",
                        width: "40%",
                        animation: `searchPulse 1.5s ease-in-out ${i * 0.15 + 0.1}s infinite`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state — before typing */}
        {!loading && !query.trim() && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 80,
              gap: 14,
            }}
          >
            <span style={{ fontSize: 64, lineHeight: 1, filter: "grayscale(1) opacity(0.35)" }}>
              🔍
            </span>
            <p style={{ color: "#9ca3af", fontSize: 15, margin: 0, textAlign: "center" }}>
              {t.emptySubtitle}
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && searched && !hasResults && query.trim() && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 80,
              gap: 10,
            }}
          >
            <span style={{ fontSize: 52, filter: "grayscale(1) opacity(0.3)" }}>🔍</span>
            <p style={{ color: "#111827", fontWeight: 600, fontSize: 16, margin: 0 }}>
              {t.noResults}
            </p>
            <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>"{query}"</p>
          </div>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <>
            {/* Listings section */}
            {listings.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                {filter === "all" && (
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#9ca3af",
                      letterSpacing: "0.08em",
                      margin: "0 0 10px",
                    }}
                  >
                    {t.sectionListings}
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {listings.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => router.push(`/listings/${item.id}`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        borderRadius: 16,
                        border: "1px solid #f3f4f6",
                        backgroundColor: "white",
                        cursor: "pointer",
                        textAlign: isRTL ? "right" : "left",
                        width: "100%",
                        transition: "background-color 0.1s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fffbf7";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                      }}
                    >
                      {/* Thumbnail */}
                      {item.photos && item.photos[0] ? (
                        <img
                          src={item.photos[0]}
                          alt={item.title}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 12,
                            objectFit: "cover",
                            flexShrink: 0,
                            backgroundColor: "#f3f4f6",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 12,
                            backgroundColor: "#f3f4f6",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#d1d5db"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width={24}
                            height={24}
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#111827",
                            margin: "0 0 3px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.title}
                        </p>
                        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 5px" }}>
                          {[item.city, item.price ? String(item.price) : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 9999,
                            backgroundColor:
                              item.listing_type === "has_place" ? "#fff7ed" : "#eff6ff",
                            color:
                              item.listing_type === "has_place" ? "#c2410c" : "#1d4ed8",
                          }}
                        >
                          {item.listing_type === "has_place" ? t.hasPlace : t.needsPlace}
                        </span>
                      </div>
                      <span
                        style={{
                          color: "#d1d5db",
                          fontSize: 20,
                          flexShrink: 0,
                          transform: isRTL ? "scaleX(-1)" : "none",
                        }}
                      >
                        ›
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Users section */}
            {users.length > 0 && (
              <div>
                {filter === "all" && listings.length > 0 && (
                  <div style={{ height: 1, backgroundColor: "#f3f4f6", margin: "0 0 20px" }} />
                )}
                {filter === "all" && (
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#9ca3af",
                      letterSpacing: "0.08em",
                      margin: "0 0 10px",
                    }}
                  >
                    {t.sectionUsers}
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {users.map((profile) => (
                    <button
                      key={profile.user_id}
                      onClick={() => router.push(`/profile/${profile.user_id}`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        borderRadius: 16,
                        border: "1px solid #f3f4f6",
                        backgroundColor: "white",
                        cursor: "pointer",
                        textAlign: isRTL ? "right" : "left",
                        width: "100%",
                        transition: "background-color 0.1s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fffbf7";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                      }}
                    >
                      {/* Avatar */}
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.display_name}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            backgroundColor: "#e5e7eb",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 18,
                            color: "#6b7280",
                          }}
                        >
                          {(profile.display_name ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#111827",
                            margin: "0 0 2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {profile.display_name}
                        </p>
                        {profile.country && (
                          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                            {profile.country}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          color: "#d1d5db",
                          fontSize: 20,
                          flexShrink: 0,
                          transform: isRTL ? "scaleX(-1)" : "none",
                        }}
                      >
                        ›
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
