"use client";

import { useEffect, useState } from "react";

export interface VisualViewportState {
  /**
   * Visual-viewport height in px, or `null` before the first client
   * measurement (SSR) and on engines without the visualViewport API. Callers
   * must keep a CSS fallback (100dvh) for that case.
   */
  height: number | null;
  /**
   * Layout-viewport height − visual-viewport height, clamped at 0.
   *
   * Greater than zero means something — in practice the on-screen keyboard —
   * overlays the layout viewport *without resizing it*. That is the iOS Safari
   * behaviour: `dvh` only tracks URL-bar changes, so a 100dvh column keeps its
   * full height and its bottom row ends up underneath the keyboard.
   *
   * It stays ~0 on engines that honour `interactive-widget=resizes-content`
   * (Chromium/Android): there the layout viewport shrinks too, so plain CSS
   * already tracks the keyboard and no JS override is needed. Both platforms
   * converge on the same measurement — only one of them acts on it.
   */
  keyboardInset: number;
}

const INITIAL: VisualViewportState = { height: null, keyboardInset: 0 };

/**
 * Tracks `window.visualViewport`. SSR-safe: renders `INITIAL` on the server and
 * the first client pass, so there is no hydration mismatch.
 */
export function useVisualViewportHeight(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(INITIAL);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return; // unsupported engine — caller keeps its CSS fallback

    let frame = 0;
    const sync = () => {
      // rAF-throttle: iOS fires resize+scroll in bursts through the whole
      // keyboard animation. One measurement per frame is plenty.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        // clientHeight, not innerHeight: this is the layout viewport, and iOS
        // leaves it untouched when the keyboard opens — which is exactly the
        // difference we are trying to measure.
        const layoutHeight = document.documentElement.clientHeight;
        const height = vv.height;
        const keyboardInset = Math.max(0, Math.round(layoutHeight - height));
        // Return `prev` unchanged so React bails out: vv 'scroll' fires often
        // without the height actually moving.
        setState((prev) =>
          prev.height === height && prev.keyboardInset === keyboardInset
            ? prev
            : { height, keyboardInset },
        );
      });
    };

    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  return state;
}
