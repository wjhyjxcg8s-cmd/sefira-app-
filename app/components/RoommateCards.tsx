"use client";

import { useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import { type Currency, convertBudgetRange } from "@/app/lib/currency";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  id: number;
  name: string;
  age: number;
  occupation: string;
  nationality: string;
  languages: string[];
  match: number;
  city: string;
  country: string;
  gradient: string;
  initials: string;
  lifestyle: string[];
  bio: string;
  bioTr: string;
  bioFa: string;
  bioAr?: string;
  verified: boolean;
  pets: boolean;
  smoking: boolean;
  budget: string;
}

// ─── Profile data ─────────────────────────────────────────────────────────────
const PROFILES: Profile[] = [
  {
    id: 1, name: "Emma Wilson",   age: 26, occupation: "UX Designer",       nationality: "British",
    languages: ["English", "German"],
    match: 97, city: "Berlin",    country: "Germany",
    gradient: "from-violet-600 via-purple-700 to-indigo-800", initials: "EW",
    lifestyle: ["Night owl", "Minimalist", "Yoga"],
    bio: "Creative designer seeking a quiet, tidy flatmate who appreciates good aesthetics.",
    bioTr: "Sessiz, düzenli ve estetiği önemseyen bir ev arkadaşı arayan yaratıcı tasarımcı.",
    bioFa: "طراح خلاق به دنبال هم‌خانه‌ای آرام و مرتب که زیبایی‌شناسی خوب را ارزشمند بداند.",
    verified: true,  pets: false, smoking: false, budget: "700-1000",
  },
  {
    id: 2, name: "Kai Tanaka",    age: 29, occupation: "Software Engineer", nationality: "Japanese",
    languages: ["Japanese", "English"],
    match: 94, city: "Berlin",    country: "Germany",
    gradient: "from-cyan-600 via-blue-700 to-indigo-800",     initials: "KT",
    lifestyle: ["Early bird", "Gamer", "Coffee lover"],
    bio: "Remote dev who values clean spaces and good coffee. Let's build a calm, focused home.",
    bioTr: "Temiz alanları ve güzel kahveyi önemseyen uzaktan geliştirici. Sakin, odaklı bir ev kuralım.",
    bioFa: "توسعه‌دهنده از راه دور که فضاهای تمیز و قهوه خوب را می‌پسندد. خانه‌ای آرام و متمرکز بسازیم.",
    verified: true,  pets: true,  smoking: false, budget: "800-1100",
  },
  {
    id: 3, name: "Sofia Ramirez", age: 24, occupation: "Medical Student",   nationality: "Spanish",
    languages: ["Spanish", "English", "French"],
    match: 91, city: "Barcelona", country: "Spain",
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",    initials: "SR",
    lifestyle: ["Student", "Active", "Social"],
    bio: "Med student, tidy and friendly. Latin music on weekends, focused on weeknights.",
    bioTr: "Tıp öğrencisi, düzenli ve arkadaş canlısı. Hafta sonları Latin müzik, hafta içi çalışma modu.",
    bioFa: "دانشجوی پزشکی، مرتب و دوستانه. آخر هفته‌ها موسیقی لاتین، شب‌های هفته مطالعه.",
    verified: false, pets: false, smoking: false, budget: "500-750",
  },
  {
    id: 4, name: "Lena Müller",   age: 28, occupation: "Architect",         nationality: "German",
    languages: ["German", "English"],
    match: 89, city: "Munich",    country: "Germany",
    gradient: "from-amber-500 via-orange-700 to-rose-700",    initials: "LM",
    lifestyle: ["Minimalist", "Cyclist", "Foodie"],
    bio: "Architect with a love for clean design and weekend hikes. Always keeps tidy spaces.",
    bioTr: "Temiz tasarımı ve hafta sonu yürüyüşlerini seven mimar. Her zaman düzenli bir alan sağlar.",
    bioFa: "معمار با عشق به طراحی تمیز و پیاده‌روی آخر هفته. همیشه فضاهای مرتبی دارد.",
    verified: true,  pets: false, smoking: false, budget: "900-1200",
  },
  {
    id: 5, name: "Mehmet Yılmaz", age: 31, occupation: "Chef",              nationality: "Turkish",
    languages: ["Turkish", "English", "German"],
    match: 86, city: "Istanbul",  country: "Turkey",
    gradient: "from-orange-600 via-orange-700 to-cyan-800",    initials: "MY",
    lifestyle: ["Early bird", "Foodie", "Calm"],
    bio: "Professional chef who cooks for two and keeps the kitchen spotless. Early riser.",
    bioTr: "İkisi için pişiren ve mutfağı pırıl pırıl tutan profesyonel aşçı. Erken kalkar.",
    bioFa: "آشپز حرفه‌ای که برای دو نفر می‌پزد و آشپزخانه را پاکیزه نگه می‌دارد. صبح‌زود بیدار می‌شود.",
    verified: true,  pets: true,  smoking: false, budget: "400-700",
  },
  {
    id: 6, name: "Priya Sharma",  age: 27, occupation: "Data Scientist",    nationality: "Indian",
    languages: ["Hindi", "English"],
    match: 83, city: "Dubai",     country: "UAE",
    gradient: "from-purple-500 via-violet-600 to-indigo-700", initials: "PS",
    lifestyle: ["Night owl", "Reader", "Introvert"],
    bio: "Data scientist, quiet and focused. Love a good book and strong chai. Very tidy.",
    bioTr: "Veri bilimcisi, sessiz ve odaklı. İyi kitap ve güçlü çayı sever. Çok düzenli.",
    bioFa: "دانشمند داده، آرام و متمرکز. کتاب خوب و چای قوی را دوست دارد. بسیار مرتب.",
    verified: false, pets: false, smoking: false, budget: "1000-1500",
  },
];

