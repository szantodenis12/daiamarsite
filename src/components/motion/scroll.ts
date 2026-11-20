import type Lenis from "lenis";

export type ScrollFrame = {
  /** Current scroll position (px). */
  y: number;
  /** Largest possible scroll position (px). */
  maxY: number;
  /** Viewport size (px). */
  vw: number;
  vh: number;
  /** 1 while the page moves down, -1 while it moves up. */
  dir: 1 | -1;
};

/** `read` runs for every subscriber before any `write`, so measuring and styling never interleave. */
export type ScrollSubscriber = {
  read?: (frame: ScrollFrame) => void;
  write: (frame: ScrollFrame) => void;
};

const subscribers = new Set<ScrollSubscriber>();
const frame: ScrollFrame = { y: 0, maxY: 0, vw: 0, vh: 0, dir: 1 };
let lenis: Lenis | null = null;
let raf = 0;
let dirty = true;
let listening = false;
let pauses = 0;
let resizeObserver: ResizeObserver | null = null;

function tick(time: number) {
  raf = 0;
  lenis?.raf(time);
  const y = window.scrollY;
  if (dirty || y !== frame.y) {
    const doc = document.documentElement;
    if (y !== frame.y) frame.dir = y > frame.y ? 1 : -1;
    frame.y = y;
    frame.vw = doc.clientWidth;
    frame.vh = window.innerHeight;
    frame.maxY = Math.max(0, doc.scrollHeight - frame.vh);
    dirty = false;
    for (const s of subscribers) s.read?.(frame);
    for (const s of subscribers) s.write(frame);
  }
  // Lenis needs a frame on every tick; native scroll only wakes the loop on demand.
  if (lenis) raf = requestAnimationFrame(tick);
}

/** Runs the subscribers on the next frame even if the scroll position did not change (e.g. after layout changes). */
export function requestScrollFrame() {
  dirty = true;
  if (!raf) raf = requestAnimationFrame(tick);
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(tick);
}

function syncListeners() {
  const needed = subscribers.size > 0 || lenis !== null;
  if (needed === listening) return;
  listening = needed;
  if (needed) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", requestScrollFrame, { passive: true });
    resizeObserver = new ResizeObserver(requestScrollFrame);
    resizeObserver.observe(document.body);
    requestScrollFrame();
  } else {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", requestScrollFrame);
    resizeObserver?.disconnect();
    resizeObserver = null;
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

export function subscribeScroll(subscriber: ScrollSubscriber) {
  subscribers.add(subscriber);
  syncListeners();
  requestScrollFrame();
  return () => {
    subscribers.delete(subscriber);
    syncListeners();
  };
}

/** Used by SmoothScroll only. */
export function setLenis(instance: Lenis | null) {
  lenis = instance;
  if (lenis && pauses > 0) lenis.stop();
  cancelAnimationFrame(raf);
  raf = 0;
  syncListeners();
  requestScrollFrame();
}

export function getLenis() {
  return lenis;
}

/** Stops smooth scrolling (e.g. while an overlay is open). Returns the function that resumes it. */
export function pauseScroll() {
  pauses += 1;
  lenis?.stop();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    pauses -= 1;
    if (pauses === 0) lenis?.start();
  };
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Scrolls to an element (honouring scroll-padding-top, i.e. the header, and the element's scroll-margin-top)
 * or to a position. Smooth with Lenis, otherwise native (smooth only if the user allows motion).
 */
export function scrollToTarget(target: Element | number, { immediate = false } = {}) {
  let top: number;
  if (typeof target === "number") top = target;
  else {
    const offset = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    top = target.getBoundingClientRect().top + window.scrollY - offset;
  }
  top = Math.max(0, top);
  if (lenis) {
    const duration = Math.min(1.4, Math.max(0.6, Math.abs(top - window.scrollY) / 2400));
    lenis.scrollTo(top, { immediate, force: true, duration, easing: easeInOutCubic });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: immediate || reduce ? "instant" : "smooth" });
}
