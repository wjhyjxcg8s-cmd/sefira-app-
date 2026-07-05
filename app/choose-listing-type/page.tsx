"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLang } from "@/app/lib/LangContext";

const headerTitle: Record<string, string> = {
  tr: "İlan Türü Seçin",
  en: "Choose Listing Type",
  fa: "نوع آگهی را انتخاب کنید",
  ar: "اختر نوع الإعلان",
  de: "Inseratstyp wählen",
  ru: "Выберите тип объявления",
};

const residentialTitle: Record<string, string> = {
  tr: "Konut İlanı",
  en: "Residential Listing",
  fa: "آگهی مسکونی",
  ar: "إعلان سكني",
  de: "Wohnungsanzeige",
  ru: "Жилое объявление",
};

const residentialSubtitle: Record<string, string> = {
  tr: "Ev, oda veya ev arkadaşı ilanı ver",
  en: "Post a home, room or roommate listing",
  fa: "آگهی خانه، اتاق یا هم‌خانه",
  ar: "أضف إعلان منزل أو غرفة أو شريك سكن",
  de: "Wohnung, Zimmer oder Mitbewohner inserieren",
  ru: "Подать объявление о жилье, комнате или соседе",
};

const commercialTitle: Record<string, string> = {
  tr: "Ticari İlan",
  en: "Commercial Listing",
  fa: "آگهی تجاری",
  ar: "إعلان تجاري",
  de: "Gewerbeanzeige",
  ru: "Коммерческое объявление",
};

const commercialSubtitle: Record<string, string> = {
  tr: "Ofis, dükkan veya ticari alan ilanı ver",
  en: "Post an office, shop or commercial space listing",
  fa: "آگهی آفیس، مغازه یا فضای تجاری",
  ar: "أضف إعلان مكتب أو محل أو مساحة تجارية",
  de: "Büro, Laden oder Gewerbefläche inserieren",
  ru: "Подать объявление об офисе, магазине или коммерческом пространстве",
};

export default function ChooseListingTypePage() {
  const router = useRouter();
  const { lang } = useLang();
  const isRtl = lang === "fa" || lang === "ar";

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
      {/* Orange header */}
      <div
        className="relative flex items-center px-4 shrink-0"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)', backgroundColor: '#f97316' }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
          aria-label="Geri"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h3 className="text-white font-black text-lg flex-1 text-center pr-9">
          {headerTitle[lang] ?? headerTitle.tr}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        <motion.button
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 30 }}
          onClick={() => router.push("/create-listing")}
          className="relative flex items-center rounded-2xl p-8 shadow-lg text-white text-left overflow-hidden"
          style={{ minHeight: "40vh", background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          <div className="flex flex-col items-start gap-3 flex-1">
            <span style={{ fontSize: 64, lineHeight: 1 }}>🏠</span>
            <span className="font-bold" style={{ fontSize: 24 }}>{residentialTitle[lang] ?? residentialTitle.tr}</span>
            <span className="text-white/80" style={{ fontSize: 14 }}>{residentialSubtitle[lang] ?? residentialSubtitle.tr}</span>
          </div>
          <span className="text-white/80 text-3xl shrink-0" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>→</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 30 }}
          onClick={() => router.push("/?openCommercial=owner")}
          className="relative flex items-center rounded-2xl p-8 shadow-lg text-white text-left overflow-hidden"
          style={{ minHeight: "40vh", background: "linear-gradient(135deg, #10b981, #059669)" }}
        >
          <div className="flex flex-col items-start gap-3 flex-1">
            <span style={{ fontSize: 64, lineHeight: 1 }}>🏢</span>
            <span className="font-bold" style={{ fontSize: 24 }}>{commercialTitle[lang] ?? commercialTitle.tr}</span>
            <span className="text-white/80" style={{ fontSize: 14 }}>{commercialSubtitle[lang] ?? commercialSubtitle.tr}</span>
          </div>
          <span className="text-white/80 text-3xl shrink-0" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>→</span>
        </motion.button>
      </div>
    </div>
  );
}