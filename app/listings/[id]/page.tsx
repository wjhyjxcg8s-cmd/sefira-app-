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
              <span>{listing.country}</span>
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
