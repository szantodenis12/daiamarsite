"use client";

import { useRef } from "react";
import { useParallax } from "./useParallax";

type Props = {
  /** Fraction of the scroll distance the element lags behind (positive) or runs ahead (negative). Typical 0.08 to 0.2. */
  speed?: number;
  as?: "div" | "span" | "figure";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/** Wrapper that drifts its content vertically while scrolling. Layout is untouched (transform only). */
export default function Parallax({ speed = 0.1, as: Tag = "div", className, style, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  useParallax(ref, speed);
  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  );
}
