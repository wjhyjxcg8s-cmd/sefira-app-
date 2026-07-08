"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    home: "Ana Sayfa", share: "Paylaş", linkCopied: "Link kopyalandı",
    linkToCopy: "Kopyalamak için bağlantı", close: "Kapat",
    houseTypeCaption: "Ev Tipi", roomsCaption: "Oda Sayısı", elevatorCaption: "Asansör",
    furnishedCaption: "Eşya Durumu", parkingCaption: "Otopark", smokingCaption: "Sigara",
    residentsCaption: "Mevcut Sakin", roomsSuffix: "oda", residentsSuffix: "kişi yaşıyor",
    houseTypeApartment: "Daire", houseTypeVilla: "Villa", houseTypeResidence: "Rezidans",
    houseTypeDormitory: "Yurt", houseTypeIndependent: "Müstakil Ev",
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
    home: "Home", share: "Share", linkCopied: "Link copied",
    linkToCopy: "Link to copy", close: "Close",
    houseTypeCaption: "House Type", roomsCaption: "Rooms", elevatorCaption: "Elevator",
    furnishedCaption: "Furnishing", parkingCaption: "Parking", smokingCaption: "Smoking",
    residentsCaption: "Current Residents", roomsSuffix: "rooms", residentsSuffix: "residents",
    houseTypeApartment: "Apartment", houseTypeVilla: "Villa", houseTypeResidence: "Residence",
    houseTypeDormitory: "Dormitory", houseTypeIndependent: "Independent House",
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
    home: "خانه", share: "اشتراک‌گذاری", linkCopied: "لینک کپی شد",
    linkToCopy: "لینک برای کپی کردن", close: "بستن",
    houseTypeCaption: "نوع خانه", roomsCaption: "تعداد اتاق", elevatorCaption: "آسانسور",
    furnishedCaption: "وضعیت مبلمان", parkingCaption: "پارکینگ", smokingCaption: "سیگار",
    residentsCaption: "ساکنان فعلی", roomsSuffix: "اتاق", residentsSuffix: "نفر ساکن",
    houseTypeApartment: "آپارتمان", houseTypeVilla: "ویلا", houseTypeResidence: "رزیدانس",
    houseTypeDormitory: "خوابگاه", houseTypeIndependent: "خانه مستقل",
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
    home: "الرئيسية", share: "مشاركة", linkCopied: "تم نسخ الرابط",
    linkToCopy: "رابط للنسخ", close: "إغلاق",
    houseTypeCaption: "نوع المسكن", roomsCaption: "عدد الغرف", elevatorCaption: "المصعد",
    furnishedCaption: "التأثيث", parkingCaption: "موقف السيارات", smokingCaption: "التدخين",
    residentsCaption: "السكان الحاليون", roomsSuffix: "غرفة", residentsSuffix: "ساكن",
    houseTypeApartment: "شقة", houseTypeVilla: "فيلا", houseTypeResidence: "ريزيدنس",
    houseTypeDormitory: "سكن طلابي", houseTypeIndependent: "بيت مستقل",
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
    home: "Startseite", share: "Teilen", linkCopied: "Link kopiert",
    linkToCopy: "Link zum Kopieren", close: "Schließen",
    houseTypeCaption: "Haustyp", roomsCaption: "Zimmer", elevatorCaption: "Aufzug",
    furnishedCaption: "Möblierung", parkingCaption: "Parkplatz", smokingCaption: "Rauchen",
    residentsCaption: "Aktuelle Bewohner", roomsSuffix: "Zimmer", residentsSuffix: "Bewohner",
    houseTypeApartment: "Wohnung", houseTypeVilla: "Villa", houseTypeResidence: "Residenz",
    houseTypeDormitory: "Wohnheim", houseTypeIndependent: "Einfamilienhaus",
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
    home: "Главная", share: "Поделиться", linkCopied: "Ссылка скопирована",
    linkToCopy: "Ссылка для копирования", close: "Закрыть",
    houseTypeCaption: "Тип жилья", roomsCaption: "Комнат", elevatorCaption: "Лифт",
    furnishedCaption: "Мебель", parkingCaption: "Парковка", smokingCaption: "Курение",
    residentsCaption: "Текущие жильцы", roomsSuffix: "комнат", residentsSuffix: "жильцов",
    houseTypeApartment: "Квартира", houseTypeVilla: "Вилла", houseTypeResidence: "Резиденция",
    houseTypeDormitory: "Общежитие", houseTypeIndependent: "Частный дом",
  },
};

function codeToFlag(code: string): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
}

