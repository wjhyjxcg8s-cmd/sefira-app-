"use client";

import { useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from "framer-motion";

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
    verified: true,  pets: false, smoking: false, budget: "700–1 000",
  },
  {
    id: 2, name: "Kai Tanaka",     age: 29, occupation: "Software Engineer", nationality: "Japanese",
    languages: ["Japanese", "English"],
    match: 94, city: "Berlin",    country: "Germany",
    gradient: "from-cyan-600 via-blue-700 to-indigo-800",     initials: "KT",
    lifestyle: ["Early bird", "Gamer", "Coffee lover"],
    bio: "Remote dev who values clean spaces and good coffee. Let's build a calm, focused home.",
    verified: true,  pets: true,  smoking: false, budget: "800–1 100",
  },
  {
    id: 3, name: "Sofia Ramirez",  age: 24, occupation: "Medical Student",   nationality: "Spanish",
    languages: ["Spanish", "English", "French"],
    match: 91, city: "Barcelona", country: "Spain",
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",    initials: "SR",
    lifestyle: ["Student", "Active", "Social"],
    bio: "Med student, tidy and friendly. Latin music on weekends, focused on weeknights.",
    verified: false, pets: false, smoking: false, budget: "500–750",
  },
  {
    id: 4, name: "Lena Müller",    age: 28, occupation: "Architect",         nationality: "German",
    languages: ["German", "English"],
    match: 89, city: "Munich",    country: "Germany",
    gradient: "from-amber-500 via-orange-600 to-rose-700",    initials: "LM",
    lifestyle: ["Minimalist", "Cyclist", "Foodie"],
    bio: "Architect with a love for clean design and weekend hikes. Always keeps tidy spaces.",
    verified: true,  pets: false, smoking: false, budget: "900–1 200",
  },
  {
    id: 5, name: "Mehmet Yılmaz", age: 31, occupation: "Chef",              nationality: "Turkish",
    languages: ["Turkish", "English", "German"],
    match: 86, city: "Istanbul",  country: "Turkey",
    gradient: "from-emerald-600 via-teal-700 to-cyan-800",    initials: "MY",
    lifestyle: ["Early bird", "Foodie", "Calm"],
    bio: "Professional chef who cooks for two and keeps the kitchen spotless. Early riser.",
    verified: true,  pets: true,  smoking: false, budget: "400–700",
  },
  {
    id: 6, name: "Priya Sharma",   age: 27, occupation: "Data Scientist",    nationality: "Indian",
    languages: ["Hindi", "English"],
    match: 83, city: "Dubai",     country: "UAE",
    gradient: "from-purple-500 via-violet-600 to-indigo-700", initials: "PS",
    lifestyle: ["Night owl", "Reader", "Introvert"],
    bio: "Data scientist, quiet and focused. Love a good book and strong chai. Very tidy.",
    verified: false, pets: false, smoking: false, budget: "1 000–1 500",
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
    likeLabel:  "Beğen",
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
    likeLabel:  "Like",
    saveLabel:  "Save",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

const SWIPE_THRESHOLD   = 80;
const VELOCITY_THRESHOLD = 500;

// ─── SwipeCard ────────────────────────────────────────────────────────────────
function SwipeCard({
  profile,
  stackIndex,
  onSwipe,
  forcedDir,
  labels,
}: {
  profile: Profile;
  stackIndex: number;
  onSwipe: (dir: "left" | "right") => void;
  forcedDir: "left" | "right" | null;
  labels: Labels;
}) {
  const isTop   = stackIndex === 0;
  const controls = useAnimation();

  // Motion values — drive rotation and stamp opacity from drag position
  const x            = useMotionValue(0);
  const rotate       = useTransform(x, [-280, 0, 280], [-22, 0, 22]);
  const likeOpacity  = useTransform(x, [30, 110], [0, 1]);
  const passOpacity  = useTransform(x, [-110, -30], [1, 0]);

  // Throw the card off-screen, then notify parent
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

  // Button-triggered swipe
  useEffect(() => {
    if (forcedDir) throwCard(forcedDir);
  }, [forcedDir]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      const right = info.offset.x > SWIPE_THRESHOLD  || info.velocity.x >  VELOCITY_THRESHOLD;
      const left  = info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD;
      if (right) throwCard("right");
      else if (left) throwCard("left");
      // else: spring back to centre automatically via dragConstraints
    },
    [throwCard],
  );

  // Stack visual positioning
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

      {/* ── LIKE stamp ── */}
      {isTop && (
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-4 left-4 z-20 pointer-events-none border-[3px] border-orange-500 rounded-xl px-3 py-1.5 -rotate-12"
        >
          <span className="text-orange-500 font-black text-base tracking-widest">
            LIKE ♥
          </span>
        </motion.div>
      )}

      {/* ── PASS stamp ── */}
      {isTop && (
        <motion.div
          style={{ opacity: passOpacity }}
          className="absolute top-4 right-4 z-20 pointer-events-none border-[3px] border-stone-400 rounded-xl px-3 py-1.5 rotate-12"
        >
          <span className="text-stone-400 font-black text-base tracking-widest">
            PASS ✕
          </span>
        </motion.div>
      )}

      {/* ── Card shell ── */}
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
          {/* Avatar + name overlay at bottom of header */}
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

          {/* Budget */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              {labels.budget}
            </span>
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-sm font-black text-stone-800">
              €{profile.budget}
              <span className="text-xs font-medium text-stone-400">{labels.perMonth}</span>
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

          {/* Pets / Smoking row */}
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
export default function RoommateCards({ lang = "en" }: { lang?: "tr" | "en" }) {
  const [topIndex,  setTopIndex]  = useState(0);
  const [likedCount, setLikedCount] = useState(0);
  const [forcedDir, setForcedDir] = useState<"left" | "right" | null>(null);

  const labels = LABELS[lang];
  const total  = PROFILES.length;

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

  // Build the 3-card stack: [top=0, mid=1, back=2], rendered back→front
  const stack = [2, 1, 0].map((offset) => ({
    profile:    PROFILES[(topIndex + offset) % total],
    stackIndex: offset,
    seqKey:     topIndex + offset, // monotonically increasing → fresh mount when cycling
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
          />
        ))}
      </div>

      {/* Drag hint */}
      <p className="mt-4 text-[11px] text-stone-400 font-medium tracking-wide text-center pointer-events-none px-4">
        {labels.dragHint}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-6 mt-5">
        {/* Pass */}
        <button
          onClick={() => triggerSwipe("left")}
          disabled={!!forcedDir}
          aria-label={labels.passLabel}
          className="w-14 h-14 rounded-full bg-white border-2 border-stone-200 flex flex-col items-center justify-center gap-0.5 shadow-md hover:border-stone-300 hover:scale-110 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-stone-400 text-lg font-bold leading-none">✕</span>
          <span className="text-[9px] text-stone-400 font-bold tracking-wide uppercase leading-none">{labels.passLabel}</span>
        </button>

        {/* Like */}
        <button
          onClick={() => triggerSwipe("right")}
          disabled={!!forcedDir}
          aria-label={labels.likeLabel}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex flex-col items-center justify-center gap-0.5 shadow-xl shadow-orange-500/30 hover:opacity-95 hover:scale-110 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-white text-2xl leading-none">♥</span>
          <span className="text-[9px] text-white/80 font-bold tracking-wide uppercase leading-none">{labels.likeLabel}</span>
        </button>

        {/* Save / Star */}
        <button
          aria-label={labels.saveLabel}
          className="w-14 h-14 rounded-full bg-white border-2 border-amber-200 flex flex-col items-center justify-center gap-0.5 shadow-md hover:border-amber-400 hover:scale-110 transition-all duration-200 active:scale-95"
        >
          <span className="text-amber-400 text-lg leading-none">★</span>
          <span className="text-[9px] text-amber-400 font-bold tracking-wide uppercase leading-none">{labels.saveLabel}</span>
        </button>
      </div>

    </div>
  );
}
