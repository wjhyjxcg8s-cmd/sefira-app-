"use client";

import { useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from "framer-motion";
import {
  type Currency,
  convertBudgetRange,
} from "@/app/lib/currency";

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
  verified: boolean;
  pets: boolean;
  smoking: boolean;
  budget: string;
}

// ─── Profile data ─────────────────────────────────────────────────────────────
const PROFILES: Profile[] = [
  {
    id: 1, name: "Emma Wilson",    age: 26, occupation: "UX Designer",       nationality: "British",
    languages: ["English", "German"],
    match: 97, city: "Berlin",    country: "Germany",
    gradient: "from-violet-600 via-purple-700 to-indigo-800", initials: "EW",
    lifestyle: ["Night owl", "Minimalist", "Yoga"],
    bio: "Creative designer seeking a quiet, tidy flatmate who appreciates good aesthetics.",
    verified: true,  pets: false, smoking: false, budget: "700-1000",
  },
  {
    id: 2, name: "Kai Tanaka",     age: 29, occupation: "Software Engineer", nationality: "Japanese",
    languages: ["Japanese", "English"],
    match: 94, city: "Berlin",    country: "Germany",
    gradient: "from-cyan-600 via-blue-700 to-indigo-800",     initials: "KT",
    lifestyle: ["Early bird", "Gamer", "Coffee lover"],
    bio: "Remote dev who values clean spaces and good coffee. Let's build a calm, focused home.",
    verified: true,  pets: true,  smoking: false, budget: "800-1100",
  },
  {
    id: 3, name: "Sofia Ramirez",  age: 24, occupation: "Medical Student",   nationality: "Spanish",
    languages: ["Spanish", "English", "French"],
    match: 91, city: "Barcelona", country: "Spain",
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",    initials: "SR",
    lifestyle: ["Student", "Active", "Social"],
    bio: "Med student, tidy and friendly. Latin music on weekends, focused on weeknights.",
    verified: false, pets: false, smoking: false, budget: "500-750",
  },
  {
    id: 4, name: "Lena Müller",    age: 28, occupation: "Architect",         nationality: "German",
    languages: ["German", "English"],
    match: 89, city: "Munich",    country: "Germany",
    gradient: "from-amber-500 via-orange-600 to-rose-700",    initials: "LM",
    lifestyle: ["Minimalist", "Cyclist", "Foodie"],
    bio: "Architect with a love for clean design and weekend hikes. Always keeps tidy spaces.",
    verified: true,  pets: false, smoking: false, budget: "900-1200",
  },
  {
    id: 5, name: "Mehmet Yılmaz", age: 31, occupation: "Chef",              nationality: "Turkish",
    languages: ["Turkish", "English", "German"],
    match: 86, city: "Istanbul",  country: "Turkey",
    gradient: "from-emerald-600 via-teal-700 to-cyan-800",    initials: "MY",
    lifestyle: ["Early bird", "Foodie", "Calm"],
    bio: "Professional chef who cooks for two and keeps the kitchen spotless. Early riser.",
    verified: true,  pets: true,  smoking: false, budget: "400-700",
  },
  {
    id: 6, name: "Priya Sharma",   age: 27, occupation: "Data Scientist",    nationality: "Indian",
    languages: ["Hindi", "English"],
    match: 83, city: "Dubai",     country: "UAE",
    gradient: "from-purple-500 via-violet-600 to-indigo-700", initials: "PS",
    lifestyle: ["Night owl", "Reader", "Introvert"],
    bio: "Data scientist, quiet and focused. Love a good book and strong chai. Very tidy.",
    verified: false, pets: false, smoking: false, budget: "1000-1500",
  },
];

