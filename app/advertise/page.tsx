"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/app/lib/LangContext";

const content = {
  tr: {
    title: "Sefira'da Hedefli Reklamcılık",
    description: "Yakında ilanlarınızı hedef kitlenize gösterebileceksiniz. Bu özellik çok yakında aktif olacak — bizi takip edin!",
    badge: "Çok Yakında",
    homeLabel: "Ana Sayfaya Dön",
  },
  en: {
    title: "Targeted Advertising on Sefira",
    description: "Soon you'll be able to show your ads to exactly the right users. This feature is coming — stay tuned!",
    badge: "Coming Soon",
    homeLabel: "Back to Home",
  },
  fa: {
    title: "تبلیغات هدفمند در سفیرا",
    description: "به زودی می‌توانید تبلیغات خود را به کاربران مورد نظر نشان دهید. این قابلیت برای شما فعال خواهد شد — منتظر باشید!",
    badge: "به زودی",
    homeLabel: "بازگشت به صفحه اصلی",
  },
  ar: {
    title: "الإعلانات المستهدفة على سفيرا",
    description: "قريباً ستتمكن من عرض إعلاناتك للمستخدمين المناسبين. هذه الميزة ستكون متاحة قريباً — ترقبوا!",
    badge: "قريباً",
    homeLabel: "العودة إلى الصفحة الرئيسية",
  },
  de: {
    title: "Gezielte Werbung auf Sefira",
    description: "Bald kannst du deine Anzeigen genau den richtigen Nutzern zeigen. Diese Funktion kommt bald — bleib dran!",
    badge: "Demnächst",
    homeLabel: "Zurück zur Startseite",
  },
  ru: {
    title: "Целевая реклама на Sefira",
    description: "Скоро вы сможете показывать свою рекламу нужным пользователям. Эта функция скоро будет доступна — следите за обновлениями!",
    badge: "Скоро",
    homeLabel: "На главную",
  },
};

export default function AdvertisePage() {
  const router = useRouter();
  const { lang } = useLang();
  const c = content[lang] ?? content.en;
  const isRtl = lang === "fa" || lang === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        minHeight: "100dvh",
        background: "white",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{
          position: "absolute",
          top: 16,
          [isRtl ? "right" : "left"]: 16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#f3f4f6",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
        aria-label="Back"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#374151"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 20, height: 20, transform: isRtl ? "scaleX(-1)" : undefined }}
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Center content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 40px",
          gap: 20,
          textAlign: "center",
        }}
      >
        {/* Animated icon */}
        <div
          className="animate-pulse"
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
            boxShadow: "0 8px 32px rgba(245,158,11,0.35)",
          }}
        >
          📣
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            lineHeight: 1.3,
            maxWidth: 320,
          }}
        >
          {c.title}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 15,
            color: "#6b7280",
            maxWidth: 360,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {c.description}
        </p>

        {/* Badge */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-500 rounded-full blur-md opacity-40 animate-pulse" />
            <div className="relative px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 shadow-lg">
              <span className="text-white font-bold text-sm tracking-widest uppercase">{c.badge}</span>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <button
          onClick={() => router.push("/")}
          className="mt-8 relative group"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <div className="flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-gray-100 bg-white shadow-lg hover:shadow-xl hover:border-orange-200 transition-all duration-300 hover:-translate-y-0.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-4 h-4 text-white" style={isRtl ? { transform: "rotate(180deg)" } : {}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </div>
            <span className="text-gray-700 font-semibold text-sm tracking-wide group-hover:text-orange-500 transition-colors duration-200">
              {c.homeLabel}
            </span>
            <div className="ml-1 opacity-40 group-hover:opacity-70 transition-opacity duration-200">
              <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Decorative dots */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          paddingBottom: 40,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ec4899", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
      </div>
    </div>
  );
}
