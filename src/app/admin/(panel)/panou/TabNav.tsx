"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import styles from "./panou.module.css";

export type TabItem = { id: string; label: string; href: string };

/** Accessible tablist made of real links (works without JS); arrow keys, Home and End move between tabs. */
export function TabNav({ tabs, active, panelId }: { tabs: TabItem[]; active: string; panelId: string }) {
  const router = useRouter();
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent) {
    const index = tabs.findIndex((t) => t.id === active);
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    refs.current[next]?.focus();
    router.push(tabs[next].href, { scroll: false });
  }

  return (
    <div className={styles.tabs} role="tablist" aria-label="Secțiuni raport" onKeyDown={onKeyDown}>
      {tabs.map((t, i) => (
        <Link
          key={t.id}
          ref={(node) => { refs.current[i] = node; }}
          href={t.href}
          scroll={false}
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={t.id === active}
          aria-controls={panelId}
          tabIndex={t.id === active ? 0 : -1}
          className={styles.tab}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
