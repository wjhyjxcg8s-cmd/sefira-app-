"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

const translations = {
  tr: {
    title: "Kaydedilen İlanlar",
    empty: "Henüz kaydettiğiniz ilan yok.",
    emptyAction: "İlanlara Göz At",
    notLoggedIn: "Kaydedilen ilanları görmek için giriş yapınız.",
    goHome: "Ana Sayfaya Git",
    address: "Adres",
    sharingCost: "Aylık Paylaşım Ücreti",
    roommates: "Ev Arkadaşı",
    rooms: "Oda",
  },
  en: {
    title: "Saved Listings",
    empty: "You haven't saved any listings yet.",
    emptyAction: "Browse Listings",
    notLoggedIn: "Please sign in to view saved listings.",
    goHome: "Go to Home",
    address: "Address",
    sharingCost: "Monthly Sharing Cost",
    roommates: "Housemates",
    rooms: "Rooms",
  },
  fa: {
    title: "آگهی‌های ذخیره شده",
    empty: "هنوز هیچ آگهی‌ای ذخیره نکردی!",
    emptyAction: "مرور آگهی‌ها",
    notLoggedIn: "برای مشاهده آگهی‌های ذخیره‌شده لطفاً وارد شوید.",
    goHome: "رفتن به صفحه اصلی",
    address: "آدرس",
    sharingCost: "هزینه مشترک ماهانه",
    roommates: "هم‌خانه",
    rooms: "اتاق",
  },
  de: {
    title: "Gespeicherte Inserate",
    empty: "Sie haben noch keine Inserate gespeichert.",
    emptyAction: "Inserate durchsuchen",
    notLoggedIn: "Bitte melden Sie sich an, um gespeicherte Inserate anzuzeigen.",
    goHome: "Zur Startseite",
    address: "Adresse",
    sharingCost: "Monatliche Mietkosten",
    roommates: "Mitbewohner",
    rooms: "Zimmer",
  },
  // Always add "ar" key when adding new translations
  ar: {
    title: "الإعلانات المحفوظة",
    empty: "لم تحفظ أي إعلانات بعد.",
    emptyAction: "تصفّح الإعلانات",
    notLoggedIn: "يرجى تسجيل الدخول لعرض الإعلانات المحفوظة.",
    goHome: "الذهاب إلى الرئيسية",
    address: "العنوان",
    sharingCost: "تكلفة المشاركة الشهرية",
    roommates: "شريك السكن",
    rooms: "الغرف",
  },
};

type Lang = keyof typeof translations;

interface SavedListing {
  id: number;
  address: string | null;
  rent: number | null;
  currency: string | null;
  rooms: number | null;
  needed_roommates: number | null;
}

export default function SavedListingsPage() {
  const { user, loading } = useAuth();
  const [lang, setLang] = useState<Lang>("tr");
  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem("sefira-lang") as Lang | null;
    if (saved === "tr" || saved === "en" || saved === "fa" || saved === "ar" || saved === "de") setLang(saved);
  }, []);

  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("sefira-saved-listings");
    if (raw) {
      try { setSavedIds(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!savedIds.length) { setFetching(false); return; }
    supabase
      .from("listings")
      .select("*")
      .in("id", savedIds)
      .then(({ data }) => {
        setListings((data as SavedListing[]) ?? []);
        setFetching(false);
      });
  }, [savedIds]);

  if (loading) {
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
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
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

      <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
        {/* Back to home */}
        <Link href="/" dir="ltr" className="inline-flex items-center gap-1.5 mb-5 text-sm font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
            <polyline points={lang === "fa" || lang === "ar" ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
          </svg>
          <span>{lang === "tr" ? "Ana Sayfa" : lang === "fa" ? "صفحه اصلی" : lang === "ar" ? "الرئيسية" : "Home"}</span>
        </Link>

        <h1 className="text-2xl font-black text-stone-900 mb-6 flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-orange-500">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {t.title}
        </h1>

        {fetching ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-stone-400">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-stone-500 font-medium max-w-xs">{t.empty}</p>
            <Link
              href="/"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95 text-sm"
            >
              {t.emptyAction}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {listings.map((l) => (
              <div
                key={String(l.id)}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="font-bold text-stone-900 text-sm truncate">
                      {l.address ?? "—"}
                    </p>
                    <p className="text-xs text-stone-400">
                      {t.rooms}: {l.rooms ?? "—"} · {t.roommates}: {l.needed_roommates ?? "—"}
                    </p>
                  </div>
                  {l.rent != null && (
                    <span className="flex-shrink-0 text-sm font-black text-orange-500">
                      {l.currency ?? "$"}{l.rent}<span className="text-stone-400 font-normal text-xs">/mo</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    const next = savedIds.filter((id) => id !== l.id);
                    setSavedIds(next);
                    setListings((prev) => prev.filter((item) => item.id !== l.id));
                    localStorage.setItem("sefira-saved-listings", JSON.stringify(next));
                  }}
                  className="self-end text-xs text-rose-400 hover:text-rose-600 font-semibold transition-colors"
                >
                  {lang === "tr" ? "Kaldır" : lang === "fa" ? "حذف" : lang === "ar" ? "إزالة" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
