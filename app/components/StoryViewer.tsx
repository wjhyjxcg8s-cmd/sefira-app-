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
    ? "absolute top-0 inset-x-0 z-20 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 flex gap-1 flex-row-reverse"
    : "absolute top-0 inset-x-0 z-20 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 flex gap-1";

  const prevZoneClassName = isRTL
    ? "absolute inset-y-0 right-0 z-30 w-[35%]"
    : "absolute inset-y-0 left-0 z-30 w-[35%]";

  const nextZoneClassName = isRTL
    ? "absolute inset-y-0 left-0 z-30 w-[65%]"
    : "absolute inset-y-0 right-0 z-30 w-[65%]";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-neutral-950 select-none overflow-hidden"
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
      <div className="absolute inset-0 transition-opacity duration-200 ease-out" style={{ opacity: fadeIn ? 1 : 0 }}>
        <Image
          src={story.image_url}
          alt=""
          fill
          aria-hidden="true"
          className="object-cover scale-110 blur-2xl opacity-40"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Media */}
      <div className="absolute inset-0 flex items-center justify-center px-2 py-14">
        <div
          className="relative w-full h-full transition-opacity duration-200 ease-out"
          style={{ opacity: fadeIn ? 1 : 0 }}
        >
          <Image
            src={story.image_url}
            alt={story.caption ?? "Hikaye"}
            fill
            priority
            sizes="100vw"
            className="object-contain rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      {/* Progress bars */}
      <div className={progressRowClassName}>
        {stories.map((s, i) => (
          <div key={s.id} className="h-[3px] flex-1 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
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
        className="absolute inset-x-0 z-20 top-11 pt-[env(safe-area-inset-top)] px-4 flex items-center gap-2.5"
      >
        <Image
          src="/images/sefira-logo.png"
          alt="Sefira"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full ring-1 ring-white/60 object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">
            {story.caption ?? "Sefira"}
          </p>
          <p className="text-xs text-white/70">
            {formatMessageTime(story.created_at, LOCALE_MAP[lang])}
          </p>
        </div>
        <button
          onClick={() => onCloseRef.current()}
          className="w-9 h-9 rounded-full bg-white/15 backdrop-blur text-white flex items-center justify-center active:bg-white/25 flex-shrink-0"
          aria-label="Kapat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Bottom scrim */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Tap zones */}
      <button className={prevZoneClassName} onClick={onPrev} aria-label="Önceki hikaye" />
      <button className={nextZoneClassName} onClick={onNext} aria-label="Sonraki hikaye" />
    </div>,
    document.body
  );
}
