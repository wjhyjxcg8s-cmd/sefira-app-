"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/app/lib/LangContext";

const content = {
  tr: {
    title: "Sefira'da Hedefli Reklamcılık",
    description: "Yakında ilanlarınızı hedef kitlenize gösterebileceksiniz. Bu özellik çok yakında aktif olacak — bizi takip edin!",
    badge: "Çok Yakında",
  },
  en: {
    title: "Targeted Advertising on Sefira",
    description: "Soon you'll be able to show your ads to exactly the right users. This feature is coming — stay tuned!",
    badge: "Coming Soon",
  },
  fa: {
    title: "تبلیغات هدفمند در سفیرا",
    description: "به زودی می‌توانید تبلیغات خود را به کاربران مورد نظر نشان دهید. این قابلیت برای شما فعال خواهد شد — منتظر باشید!",
    badge: "به زودی",
  },
  ar: {
    title: "الإعلانات المستهدفة على سفيرا",
    description: "قريباً ستتمكن من عرض إعلاناتك للمستخدمين المناسبين. هذه الميزة ستكون متاحة قريباً — ترقبوا!",
    badge: "قريباً",
  },
  de: {
    title: "Gezielte Werbung auf Sefira",
    description: "Bald kannst du deine Anzeigen genau den richtigen Nutzern zeigen. Diese Funktion kommt bald — bleib dran!",
    badge: "Demnächst",
  },
  ru: {
    title: "Целевая реклама на Sefira",
    description: "Скоро вы сможете показывать свою рекламу нужным пользователям. Эта функция скоро будет доступна — следите за обновлениями!",
    badge: "Скоро",
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
        <span
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 9999,
            padding: "8px 24px",
          }}
        >
          {c.badge}
        </span>
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
