"use client";

import { useEffect, useRef } from "react";
import { markMotionReady, onceInView, REDUCED_MOTION } from "./observe";

export type InViewTag = "div" | "section" | "article" | "aside" | "figure" | "header" | "footer" | "ul" | "ol" | "li" | "h1" | "h2" | "h3" | "p" | "span";

type Props = {
  as?: InViewTag;
  className?: string;
  style?: React.CSSProperties;
  "data-mode"?: string;
  children: React.ReactNode;
};

/** Renders the element and sets data-shown="true" on it the first time it scrolls into view. CSS does the rest. */
export default function InView({ as: Tag = "div", className, style, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    markMotionReady();
    const show = () => {
      el.dataset.shown = "true";
    };
    if (window.matchMedia(REDUCED_MOTION).matches) {
      show();
      return;
    }
    return onceInView(el, show);
  }, []);
  return (
    <Tag ref={ref as never} className={className} style={style} {...rest}>
      {children}
    </Tag>
  );
}
