"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

const ownerBadge: Record<string, string> = {
  tr: "TİCARİ ALAN SAHİBİ",
  en: "COMMERCIAL SPACE OWNER",
  fa: "صاحب فضای تجاری",
  ar: "صاحب مساحة تجارية",
  de: "GEWERBERAUM-EIGENTÜMER",
  ru: "ВЛАДЕЛЕЦ КОММЕРЧЕСКОЙ ПЛОЩАДИ",
};

const ownerOptionTitle: Record<string, string> = {
  tr: "Ticari paylaşım alanım var, paylaşmak istiyorum",
  en: "I have a commercial space to share",
  fa: "فضای تجاری دارم، می‌خواهم به اشتراک بگذارم",
  ar: "لدي مساحة تجارية أريد مشاركتها",
  de: "Ich habe einen Gewerberaum zum Teilen",
  ru: "У меня есть коммерческая площадь для совместного использования",
};

const ownerOptionSubtitle: Record<string, string> = {
  tr: "Alanınızı doğru kişiyle paylaşın",
  en: "Share your space with the right person",
  fa: "فضای خود را با فرد مناسب به اشتراک بگذارید",
  ar: "شارك مساحتك مع الشخص المناسب",
  de: "Teilen Sie Ihren Raum mit der richtigen Person",
  ru: "Поделитесь площадью с подходящим человеком",
};

const seekerBadge: Record<string, string> = {
  tr: "TİCARİ ALAN ARAYAN",
  en: "LOOKING FOR COMMERCIAL SPACE",
  fa: "دنبال فضای تجاری",
  ar: "أبحث عن مساحة تجارية",
  de: "GEWERBERAUM GESUCHT",
  ru: "ИЩУ КОММЕРЧЕСКУЮ ПЛОЩАДЬ",
};

const seekerOptionTitle: Record<string, string> = {
  tr: "Ticari paylaşım alanı arıyorum",
  en: "I'm looking for a commercial space",
  fa: "دنبال فضای تجاری مشترک می‌گردم",
  ar: "أبحث عن مساحة تجارية مشتركة",
  de: "Ich suche einen gemeinsamen Gewerberaum",
  ru: "Ищу коммерческую площадь для совместного использования",
};

const seekerOptionSubtitle: Record<string, string> = {
  tr: "Size uygun ticari alanı bulun",
  en: "Find the right space for you",
  fa: "فضای مناسب خود را پیدا کنید",
  ar: "اعثر على المساحة المناسبة لك",
  de: "Finden Sie den richtigen Raum für Sie",
  ru: "Найдите подходящую площадь для себя",
};

export default function ChooseListingTypePage() {
  const router = useRouter();
  const { lang } = useLang();
  const isRtl = lang === "fa" || lang === "ar";
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* Orange header */}
      <div
        className="relative flex items-center px-4 shrink-0"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)', backgroundColor: '#f97316' }}
      >
        <button
          onClick={() => (step === 2 ? setStep(1) : router.back())}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
          aria-label="Geri"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h3 className="text-white font-black text-lg flex-1 text-center pr-9">
          {step === 1 ? (headerTitle[lang] ?? headerTitle.tr) : (commercialTitle[lang] ?? commercialTitle.tr)}
        </h3>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 overflow-y-auto p-5 flex flex-col gap-4"
            >
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
                onClick={() => setStep(2)}
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
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 overflow-y-auto p-5 flex flex-col gap-4"
            >
              {/* Option A — commercial space owner */}
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -4 }}
                onClick={() => router.push("/commercial-type-select?mode=owner")}
                className="w-full relative overflow-hidden rounded-3xl p-[17px] text-left shadow-[0_12px_40px_-12px_rgba(16,185,129,0.6)] active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg,#34D399 0%,#10B981 55%,#047857 100%)' }}
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/15 rounded-full blur-xl" />
                <div className="absolute right-8 bottom-2 w-20 h-20 bg-white/10 rounded-full blur-md" />

                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shrink-0 shadow-inner">
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block bg-white/25 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 tracking-wide">
                      🏢 {ownerBadge[lang] ?? ownerBadge.tr}
                    </span>
                    <p className="text-white font-black text-base leading-snug">
                      {ownerOptionTitle[lang] ?? ownerOptionTitle.tr}
                    </p>
                    <p className="text-white/80 text-[13px] mt-1 font-medium">
                      {ownerOptionSubtitle[lang] ?? ownerOptionSubtitle.tr}
                    </p>
                  </div>
                  <span className="text-white text-2xl shrink-0">→</span>
                </div>
              </motion.button>

              {/* Option B — commercial space seeker */}
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.2 }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -4 }}
                onClick={() => router.push("/commercial-type-select?mode=seeker")}
                className="w-full relative overflow-hidden rounded-3xl p-[17px] text-left shadow-[0_12px_40px_-12px_rgba(13,148,136,0.6)] active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg,#2DD4BF 0%,#0D9488 55%,#115E59 100%)' }}
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/15 rounded-full blur-xl" />
                <div className="absolute right-8 bottom-2 w-20 h-20 bg-white/10 rounded-full blur-md" />

                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shrink-0 shadow-inner">
                    🔍
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block bg-white/25 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 tracking-wide">
                      🔍 {seekerBadge[lang] ?? seekerBadge.tr}
                    </span>
                    <p className="text-white font-black text-base leading-snug">
                      {seekerOptionTitle[lang] ?? seekerOptionTitle.tr}
                    </p>
                    <p className="text-white/80 text-[13px] mt-1 font-medium">
                      {seekerOptionSubtitle[lang] ?? seekerOptionSubtitle.tr}
                    </p>
                  </div>
                  <span className="text-white text-2xl shrink-0">→</span>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}