// ─── Labels ───────────────────────────────────────────────────────────────────
const LABELS = {
  tr: {
    heading:      "Önerilen Ev Arkadaşları",
    subheading:   "Sürükle ve keşfet",
    dragHint:     "← geçmek için sürükle  ·  beğenmek için sürükle →",
    liked:        "beğenildi",
    of:           "/",
    budget:       "Bütçe",
    languages:    "Diller",
    lifestyle:    "Yaşam Tarzı",
    petsOk:       "🐾 Evcil Hayvan OK",
    noPets:       "🚫 Evcil Hayvan Yok",
    smoker:       "🚬 Sigara İçiyor",
    nonSmoker:    "🚭 Sigara İçmiyor",
    verified:     "Doğrulandı",
    match:        "Eşleşme",
    perMonth:     "/ay",
    rejectLabel:  "Reddet",
    messageLabel: "Mesaj",
    saveLabel:    "Kaydet",
    inspectBtn:   "İlanı İncele",
    closeModal:   "Kapat",
    sendMessage:  "Mesaj Gönder",
  },
  en: {
    heading:      "Suggested Roommates",
    subheading:   "Drag to explore",
    dragHint:     "← drag to pass  ·  drag to like →",
    liked:        "liked",
    of:           "/",
    budget:       "Budget",
    languages:    "Languages",
    lifestyle:    "Lifestyle",
    petsOk:       "🐾 Pets OK",
    noPets:       "🚫 No Pets",
    smoker:       "🚬 Smoker",
    nonSmoker:    "🚭 Non-smoker",
    verified:     "Verified",
    match:        "Match",
    perMonth:     "/mo",
    rejectLabel:  "Reject",
    messageLabel: "Message",
    saveLabel:    "Save",
    inspectBtn:   "View Listing",
    closeModal:   "Close",
    sendMessage:  "Send Message",
  },
  fa: {
    heading:      "هم‌خانه‌های پیشنهادی",
    subheading:   "برای کشف بکشید",
    dragHint:     "← برای رد کردن بکشید  ·  برای لایک بکشید →",
    liked:        "لایک شد",
    of:           "/",
    budget:       "بودجه",
    languages:    "زبان‌ها",
    lifestyle:    "سبک زندگی",
    petsOk:       "🐾 حیوانات خانگی مجاز",
    noPets:       "🚫 بدون حیوانات خانگی",
    smoker:       "🚬 سیگاری",
    nonSmoker:    "🚭 غیرسیگاری",
    verified:     "تأیید شده",
    match:        "تطابق",
    perMonth:     "/ماه",
    rejectLabel:  "رد کردن",
    messageLabel: "پیام",
    saveLabel:    "ذخیره",
    inspectBtn:   "مشاهده کامل آگهی",
    closeModal:   "بستن",
    sendMessage:  "ارسال پیام",
  },
  de: {
    heading:      "Vorgeschlagene Mitbewohner",
    subheading:   "Wischen zum Entdecken",
    dragHint:     "← nach links ziehen zum Überspringen  ·  nach rechts ziehen zum Mögen →",
    liked:        "gefällt mir",
    of:           "/",
    budget:       "Budget",
    languages:    "Sprachen",
    lifestyle:    "Lebensstil",
    petsOk:       "🐾 Haustiere erlaubt",
    noPets:       "🚫 Keine Haustiere",
    smoker:       "🚬 Raucher",
    nonSmoker:    "🚭 Nichtraucher",
    verified:     "Verifiziert",
    match:        "Match",
    perMonth:     "/Mo.",
    rejectLabel:  "Überspringen",
    messageLabel: "Nachricht",
    saveLabel:    "Speichern",
    inspectBtn:   "Inserat ansehen",
    closeModal:   "Schließen",
    sendMessage:  "Nachricht senden",
  },
  // Always add "ar" key when adding new translations
  ar: {
    heading:      "شركاء السكن المقترحون",
    subheading:   "اسحب للاستكشاف",
    dragHint:     "← اسحب للتخطي  ·  اسحب للإعجاب →",
    liked:        "تم الإعجاب",
    of:           "/",
    budget:       "الميزانية",
    languages:    "اللغات",
    lifestyle:    "أسلوب الحياة",
    petsOk:       "🐾 الحيوانات الأليفة مقبولة",
    noPets:       "🚫 لا حيوانات أليفة",
    smoker:       "🚬 مدخن",
    nonSmoker:    "🚭 غير مدخن",
    verified:     "موثّق",
    match:        "تطابق",
    perMonth:     "/شهر",
    rejectLabel:  "تخطي",
    messageLabel: "رسالة",
    saveLabel:    "حفظ",
    inspectBtn:   "عرض الإعلان كاملاً",
    closeModal:   "إغلاق",
    sendMessage:  "إرسال رسالة",
  },
  ru: {
    heading:      "Рекомендуемые соседи",
    subheading:   "Свайпайте для просмотра",
    dragHint:     "← свайп влево — пропустить  ·  свайп вправо — нравится →",
    liked:        "Нравится",
    of:           "/",
    budget:       "Бюджет",
    languages:    "Языки",
    lifestyle:    "Образ жизни",
    petsOk:       "🐾 Животные разрешены",
    noPets:       "🚫 Без животных",
    smoker:       "🚬 Курящий",
    nonSmoker:    "🚭 Некурящий",
    verified:     "Проверено",
    match:        "Совпадение",
    perMonth:     "/месяц",
    rejectLabel:  "Пропустить",
    messageLabel: "Сообщение",
    saveLabel:    "Сохранить",
    inspectBtn:   "Посмотреть объявление",
    closeModal:   "Закрыть",
    sendMessage:  "Отправить сообщение",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

const SWIPE_THRESHOLD    = 80;
const VELOCITY_THRESHOLD = 500;

// ─── Glassmorphism card shell styles (shared) ─────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
  background:          "rgba(255, 255, 255, 0.91)",
  backdropFilter:      "blur(22px) saturate(180%)",
  WebkitBackdropFilter:"blur(22px) saturate(180%)",
  border:              "1px solid rgba(255, 255, 255, 0.68)",
  boxShadow: [
    "0 32px 64px -16px rgba(0,0,0,0.20)",
    "0 16px 32px -8px rgba(0,0,0,0.10)",
    "0 4px 8px -2px rgba(0,0,0,0.06)",
    "inset 0 1px 0 rgba(255,255,255,0.95)",
    "inset 0 -1px 0 rgba(0,0,0,0.04)",
  ].join(", "),
};

const INSPECT_GRAD: React.CSSProperties = {
  background:  "linear-gradient(135deg, #F97316 0%, #a855f7 52%, #6366f1 100%)",
  boxShadow:   "0 10px 28px -6px rgba(168,85,247,0.48), 0 4px 10px -2px rgba(249,115,22,0.32)",
};

const FA_FONT: React.CSSProperties = {
  fontFamily: "'Vazirmatn', 'Tahoma', 'Arial Unicode MS', sans-serif",
};

// ─── SwipeCard ────────────────────────────────────────────────────────────────
function SwipeCard({
  profile,
  stackIndex,
  onSwipe,
  forcedDir,
  labels,
  currency,
  onInspect,
  lang,
}: {
  profile:    Profile;
  stackIndex: number;
  onSwipe:    (dir: "left" | "right") => void;
  forcedDir:  "left" | "right" | null;
  labels:     Labels;
  currency:   Currency;
  onInspect:  () => void;
  lang:       "tr" | "en" | "fa" | "ar" | "de" | "ru";
}) {
  const isTop    = stackIndex === 0;
  const controls = useAnimation();

  const x            = useMotionValue(0);
  const rotate       = useTransform(x, [-280, 0, 280], [-22, 0, 22]);
  const likeOpacity  = useTransform(x, [30, 110], [0, 1]);
  const passOpacity  = useTransform(x, [-110, -30], [1, 0]);

  const throwCard = useCallback(
    async (dir: "left" | "right") => {
      await controls.start({
        x:          dir === "right" ? 720 : -720,
        transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] },
      });
      onSwipe(dir);
    },
    [controls, onSwipe],
  );

  useEffect(() => {
    if (forcedDir) throwCard(forcedDir);
  }, [forcedDir]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      const right = info.offset.x > SWIPE_THRESHOLD  || info.velocity.x >  VELOCITY_THRESHOLD;
      const left  = info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD;
      if (right)      throwCard("right");
      else if (left)  throwCard("left");
    },
    [throwCard],
  );

  const scale   = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 18;

  return (
    <motion.div
      className={`absolute inset-0 select-none touch-none origin-bottom overflow-hidden ${
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{
        x:      isTop ? x      : undefined,
        rotate: isTop ? rotate : undefined,
        zIndex: 10 - stackIndex,
      }}
      animate={isTop
        ? controls
        : { scale, y: yOffset, opacity: 1 - stackIndex * 0.14 }
      }
      initial={{ scale, y: yOffset, opacity: 1 - stackIndex * 0.14 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.75}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileDrag={isTop ? { scale: 1.02 } : undefined}
    >
      {/* LIKE stamp */}
      {isTop && (
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-4 left-4 z-20 pointer-events-none border-[3px] border-orange-500 rounded-xl px-3 py-1.5 -rotate-12"
        >
          <span className="text-orange-500 font-black text-base tracking-widest">LIKE ♥</span>
        </motion.div>
      )}

      {/* PASS stamp */}
      {isTop && (
        <motion.div
          style={{ opacity: passOpacity }}
          className="absolute top-4 right-4 z-20 pointer-events-none border-[3px] border-stone-400 rounded-xl px-3 py-1.5 rotate-12"
        >
          <span className="text-stone-400 font-black text-base tracking-widest">PASS ✕</span>
        </motion.div>
      )}

      {/*
        dir="ltr" is critical: isolates every card from any ancestor RTL context
        so numbers, ranges (e.g. $700–$1,000) and flex layout never flip.
      */}
      <div dir="ltr" className="w-full h-full rounded-3xl overflow-hidden flex flex-col" style={{ ...CARD_STYLE, background: "rgba(255,255,255,1)" }}>

        {/* Header gradient */}
        <div className={`relative bg-gradient-to-br ${profile.gradient} h-44 flex-shrink-0`}>

          {isTop && (
            <>
              {/* Verified badge */}
              {profile.verified && (
                <div className="absolute top-3.5 left-4 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md shadow-emerald-600/30">
                  ✓ {labels.verified}
                </div>
              )}

              {/* Match % pill */}
              <div
                className="absolute top-3.5 right-4 rounded-2xl px-3 py-1.5 shadow-lg"
                style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(12px)" }}
              >
                <span className="text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent" style={{ direction: "ltr", unicodeBidi: "embed" }}>
                  {profile.match}% {labels.match}
                </span>
              </div>

              {/* Avatar + name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/55 to-transparent flex items-end gap-3">
                <div
                  className="w-12 h-12 flex-shrink-0 rounded-2xl border border-white/30 flex items-center justify-center font-black text-base text-white shadow-xl"
                  style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)" }}
                >
                  {profile.initials}
                </div>
                <div>
                  <p className="font-black text-white text-base leading-tight drop-shadow">
                    {profile.name}, {profile.age}
                  </p>
                  <p className="text-white/80 text-xs font-medium">{profile.occupation}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Card body */}
        <div className="flex-1 px-4 pt-3 pb-3 flex flex-col gap-2 overflow-hidden min-h-0" style={!isTop ? { visibility: "hidden" } : undefined}>

          {/* Location */}
          <div className="flex items-center text-xs font-medium text-stone-500">
            <span className="mr-1.5">📍</span>
            <span>{profile.city}, {profile.country}</span>
            <span className="ml-auto text-stone-400 font-normal">{profile.nationality}</span>
          </div>

          {/* Budget — explicit ltr prevents dash-separated ranges from flipping */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex-shrink-0">
              {labels.budget}
            </span>
            <div className="flex-1 h-px bg-stone-100" />
            <span
              className="text-sm font-black text-stone-800 whitespace-nowrap"
              style={{ direction: "ltr", unicodeBidi: "embed" }}
            >
              {convertBudgetRange(profile.budget, currency)}
              <span className="text-xs font-medium text-stone-400 ml-0.5">{labels.perMonth}</span>
            </span>
          </div>

          {/* Languages */}
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              {labels.languages}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2.5 py-0.5 bg-orange-50 text-orange-800 border border-orange-100 rounded-full text-[11px] font-semibold"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Lifestyle */}
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              {labels.lifestyle}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.lifestyle.map((pref) => (
                <span
                  key={pref}
                  className="px-2.5 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[11px] font-medium"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 italic">
            &ldquo;{lang === "tr" ? profile.bioTr : lang === "fa" ? profile.bioFa : lang === "ar" ? (profile.bioAr ?? profile.bio) : profile.bio}&rdquo;
          </p>

          {/* Pets / Smoking */}
          <div className="flex items-center gap-3 border-t border-stone-100 pt-1.5">
            <span className={`text-xs font-medium ${profile.pets ? "text-emerald-600" : "text-stone-400"}`}>
              {profile.pets ? labels.petsOk : labels.noPets}
            </span>
            <span className={`text-xs font-medium ${profile.smoking ? "text-amber-600" : "text-stone-400"}`}>
              {profile.smoking ? labels.smoker : labels.nonSmoker}
            </span>
          </div>

          {/* ── Inspect Notice CTA ─────────────────────────────────────────── */}
          <button
            onClick={(e) => { e.stopPropagation(); onInspect(); }}
            className="mt-auto w-full rounded-2xl py-2.5 flex items-center justify-center gap-2 font-bold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.015] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            style={INSPECT_GRAD}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span dir="rtl" style={FA_FONT}>{labels.inspectBtn}</span>
          </button>

        </div>
      </div>
    </motion.div>
  );
}

// ─── Inspect Modal ────────────────────────────────────────────────────────────
function InspectModal({
  profile,
  labels,
  currency,
  onClose,
  lang,
}: {
  profile:  Profile;
  labels:   Labels;
  currency: Currency;
  onClose:  () => void;
  lang:     "tr" | "en" | "fa" | "ar" | "de" | "ru";
}) {
  return (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.62)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        key="modal-card"
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        dir="ltr"
        className="rounded-3xl overflow-hidden w-full max-w-sm max-h-[88vh] overflow-y-auto"
        style={{
          background:           "rgba(255,255,255,0.97)",
          backdropFilter:       "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border:               "1px solid rgba(255,255,255,0.72)",
          boxShadow:            "0 48px 96px -24px rgba(0,0,0,0.32), 0 24px 48px -12px rgba(0,0,0,0.14)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className={`relative bg-gradient-to-br ${profile.gradient} h-56`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}
            aria-label="Close"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {profile.verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
              ✓ {labels.verified}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent flex items-end gap-3">
            <div
              className="w-14 h-14 rounded-2xl border border-white/30 flex items-center justify-center font-black text-lg text-white shadow-xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)" }}
            >
              {profile.initials}
            </div>
            <div>
              <p className="font-black text-white text-xl leading-tight drop-shadow">
                {profile.name}, {profile.age}
              </p>
              <p className="text-white/80 text-sm font-medium">{profile.occupation}</p>
            </div>
            <div
              className="ml-auto rounded-xl px-3 py-1.5 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(10px)" }}
            >
              <span className="text-sm font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent" style={{ direction: "ltr", unicodeBidi: "embed" }}>
                {profile.match}% {labels.match}
              </span>
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-5 space-y-4">

          <div className="flex items-center text-sm text-stone-600">
            <span className="mr-2">📍</span>
            <span className="font-medium">{profile.city}, {profile.country}</span>
            <span className="ml-auto text-stone-400">{profile.nationality}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{labels.budget}</span>
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-base font-black text-stone-800" style={{ direction: "ltr", unicodeBidi: "embed" }}>
              {convertBudgetRange(profile.budget, currency)}
              <span className="text-xs text-stone-400 ml-1">{labels.perMonth}</span>
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{labels.languages}</p>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((l) => (
                <span key={l} className="px-3 py-1 bg-orange-50 text-orange-800 border border-orange-100 rounded-full text-xs font-semibold">
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{labels.lifestyle}</p>
            <div className="flex flex-wrap gap-2">
              {profile.lifestyle.map((pref) => (
                <span key={pref} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">
                  {pref}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "rgba(248,247,246,0.9)" }}>
            <p className="text-sm text-stone-600 leading-relaxed italic">
              &ldquo;{lang === "tr" ? profile.bioTr : lang === "fa" ? profile.bioFa : lang === "ar" ? (profile.bioAr ?? profile.bio) : profile.bio}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-4 py-2 border-t border-stone-100">
            <span className={`text-sm font-medium ${profile.pets ? "text-emerald-600" : "text-stone-400"}`}>
              {profile.pets ? labels.petsOk : labels.noPets}
            </span>
            <span className={`text-sm font-medium ${profile.smoking ? "text-amber-600" : "text-stone-400"}`}>
              {profile.smoking ? labels.smoker : labels.nonSmoker}
            </span>
          </div>

          {/* Send message CTA */}
          <button
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 hover:opacity-90 hover:scale-[1.015] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            style={INSPECT_GRAD}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span dir="rtl" style={FA_FONT}>{labels.sendMessage}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function RoommateCards({
  lang = "en",
  currency = "USD",
}: {
  lang?:           "tr" | "en" | "fa" | "ar" | "de" | "ru";
  currency?:       Currency;
  currencySymbol?: string;
}) {
  const [topIndex,        setTopIndex]        = useState(0);
  const [likedCount,      setLikedCount]      = useState(0);
  const [forcedDir,       setForcedDir]       = useState<"left" | "right" | null>(null);
  const [savedSet,        setSavedSet]        = useState<Set<number>>(new Set());
  const [animSave,        setAnimSave]        = useState(false);
  const [inspectedProfile, setInspectedProfile] = useState<Profile | null>(null);

  const labels         = LABELS[lang];
  const total          = PROFILES.length;
  const currentProfile = PROFILES[topIndex % total];
  const isSaved        = savedSet.has(currentProfile.id);

  const handleSwipe = useCallback(
    (dir: "left" | "right") => {
      if (dir === "right") setLikedCount((c) => c + 1);
      setTopIndex((i) => (i + 1) % total);
      setForcedDir(null);
    },
    [total],
  );

  const triggerSwipe = useCallback(
    (dir: "left" | "right") => {
      if (!forcedDir) setForcedDir(dir);
    },
    [forcedDir],
  );

  const toggleSave = useCallback(() => {
    setSavedSet((prev) => {
      const next = new Set(prev);
      if (next.has(currentProfile.id)) next.delete(currentProfile.id);
      else next.add(currentProfile.id);
      return next;
    });
    setAnimSave(true);
    setTimeout(() => setAnimSave(false), 420);
  }, [currentProfile.id]);

  // Back-to-front render order so the top card paints last (on top)
  const stack = [2, 1, 0].map((offset) => ({
    profile:    PROFILES[(topIndex + offset) % total],
    stackIndex: offset,
    seqKey:     topIndex + offset,
  }));

  return (
    <>
      <div className="flex flex-col items-center w-full select-none">

        {/* Section header */}
        <div className="text-center mb-6 w-full">
          <h3 className="text-xl font-black text-stone-900 tracking-tight">{labels.heading}</h3>
          <p className="text-xs text-stone-400 mt-1 font-medium">{labels.subheading}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-5 text-sm">
          <span className="font-black text-orange-500">{likedCount}</span>
          <span className="text-stone-400 font-medium">{labels.liked}</span>
          <span className="text-stone-200 mx-1">·</span>
          <span className="text-stone-500 font-medium">
            {(topIndex % total) + 1}{labels.of}{total}
          </span>
        </div>

        {/* Card stack */}
        <div className="relative w-full max-w-[320px] sm:max-w-[340px] h-[540px] overflow-hidden">
          {stack.map(({ profile, stackIndex, seqKey }) => (
            <SwipeCard
              key={seqKey}
              profile={profile}
              stackIndex={stackIndex}
              onSwipe={handleSwipe}
              forcedDir={stackIndex === 0 ? forcedDir : null}
              labels={labels}
              currency={currency}
              onInspect={() => setInspectedProfile(profile)}
              lang={lang}
            />
          ))}
        </div>

        {/* Drag hint */}
        <p className="mt-4 text-[11px] text-stone-400 font-medium tracking-wide text-center pointer-events-none px-4">
          {labels.dragHint}
        </p>

        {/* ── Action buttons: Reject | Message | Save ──────────────────────── */}
        <div className="flex items-start justify-center gap-7 mt-6">

          {/* Reject */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => triggerSwipe("left")}
              disabled={!!forcedDir}
              aria-label={labels.rejectLabel}
              className="w-14 h-14 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center shadow-lg hover:border-red-300 hover:bg-red-50 hover:scale-110 hover:-translate-y-0.5 hover:shadow-red-200/60 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <span dir="rtl" className="text-[11px] font-bold text-stone-400" style={FA_FONT}>
              {labels.rejectLabel}
            </span>
          </div>

          {/* Message — center, larger, gradient */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => triggerSwipe("right")}
              disabled={!!forcedDir}
              aria-label={labels.messageLabel}
              className="w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-95 hover:scale-110 hover:-translate-y-1 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:  "linear-gradient(135deg, #F97316, #a855f7, #6366f1)",
                boxShadow:   "0 16px 40px -8px rgba(168,85,247,0.48), 0 8px 16px -4px rgba(249,115,22,0.32)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <span dir="rtl" className="text-[11px] font-bold text-stone-500" style={FA_FONT}>
              {labels.messageLabel}
            </span>
          </div>

          {/* Save — heart toggle */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleSave}
              aria-label={labels.saveLabel}
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-200 active:scale-95 hover:scale-110 hover:-translate-y-0.5 ${
                isSaved
                  ? "bg-gradient-to-br from-rose-400 to-pink-500 border-rose-300 shadow-rose-400/30 hover:shadow-rose-500/40"
                  : "bg-white border-rose-200 hover:border-rose-300 hover:bg-rose-50 hover:shadow-rose-200/60"
              }`}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={isSaved ? "white" : "none"}
                stroke={isSaved ? "white" : "#fb7185"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={animSave ? "animate-heart-pop" : ""}
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <span dir="rtl" className="text-[11px] font-bold text-stone-400" style={FA_FONT}>
              {labels.saveLabel}
            </span>
          </div>

        </div>
      </div>

      {/* Inspect modal — rendered via portal-like AnimatePresence outside the card stack */}
      <AnimatePresence>
        {inspectedProfile && (
          <InspectModal
            profile={inspectedProfile}
            labels={labels}
            currency={currency}
            onClose={() => setInspectedProfile(null)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </>
  );
}
