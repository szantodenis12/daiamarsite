"use client";

import { useEffect, useRef, type RefObject } from "react";
import { REDUCED_MOTION } from "./observe";
import { subscribeScroll } from "./scroll";

/**
 * Progress 0..1 of an element through the viewport: 0 when its top reaches `start` (fraction of the viewport height
 * from the top), 1 when its bottom reaches `end`. Calls `onProgress` from the shared scroll loop.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, onProgress: (p: number) => void, { start = 0.8, end = 0.4 } = {}) {
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCED_MOTION).matches) {
      cb.current(1);
      return;
    }
    let p = 0;
    return subscribeScroll({
      read: (f) => {
        const r = el.getBoundingClientRect();
        const denom = r.height + (start - end) * f.vh;
        p = denom > 0 ? Math.max(0, Math.min(1, (start * f.vh - r.top) / denom)) : 1;
      },
      write: () => cb.current(p),
    });
  }, [ref, start, end]);
}

type Props = {
  start?: number;
  end?: number;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Wrapper that exposes its scroll progress as the CSS variable --progress (0..1). Server markup uses 1, so without
 * JS or with reduced motion a line driven by it is simply complete.
 * CSS: `.line { transform: scaleY(var(--progress, 1)); transform-origin: top; }`
 */
export default function ScrollProgress({ start, end, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => ref.current?.style.setProperty("--progress", p.toFixed(4)), { start, end });
  return (
    <div ref={ref} className={className} style={{ "--progress": 1 } as React.CSSProperties}>
      {children}
    </div>
  );
}
