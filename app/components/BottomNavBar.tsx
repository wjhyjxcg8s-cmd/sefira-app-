"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, MessageCircle, Heart, User, Plus } from "lucide-react";
import { useLang, type Lang } from "@/app/lib/LangContext";
import { useAuth } from "@/app/lib/AuthContext";
import { useProfileDrawer } from "@/app/lib/ProfileDrawerContext";
import { useChatView } from "@/app/lib/ChatViewContext";
import { useUnreadMessagesCount } from "@/app/lib/useUnreadMessages";

const LABELS: Record<"home" | "messages" | "favorites" | "profile" | "postListing", Record<Lang, string>> = {
  home: { tr: "Ana Sayfa", en: "Home", fa: "خانه", ar: "الرئيسية", de: "Start", ru: "Главная" },
  messages: { tr: "Mesajlar", en: "Messages", fa: "پیام‌ها", ar: "الرسائل", de: "Nachrichten", ru: "Сообщения" },
  favorites: { tr: "Favoriler", en: "Favorites", fa: "علاقه‌مندی‌ها", ar: "المفضلة", de: "Favoriten", ru: "Избранное" },
  profile: { tr: "Profil", en: "Profile", fa: "پروفایل", ar: "الملف الشخصي", de: "Profil", ru: "Профиль" },
  postListing: { tr: "İlan Ver", en: "Post Listing", fa: "ثبت آگهی", ar: "نشر إعلان", de: "Inserat aufgeben", ru: "Разместить объявление" },
};

// Routes where the consumer-facing bottom nav shouldn't appear (admin panel, etc.)
const HIDDEN_PREFIXES = ["/admin-sefira-2026"];

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] flex-1 active:scale-95 transition-transform"
    >
      <span className="relative">
        <Icon
          className="w-6 h-6"
          strokeWidth={2}
          color={active ? "#f97316" : "#94a3b8"}
        />
        {!!badge && badge > 0 && (
          <span className="absolute -top-1 -end-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span
        className="text-[11px] font-medium"
        style={{ color: active ? "#f97316" : "#94a3b8" }}
      >
        {label}
      </span>
    </button>
  );
}

export default function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLang();
  const { user } = useAuth();
  const { isOpen: profileDrawerOpen, setIsOpen: setProfileDrawerOpen } = useProfileDrawer();
  const { isChatOpen } = useChatView();
  const unreadCount = useUnreadMessagesCount();
  const isRtl = lang === "fa" || lang === "ar";

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  if (isChatOpen) return null;

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  const handleProfileTap = () => {
    if (!user) { router.push("/profile"); return; }
    setProfileDrawerOpen(true);
  };

  return (
    <nav
      dir={isRtl ? "rtl" : "ltr"}
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-[0_-2px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="relative flex items-stretch h-16 px-1">
        <NavItem
          icon={Home}
          label={LABELS.home[lang]}
          active={isActive("/")}
          onClick={() => router.push("/")}
        />
        <NavItem
          icon={MessageCircle}
          label={LABELS.messages[lang]}
          active={isActive("/messages")}
          onClick={() => router.push("/messages")}
          badge={unreadCount}
        />

        {/* Center spacer reserved for the FAB */}
        <div className="w-16 flex-shrink-0" aria-hidden="true" />

        <NavItem
          icon={Heart}
          label={LABELS.favorites[lang]}
          active={isActive("/saved")}
          onClick={() => router.push("/saved")}
        />
        <NavItem
          icon={User}
          label={LABELS.profile[lang]}
          active={profileDrawerOpen}
          onClick={handleProfileTap}
        />

        {/* Center FAB — protrudes above the bar */}
        <button
          onClick={() => router.push("/choose-listing-type")}
          aria-label={LABELS.postListing[lang]}
          className="absolute left-1/2 -translate-x-1/2 -top-3 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 active:scale-95 transition-transform"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}