// The stored country string is whatever language the poster typed it in at creation time —
// always re-derive from country_code in the viewer's current language instead of trusting it.
function localizedCountryName(countryCode: string | null | undefined, fallback: string | null | undefined, lang: string): string | null {
  if (countryCode && /^[A-Za-z]{2}$/.test(countryCode)) {
    try {
      const name = new Intl.DisplayNames([lang], { type: "region" }).of(countryCode.toUpperCase());
      if (name) return name;
    } catch {
      // unsupported locale/code — fall back to stored value below
    }
  }
  return fallback ?? null;
}

function houseTypeLabel(t: Record<string, string>, houseType: string | null): string | null {
  if (!houseType) return null;
  const map: Record<string, string> = {
    apartment: t.houseTypeApartment,
    villa: t.houseTypeVilla,
    residence: t.houseTypeResidence,
    dormitory: t.houseTypeDormitory,
    independent: t.houseTypeIndependent,
  };
  return map[houseType] ?? houseType;
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
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [shareUrlModal, setShareUrlModal] = useState<string | null>(null);
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
  const isRtl = lang === "fa" || lang === "ar";
  const isLoggedIn = !!currentUserId;
  const isOwner = isLoggedIn && listing && currentUserId === listing.user_id;
  const photos: string[] = listing?.photos ?? [];
  const isSeeker = listing?.type === "needs_place";

  function handleSendMessage() {
    router.push(`/messages?userId=${listing.user_id}&listingId=${listing.id}`);
  }

  function showToast() {
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  }

  async function handleShare() {
    const url = window.location.href;
    const title = listing?.city ?? "Sefira";
    const shareData = { title, text: `${title} - Sefira`, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed — fall through to copy fallbacks
      }
    }

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        showToast();
        return;
      } catch {
        // fall through to legacy copy
      }
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast();
      return;
    } catch {
      setShareUrlModal(url);
    }
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
    <div className="min-h-screen bg-gray-50 pb-32" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (searchParams.get("from") === "admin") router.push("/admin-sefira-2026/listings");
              else if (window.history.length > 1) router.back();
              else router.push("/");
            }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-lg"
          >
            {isRtl ? "→" : "←"}
          </button>
          <Link
            href="/"
            aria-label={t.home}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-lg"
          >
            🏠
          </Link>
        </div>
        <button
          onClick={handleShare}
          aria-label={t.share}
          className="group w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-stone-700 transition-colors hover:bg-orange-50 hover:border-orange-300 active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px] group-hover:text-orange-500 transition-colors"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          </svg>
        </button>
      </div>

      {showCopyToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg animate-[fadeIn_0.2s_ease-out]">
          {t.linkCopied}
        </div>
      )}

      {shareUrlModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShareUrlModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-gray-700 mb-2">{t.linkToCopy}</p>
            <p
              className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 break-all select-all"
            >
              {shareUrlModal}
            </p>
            <button
              onClick={() => setShareUrlModal(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {isSeeker ? (
      <>
        {/* ── Seeker hero ─────────────────────────────────────────────────── */}
        <div className="relative min-h-[260px] overflow-hidden bg-gradient-to-b from-orange-100 via-amber-50 to-white">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 260"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* back layer — full-width skyline, grounds the illustration */}
            <g fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.25">
              <path d="M0 260 L0 232 L22 232 L22 212 L46 212 L46 226 L70 226 L70 198 L96 198 L96 220 L122 220 L122 206 L146 206 L146 230 L172 230 L172 202 L198 202 L198 216 L222 216 L222 192 L248 192 L248 218 L272 218 L272 202 L298 202 L298 226 L322 226 L322 208 L348 208 L348 224 L372 224 L372 210 L400 210 L400 260" />
              <rect x="28" y="218" width="8" height="8" />
              <rect x="102" y="205" width="8" height="8" />
              <rect x="178" y="212" width="8" height="8" />
              <rect x="228" y="200" width="8" height="8" />
              <rect x="304" y="212" width="8" height="8" />
              <rect x="354" y="214" width="8" height="8" />
            </g>

            {/* mid layer — landmark towers + trees */}
            <g fill="none" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
              <rect x="52" y="150" width="34" height="80" rx="2" />
              <line x1="69" y1="150" x2="69" y2="136" />
              <rect x="61" y="164" width="8" height="8" />
              <rect x="61" y="184" width="8" height="8" />

              <rect x="308" y="158" width="34" height="72" rx="2" />
              <line x1="325" y1="158" x2="325" y2="144" />
              <rect x="317" y="172" width="8" height="8" />
              <rect x="317" y="192" width="8" height="8" />

              <circle cx="140" cy="214" r="13" />
              <line x1="140" y1="227" x2="140" y2="246" />
              <circle cx="256" cy="208" r="11" />
              <line x1="256" y1="219" x2="256" y2="240" />
            </g>

            {/* floating layer — pin, clouds, magnifier, route */}
            <g fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
              <path d="M200 26c-34 0-61 27-61 61 0 46 61 100 61 100s61-54 61-100c0-34-27-61-61-61z" />
              <circle cx="200" cy="87" r="20" />

              <circle cx="332" cy="52" r="19" />
              <line x1="345" y1="65" x2="367" y2="87" />

              <path d="M32 32a7 7 0 0 1 13-4 8 8 0 0 1 14 3 6 6 0 0 1-2 12H34a6 6 0 0 1-2-11z" />
              <path d="M100 16a6 6 0 0 1 11-3 7 7 0 0 1 12 2 5 5 0 0 1-1 10H98a5 5 0 0 1-2-9z" />
              <path d="M282 18a6 6 0 0 1 11-3 7 7 0 0 1 12 2 5 5 0 0 1-1 10h-19a5 5 0 0 1-3-9z" />
              <path d="M348 40a5 5 0 0 1 9-2 6 6 0 0 1 10 2 4 4 0 0 1-1 8h-15a4 4 0 0 1-3-8z" />

              <path d="M92 196c38-26 88-10 108 18s66 18 96-38" strokeDasharray="1 8" opacity="0.7" />
            </g>

            {/* sparkle accents */}
            <g fill="#fb923c" opacity="0.4">
              <circle cx="128" cy="58" r="2.5" />
              <circle cx="252" cy="42" r="2.5" />
              <circle cx="62" cy="80" r="2" />
              <circle cx="360" cy="110" r="2.5" />
              <circle cx="170" cy="188" r="2" />
            </g>
          </svg>
        </div>

        <div className="flex justify-center -mt-16 relative z-20">
          <div className="relative w-32 h-32">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? ""}
                className="relative z-10 w-full h-full rounded-full object-cover border-4 border-white shadow-2xl"
              />
            ) : (
              <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-5xl font-black text-white border-4 border-white shadow-2xl">
                {(profile?.display_name ?? "?")[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 -mt-12 relative z-10 space-y-4">
          {/* ── Info card ──────────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm px-5 pb-5 pt-20 text-center">
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
                <span>
                  {localizedCountryName(listing.country_code, listing.country, lang)}
                  {listing.country_code ? ` (${listing.country_code})` : ""}
                </span>
              </p>
            )}

            {listing.max_budget && listing.currency && (
              <span className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold px-4 py-2 rounded-full mt-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                  <path d="M19 7H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
                  <path d="M16 13h2" />
                </svg>
                <span className="font-normal text-gray-400">{t.maxPrefix}</span>
                {Number(listing.max_budget).toLocaleString()} {listing.currency}
                <span className="font-normal text-gray-400">{t.perMonth}</span>
              </span>
            )}
          </div>

          {/* ── Detail cards ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <div className="flex divide-x divide-gray-100">
              <div className="flex-1 flex flex-col items-center gap-1.5 px-2 text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                  <path d="M3 10.5L12 3l9 7.5" />
                  <path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
                </svg>
                <span className="text-xs text-gray-400">{t.roomType}</span>
                <span className="text-sm font-bold text-gray-800">
                  {listing.private_room_required ? t.privateRoomYes : t.privateRoomAny}
                </span>
              </div>
              {listing.seeker_gender && (
                <div className="flex-1 flex flex-col items-center gap-1.5 px-2 text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="text-xs text-gray-400">{t.genderPref}</span>
                  <span className="text-sm font-bold text-gray-800">{listing.seeker_gender}</span>
                </div>
              )}
              {listing.seeker_age && (
                <div className="flex-1 flex flex-col items-center gap-1.5 px-2 text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="text-xs text-gray-400">{t.ageLabel}</span>
                  <span className="text-sm font-bold text-gray-800">{listing.seeker_age}</span>
                </div>
              )}
              {listing.occupation && (
                <div className="flex-1 flex flex-col items-center gap-1.5 px-2 text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span className="text-xs text-gray-400">{t.occupation}</span>
                  <span className="text-sm font-bold text-gray-800">{listing.occupation}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── About card ───────────────────────────────────────────────────── */}
          {listing.about_text && (
            <div className="bg-white rounded-3xl shadow-sm p-5">
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
            <div className="bg-white rounded-3xl shadow-sm p-5">
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
        </div>
      </>
      ) : (
      <>
        {/* ── Owner hero ───────────────────────────────────────────────────── */}
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
                        i === activePhoto ? "border-emerald-400" : "border-transparent opacity-60"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 180"
              preserveAspectRatio="xMidYMid slice"
              style={{ opacity: 0.15 }}
              aria-hidden="true"
            >
              <rect x="15" y="110" width="45" height="40" fill="#78716c" />
              <path d="M10 110 L37.5 85 L65 110 Z" fill="#78716c" />
              <rect x="330" y="90" width="50" height="60" fill="#78716c" />
              <path d="M324 90 L355 60 L386 90 Z" fill="#78716c" />
              <rect x="290" y="130" width="30" height="20" fill="#78716c" />
              <path d="M286 130 L305 115 L324 130 Z" fill="#78716c" />
              <rect x="160" y="70" width="80" height="80" fill="#78716c" />
              <path d="M150 70 L200 30 L250 70 Z" fill="#78716c" />
            </svg>
            <span className="relative text-6xl">🏠</span>
          </div>
        )}

        {/* ── Info card ────────────────────────────────────────────────────── */}
        <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M3 10.5L12 3l9 7.5" />
              <path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
            </svg>
            {t.ownerBadge}
          </span>

          <h1 className="text-xl font-black text-gray-900">
            {listing.city ?? ""}{listing.district ? ` / ${listing.district}` : ""}
          </h1>

          {listing.country && (
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
              <span>{codeToFlag(listing.country_code)}</span>
              <span>{localizedCountryName(listing.country_code, listing.country, lang)}</span>
              {listing.country_code && (
                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                  {listing.country_code}
                </span>
              )}
            </p>
          )}

          {listing.rent && listing.currency && (
            <p className="text-3xl font-black text-orange-600 mt-4">
              {Number(listing.rent).toLocaleString()} {listing.currency}
              <span className="text-base font-normal text-gray-400 ml-1">{t.perMonth}</span>
            </p>
          )}
        </div>

        {/* ── Details grid ─────────────────────────────────────────────────── */}
        <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
            {listing.house_type && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">🏠</span>
                <span className="text-xs text-gray-400">{t.houseTypeCaption}</span>
                <span className="text-sm font-bold text-gray-800">{houseTypeLabel(t, listing.house_type)}</span>
              </div>
            )}
            {listing.rooms && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">🛏️</span>
                <span className="text-xs text-gray-400">{t.roomsCaption}</span>
                <span className="text-sm font-bold text-gray-800">{listing.rooms} {t.roomsSuffix}</span>
              </div>
            )}
            {listing.elevator != null && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">🛗</span>
                <span className="text-xs text-gray-400">{t.elevatorCaption}</span>
                <span className="text-sm font-bold text-gray-800">{listing.elevator ? t.elevatorOwnerOn : t.elevatorOwnerOff}</span>
              </div>
            )}
            {listing.furnished != null && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">🪑</span>
                <span className="text-xs text-gray-400">{t.furnishedCaption}</span>
                <span className="text-sm font-bold text-gray-800">{listing.furnished ? t.furnishedOwnerOn : t.furnishedOwnerOff}</span>
              </div>
            )}
            {listing.parking != null && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">🚗</span>
                <span className="text-xs text-gray-400">{t.parkingCaption}</span>
                <span className="text-sm font-bold text-gray-800">{listing.parking ? t.parkingOwnerOn : t.parkingOwnerOff}</span>
              </div>
            )}
            {listing.smoking != null && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">🚬</span>
                <span className="text-xs text-gray-400">{t.smokingCaption}</span>
                <span className="text-sm font-bold text-gray-800">{listing.smoking ? t.smokingOwnerOn : t.smokingOwnerOff}</span>
              </div>
            )}
            {listing.current_residents > 0 && (
              <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-2xl">👥</span>
                <span className="text-xs text-gray-400">{t.residentsCaption}</span>
                <span className="text-sm font-bold text-gray-800">{listing.current_residents} {t.residentsSuffix}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── About card ───────────────────────────────────────────────────── */}
        {listing.description && (
          <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm flex-shrink-0">
                📝
              </span>
              <h3 className="font-bold text-gray-800">{t.description}</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* ── Profile card (real data only — no fake ratings/verification) ──── */}
        {profile && (
          <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name ?? ""}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600 flex-shrink-0">
                  {(profile.display_name ?? "?")[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{profile.display_name ?? "—"}</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500 flex-wrap">
                  {genderEmoji && <span>{genderEmoji}</span>}
                  {profile.country && <span>{profile.country}</span>}
                </div>
              </div>
            </div>
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
