"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { useLang } from "@/app/lib/LangContext";
import { useProfileDrawer } from "@/app/lib/ProfileDrawerContext";
import { supabase } from "@/app/lib/supabase";

const SIGN_OUT = {
  signOut: { tr: "Çıkış Yap", en: "Log Out", fa: "خروج", de: "Abmelden", ar: "تسجيل الخروج", ru: "Выйти" },
  confirmTitle: { tr: "Çıkış Yap", en: "Sign Out", fa: "خروج از حساب", de: "Abmelden", ar: "تسجيل الخروج", ru: "Выйти" },
  confirmMsg: {
    tr: "Hesabınızdan çıkmak istediğinizden emin misiniz?",
    en: "Are you sure you want to sign out?",
    fa: "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",
    de: "Sind Sie sicher, dass Sie sich abmelden möchten?",
    ar: "هل أنت متأكد من أنك تريد تسجيل الخروج؟",
    ru: "Вы уверены, что хотите выйти?",
  },
  confirmCancel: { tr: "İptal", en: "Cancel", fa: "انصراف", de: "Abbrechen", ar: "إلغاء", ru: "Отмена" },
  confirmOk: { tr: "Çıkış Yap", en: "Sign Out", fa: "خروج", de: "Abmelden", ar: "خروج", ru: "Выйти" },
};

