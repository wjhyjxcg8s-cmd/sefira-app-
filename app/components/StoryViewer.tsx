"use client";

// Verified flow: tap right half → onPointerUp fires (no onClick — kills the
// iOS pointer+synthesized-click double-fire) → pointerType/duration/movement
// guard passes → navLock guard passes → goNext() functional setIndex update →
// index changes → timer effect's cleanup cancels the old RAF, a fresh one is
// requested for the new index → two-layer incoming/current cross-fade runs.
// Index lives only in this component's state (`index`); nothing else in this
// file may call setIndex, and page.tsx never holds it.

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { type Lang } from "@/app/lib/LangContext";
import { formatMessageTime } from "@/app/lib/formatTime";

const STORY_DURATION_MS = 5000;
const CLOSE_SWIPE_THRESHOLD = 80;
const NAV_LOCK_MS = 300;
const TAP_MAX_DURATION_MS = 250;
const TAP_MAX_MOVEMENT_PX = 10;
const CROSSFADE_MS = 200;

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

interface Layer {
  story: StoryViewerStory;
}

interface StoryViewerProps {
  stories: StoryViewerStory[];
  initialIndex: number;
  lang: Lang;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export default function StoryViewer({ stories, initialIndex, lang, onClose, onIndexChange }: StoryViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [entered, setEntered] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const story = stories[index];

  // Two-layer cross-fade: `currentLayer` is fully visible; `incomingLayer` (if any)
  // mounts at opacity 0 and only fades in once its image has actually loaded,
  // which is what kills the white-flash-on-swap (a single swapped `src` renders
  // blank for a frame before the new image paints).
  const [currentLayer, setCurrentLayer] = useState<Layer | null>(() => (story ? { story } : null));
  const [incomingLayer, setIncomingLayer] = useState<Layer | null>(null);
  const [incomingVisible, setIncomingVisible] = useState(false);
  const isFirstStoryEffect = useRef(true);
  const lastResetIndexRef = useRef(-1);

  const elapsedRef = useRef(0);
  const isPausedRef = useRef(isPaused);
  const touchStartYRef = useRef<number | null>(null);
  const dragYRef = useRef(0);
  const navLockRef = useRef(0);
  const pressRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const onCloseRef = useRef(onClose);
  const onIndexChangeRef = useRef(onIndexChange);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onIndexChangeRef.current = onIndexChange; }, [onIndexChange]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

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

  // Report every index change up for view-tracking. This is the ONLY thing
  // the parent learns about navigation — it never drives it.
  useEffect(() => {
    onIndexChangeRef.current?.(index);
  }, [index]);

  // Single source of truth for navigation. Functional updates only — nothing
  // here closes over `index`, so a stale render can never undo a newer one.
  const goNext = useCallback(() => {
    setIndex((i) => (i + 1 < stories.length ? i + 1 : (onCloseRef.current(), i)));
  }, [stories.length]);
  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Shared debounce across tap zones, keyboard, and the auto-advance timer —
  // whichever nav path fires first within the window wins, the rest are no-ops.
  const guardedNav = useCallback((fn: () => void) => {
    const now = Date.now();
    if (now - navLockRef.current < NAV_LOCK_MS) return;
    navLockRef.current = now;
    fn();
  }, []);

  // Start (or restart) the incoming layer whenever the active story changes.
  // Skipped on first mount — currentLayer already holds story 0 via lazy init.
  useEffect(() => {
    if (!story) return;
    if (isFirstStoryEffect.current) {
      isFirstStoryEffect.current = false;
      return;
    }
    setIncomingLayer((inc) => (inc && inc.story.id === story.id ? inc : { story }));
    setIncomingVisible(false);
  }, [story]);

  // Backdrop-only fade (media cross-fade is handled by the two layers above)
  useEffect(() => {
    setFadeIn(false);
    const raf = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(raf);
  }, [index]);

