"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", TRY: "₺", AED: "د.إ", TOMAN: "ت", RUB: "₽",
};

const translations = {
  tr: {
    title: "İlanlarım",
    empty: "Henüz ilan vermediniz. İlk ilanınızı şimdi verin!",
    createBtn: "İlan Ver",
    notLoggedIn: "İlanlarınızı görmek için giriş yapınız.",
    goHome: "Ana Sayfaya Git",
    active: "Aktif",
    edit: "Düzenle",
    delete: "Sil",
    deleteConfirm: "Bu ilanı silmek istediğinize emin misiniz?",
    deleting: "Siliniyor...",
    houseTypeApartment: "Daire",
    houseTypeVilla: "Villa",
    houseTypeResidence: "Rezidans",
    houseTypeDormitory: "Yurt",
    houseTypeIndependent: "Müstakil Ev",
    perMonth: "/ay",
  },
  en: {
    title: "My Listings",
    empty: "You haven't posted any listings yet. Post your first one!",
    createBtn: "Create Listing",
    notLoggedIn: "Please sign in to view your listings.",
    goHome: "Go to Home",
    active: "Active",
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this listing?",
    deleting: "Deleting...",
    houseTypeApartment: "Apartment",
    houseTypeVilla: "Villa",
    houseTypeResidence: "Residence",
    houseTypeDormitory: "Dormitory",
    houseTypeIndependent: "Independent House",
    perMonth: "/mo",
  },
  fa: {
    title: "آگهی‌های من",
    empty: "هنوز آگهی‌ای ثبت نکردید. اولین آگهی‌تان را ثبت کنید!",
    createBtn: "ثبت آگهی",
    notLoggedIn: "برای مشاهده آگهی‌های خود لطفاً وارد شوید.",
    goHome: "رفتن به صفحه اصلی",
    active: "فعال",
    edit: "ویرایش",
    delete: "حذف",
    deleteConfirm: "آیا مطمئن هستید که می‌خواهید این آگهی را حذف کنید؟",
    deleting: "در حال حذف...",
    houseTypeApartment: "آپارتمان",
    houseTypeVilla: "ویلا",
    houseTypeResidence: "رزیدانس",
    houseTypeDormitory: "خوابگاه",
    houseTypeIndependent: "خانه مستقل",
    perMonth: "/ماه",
  },
  ar: {
    title: "إعلاناتي",
    empty: "لم تنشر أي إعلانات بعد. انشر إعلانك الأول الآن!",
    createBtn: "نشر إعلان",
    notLoggedIn: "يرجى تسجيل الدخول لعرض إعلاناتك.",
    goHome: "الذهاب إلى الرئيسية",
    active: "نشط",
    edit: "تعديل",
    delete: "حذف",
    deleteConfirm: "هل أنت متأكد أنك تريد حذف هذا الإعلان؟",
    deleting: "جارٍ الحذف...",
    houseTypeApartment: "شقة",
    houseTypeVilla: "فيلا",
    houseTypeResidence: "ريزيدنس",
    houseTypeDormitory: "سكن طلابي",
    houseTypeIndependent: "بيت مستقل",
    perMonth: "/شهر",
  },
  de: {
    title: "Meine Inserate",
    empty: "Sie haben noch keine Inserate aufgegeben. Geben Sie jetzt Ihr erstes auf!",
    createBtn: "Inserat aufgeben",
    notLoggedIn: "Bitte melden Sie sich an, um Ihre Inserate anzuzeigen.",
    goHome: "Zur Startseite",
    active: "Aktiv",
    edit: "Bearbeiten",
    delete: "Löschen",
    deleteConfirm: "Sind Sie sicher, dass Sie dieses Inserat löschen möchten?",
    deleting: "Wird gelöscht...",
    houseTypeApartment: "Wohnung",
    houseTypeVilla: "Villa",
    houseTypeResidence: "Residenz",
    houseTypeDormitory: "Wohnheim",
    houseTypeIndependent: "Einfamilienhaus",
    perMonth: "/Mo.",
  },
  ru: {
    title: "Мои объявления",
    empty: "У вас нет объявлений. Разместите первое!",
    createBtn: "Создать объявление",
    notLoggedIn: "Войдите, чтобы просмотреть объявления.",
    goHome: "Перейти на главную",
    active: "Активно",
    edit: "Редактировать",
    delete: "Удалить",
    deleteConfirm: "Вы уверены, что хотите удалить это объявление?",
    deleting: "Удаление...",
    houseTypeApartment: "Квартира",
    houseTypeVilla: "Вилла",
    houseTypeResidence: "Резиденция",
    houseTypeDormitory: "Общежитие",
    houseTypeIndependent: "Частный дом",
    perMonth: "/мес",
  },
};

type Lang = keyof typeof translations;

interface Listing {
  id: number;
  photos: string[] | null;
  city: string | null;
  district: string | null;
  rent: number | null;
  currency: string;
  house_type: string | null;
  created_at: string;
}

function houseTypeLabel(
  t: (typeof translations)[Lang],
  houseType: string | null
): string | null {
  if (!houseType) return null;
  const map: Record<string, keyof typeof translations.en> = {
    apartment: "houseTypeApartment",
    villa: "houseTypeVilla",
    residence: "houseTypeResidence",
    dormitory: "houseTypeDormitory",
    independent: "houseTypeIndependent",
  };
  const key = map[houseType];
  return key ? (t[key] as string) : houseType;
}

export default function MyListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("tr");
  const t = translations[lang];

  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sefira-lang") as Lang | null;
    if (saved && saved in translations) setLang(saved);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { setFetching(false); return; }
    supabase
      .from("listings")
      .select("id, photos, city, district, rent, currency, house_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setListings((data as Listing[]) ?? []);
        setFetching(false);
      });
  }, [user, loading]);

  const handleDelete = async (id: number) => {
    if (!window.confirm(t.deleteConfirm)) return;
    setDeletingId(id);
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
  };

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

      <div className="pt-24 pb-28 px-5 max-w-2xl mx-auto">
        {/* Back button */}
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
            {listings.map((listing) => {
              const firstPhoto = listing.photos?.[0] ?? null;
              const sym = CURRENCY_SYMBOLS[listing.currency] ?? listing.currency;
              const typeLabel = houseTypeLabel(t, listing.house_type);
              const isDeleting = deletingId === listing.id;

              return (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
                >
                  {/* Photo */}
                  <div className="w-full h-44 bg-stone-100 relative">
                    {firstPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={firstPhoto}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-stone-300">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-emerald-600 bg-emerald-50/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {t.active}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 text-base truncate">
                          {[listing.city, listing.district].filter(Boolean).join(", ") || "—"}
                        </p>
                        {typeLabel && (
                          <span className="inline-block mt-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            {typeLabel}
                          </span>
                        )}
                      </div>
                      {listing.rent != null && (
                        <div className="text-right flex-shrink-0">
                          <span className="text-lg font-black text-orange-500">
                            {sym}{listing.rent}
                          </span>
                          <span className="text-stone-400 font-normal text-xs">{t.perMonth}</span>
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/listings/${listing.id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm py-2.5 rounded-xl shadow-md shadow-orange-500/20 hover:opacity-90 active:scale-95 transition-all"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        {t.edit}
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={isDeleting}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold text-sm py-2.5 rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                      >
                        {isDeleting ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        )}
                        {isDeleting ? t.deleting : t.delete}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
