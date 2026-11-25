"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { DEMO_COOKIE } from "../actions/cookie";
import styles from "./demo.module.css";

/** Shows the demo message when a form action was blocked (the server sets a short-lived cookie for it). */
export function DemoNotice({ stamp }: { stamp: string | null }) {
  const seen = useRef<string | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!stamp || seen.current === stamp) return;
    seen.current = stamp;
    document.cookie = `${DEMO_COOKIE}=; Max-Age=0; path=/`;
    setShown(true);
    const timer = setTimeout(() => setShown(false), 4500);
    return () => clearTimeout(timer);
  }, [stamp]);

  if (!shown) return null;
  return (
    <div className={styles.toast} role="status">
      <Info aria-hidden size={16} /> Versiune demo: modificările nu se salvează.
    </div>
  );
}

/** Topbar badge, only rendered in demo mode. */
export function DemoBadge() {
  return (
    <span className={styles.badge} title="Date de test. Modificările nu se salvează." tabIndex={0}>
      Demo
    </span>
  );
}
