"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

const translations = {
  tr: {
    title: "İlanlarım",
    empty: "Henüz ilan vermediniz. İlk ilanınızı şimdi verin!",
    createBtn: "İlan Ver",
    notLoggedIn: "İlanlarınızı görmek için giriş yapınız.",
    goHome: "Ana Sayfaya Git",
    address: "Adres",
    sharingCost: "Aylık Paylaşım Ücreti",
    roommates: "Aranan Ev Arkadaşı",
    rooms: "Oda",
    active: "Aktif",
    type_has_place: "Ev sahibi — ev arkadaşı arıyor",
    type_needs_place: "Ev arıyor — birlikte yaşayacak biri",
  },
  en: {
    title: "My Listings",
    empty: "You haven't posted any listings yet. Post your first one!",
    createBtn: "Create Listing",
    notLoggedIn: "Please sign in to view your listings.",
    goHome: "Go to Home",
    address: "Address",
    sharingCost: "Monthly Sharing Cost",
    roommates: "Housemates Needed",
    rooms: "Rooms",
    active: "Active",
    type_has_place: "Has a place — looking for housemate(s)",
    type_needs_place: "No place — looking to share living",
  },
  fa: {
    title: "آگهی‌های من",
    empty: "عزیزم، هنوز آگهی‌ای ثبت نکردی! اما می‌توانی همین‌جا آگهی بدی.",
    createBtn: "ثبت آگهی",
    notLoggedIn: "برای مشاهده آگهی‌های خود لطفاً وارد شوید.",
    goHome: "رفتن به صفحه اصلی",
    address: "آدرس",
    sharingCost: "هزینه مشترک ماهانه",
    roommates: "هم‌خانه مورد نیاز",
    rooms: "اتاق",
    active: "فعال",
    type_has_place: "خانه دارم — دنبال هم‌خانه",
    type_needs_place: "خانه ندارم — دنبال زندگی مشترک",
  },
  de: {
    title: "Meine Inserate",
    empty: "Sie haben noch keine Inserate aufgegeben. Geben Sie jetzt Ihr erstes auf!",
    createBtn: "Inserat aufgeben",
    notLoggedIn: "Bitte melden Sie sich an, um Ihre Inserate anzuzeigen.",
    goHome: "Zur Startseite",
    address: "Adresse",
    sharingCost: "Monatliche Mietkosten",
    roommates: "Gesuchte Mitbewohner",
    rooms: "Zimmer",
    active: "Aktiv",
    type_has_place: "Hat Wohnung — sucht Mitbewohner",
    type_needs_place: "Keine Wohnung — sucht Mitbewohner",
  },
  // Always add "ar" key when adding new translations
  ar: {
    title: "إعلاناتي",
    empty: "لم تنشر أي إعلانات بعد. انشر إعلانك الأول الآن!",
    createBtn: "نشر إعلان",
    notLoggedIn: "يرجى تسجيل الدخول لعرض إعلاناتك.",
    goHome: "الذهاب إلى الرئيسية",
    address: "العنوان",
    sharingCost: "تكلفة المشاركة الشهرية",
    roommates: "شركاء السكن المطلوبون",
    rooms: "الغرف",
    active: "نشط",
    type_has_place: "لديه مكان — يبحث عن شريك سكن",
    type_needs_place: "ليس لديه مكان — يبحث عن المشاركة",
  },
  ru: {
    title: "Мои объявления",
    empty: "У вас нет объявлений. Разместите первое!",
    createBtn: "Создать объявление",
    notLoggedIn: "Войдите, чтобы просмотреть объявления.",
    goHome: "Перейти на главную",
    address: "Адрес",
    sharingCost: "Стоимость аренды в месяц",
    roommates: "Нужных соседей",
    rooms: "Комнаты",
    active: "Активно",
    type_has_place: "Есть жильё — ищу соседа",
    type_needs_place: "Нет жилья — ищу совместное проживание",
  },
};

type Lang = keyof typeof translations;

interface Listing {
  id: number;
  type: "has_place" | "needs_place";
  address: string;
  rent: number | null;
  currency: string;
  rooms: number;
  needed_roommates: number;
  created_at: string;
}

export default function MyListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("tr");
  const t = translations[lang];

  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sefira-lang") as Lang | null;
    if (saved === "tr" || saved === "en" || saved === "fa" || saved === "ar" || saved === "de" || saved === "ru") setLang(saved);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { setFetching(false); return; }
    supabase
      .from("listings")
      .select("id, type, address, rent, currency, rooms, needed_roommates, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setListings((data as Listing[]) ?? []);
        setFetching(false);
      });
  }, [user, loading]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-5 p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="3" />
          </svg>
        </div>
        <p className="text-stone-600 text-center font-medium">{t.notLoggedIn}</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95"
        >
          {t.goHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50" dir={lang === "fa" || lang === "ar" ? "rtl" : "ltr"}>
      {/* Navbar */}
      <nav dir="ltr" style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)", willChange: "transform" }} className="fixed top-0 left-0 right-0 w-full z-[9999] bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-all duration-300">
              S
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Sefira
            </span>
          </Link>
          <Link href="/profile" className="text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
            ←
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-24 px-5 max-w-2xl mx-auto">
        {/* Back to home */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block mb-5">
          <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfa</span>
          </Link>
        </motion.div>

        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-orange-500">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="3" />
            </svg>
            {t.title}
          </h1>
          <Link
            href="/create-listing"
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t.createBtn}
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-stone-400">
                <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="3" />
              </svg>
            </div>
            <p className="text-stone-500 font-medium max-w-xs">{t.empty}</p>
            <Link
              href="/create-listing"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95 text-sm flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t.createBtn}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="font-bold text-stone-900 text-sm truncate">
                      {listing.address || "—"}
                    </p>
                    <p className="text-xs text-stone-500">
                      {listing.type === "has_place" ? t.type_has_place : t.type_needs_place}
                    </p>
                    <p className="text-xs text-stone-400">
                      {t.rooms}: {listing.rooms} · {t.roommates}: {listing.needed_roommates}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {listing.rent && (
                      <span className="text-sm font-black text-orange-500">
                        {listing.currency === "USD" ? "$" : listing.currency === "EUR" ? "€" : "₺"}
                        {listing.rent}
                        <span className="text-stone-400 font-normal text-xs">/mo</span>
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {t.active}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-stone-300 font-medium">
                  {new Date(listing.created_at).toLocaleDateString(
                    lang === "tr" ? "tr-TR" : lang === "fa" ? "fa-IR" : lang === "ar" ? "ar-SA" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white/95 backdrop-blur-xl border-t border-stone-200">
        <button
          onClick={() => router.push("/create-listing")}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm px-6 py-4 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t.createBtn}
        </button>
      </div>
    </div>
  );
}
