"use client";

import { useEffect, useRef } from "react";

const fmt = new Intl.NumberFormat("ro-RO");

/** Renders the final number (server and no-JS), then counts up once on load unless the user prefers reduced motion. */
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current?.firstChild;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches || value <= 0) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      node.nodeValue = fmt.format(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    node.nodeValue = fmt.format(0);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      node.nodeValue = fmt.format(value);
    };
  }, [value, duration]);
  return <span ref={ref}>{fmt.format(value)}</span>;
}
