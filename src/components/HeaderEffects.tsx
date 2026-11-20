"use client";

import { useEffect, useRef } from "react";
import { REDUCED_MOTION } from "@/components/motion/observe";
import { subscribeScroll } from "@/components/motion/scroll";
import styles from "./Header.module.css";

const HIDE_AFTER = 400;

/** Scroll-driven header state: data-scrolled after 8px, data-hidden while scrolling down, plus the thin progress bar. */
export default function HeaderEffects() {
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const header = bar.current?.closest("header");
    const fill = bar.current;
    if (!header || !fill) return;
    const mql = window.matchMedia(REDUCED_MOTION);
    let scrolled = false;
    let hidden = false;
    let lastY = 0;

    const setHidden = (v: boolean) => {
      if (v === hidden) return;
      hidden = v;
      header.toggleAttribute("data-hidden", v);
    };
    const onFocusIn = () => setHidden(false);
    header.addEventListener("focusin", onFocusIn);

    const unsubscribe = subscribeScroll({
      write: (f) => {
        const next = f.y > 8;
        if (next !== scrolled) {
          scrolled = next;
          header.toggleAttribute("data-scrolled", next);
        }
        fill.style.transform = `scaleX(${f.maxY > 0 ? Math.min(1, f.y / f.maxY).toFixed(4) : 0})`;

        const menuOpen = header.querySelector('[data-open="true"]') !== null;
        const dy = f.y - lastY;
        lastY = f.y;
        if (mql.matches || menuOpen || f.y <= HIDE_AFTER || header.contains(document.activeElement)) {
          if (mql.matches || menuOpen || f.y <= HIDE_AFTER) setHidden(false);
          return;
        }
        // Ignore sub-pixel jitter and elastic overscroll at the page ends.
        if (dy > 2) setHidden(true);
        else if (dy < -2) setHidden(false);
      },
    });
    return () => {
      unsubscribe();
      header.removeEventListener("focusin", onFocusIn);
      header.removeAttribute("data-hidden");
      header.removeAttribute("data-scrolled");
    };
  }, []);

  return (
    <div className={styles.progress} aria-hidden="true">
      <span ref={bar} className={styles.progressFill} />
    </div>
  );
}
