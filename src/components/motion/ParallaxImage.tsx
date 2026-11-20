"use client";

import { useCallback, useRef } from "react";
import { useParallax } from "./useParallax";
import styles from "./motion.module.css";

type Props = {
  /** Same meaning as in Parallax. Default 0.12. */
  speed?: number;
  /** Extra height (fraction of the frame) given to the inner layer on each side so edges never show. Default 0.12. */
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
  /** The media, typically a next/image with `fill` (it fills the overscaled inner layer). */
  children: React.ReactNode;
};

/** Frame with overflow hidden whose image layer is taller than the frame and slides inside it. The frame needs a size (aspect-ratio or height). */
export default function ParallaxImage({ speed = 0.12, overscan = 0.12, className = "", style, children }: Props) {
  const inner = useRef<HTMLDivElement>(null);
  // The moving layer is (1 + 2 * overscan) times the frame height; it may slide by overscan * frame height.
  const limit = useCallback((layerHeight: number) => (layerHeight * overscan) / (1 + 2 * overscan), [overscan]);
  useParallax(inner, speed, limit);
  return (
    <div className={`${styles.pxFrame} ${className}`} style={style}>
      <div ref={inner} className={styles.pxInner} style={{ top: `${-overscan * 100}%`, bottom: `${-overscan * 100}%` }}>
        {children}
      </div>
    </div>
  );
}
