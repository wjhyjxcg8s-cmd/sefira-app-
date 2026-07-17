"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { type Lang } from "@/app/lib/LangContext";
import { formatMessageTime } from "@/app/lib/formatTime";

const STORY_DURATION_MS = 5000;
const CLOSE_SWIPE_THRESHOLD = 80;

const LOCALE_MAP: Record<Lang, string> = {
  tr: "tr-TR",
  en: "en-US",
  fa: "fa-IR",
  ar: "ar-SA",
  de: "de-DE",
  ru: "ru-RU",
};

interface StoryViewerStory {
  id: string;
  image_url: string;
  caption: string | null;
  week_label: string | null;
  created_at: string;
  views: number;
}

interface StoryViewerProps {
  stories: StoryViewerStory[];
  index: number;
  lang: Lang;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function StoryViewer({ stories, index, lang, onClose, onNext, onPrev }: StoryViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [entered, setEntered] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const elapsedRef = useRef(0);
  const startTimeRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const dragYRef = useRef(0);
  const onNextRef = useRef(onNext);
  const onPrevRef = useRef(onPrev);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onNextRef.current = onNext; }, [onNext]);
  useEffect(() => { onPrevRef.current = onPrev; }, [onPrev]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => { setMounted(true); }, []);

  // One-time entrance: media scales 0.96 → 1 and fades in over 250ms on first mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  const story = stories[index];

  // Reset progress + trigger cross-fade whenever the active story changes
  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
    setFadeIn(false);
    const raf = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(raf);
  }, [index]);

  // Preload the next story's image so advancing never shows a blank frame
  useEffect(() => {
    const next = stories[index + 1];
    if (!next) return;
    const img = new window.Image();
    img.src = next.image_url;
  }, [index, stories]);

  // Drive the auto-advance timer; pausable via isPaused
  useEffect(() => {
    if (isPaused) return;
    startTimeRef.current = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = elapsedRef.current + (now - startTimeRef.current);
      const pct = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
      setProgress(pct);
      if (elapsed >= STORY_DURATION_MS) {
        onNextRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      elapsedRef.current += performance.now() - startTimeRef.current;
    };
  }, [isPaused, index]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      else if (e.key === "ArrowLeft") onPrevRef.current();
      else if (e.key === "ArrowRight") onNextRef.current();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!mounted || !story) return null;

  const isRTL = lang === "fa" || lang === "ar";

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const delta = e.touches[0].clientY - touchStartYRef.current;
    if (delta > 0) {
      dragYRef.current = delta;
      setIsDragging(true);
      setDragY(delta);
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    if (dragYRef.current > CLOSE_SWIPE_THRESHOLD) {
      onCloseRef.current();
      return;
    }
    dragYRef.current = 0;
    setIsDragging(false);
    setDragY(0);
  };

  const progressRowClassName = isRTL
    ? "absolute top-0 inset-x-0 z-40 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 flex gap-1 flex-row-reverse"
    : "absolute top-0 inset-x-0 z-40 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 flex gap-1";

  const prevZoneClassName = isRTL
    ? "absolute top-24 bottom-0 right-0 z-30 w-[35%]"
    : "absolute top-24 bottom-0 left-0 z-30 w-[35%]";

  const nextZoneClassName = isRTL
    ? "absolute top-24 bottom-0 left-0 z-30 w-[65%]"
    : "absolute top-24 bottom-0 right-0 z-30 w-[65%]";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black select-none overflow-hidden"
      style={{
        transform: `translateY(${dragY}px)`,
        opacity: isDragging ? Math.max(1 - dragY / 400, 0.3) : 1,
        transition: isDragging ? "none" : "transform 200ms ease, opacity 200ms ease",
      }}
      onPointerDown={() => setIsPaused(true)}
      onPointerUp={() => setIsPaused(false)}
      onPointerCancel={() => setIsPaused(false)}
      onPointerLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Blurred backdrop — kills the black void */}
      <div className="absolute inset-0 z-0 transition-opacity duration-200 ease-out" style={{ opacity: fadeIn ? 1 : 0 }}>
        <Image
          src={story.image_url}
          alt=""
          fill
          aria-hidden="true"
          className="object-cover scale-125 blur-3xl opacity-90 saturate-150"
        />
        <div className="absolute inset-0 z-[1] bg-black/20" />
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)" }}
        />
      </div>

      {/* Media — floating card over the blurred backdrop */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center px-3 pt-20 pb-10"
        style={{
          opacity: fadeIn ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.96)",
          transition: entered ? "opacity 200ms ease-out" : "opacity 250ms ease-out, transform 250ms ease-out",
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center ring-1 ring-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden rounded-2xl">
          <Image
            src={story.image_url}
            alt={story.caption ?? "Hikaye"}
            fill
            priority
            sizes="100vw"
            className="object-contain w-full h-full rounded-2xl"
          />
        </div>
      </div>

      {/* Progress bars */}
      <div className={progressRowClassName}>
        {stories.map((s, i) => (
          <div key={s.id} className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]"
              style={{
                width: i < index ? "100%" : i > index ? "0%" : `${progress}%`,
                transition: i === index ? "width 100ms linear" : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Top scrim */}
      <div className="absolute top-0 inset-x-0 z-10 h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />

      {/* Header */}
      <div
        className="absolute inset-x-0 z-40 top-11 pt-[env(safe-area-inset-top)] px-4 flex items-center gap-2.5"
      >
        <Image
          src="/images/sefira-logo.png"
          alt="Sefira"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full ring-1 ring-white/40 object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-white drop-shadow-sm truncate">
            {story.caption ?? "Sefira"}
          </p>
          <p className="text-xs text-white/70">
            {formatMessageTime(story.created_at, LOCALE_MAP[lang])}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onCloseRef.current(); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="group relative z-40 w-10 h-10 flex items-center justify-center pointer-events-auto flex-shrink-0"
          aria-label="Kapat"
        >
          <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur text-white flex items-center justify-center transition-colors group-active:bg-white/25 pointer-events-none">
            <X size={18} />
          </span>
        </button>
      </div>

      {/* Bottom scrim */}
      <div className="absolute bottom-0 inset-x-0 z-10 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Tap zones */}
      <button className={prevZoneClassName} onClick={onPrev} aria-label="Önceki hikaye" />
      <button className={nextZoneClassName} onClick={onNext} aria-label="Sonraki hikaye" />
    </div>,
    document.body
  );
}