// ─── i18n labels ──────────────────────────────────────────────────────────────
const LABELS = {
  tr: {
    heading:    "Önerilen Ev Arkadaşları",
    subheading: "Sürükle ve keşfet",
    dragHint:   "← geçmek için sürükle  ·  beğenmek için sürükle →",
    liked:      "beğenildi",
    of:         "/",
    budget:     "Bütçe",
    languages:  "Diller",
    lifestyle:  "Yaşam Tarzı",
    petsOk:     "🐾 Evcil Hayvan OK",
    noPets:     "🚫 Evcil Hayvan Yok",
    smoker:     "🚬 Sigara İçiyor",
    nonSmoker:  "🚭 Sigara İçmiyor",
    verified:   "Doğrulandı",
    match:      "Eşleşme",
    perMonth:   "/ay",
    passLabel:  "Geç",
    likeLabel:  "Mesaj",
    saveLabel:  "Kaydet",
  },
  en: {
    heading:    "Suggested Roommates",
    subheading: "Drag to explore",
    dragHint:   "← drag to pass  ·  drag to like →",
    liked:      "liked",
    of:         "/",
    budget:     "Budget",
    languages:  "Languages",
    lifestyle:  "Lifestyle",
    petsOk:     "🐾 Pets OK",
    noPets:     "🚫 No Pets",
    smoker:     "🚬 Smoker",
    nonSmoker:  "🚭 Non-smoker",
    verified:   "Verified",
    match:      "Match",
    perMonth:   "/mo",
    passLabel:  "Pass",
    likeLabel:  "Message",
    saveLabel:  "Save",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

const SWIPE_THRESHOLD    = 80;
const VELOCITY_THRESHOLD = 500;

// ─── SwipeCard ────────────────────────────────────────────────────────────────
function SwipeCard({
  profile,
  stackIndex,
  onSwipe,
  forcedDir,
  labels,
  currency,
}: {
  profile: Profile;
  stackIndex: number;
  onSwipe: (dir: "left" | "right") => void;
  forcedDir: "left" | "right" | null;
  labels: Labels;
  currency: Currency;
}) {
  const isTop    = stackIndex === 0;
  const controls = useAnimation();

  const x           = useMotionValue(0);
  const rotate      = useTransform(x, [-280, 0, 280], [-22, 0, 22]);
  const likeOpacity = useTransform(x, [30, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -30], [1, 0]);

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
      if (right) throwCard("right");
      else if (left) throwCard("left");
    },
    [throwCard],
  );

  const scale   = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 18;

  return (
    <motion.div
      className={`absolute inset-0 select-none touch-none origin-bottom ${
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

      {/* Card shell */}
      <div className="w-full h-full bg-white rounded-3xl shadow-2xl shadow-stone-300/40 overflow-hidden border border-stone-100 flex flex-col">

        {/* Header gradient */}
        <div className={`relative bg-gradient-to-br ${profile.gradient} h-44 flex-shrink-0`}>
          {profile.verified && (
            <div className="absolute top-3.5 left-4 flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
              ✓ {labels.verified}
            </div>
          )}
          <div className="absolute top-3.5 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-1.5 shadow-lg">
            <span className="text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {profile.match}% {labels.match}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex items-end gap-3">
            <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-base text-white shadow-xl">
              {profile.initials}
            </div>
            <div>
              <p className="font-black text-white text-base leading-tight drop-shadow">
                {profile.name}, {profile.age}
              </p>
              <p className="text-white/80 text-xs font-medium">{profile.occupation}</p>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden min-h-0">

          {/* Location row */}
          <div className="flex items-center text-xs font-medium text-stone-500">
            <span className="mr-1.5">📍</span>
            <span>{profile.city}, {profile.country}</span>
            <span className="ml-auto text-stone-400 font-normal">{profile.nationality}</span>
          </div>

          {/* Budget — single converted value, no duplicate layers */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex-shrink-0">
              {labels.budget}
            </span>
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-sm font-black text-stone-800 whitespace-nowrap">
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
                  className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[11px] font-semibold"
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
            &ldquo;{profile.bio}&rdquo;
          </p>

          {/* Pets / Smoking */}
          <div className="mt-auto flex items-center gap-3 pt-2 border-t border-stone-100">
            <span className={`text-xs font-medium ${profile.pets ? "text-emerald-600" : "text-stone-400"}`}>
              {profile.pets ? labels.petsOk : labels.noPets}
            </span>
            <span className={`text-xs font-medium ${profile.smoking ? "text-amber-600" : "text-stone-400"}`}>
              {profile.smoking ? labels.smoker : labels.nonSmoker}
            </span>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function RoommateCards({
  lang = "en",
  currency = "USD",
  currencySymbol,
}: {
  lang?: "tr" | "en";
  currency?: Currency;
  currencySymbol?: string;
}) {
  const [topIndex,   setTopIndex]   = useState(0);
  const [likedCount, setLikedCount] = useState(0);
  const [forcedDir,  setForcedDir]  = useState<"left" | "right" | null>(null);
  const [savedSet,   setSavedSet]   = useState<Set<number>>(new Set());
  const [animSave,   setAnimSave]   = useState(false);

  const labels = LABELS[lang];
  const total  = PROFILES.length;

  const currentProfileId = PROFILES[topIndex % total].id;
  const isSaved          = savedSet.has(currentProfileId);

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
      if (next.has(currentProfileId)) next.delete(currentProfileId);
      else next.add(currentProfileId);
      return next;
    });
    setAnimSave(true);
    setTimeout(() => setAnimSave(false), 420);
  }, [currentProfileId]);

  // Build the 3-card stack: [top=0, mid=1, back=2], rendered back→front
  const stack = [2, 1, 0].map((offset) => ({
    profile:    PROFILES[(topIndex + offset) % total],
    stackIndex: offset,
    seqKey:     topIndex + offset,
  }));

  return (
    <div className="flex flex-col items-center w-full select-none">

      {/* Section header */}
      <div className="text-center mb-6 w-full">
        <h3 className="text-xl font-black text-stone-900 tracking-tight">
          {labels.heading}
        </h3>
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
      <div className="relative w-full max-w-[320px] sm:max-w-[340px] h-[500px]">
        {stack.map(({ profile, stackIndex, seqKey }) => (
          <SwipeCard
            key={seqKey}
            profile={profile}
            stackIndex={stackIndex}
            onSwipe={handleSwipe}
            forcedDir={stackIndex === 0 ? forcedDir : null}
            labels={labels}
            currency={currency}
          />
        ))}
      </div>

      {/* Drag hint */}
      <p className="mt-4 text-[11px] text-stone-400 font-medium tracking-wide text-center pointer-events-none px-4">
        {labels.dragHint}
      </p>

      {/* ── 3 floating icon-only action buttons ── */}
      <div className="flex items-center justify-center gap-5 mt-6">

        {/* 1 · Message / Connect — primary brand gradient */}
        <button
          onClick={() => triggerSwipe("right")}
          disabled={!!forcedDir}
          aria-label={labels.likeLabel}
          className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-orange-500 via-fuchsia-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-orange-500/35 hover:opacity-95 hover:scale-110 hover:-translate-y-0.5 hover:shadow-fuchsia-500/45 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        {/* 2 · Save — heart toggle with pop animation */}
        <button
          onClick={toggleSave}
          aria-label={labels.saveLabel}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-200 active:scale-95 hover:scale-110 hover:-translate-y-0.5 ${
            isSaved
              ? "bg-gradient-to-br from-rose-400 to-pink-500 border-rose-300 shadow-rose-400/30 hover:shadow-rose-500/40"
              : "bg-white border-rose-200 hover:border-rose-300 hover:shadow-rose-200/60"
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

        {/* 3 · Reject / Skip — clean minimal X */}
        <button
          onClick={() => triggerSwipe("left")}
          disabled={!!forcedDir}
          aria-label={labels.passLabel}
          className="w-14 h-14 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center shadow-lg hover:border-stone-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-stone-200/60 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-stone-400" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

      </div>

    </div>
  );
}
