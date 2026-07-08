"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/app/lib/LangContext";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AuthModal from "@/app/components/AuthModal";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    tenantBadge: "Kiracı",
    perMonth: "/ ay",
    elevatorOwnerOn: "Asansör var", elevatorOwnerOff: "Asansör yok", elevatorSeekerOn: "Asansör istiyor",
    furnishedOwnerOn: "Eşyalı", furnishedOwnerOff: "Eşyasız", furnishedSeekerOn: "Eşyalı istiyor",
    parkingOwnerOn: "Otopark var", parkingOwnerOff: "Otopark yok", parkingSeekerOn: "Otopark istiyor",
    smokingOwnerOn: "Sigara serbest", smokingOwnerOff: "Sigara yasak",
    smokingSeekerOn: "Sigara içilebilir yer arıyor", smokingSeekerOff: "Sigara içilmeyen yer istiyor",
    budget: "Bütçe", ageLabel: "Yaş", gender: "Cinsiyet", occupation: "Meslek",
    wantsPrivateRoom: "Özel oda istiyor", maxPrefix: "Maks",
    seekerBadge: "Ev Arıyor", roomType: "Oda Tipi", privateRoomYes: "Özel Oda", privateRoomAny: "Fark Etmez",
    genderPref: "Ev Arkadaşı Tercihi", aboutTitle: "İstek Hakkında",
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
    ownerBadge: "Host",
    tenantBadge: "Tenant",
    perMonth: "/ mo",
    elevatorOwnerOn: "Has elevator", elevatorOwnerOff: "No elevator", elevatorSeekerOn: "Wants elevator",
    furnishedOwnerOn: "Furnished", furnishedOwnerOff: "Unfurnished", furnishedSeekerOn: "Wants furnished",
    parkingOwnerOn: "Has parking", parkingOwnerOff: "No parking", parkingSeekerOn: "Wants parking",
    smokingOwnerOn: "Smoking allowed", smokingOwnerOff: "No smoking",
    smokingSeekerOn: "Ok with smoking", smokingSeekerOff: "Wants non-smoking place",
    budget: "Budget", ageLabel: "Age", gender: "Gender", occupation: "Occupation",
    wantsPrivateRoom: "Wants private room", maxPrefix: "Max",
    seekerBadge: "Seeker", roomType: "Room Type", privateRoomYes: "Private Room", privateRoomAny: "Doesn't matter",
    genderPref: "Roommate Preference", aboutTitle: "About the Request",
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
    ownerBadge: "صاحب‌خانه",
    tenantBadge: "مستأجر",
    perMonth: "/ ماه",
    elevatorOwnerOn: "دارای آسانسور", elevatorOwnerOff: "بدون آسانسور", elevatorSeekerOn: "آسانسور داشته باشد",
    furnishedOwnerOn: "مبله", furnishedOwnerOff: "بدون مبلمان", furnishedSeekerOn: "مبله باشد",
    parkingOwnerOn: "دارای پارکینگ", parkingOwnerOff: "بدون پارکینگ", parkingSeekerOn: "پارکینگ داشته باشد",
    smokingOwnerOn: "سیگار آزاد", smokingOwnerOff: "سیگار ممنوع",
    smokingSeekerOn: "با سیگار مشکلی ندارد", smokingSeekerOff: "محیط بدون سیگار می‌خواهد",
    budget: "بودجه", ageLabel: "سن", gender: "جنسیت", occupation: "شغل",
    wantsPrivateRoom: "اتاق خصوصی می‌خواهد", maxPrefix: "حداکثر",
    seekerBadge: "دنبال فضا", roomType: "نوع فضا", privateRoomYes: "اتاق خصوصی", privateRoomAny: "مهم نیست",
    genderPref: "ترجیح هم‌خانه", aboutTitle: "درباره درخواست",
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
    ownerBadge: "صاحب المنزل",
    tenantBadge: "مستأجر",
    perMonth: "/ شهر",
    elevatorOwnerOn: "يوجد مصعد", elevatorOwnerOff: "لا يوجد مصعد", elevatorSeekerOn: "يريد مصعداً",
    furnishedOwnerOn: "مفروش", furnishedOwnerOff: "غير مفروش", furnishedSeekerOn: "يريد مفروشاً",
    parkingOwnerOn: "يوجد موقف", parkingOwnerOff: "لا يوجد موقف", parkingSeekerOn: "يريد موقفاً",
    smokingOwnerOn: "التدخين مسموح", smokingOwnerOff: "ممنوع التدخين",
    smokingSeekerOn: "لا مانع من التدخين", smokingSeekerOff: "يريد مكاناً خالياً من التدخين",
    budget: "الميزانية", ageLabel: "العمر", gender: "الجنس", occupation: "المهنة",
    wantsPrivateRoom: "يريد غرفة خاصة", maxPrefix: "الحد الأقصى",
    seekerBadge: "يبحث عن سكن", roomType: "نوع الغرفة", privateRoomYes: "غرفة خاصة", privateRoomAny: "لا يهم",
    genderPref: "تفضيل شريك السكن", aboutTitle: "عن الطلب",
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
    ownerBadge: "Vermieter",
    tenantBadge: "Mieter",
    perMonth: "/ Mo.",
    elevatorOwnerOn: "Mit Aufzug", elevatorOwnerOff: "Kein Aufzug", elevatorSeekerOn: "Möchte Aufzug",
    furnishedOwnerOn: "Möbliert", furnishedOwnerOff: "Unmöbliert", furnishedSeekerOn: "Möchte möbliert",
    parkingOwnerOn: "Mit Parkplatz", parkingOwnerOff: "Kein Parkplatz", parkingSeekerOn: "Möchte Parkplatz",
    smokingOwnerOn: "Rauchen erlaubt", smokingOwnerOff: "Rauchen verboten",
    smokingSeekerOn: "Raucher ok", smokingSeekerOff: "Möchte Nichtraucher-Unterkunft",
    budget: "Budget", ageLabel: "Alter", gender: "Geschlecht", occupation: "Beruf",
    wantsPrivateRoom: "Möchte Privatzimmer", maxPrefix: "Max",
    seekerBadge: "Suchend", roomType: "Zimmerart", privateRoomYes: "Privatzimmer", privateRoomAny: "Egal",
    genderPref: "Mitbewohner-Präferenz", aboutTitle: "Über die Anfrage",
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
    ownerBadge: "Арендодатель",
    tenantBadge: "Арендатор",
    perMonth: "/ мес.",
    elevatorOwnerOn: "Есть лифт", elevatorOwnerOff: "Без лифта", elevatorSeekerOn: "Хочет лифт",
    furnishedOwnerOn: "С мебелью", furnishedOwnerOff: "Без мебели", furnishedSeekerOn: "Хочет с мебелью",
    parkingOwnerOn: "Есть парковка", parkingOwnerOff: "Нет парковки", parkingSeekerOn: "Хочет парковку",
    smokingOwnerOn: "Курение разрешено", smokingOwnerOff: "Курение запрещено",
    smokingSeekerOn: "Курение допустимо", smokingSeekerOff: "Хочет место для некурящих",
    budget: "Бюджет", ageLabel: "Возраст", gender: "Пол", occupation: "Профессия",
    wantsPrivateRoom: "Хочет отдельную комнату", maxPrefix: "Макс",
    seekerBadge: "Ищет жильё", roomType: "Тип комнаты", privateRoomYes: "Отдельная комната", privateRoomAny: "Неважно",
    genderPref: "Предпочтение соседа", aboutTitle: "О запросе",
  },
};

