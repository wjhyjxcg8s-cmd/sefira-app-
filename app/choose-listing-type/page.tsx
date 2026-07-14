"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useLang } from "@/app/lib/LangContext";

const headerTitle: Record<string, string> = {
  tr: "İlan Türü Seçin",
  en: "Choose Listing Type",
  fa: "نوع آگهی را انتخاب کنید",
  ar: "اختر نوع الإعلان",
  de: "Inseratstyp wählen",
  ru: "Выберите тип объявления",
};

const pageSubtitle: Record<string, string> = {
  tr: "Hangi türde ilan vermek istiyorsunuz?",
  en: "What type of listing would you like to post?",
  fa: "چه نوع آگهی می‌خواهید ثبت کنید؟",
  ar: "ما نوع الإعلان الذي تريد نشره؟",
  de: "Welche Art von Inserat möchten Sie aufgeben?",
  ru: "Какой тип объявления вы хотите разместить?",
};

const residentialBadge: Record<string, string> = {
  tr: "KONUT",
  en: "HOME",
  fa: "مسکونی",
  ar: "سكني",
  de: "WOHNEN",
  ru: "ЖИЛЬЕ",
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

const commercialBadge: Record<string, string> = {
  tr: "TİCARİ",
  en: "COMMERCIAL",
  fa: "تجاری",
  ar: "تجاري",
  de: "GEWERBE",
  ru: "КОММЕРЧЕСКОЕ",
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

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

function PatternOverlay() {
  return (
    <div
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "18px 18px" }}
    />
  );
}

function CornerBlobs() {
  return (
    <>
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-white rounded-full opacity-10 blur-2xl" />
      <div className="absolute -left-6 -bottom-10 w-32 h-32 bg-white rounded-full opacity-10 blur-2xl" />
    </>
  );
}

export default function ChooseListingTypePage() {
  const router = useRouter();
  const { lang } = useLang();
  const isRtl = lang === "fa" || lang === "ar";
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-orange-50 flex flex-col overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
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

      {step === 1 && (
        <p className="text-center text-stone-500 text-sm font-medium pt-4 px-6">
          {pageSubtitle[lang] ?? pageSubtitle.tr}
        </p>
      )}

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="px-4 pt-6 pb-24 md:pb-6 flex flex-col gap-4"
              >
                {/* Card 1 — Residential */}
                <motion.button
                  variants={cardVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/create-listing")}
                  className="relative w-full rounded-[24px] overflow-hidden text-left shadow-[0_20px_45px_-12px_rgba(234,88,12,0.45)]"
                  style={{ minHeight: 200, background: "linear-gradient(135deg, #fb923c 0%, #f97316 55%, #c2410c 100%)" }}
                >
                  <PatternOverlay />
                  <CornerBlobs />

                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-white/25 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide border border-white/30">
                    🏠 {residentialBadge[lang] ?? residentialBadge.tr}
                  </span>

                  <span className="absolute bottom-4 right-4 text-7xl leading-none">
                    🏠
                  </span>

                  <div className="absolute bottom-4 left-5 right-28 flex flex-col gap-1.5">
                    <span className="text-white font-bold" style={{ fontSize: 22 }}>{residentialTitle[lang] ?? residentialTitle.tr}</span>
                    <span className="text-white/80" style={{ fontSize: 13 }}>{residentialSubtitle[lang] ?? residentialSubtitle.tr}</span>
                    <div className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="text-xl">🛏️</span><span className="text-xl">🚿</span><span className="text-xl">👥</span>
                    </div>
                  </div>
                </motion.button>

                {/* Card 2 — Commercial */}
                <motion.button
                  variants={cardVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="relative w-full rounded-[24px] overflow-hidden text-left shadow-[0_20px_45px_-12px_rgba(5,150,105,0.45)]"
                  style={{ minHeight: 200, background: "linear-gradient(135deg, #34d399 0%, #10b981 55%, #047857 100%)" }}
                >
                  <PatternOverlay />
                  <CornerBlobs />

                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-white/25 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide border border-white/30">
                    🏢 {commercialBadge[lang] ?? commercialBadge.tr}
                  </span>

                  <span className="absolute bottom-4 right-4 text-7xl leading-none">
                    🏢
                  </span>

                  <div className="absolute bottom-4 left-5 right-28 flex flex-col gap-1.5">
                    <span className="text-white font-bold" style={{ fontSize: 22 }}>{commercialTitle[lang] ?? commercialTitle.tr}</span>
                    <span className="text-white/80" style={{ fontSize: 13 }}>{commercialSubtitle[lang] ?? commercialSubtitle.tr}</span>
                    <div className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="text-xl">🏢</span><span className="text-xl">🏪</span><span className="text-xl">🔧</span>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="px-4 pt-6 pb-24 md:pb-6 flex flex-col gap-4"
              >
                {/* Option A — commercial space owner */}
                <motion.button
                  variants={cardVariants}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -4 }}
                  onClick={() => router.push("/commercial-type-select?mode=owner")}
                  className="w-full relative overflow-hidden rounded-[24px] p-5 text-left shadow-[0_20px_45px_-12px_rgba(16,185,129,0.5)]"
                  style={{ minHeight: 180, background: 'linear-gradient(135deg,#34D399 0%,#10B981 55%,#047857 100%)' }}
                >
                  <PatternOverlay />
                  <CornerBlobs />

                  <div className="relative z-10 flex items-center gap-4 h-full">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shrink-0 shadow-inner"
                    >
                      🏢
                    </motion.div>
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
                    <motion.span
                      animate={{ x: [0, 6, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="text-white text-2xl shrink-0"
                    >→</motion.span>
                  </div>
                </motion.button>

                {/* Option B — commercial space seeker */}
                <motion.button
                  variants={cardVariants}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -4 }}
                  onClick={() => router.push("/commercial-type-select?mode=seeker")}
                  className="w-full relative overflow-hidden rounded-[24px] p-5 text-left shadow-[0_20px_45px_-12px_rgba(13,148,136,0.5)]"
                  style={{ minHeight: 180, background: 'linear-gradient(135deg,#2DD4BF 0%,#0D9488 55%,#115E59 100%)' }}
                >
                  <PatternOverlay />
                  <CornerBlobs />

                  <div className="relative z-10 flex items-center gap-4 h-full">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shrink-0 shadow-inner"
                    >
                      🔍
                    </motion.div>
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
                    <motion.span
                      animate={{ x: [0, 6, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                      className="text-white text-2xl shrink-0"
                    >→</motion.span>
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}