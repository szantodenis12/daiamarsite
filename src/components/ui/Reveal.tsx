"use client";

import { useEffect, useRef } from "react";
import { markMotionReady, onceInView, REDUCED_MOTION } from "@/components/motion/observe";
import styles from "./ui.module.css";

type Props = {
  as?: "div" | "section" | "li" | "article" | "figure" | "ul" | "p" | "span";
  /** ms before the transition starts (use 60 to 90 per item to stagger). */
  delay?: number;
  /** "up" (default): rise and fade. "fade": opacity only. "image": clip-path and scale reveal for media. */
  variant?: "up" | "fade" | "image";
  className?: string;
  children: React.ReactNode;
};

export default function Reveal({ as: Tag = "div", delay = 0, variant = "up", className = "", children }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    markMotionReady();
    if (window.matchMedia(REDUCED_MOTION).matches) {
      el.dataset.shown = "true";
      return;
    }
    const show = () => {
      el.dataset.shown = "true";
    };
    if (variant !== "image") return onceInView(el, show);
    // Media must never stay clipped: observe with no negative margin, and re-check on load and after a delay in case the observer never fires.
    const stop = onceInView(el, show, "0px");
    const visible = () => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };
    const check = () => {
      if (visible()) {
        stop();
        show();
      }
    };
    window.addEventListener("load", check);
    const timer = window.setTimeout(check, 2500);
    return () => {
      stop();
      window.removeEventListener("load", check);
      window.clearTimeout(timer);
    };
  }, [variant]);
  return (
    <Tag ref={ref as never} className={`${styles.reveal} ${className}`} data-variant={variant} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
