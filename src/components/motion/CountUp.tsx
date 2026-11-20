"use client";

import { useEffect, useRef } from "react";
import { onceInView, REDUCED_MOTION } from "./observe";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** ms, default 1200 */
  duration?: number;
  className?: string;
};

const format = (n: number, decimals: number) => n.toLocaleString("ro-RO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false });

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Renders the final value on the server (and without JS), then counts up from 0 once in view. Use only for real numbers. */
export default function CountUp({ value, prefix = "", suffix = "", decimals = 0, duration = 1200, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia(REDUCED_MOTION).matches) return;
    const write = (n: number) => {
      el.textContent = `${prefix}${format(n, decimals)}${suffix}`;
    };
    let raf = 0;
    write(0);
    const stop = onceInView(el, () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        write(value * easeOut(p));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
      write(value);
    };
  }, [value, prefix, suffix, decimals, duration]);
  return (
    <span ref={ref} className={`num ${className}`} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {format(value, decimals)}
      {suffix}
    </span>
  );
}
