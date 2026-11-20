"use client";

import { useEffect, type RefObject } from "react";
import { observe, REDUCED_MOTION } from "./observe";
import { subscribeScroll } from "./scroll";

/**
 * Moves `ref` along Y while it is near the viewport: offset = (viewport centre - element centre) * speed.
 * Positive speed lags behind the scroll (slower), negative runs ahead (faster).
 * `limit(height)` returns the largest allowed offset in px for an element of that height (used to keep overscaled images covering their frame).
 */
export function useParallax(ref: RefObject<HTMLElement | null>, speed: number, limit?: (height: number) => number) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mql = window.matchMedia(REDUCED_MOTION);
    let unsubscribe: (() => void) | null = null;
    let stopObserving: (() => void) | null = null;
    let offset = 0;
    let target = 0;

    const start = () => {
      stopObserving = observe(
        el,
        (entry) => {
          if (entry.isIntersecting && !unsubscribe) {
            el.style.willChange = "transform";
            unsubscribe = subscribeScroll({
              read: (f) => {
                // getBoundingClientRect includes our own transform, so take it out.
                const rect = el.getBoundingClientRect();
                const centre = rect.top - offset + rect.height / 2;
                const k = f.vw < 768 ? 0.5 : 1;
                let next = (f.vh / 2 - centre) * speed * k;
                if (limit) {
                  const max = limit(rect.height);
                  next = Math.max(-max, Math.min(max, next));
                }
                target = next;
              },
              write: () => {
                offset = target;
                el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
              },
            });
          } else if (!entry.isIntersecting && unsubscribe) {
            unsubscribe();
            unsubscribe = null;
            el.style.willChange = "";
          }
        },
        { rootMargin: "20% 0px 20% 0px" },
      );
    };
    const stop = () => {
      stopObserving?.();
      unsubscribe?.();
      stopObserving = unsubscribe = null;
      el.style.transform = "";
      el.style.willChange = "";
      offset = target = 0;
    };
    const sync = () => {
      stop();
      if (!mql.matches) start();
    };
    sync();
    mql.addEventListener("change", sync);
    return () => {
      mql.removeEventListener("change", sync);
      stop();
    };
  }, [ref, speed, limit]);
}
