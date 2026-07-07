"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/app/lib/LangContext";

type Content = {
  heading: string;
  sub: string;
  back: string;
};

const MOBILE_APP_CONTENT: Record<string, Content> = {
  tr: {
    heading: "Uygulama Çok Yakında",
    sub: "Sefira mobil uygulaması en kısa sürede App Store ve Google Play'de yerini alacak. Takipte kalın!",
    back: "← Geri",
  },
  en: {
    heading: "App Coming Soon",
    sub: "The Sefira mobile app will be available on the App Store and Google Play very soon. Stay tuned!",
    back: "← Back",
  },
  fa: {
    heading: "اپلیکیشن به‌زودی",
    sub: "اپلیکیشن موبایل سفیرا به‌زودی در App Store و Google Play در دسترس خواهد بود. همراه ما باشید!",
    back: "→ بازگشت",
  },
  ar: {
    heading: "التطبيق قريباً",
    sub: "سيكون تطبيق سفيرا للجوال متاحاً قريباً على App Store و Google Play. ابقَ على اطلاع!",
    back: "→ رجوع",
  },
  de: {
    heading: "App kommt bald",
    sub: "Die Sefira App wird schon bald im App Store und bei Google Play verfügbar sein. Bleib dran!",
    back: "← Zurück",
  },
  ru: {
    heading: "Приложение скоро",
    sub: "Мобильное приложение Sefira скоро появится в App Store и Google Play. Следите за обновлениями!",
    back: "← Назад",
  },
};

export default function MobileAppPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isRtl = lang === "fa" || lang === "ar";

  const content = MOBILE_APP_CONTENT[lang] || MOBILE_APP_CONTENT.tr;

  return (
    <div
      className="min-h-screen bg-stone-900 flex flex-col items-center justify-center px-6 text-center"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <button
        onClick={() => router.back()}
        className="fixed top-6 left-6 rtl:left-auto rtl:right-6 inline-flex items-center gap-1 text-sm font-semibold text-stone-400 hover:text-white transition-colors duration-200"
      >
        {content.back}
      </button>

      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-base shadow-lg shadow-orange-500/25">
          S
        </div>
        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
          Sefira
        </span>
      </div>

      <div className="text-6xl mb-8">📱</div>

      <h1 className="text-2xl sm:text-3xl font-black text-white mb-4 max-w-sm">
        {content.heading}
      </h1>
      <p className="text-sm sm:text-base text-stone-400 leading-relaxed max-w-sm">
        {content.sub}
      </p>
    </div>
  );
}