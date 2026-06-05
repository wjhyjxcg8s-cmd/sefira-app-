"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI"
);

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

const labels: Record<Lang, Record<string, string>> = {
  tr: {
    contact: "Mesaj Gönder",
    ownListing: "Bu sizin ilanınız",
    loginPrompt: "Mesaj için giriş yap →",
    description: "Açıklama",
    preferences: "Tercihler",
    memberSince: "Üye",
    age: "yaşında",
    verified: "Onaylı",
    ownerBadge: "Ev Sahibi",
    tenantBadge: "Kiracı Arıyor",
    perMonth: "/ ay",
  },
  en: {
    contact: "Send Message",
    ownListing: "This is your listing",
    loginPrompt: "Login to message →",
    description: "Description",
    preferences: "Preferences",
    memberSince: "Member since",
    age: "years old",
    verified: "Verified",
    ownerBadge: "Has Place",
    tenantBadge: "Looking for Tenant",
    perMonth: "/ mo",
  },
  fa: {
    contact: "ارسال پیام",
    ownListing: "این آگهی شماست",
    loginPrompt: "برای پیام وارد شوید ←",
    description: "توضیحات",
    preferences: "ترجیحات",
    memberSince: "عضو از",
    age: "ساله",
    verified: "تأیید شده",
    ownerBadge: "صاحب خانه",
    tenantBadge: "دنبال مستأجر",
    perMonth: "/ ماه",
  },
  ar: {
    contact: "إرسال رسالة",
    ownListing: "هذا إعلانك",
    loginPrompt: "سجل دخولك للرسائل ←",
    description: "الوصف",
    preferences: "التفضيلات",
    memberSince: "عضو منذ",
    age: "سنة",
    verified: "موثق",
    ownerBadge: "لديه مكان",
    tenantBadge: "يبحث عن مستأجر",
    perMonth: "/ شهر",
  },
  de: {
    contact: "Nachricht senden",
    ownListing: "Das ist Ihre Anzeige",
    loginPrompt: "Einloggen zum Schreiben →",
    description: "Beschreibung",
    preferences: "Präferenzen",
    memberSince: "Mitglied seit",
    age: "Jahre alt",
    verified: "Verifiziert",
    ownerBadge: "Hat Platz",
    tenantBadge: "Sucht Mieter",
    perMonth: "/ Mo.",
  },
  ru: {
    contact: "Отправить сообщение",
    ownListing: "Это ваше объявление",
    loginPrompt: "Войдите, чтобы написать →",
    description: "Описание",
    preferences: "Предпочтения",
    memberSince: "Участник с",
    age: "лет",
    verified: "Подтверждён",
    ownerBadge: "Есть жильё",
    tenantBadge: "Ищет жильца",
    perMonth: "/ мес.",
  },
};

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateStr: string, lang: Lang): string {
  try {
    return new Date(dateStr).toLocaleDateString(
      lang === "tr" ? "tr-TR" :
      lang === "fa" ? "fa-IR" :
      lang === "ar" ? "ar-SA" :
      lang === "de" ? "de-DE" :
      lang === "ru" ? "ru-RU" : "en-US",
      { year: "numeric", month: "long" }
    );
  } catch {
    return dateStr;
  }
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [listing, setListing] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lang, setLang] = useState<Lang>("tr");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && labels[saved]) setLang(saved);
  }, []);

  useEffect(() => {
    async function load() {
      const id = String(params?.id ?? "");
      console.log("Loading listing id:", id);

      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Step 1: fetch listing alone — no JOIN so a missing profile can't break it
      const { data: listingData, error: listingErr } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      console.log("Listing data:", listingData);
      console.log("Listing error:", listingErr);

      if (listingData) {
        setListing(listingData);

        // Step 2: fetch profile separately — failure is non-fatal
        if (listingData.user_id) {
          const { data: profileData, error: profileErr } = await supabase
            .from("profiles")
            .select("display_name, avatar_url, gender, birth_date, country, created_at")
            .eq("user_id", listingData.user_id)
            .maybeSingle();
          console.log("Profile data:", profileData);
          console.log("Profile error:", profileErr);
          setProfile(profileData ?? null);
        }
      }

      setLoading(false);
    }

    load();
  }, [params]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id ?? null);
    });
  }, []);

  const t = labels[lang];
  const isLoggedIn = !!currentUserId;
  const isOwner = isLoggedIn && listing && currentUserId === listing.user_id;
  const photos: string[] = listing?.photos ?? [];

  function handleSendMessage() {
    router.push(`/messages?userId=${listing.user_id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-4xl mb-3">🏚️</p>
          <p className="text-gray-500">İlan bulunamadı</p>
          <button onClick={() => router.push("/")} className="mt-4 text-orange-500 underline text-sm">
            Geri dön
          </button>
        </div>
      </div>
    );
  }

  const age = calcAge(profile?.birth_date ?? null);
  const genderEmoji =
    profile?.gender === "male" || profile?.gender === "erkek" ? "👨"
    : profile?.gender === "female" || profile?.gender === "kadın" || profile?.gender === "kadin" ? "👩"
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-lg"
        >
          ←
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xl"
        >
          ⋯
        </button>
      </div>

      {/* Photo gallery */}
      {photos.length > 0 ? (
        <div className="bg-black">
          <div className="aspect-video w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[activePhoto]}
              alt={listing.city ?? ""}
              className="w-full h-full object-cover"
            />
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 p-2 overflow-x-auto bg-black">
              {photos.map((p: string, i: number) => (
                <button key={i} onClick={() => setActivePhoto(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p}
                    alt=""
                    className={`w-16 h-12 object-cover rounded-lg border-2 transition-all ${
                      i === activePhoto ? "border-orange-400" : "border-transparent opacity-60"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-stone-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
      )}

      {/* Listing info card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold text-white ${
            listing.type === "has_place" ? "bg-emerald-500" : "bg-blue-500"
          }`}>
            {listing.type === "has_place" ? t.ownerBadge : t.tenantBadge}
          </span>
        </div>

        <h1 className="text-xl font-black text-gray-900">
          {listing.city ?? ""}{listing.district ? ` / ${listing.district}` : ""}
        </h1>

        {listing.country_code && (
          <p className="text-sm text-gray-400 mt-0.5">{listing.country_code}</p>
        )}

        {listing.rent && listing.currency && (
          <p className="text-3xl font-black text-orange-500 mt-3">
            {Number(listing.rent).toLocaleString()} {listing.currency}
            <span className="text-base font-normal text-gray-400 ml-1">{t.perMonth}</span>
          </p>
        )}

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 text-sm text-gray-600">
          {listing.house_type && (
            <div className="flex items-center gap-2">
              <span>🏠</span>
              <span>{listing.house_type}</span>
            </div>
          )}
          {listing.rooms && (
            <div className="flex items-center gap-2">
              <span>🛏</span>
              <span>{listing.rooms} oda</span>
            </div>
          )}
          {listing.parking != null && (
            <div className="flex items-center gap-2">
              <span>🚗</span>
              <span>{listing.parking ? "Otopark var" : "Otopark yok"}</span>
            </div>
          )}
          {listing.elevator != null && (
            <div className="flex items-center gap-2">
              <span>🛗</span>
              <span>{listing.elevator ? "Asansör var" : "Asansör yok"}</span>
            </div>
          )}
          {listing.furnished != null && (
            <div className="flex items-center gap-2">
              <span>🪑</span>
              <span>{listing.furnished ? "Eşyalı" : "Eşyasız"}</span>
            </div>
          )}
          {listing.smoking != null && (
            <div className="flex items-center gap-2">
              <span>🚬</span>
              <span>{listing.smoking ? "Sigara serbest" : "Sigara yasak"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Owner profile card */}
      {profile && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-orange-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
                {(profile.display_name ?? "?")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900 truncate">{profile.display_name ?? "—"}</span>
                {profile.avatar_url && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                    ✓ {t.verified}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                {genderEmoji && <span>{genderEmoji}</span>}
                {age !== null && <span>{age} {t.age}</span>}
                {profile.country && <span>· {profile.country}</span>}
              </div>
              {profile.created_at && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.memberSince} {formatDate(profile.created_at, lang)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {listing.description && (
        <div className="mx-4 mt-4 bg-gray-50 rounded-2xl p-4">
          <h3 className="font-bold mb-2 text-gray-800">📝 {t.description}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
        </div>
      )}

      {/* Preferences */}
      {(listing.preferred_gender || listing.preferred_occupation) && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-md p-4">
          <h3 className="font-bold mb-3 text-gray-800">✨ {t.preferences}</h3>
          <div className="flex gap-2 flex-wrap">
            {listing.preferred_gender && (
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                👤 {listing.preferred_gender}
              </span>
            )}
            {listing.preferred_occupation && (
              <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm">
                💼 {listing.preferred_occupation}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Fixed contact button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg z-20">
        {isOwner ? (
          <button className="w-full py-4 rounded-2xl bg-gray-200 text-gray-500 font-bold text-lg">
            {t.ownListing}
          </button>
        ) : isLoggedIn ? (
          <button
            onClick={handleSendMessage}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
          >
            💬 {t.contact}
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-lg"
          >
            {t.loginPrompt}
          </button>
        )}
      </div>
    </div>
  );
}
