"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import styles from "./panou.module.css";

/** Small (i) button that reveals a plain-language explanation on hover, focus, click or tap. */
export function Help({ id, label, children, align = "end" }: { id: string; label: string; children: React.ReactNode; align?: "start" | "end" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        const active = document.activeElement as HTMLElement | null;
        if (active?.closest("[data-help]")) active.blur();
      }
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <span className={styles.help} data-help ref={ref} data-open={open || undefined}>
      <button type="button" className={styles.helpBtn} aria-label={label} aria-describedby={id} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Info aria-hidden size={14} />
      </button>
      <span role="tooltip" id={id} className={styles.helpTip} data-align={align}>{children}</span>
    </span>
  );
}
