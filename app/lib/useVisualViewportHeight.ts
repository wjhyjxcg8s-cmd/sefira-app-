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
   * Offset of the visual viewport's top edge within the layout viewport.
   *
   * iOS frequently scrolls the layout viewport while focusing an input, which
   * leaves the visible region starting partway down the page. A container sized
   * to `height` but anchored at layout-viewport top then hangs `offsetTop` px
   * past the visible bottom edge — which is what clips the chat input. Pair the
   * two (`position: fixed; top: offsetTop; height: height`) and the container
   * covers exactly the visible region. Stays 0 on Chromium and desktop.
   */
  offsetTop: number;
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

const INITIAL: VisualViewportState = { height: null, offsetTop: 0, keyboardInset: 0 };

/**
 * Quiet period after the last visualViewport event before a large change is
 * committed. The iOS keyboard animation is ~300ms and fires resize+scroll
 * throughout; rAF throttling alone still commits every frame of it, which
 * re-renders and resizes the container *while* iOS is animating — a feedback
 * loop the user sees as violent shake. Committing nothing until the burst stops
 * settles it instead: one update, applied when the values are already final.
 */
const SETTLE_MS = 100;

/**
 * Deltas below this commit immediately instead of waiting out SETTLE_MS. URL-bar
 * show/hide micro-shifts stay responsive; a keyboard (250-350px) never qualifies.
 */
const SMALL_CHANGE_PX = 8;

/**
 * Tracks `window.visualViewport`. SSR-safe: renders `INITIAL` on the server and
 * the first client pass, so there is no hydration mismatch.
 *
 * The returned state only ever holds *settled* values — intermediate frames of a
 * keyboard animation are never observable. Consumers can therefore treat any
 * change to it as "the viewport has finished moving", which is what makes it
 * safe to trigger scroll corrections and CSS transitions off of it.
 */
export function useVisualViewportHeight(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(INITIAL);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return; // unsupported engine — caller keeps its CSS fallback

    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    // Last values handed to React. Deltas are measured against these rather than
    // against the previous *event*, so a burst of small steps that adds up to a
    // keyboard still reads as one large change and takes the settle path.
    let committedHeight: number | null = null;
    let committedOffsetTop = 0;

    const commit = () => {
      // clientHeight, not innerHeight: this is the layout viewport, and iOS
      // leaves it untouched when the keyboard opens — which is exactly the
      // difference we are trying to measure. Read at commit time so the value
      // is the settled one, not whatever it was when the burst started.
      const layoutHeight = document.documentElement.clientHeight;
      const height = vv.height;
      const offsetTop = Math.max(0, Math.round(vv.offsetTop));
      const keyboardInset = Math.max(0, Math.round(layoutHeight - height));
      committedHeight = height;
      committedOffsetTop = offsetTop;
      // Return `prev` unchanged so React bails out on no-op updates.
      setState((prev) =>
        prev.height === height &&
        prev.offsetTop === offsetTop &&
        prev.keyboardInset === keyboardInset
          ? prev
          : { height, offsetTop, keyboardInset },
      );
    };

    const handle = () => {
      const isSmallChange =
        committedHeight !== null &&
        Math.abs(vv.height - committedHeight) < SMALL_CHANGE_PX &&
        Math.abs(Math.round(vv.offsetTop) - committedOffsetTop) < SMALL_CHANGE_PX;

      // Fast path only while no burst is in flight: once we are waiting one out,
      // an individual small step must not sneak a commit through mid-animation.
      if (isSmallChange && settleTimer === null) {
        commit();
        return;
      }

      if (settleTimer !== null) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        settleTimer = null;
        commit();
      }, SETTLE_MS);
    };

    const sync = () => {
      // rAF coalesces multiple events landing in the same frame; the settle
      // timer is what actually absorbs the animation.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        handle();
      });
    };

    commit(); // first measurement is immediate — nothing to settle yet
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (settleTimer !== null) clearTimeout(settleTimer);
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  return state;
}