export default function ProfileDrawer() {
  const { user, signOut: handleSignOut } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const { isOpen, setIsOpen } = useProfileDrawer();
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    // Drawer renders null when there's no user, so no reset-on-logout is needed.
    if (!user) return;
    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setProfileAvatarUrl(data?.avatar_url ?? null));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("admin_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("sender", "admin")
      .eq("is_read", false)
      .then(({ count }) => setUnreadSupportCount(count ?? 0));
  }, [user?.id, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!user) return null;

  const close = () => setIsOpen(false);
  const goTo = (path: string) => { close(); router.push(path); };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        onTouchMove={(e) => e.preventDefault()}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 40,
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.3s ease-out",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        dir="ltr"
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : "-100%",
          width: "85%",
          maxWidth: "360px",
          height: "100dvh",
          zIndex: 50,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          transition: "right 0.3s ease",
          boxShadow: "-4px 0 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* Gradient header — fixed, NOT scrollable */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 40%, #9333EA 100%)',
            padding: '90px 24px 32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            filter: 'blur(20px)',
          }} />

          {/* Avatar */}
          <button
            onClick={() => goTo("/profile")}
            style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "linear-gradient(135deg, #ea580c, #d97706)",
              border: "3px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "28px", color: "white",
              overflow: "hidden", cursor: "pointer", flexShrink: 0,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              marginBottom: "12px",
              position: "relative", zIndex: 1,
            }}
          >
            {profileAvatarUrl ? (
              <img src={profileAvatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (user.user_metadata?.full_name ?? user.email ?? "U")
                .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
            )}
          </button>

          <p style={{ fontWeight: 700, fontSize: "18px", color: "white", margin: "0", textAlign: "center" }}>
            {user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"}
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0, textAlign: "center" }}>
            {user.email}
          </p>
        </div>

        {/* Menu items — flex: 1 1 0 + height: 0 is required for iOS Safari/PWA scroll */}
        <div style={{ flex: "1 1 0", height: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }} className="px-3 py-4 flex flex-col gap-1.5">
          <style>{`
            @keyframes drawerItemIn {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .drawer-item {
              opacity: 0;
              animation: drawerItemIn 0.22s ease-out forwards;
            }
          `}</style>

          {/* Edit Profile */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("/profile")}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
            style={{ animationDelay: '0ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-violet-400 to-purple-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {lang === "tr" ? "Profilimi Düzenle" : lang === "fa" ? "ویرایش پروفایل" : lang === "ar" ? "تعدیل الملف الشخصی" : lang === "de" ? "Profil bearbeiten" : lang === "ru" ? "Редактировать профиль" : "Edit Profile"}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>

          {/* Post Listing */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("/choose-listing-type")}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
            style={{ animationDelay: '40ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-orange-400 to-orange-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {lang === "tr" ? "İlan Ver" : lang === "fa" ? "ثبت آگهی" : lang === "ar" ? "نشر إعلان" : lang === "de" ? "Inserat aufgeben" : lang === "ru" ? "Разместить объявление" : "Post Listing"}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>

          {/* Search */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("/search-wizard")}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
            style={{ animationDelay: '80ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-violet-600 to-purple-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {lang === "tr" ? "Arama" : lang === "fa" ? "جستجو" : lang === "ar" ? "بحث" : lang === "de" ? "Suche" : lang === "ru" ? "Поиск" : "Search"}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>

          {/* Saved */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("/saved")}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
            style={{ animationDelay: '120ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-blue-400 to-blue-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {lang === "tr" ? "Kaydedilenler" : lang === "fa" ? "ذخیره‌ها" : lang === "ar" ? "المحفوظات" : lang === "de" ? "Gespeichert" : lang === "ru" ? "Сохранённые" : "Saved"}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>

          {/* My Listings */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("/my-listings")}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
            style={{ animationDelay: '160ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-orange-400 to-orange-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
              </svg>
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {lang === "tr" ? "İlanlarım" : lang === "fa" ? "آگهی‌های من" : lang === "ar" ? "إعلاناتی" : lang === "de" ? "Meine Inserate" : lang === "ru" ? "Мои объявления" : "My Listings"}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>

          {/* My Messages */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("/messages")}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
            style={{ animationDelay: '200ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-orange-400 to-amber-500" style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {unreadSupportCount > 0 && (
                <div style={{ position: "absolute", top: "-2px", right: "-2px", minWidth: "18px", height: "18px", borderRadius: "9999px", background: "#ef4444", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                  <span style={{ color: "white", fontWeight: 700, fontSize: "10px", lineHeight: 1 }}>
                    {unreadSupportCount > 9 ? "9+" : unreadSupportCount}
                  </span>
                </div>
              )}
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {lang === "tr" ? "Mesajlarım" : lang === "fa" ? "پیام‌های من" : lang === "ar" ? "رسائلی" : lang === "de" ? "Meine Nachrichten" : lang === "ru" ? "Мои сообщения" : "My Messages"}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>

          {/* Reviews & Ratings */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("/my-reviews")}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
            style={{ animationDelay: '240ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-yellow-400 to-amber-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {lang === "tr" ? "Yorumlarım ve Puanım" : lang === "fa" ? "کامنت‌ها و امتیازهای من" : lang === "ar" ? "تعلیقاتی وتقییماتی" : lang === "de" ? "Meine Bewertungen" : lang === "ru" ? "Мои отзывы и оценки" : "Reviews & Ratings"}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>

          {/* Support */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("/support-chat")}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
            style={{ animationDelay: '260ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-sky-400 to-teal-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
                <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {lang === "tr" ? "Destek" : lang === "fa" ? "پشتیبانی" : lang === "ar" ? "الدعم" : lang === "de" ? "Support" : lang === "ru" ? "Поддержка" : "Support"}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>

          {/* Advertise */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("/advertise")}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
            style={{ animationDelay: '280ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 1 8.835-2.535m0 0A23.74 23.74 0 0 1 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
              </svg>
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {lang === "tr" ? "Reklam Ver" : lang === "fa" ? "تبلیغات" : lang === "ar" ? "الإعلانات" : lang === "de" ? "Werbung" : lang === "ru" ? "Реклама" : "Advertise"}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>

          {/* Divider */}
          <div className="h-px bg-gray-200 mx-4 my-2" />

          {/* Sign Out */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { close(); setShowSignOutConfirm(true); }}
            className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-red-50"
            style={{ animationDelay: '240ms' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-red-400 to-rose-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
              {SIGN_OUT.signOut[lang]}
            </span>
            <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
          </motion.button>
        </div>
      </div>

      {/* ── Sign Out Confirmation Dialog ─────────────────────────────────────── */}
      {showSignOutConfirm && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setShowSignOutConfirm(false)}
        >
          <div
            style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 360, direction: lang === "fa" || lang === "ar" ? "rtl" : "ltr" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 8, textAlign: "center" }}>{SIGN_OUT.confirmTitle[lang]}</p>
            <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 20 }}>{SIGN_OUT.confirmMsg[lang]}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={() => { setShowSignOutConfirm(false); handleSignOut(); }}
                style={{ width: "100%", padding: "14px 0", borderRadius: 12, background: "linear-gradient(to right, #ef4444, #f97316)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}
              >
                {SIGN_OUT.confirmOk[lang]}
              </button>
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                style={{ width: "100%", padding: "14px 0", borderRadius: 12, background: "white", color: "#6b7280", fontWeight: 600, fontSize: 15, border: "2px solid #e5e7eb", cursor: "pointer" }}
              >
                {SIGN_OUT.confirmCancel[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}