function codeToFlag(code: string): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [listing, setListing] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const { lang } = useLang();

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
            .from('profiles_public')
            .select('user_id, display_name, avatar_url, gender, country')
            .eq('user_id', listingData.user_id)
            .maybeSingle();

          if (profileErr) console.log("Profile fetch error:", profileErr);
          setProfile(profileData);
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
  const isSeeker = listing?.type === "needs_place";

  function handleSendMessage() {
    router.push(`/messages?userId=${listing.user_id}&listingId=${listing.id}`);
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
          <button onClick={() => router.push("/")} className="mt-4 text-orange-600 underline text-sm">
            Geri dön
          </button>
        </div>
      </div>
    );
  }

  const genderEmoji =
    profile?.gender === "male" || profile?.gender === "erkek" ? "👨"
    : profile?.gender === "female" || profile?.gender === "kadın" || profile?.gender === "kadin" ? "👩"
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button
          onClick={() => {
            if (searchParams.get("from") === "admin") router.push("/admin-sefira-2026/listings");
            else if (window.history.length > 1) router.back();
            else router.push("/");
          }}
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

      {isSeeker ? (
      <>
        {/* ── Seeker hero ─────────────────────────────────────────────────── */}
        <div
          className="relative h-40 overflow-hidden"
          style={{ background: "linear-gradient(180deg, #fff7ed 0%, #fffbeb 60%, #ffffff 100%)" }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 180"
            preserveAspectRatio="xMidYMid slice"
            style={{ opacity: 0.12 }}
            aria-hidden="true"
          >
            <rect x="15" y="110" width="45" height="40" fill="#f97316" />
            <path d="M10 110 L37.5 85 L65 110 Z" fill="#f97316" />
            <rect x="330" y="90" width="50" height="60" fill="#f97316" />
            <path d="M324 90 L355 60 L386 90 Z" fill="#f97316" />
            <rect x="290" y="130" width="30" height="20" fill="#f97316" />
            <path d="M286 130 L305 115 L324 130 Z" fill="#f97316" />
            <path d="M200 30c-16 0-29 13-29 29 0 21 29 55 29 55s29-34 29-55c0-16-13-29-29-29z" fill="#f97316" />
            <circle cx="200" cy="59" r="11" fill="#fff7ed" />
            <circle cx="100" cy="45" r="16" fill="none" stroke="#f97316" strokeWidth="5" />
            <line x1="112" y1="57" x2="126" y2="71" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex justify-center -mt-14 relative z-10">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? ""}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-4xl font-black text-white border-4 border-white shadow-lg">
              {(profile?.display_name ?? "?")[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>

        {/* ── Info card ────────────────────────────────────────────────────── */}
        <div className="mx-4 mt-3 bg-white rounded-3xl shadow-md p-5 text-center">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {t.seekerBadge}
          </span>

          <h1 className="text-xl font-black text-gray-900">
            {listing.city ?? ""}{listing.district ? ` / ${listing.district}` : ""}
          </h1>

          {listing.country && (
            <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1.5">
              <span>{codeToFlag(listing.country_code)}</span>
              <span>{listing.country}{listing.country_code ? ` (${listing.country_code})` : ""}</span>
            </p>
          )}

          {listing.max_budget && listing.currency && (
            <p className="text-3xl font-black text-orange-600 mt-4">
              <span className="text-base font-normal text-gray-400 mr-1">{t.maxPrefix}</span>
              {Number(listing.max_budget).toLocaleString()} {listing.currency}
              <span className="text-base font-normal text-gray-400 ml-1">{t.perMonth}</span>
            </p>
          )}
        </div>

        {/* ── Detail cards ─────────────────────────────────────────────────── */}
        <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
            <div className="flex flex-col items-center gap-1.5 p-3 text-center">
              <span className="text-2xl">🚪</span>
              <span className="text-xs text-gray-400">{t.roomType}</span>
              <span className="text-sm font-bold text-gray-800">
                {listing.private_room_required ? t.privateRoomYes : t.privateRoomAny}
              </span>
            </div>
            {listing.seeker_gender && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">👤</span>
                <span className="text-xs text-gray-400">{t.genderPref}</span>
                <span className="text-sm font-bold text-gray-800">{listing.seeker_gender}</span>
              </div>
            )}
            {listing.seeker_age && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">🎂</span>
                <span className="text-xs text-gray-400">{t.ageLabel}</span>
                <span className="text-sm font-bold text-gray-800">{listing.seeker_age}</span>
              </div>
            )}
            {listing.occupation && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">💼</span>
                <span className="text-xs text-gray-400">{t.occupation}</span>
                <span className="text-sm font-bold text-gray-800">{listing.occupation}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── About card ───────────────────────────────────────────────────── */}
        {listing.about_text && (
          <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm flex-shrink-0">
                ℹ️
              </span>
              <h3 className="font-bold text-gray-800">{t.aboutTitle}</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{listing.about_text}</p>
          </div>
        )}

        {/* ── Profile card (real data only — no fake ratings/verification/dates) ── */}
        {profile && (
          <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name ?? ""}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600 flex-shrink-0">
                  {(profile.display_name ?? "?")[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{profile.display_name ?? "—"}</p>
                {profile.country && (
                  <p className="text-sm text-gray-500 mt-0.5">{profile.country}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </>
      ) : (
      <>
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
      ) : profile?.avatar_url ? (
        <div className="aspect-video w-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar_url}
            alt={profile.display_name ?? ""}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
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

        {!isSeeker && listing.rent && listing.currency && (
          <p className="text-3xl font-black text-orange-600 mt-3">
            {Number(listing.rent).toLocaleString()} {listing.currency}
            <span className="text-base font-normal text-gray-400 ml-1">{t.perMonth}</span>
          </p>
        )}

        {isSeeker && listing.max_budget && listing.currency && (
          <p className="text-3xl font-black text-orange-600 mt-3">
            <span className="text-base font-normal text-gray-400 mr-1">{t.maxPrefix}</span>
            {Number(listing.max_budget).toLocaleString()} {listing.currency}
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
          {listing.parking != null && (isSeeker ? listing.parking === true : true) && (
            <div className="flex items-center gap-2">
              <span>🚗</span>
              <span>{isSeeker ? t.parkingSeekerOn : (listing.parking ? t.parkingOwnerOn : t.parkingOwnerOff)}</span>
            </div>
          )}
          {listing.elevator != null && (isSeeker ? listing.elevator === true : true) && (
            <div className="flex items-center gap-2">
              <span>🛗</span>
              <span>{isSeeker ? t.elevatorSeekerOn : (listing.elevator ? t.elevatorOwnerOn : t.elevatorOwnerOff)}</span>
            </div>
          )}
          {listing.furnished != null && (isSeeker ? listing.furnished === true : true) && (
            <div className="flex items-center gap-2">
              <span>🪑</span>
              <span>{isSeeker ? t.furnishedSeekerOn : (listing.furnished ? t.furnishedOwnerOn : t.furnishedOwnerOff)}</span>
            </div>
          )}
          {listing.smoking != null && (
            <div className="flex items-center gap-2">
              <span>🚬</span>
              <span>
                {isSeeker
                  ? (listing.smoking ? t.smokingSeekerOn : t.smokingSeekerOff)
                  : (listing.smoking ? t.smokingOwnerOn : t.smokingOwnerOff)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Owner profile card */}
      {profile && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-md p-5">
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile?.display_name ?? ""}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600">
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
                {profile.country && <span>· {profile.country}</span>}
              </div>
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

      </>
      )}

      {/* Fixed contact button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg z-20">
        {listing.is_deleted ? (
          <button disabled className="w-full py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-lg cursor-not-allowed">
            Bu ilan kaldırıldı
          </button>
        ) : isOwner ? (
          <button className="w-full py-4 rounded-2xl bg-gray-200 text-gray-500 font-bold text-lg">
            {t.ownListing}
          </button>
        ) : isLoggedIn ? (
          <button
            onClick={handleSendMessage}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
          >
            💬 {t.contact}
          </button>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-lg shadow-lg"
          >
            {t.loginPrompt}
          </button>
        )}
      </div>

      {showAuth && (
        <AuthModal lang={lang} initialTab="login" onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}