  // Preload both neighbors so advancing OR going back never shows a blank frame
  useEffect(() => {
    [stories[index + 1], stories[index - 1]].forEach((neighbor) => {
      if (!neighbor) return;
      const img = new window.Image();
      img.src = neighbor.image_url;
    });
  }, [index, stories]);

  // Drive the auto-advance timer. Elapsed time only resets when `index` has
  // actually changed (tracked via lastResetIndexRef) — re-running this effect
  // for an `isPaused` flip just re-arms the RAF without losing progress,
  // since pause/resume itself is already handled by isPausedRef inside tick.
  useEffect(() => {
    if (lastResetIndexRef.current !== index) {
      lastResetIndexRef.current = index;
      elapsedRef.current = 0;
      setProgress(0);
    }

    let raf: number;
    let lastFrameTime = performance.now();
    const tick = (now: number) => {
      if (!isPausedRef.current) {
        elapsedRef.current += now - lastFrameTime;
      }
      lastFrameTime = now;
      const pct = Math.min(100, (elapsedRef.current / STORY_DURATION_MS) * 100);
      setProgress(pct);
      if (elapsedRef.current >= STORY_DURATION_MS) {
        guardedNav(goNext);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, isPaused, goNext, guardedNav]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      else if (e.key === "ArrowLeft") guardedNav(goPrev);
      else if (e.key === "ArrowRight") guardedNav(goNext);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, guardedNav]);

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

  // Tap-zone press tracking: pointerdown records where/when the press started;
  // pointerup (the ONLY nav trigger — no onClick, so no synthesized double-fire)
  // only navigates if it looks like a genuine tap, not a pause-hold or a swipe.
  const handleZonePointerDown = (e: React.PointerEvent) => {
    pressRef.current = { time: Date.now(), x: e.clientX, y: e.clientY };
  };

  const handleZonePointerUp = (direction: "prev" | "next") => (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const press = pressRef.current;
    pressRef.current = null;
    if (!press) return;
    const duration = Date.now() - press.time;
    const distance = Math.hypot(e.clientX - press.x, e.clientY - press.y);
    if (duration >= TAP_MAX_DURATION_MS || distance >= TAP_MAX_MOVEMENT_PX) return;
    guardedNav(direction === "next" ? goNext : goPrev);
  };

  const progressRowClassName = isRTL
    ? "absolute top-0 inset-x-0 z-40 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 flex gap-1 flex-row-reverse"
    : "absolute top-0 inset-x-0 z-40 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 flex gap-1";

  const prevZoneClassName = isRTL
    ? "absolute top-24 bottom-0 right-0 z-30 w-[35%] select-none touch-manipulation active:bg-white/[0.03]"
    : "absolute top-24 bottom-0 left-0 z-30 w-[35%] select-none touch-manipulation active:bg-white/[0.03]";

  const nextZoneClassName = isRTL
    ? "absolute top-24 bottom-0 left-0 z-30 w-[65%] select-none touch-manipulation active:bg-white/[0.03]"
    : "absolute top-24 bottom-0 right-0 z-30 w-[65%] select-none touch-manipulation active:bg-white/[0.03]";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black select-none overflow-hidden"
      style={{
        transform: `translateY(${dragY}px)`,
        opacity: isDragging ? Math.max(1 - dragY / 400, 0.3) : 1,
        transition: isDragging ? "none" : "transform 200ms ease, opacity 200ms ease",
        WebkitTapHighlightColor: "transparent",
        WebkitUserSelect: "none",
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
      <style>{`
        @keyframes storyKenBurns {
          0% { transform: scale(1.25); }
          100% { transform: scale(1.4); }
        }
        .story-kenburns {
          animation: storyKenBurns 20s ease-in-out infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .story-kenburns { animation: none; transform: scale(1.3); }
        }
      `}</style>
      <div className="absolute inset-0 z-0 transition-opacity duration-200 ease-out" style={{ opacity: fadeIn ? 1 : 0 }}>
        <Image
          src={story.image_url}
          alt=""
          fill
          aria-hidden="true"
          className="story-kenburns object-cover blur-3xl opacity-90 saturate-150"
        />
        <div className="absolute inset-0 z-[1] bg-black/20" />
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)" }}
        />
      </div>

      {/* Media — full-width, no card framing (Instagram doesn't frame landscape media) */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center px-0 pt-20 pb-12"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.96)",
          transition: "opacity 250ms ease-out, transform 250ms ease-out",
        }}
      >
        {currentLayer && (
          <Image
            key={currentLayer.story.id}
            src={currentLayer.story.image_url}
            alt={currentLayer.story.caption ?? "Hikaye"}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 object-contain transition-opacity ease-out"
            style={{
              opacity: incomingLayer && incomingVisible ? 0 : 1,
              transitionDuration: `${CROSSFADE_MS}ms`,
            }}
          />
        )}
        {incomingLayer && (
          <Image
            key={incomingLayer.story.id}
            src={incomingLayer.story.image_url}
            alt={incomingLayer.story.caption ?? "Hikaye"}
            fill
            sizes="100vw"
            className="absolute inset-0 object-contain transition-opacity ease-out"
            style={{ opacity: incomingVisible ? 1 : 0, transitionDuration: `${CROSSFADE_MS}ms` }}
            onLoad={() => {
              setIncomingVisible(true);
              // Fallback promotion: cached/instant loads can update opacity within
              // the same paint as the mount, in which case no CSS transition ever
              // fires and onTransitionEnd below never runs. Whichever of the two
              // fires first promotes the layer; the other becomes a no-op.
              window.setTimeout(() => {
                setIncomingLayer((inc) => {
                  if (!inc) return null;
                  setCurrentLayer(inc);
                  return null;
                });
              }, CROSSFADE_MS + 50);
            }}
            onTransitionEnd={() => {
              setIncomingLayer((inc) => {
                if (!inc) return null;
                setCurrentLayer(inc);
                return null;
              });
            }}
          />
        )}
      </div>

      {/* Progress bars */}
      <div className={progressRowClassName} style={{ opacity: isPaused ? 0 : 1, transition: "opacity 150ms ease-out" }}>
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
        className="absolute inset-x-0 z-40 top-11 pt-[env(safe-area-inset-top)] pl-5 pr-4 flex items-center gap-2.5 drop-shadow-md"
        style={{ opacity: isPaused ? 0 : 1, transition: "opacity 150ms ease-out" }}
      >
        <Image
          src="/images/sefira-logo.png"
          alt="Sefira"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full ring-1 ring-white/40 object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-white truncate">
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
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Kapat"
        >
          <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur text-white flex items-center justify-center transition-colors group-active:bg-white/25 pointer-events-none">
            <X size={18} />
          </span>
        </button>
      </div>

      {/* Bottom scrim */}
      <div className="absolute bottom-0 inset-x-0 z-10 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Tap zones — div[role=button], NOT <button>: buttons synthesize a
          click ~300ms after pointerup on iOS (double-fire risk) and paint the
          default -webkit-tap-highlight-color (the reported "white sheet").
          onPointerUp is the ONLY trigger; no onClick exists on these at all. */}
      <div
        role="button"
        tabIndex={-1}
        aria-label="Önceki hikaye"
        className={prevZoneClassName}
        style={{ WebkitTapHighlightColor: "transparent" }}
        onPointerDown={handleZonePointerDown}
        onPointerUp={handleZonePointerUp("prev")}
      />
      <div
        role="button"
        tabIndex={-1}
        aria-label="Sonraki hikaye"
        className={nextZoneClassName}
        style={{ WebkitTapHighlightColor: "transparent" }}
        onPointerDown={handleZonePointerDown}
        onPointerUp={handleZonePointerUp("next")}
      />
    </div>,
    document.body
  );
}
