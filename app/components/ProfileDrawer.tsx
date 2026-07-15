"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { useLang, type Lang } from "@/app/lib/LangContext";
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

const LABELS: Record<string, Record<Lang, string>> = {
  editProfile: { tr: "Profilimi Düzenle", en: "Edit Profile", fa: "ویرایش پروفایل", ar: "تعدیل الملف الشخصی", de: "Profil bearbeiten", ru: "Редактировать профиль" },
  postListing: { tr: "İlan Ver", en: "Post Listing", fa: "ثبت آگهی", ar: "نشر إعلان", de: "Inserat aufgeben", ru: "Разместить объявление" },
  search: { tr: "Arama", en: "Search", fa: "جستجو", ar: "بحث", de: "Suche", ru: "Поиск" },
  saved: { tr: "Kaydedilenler", en: "Saved", fa: "ذخیره‌ها", ar: "المحفوظات", de: "Gespeichert", ru: "Сохранённые" },
  myListings: { tr: "İlanlarım", en: "My Listings", fa: "آگهی‌های من", ar: "إعلاناتی", de: "Meine Inserate", ru: "Мои объявления" },
  myMessages: { tr: "Mesajlarım", en: "My Messages", fa: "پیام‌های من", ar: "رسائلی", de: "Meine Nachrichten", ru: "Мои сообщения" },
  reviews: { tr: "Yorumlarım ve Puanım", en: "Reviews & Ratings", fa: "کامنت‌ها و امتیازهای من", ar: "تعلیقاتی وتقییماتی", de: "Meine Bewertungen", ru: "Мои отзывы и оценки" },
  support: { tr: "Destek", en: "Support", fa: "پشتیبانی", ar: "الدعم", de: "Support", ru: "Поддержка" },
  advertise: { tr: "Reklam Ver", en: "Advertise", fa: "تبلیغات", ar: "الإعلانات", de: "Werbung", ru: "Реклама" },
};

function MenuRow({
  onClick,
  iconClassName,
  icon,
  label,
  badge,
  danger,
}: {
  onClick: () => void;
  iconClassName: string;
  icon: ReactNode;
  label: string;
  badge?: number;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        danger
          ? "w-full flex items-center gap-3.5 py-3 px-5 text-[15px] font-medium text-red-500 active:bg-gray-50 rounded-xl transition-colors duration-150"
          : "w-full flex items-center gap-3.5 py-3 px-5 text-[15px] font-medium text-gray-800 active:bg-gray-50 rounded-xl transition-colors duration-150"
      }
    >
      <div className={iconClassName}>
        {icon}
        {!!badge && badge > 0 && (
          <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 border-2 border-white text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className="flex-1 text-start truncate">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-300 rtl:rotate-180 flex-shrink-0" />
    </button>
  );
}

export default function ProfileDrawer() {
  const { user, signOut: handleSignOut } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const { isOpen, setIsOpen } = useProfileDrawer();
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const isRtl = lang === "fa" || lang === "ar";
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (isOpen && menuScrollRef.current) {
      menuScrollRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!user) return null;
  if (!mounted) return null;

  const close = () => setIsOpen(false);
  const goTo = (path: string) => { close(); router.push(path); };

  const initials = (user.user_metadata?.full_name ?? user.email ?? "U")
    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={close}
        onTouchMove={(e) => e.preventDefault()}
        className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm"
        style={{
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.3s ease-out",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={
          isRtl
            ? "fixed inset-y-0 left-0 h-dvh z-[10001] w-[72%] max-w-[300px] flex flex-col shadow-2xl rounded-r-3xl overflow-hidden bg-white"
            : "fixed inset-y-0 right-0 h-dvh z-[10001] w-[72%] max-w-[300px] flex flex-col shadow-2xl rounded-l-3xl overflow-hidden bg-white"
        }
        style={{
          transform: isOpen ? "translateX(0)" : isRtl ? "translateX(-100%)" : "translateX(100%)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Compact header — fixed, NOT scrollable */}
        <div className="relative flex-shrink-0 h-[140px] overflow-hidden">
          <Image
            src="/images/drawer-header.webp"
            alt=""
            fill
            priority
            sizes="300px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <button
            onClick={close}
            aria-label="Close"
            className={
              isRtl
                ? "absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center z-10"
                : "absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center z-10"
            }
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 px-5 pb-3.5">
            <button
              onClick={() => goTo("/profile")}
              className="w-12 h-12 rounded-full ring-2 ring-white/90 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 font-extrabold text-base text-white"
              style={{ background: "linear-gradient(135deg, #ea580c, #d97706)" }}
            >
              {profileAvatarUrl ? (
                <img src={profileAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white leading-tight truncate">
                {user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"}
              </p>
              <p className="text-[12px] text-white/80 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div
          ref={menuScrollRef}
          dir={isRtl ? "rtl" : "ltr"}
          className="flex-1 overflow-y-auto overscroll-contain py-2"
        >
          {/* Group A: Edit Profile, Post Listing */}
          <div className="py-1">
            <MenuRow
              onClick={() => goTo("/profile")}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-gradient-to-br from-violet-400 to-purple-500"
              label={LABELS.editProfile[lang]}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => goTo("/choose-listing-type")}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-gradient-to-br from-orange-400 to-orange-500"
              label={LABELS.postListing[lang]}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" className="w-[18px] h-[18px]">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            />
          </div>

          <div className="border-t border-gray-100 my-2 mx-5" />

          {/* Group B: Search, Saved, My Listings, Messages, Reviews */}
          <div className="py-1">
            <MenuRow
              onClick={() => goTo("/search-wizard")}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-gradient-to-br from-violet-600 to-purple-500"
              label={LABELS.search[lang]}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => goTo("/saved")}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-gradient-to-br from-blue-400 to-blue-500"
              label={LABELS.saved[lang]}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => goTo("/my-listings")}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-gradient-to-br from-orange-400 to-orange-500"
              label={LABELS.myListings[lang]}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => goTo("/messages")}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-gradient-to-br from-orange-400 to-amber-500"
              label={LABELS.myMessages[lang]}
              badge={unreadSupportCount}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => goTo("/my-reviews")}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-gradient-to-br from-yellow-400 to-amber-500"
              label={LABELS.reviews[lang]}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
            />
          </div>

          <div className="border-t border-gray-100 my-2 mx-5" />

          {/* Group C: Support, Advertise */}
          <div className="py-1">
            <MenuRow
              onClick={() => goTo("/support-chat")}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-gradient-to-br from-sky-400 to-teal-500"
              label={LABELS.support[lang]}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
                  <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              }
            />
            <MenuRow
              onClick={() => goTo("/advertise")}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-gradient-to-br from-amber-500 to-red-500"
              label={LABELS.advertise[lang]}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 1 8.835-2.535m0 0A23.74 23.74 0 0 1 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
                </svg>
              }
            />
          </div>

          <div className="border-t border-gray-100 my-2 mx-5" />

          {/* Group D: Logout */}
          <div className="py-1">
            <MenuRow
              onClick={() => { close(); setShowSignOutConfirm(true); }}
              iconClassName="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative bg-red-50"
              danger
              label={SIGN_OUT.signOut[lang]}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              }
            />
          </div>
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
    </>,
    document.body
  );
}
