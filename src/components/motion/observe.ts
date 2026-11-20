import { useSyncExternalStore } from "react";

type Callback = (entry: IntersectionObserverEntry) => void;
type Shared = { io: IntersectionObserver; callbacks: Map<Element, Callback> };

// One IntersectionObserver per option set, shared by every Reveal, TextReveal, CountUp and Parallax on the page.
const observers = new Map<string, Shared>();

export function observe(el: Element, callback: Callback, { rootMargin = "0px", threshold = 0 } = {}) {
  const key = `${rootMargin}|${threshold}`;
  let shared = observers.get(key);
  if (!shared) {
    const callbacks = new Map<Element, Callback>();
    const io = new IntersectionObserver((entries) => entries.forEach((e) => callbacks.get(e.target)?.(e)), { rootMargin, threshold });
    shared = { io, callbacks };
    observers.set(key, shared);
  }
  shared.callbacks.set(el, callback);
  shared.io.observe(el);
  const { io, callbacks } = shared;
  return () => {
    callbacks.delete(el);
    io.unobserve(el);
  };
}

/** Calls `callback` once, the first time the element enters the viewport (shrunk by `rootMargin`). */
export function onceInView(el: Element, callback: () => void, rootMargin = "0px 0px -8% 0px") {
  // The observer always reports asynchronously, so `stop` is assigned before the callback can run.
  const stop = observe(
    el,
    (e) => {
      if (!e.isIntersecting) return;
      stop();
      callback();
    },
    { rootMargin },
  );
  return stop;
}

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Live media query match. Always false during SSR and hydration, then follows the query. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useReducedMotion() {
  return useMediaQuery(REDUCED_MOTION);
}

/** Lets the inline <head> fail-safe know the motion code is running, so it keeps the pre-reveal states. */
export function markMotionReady() {
  document.documentElement.classList.add("motion-ready");
}
