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
    return onceInView(el, () => {
      el.dataset.shown = "true";
    });
  }, []);
  return (
    <Tag ref={ref as never} className={`${styles.reveal} ${className}`} data-variant={variant} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
