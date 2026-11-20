"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { analyticsAllowed, CONSENT_OPEN_EVENT, functionalAllowed, openConsentSettings, readConsent, saveConsent, type ConsentChoice } from "@/lib/consent";
import styles from "./ConsentBanner.module.css";

const choiceFor = (functional: boolean, analytics: boolean): ConsentChoice =>
  functional && analytics ? "all" : functional ? "functional" : analytics ? "analytics" : "none";

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const banner = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!readConsent()) setOpen(true);
    const reopen = () => {
      const current = readConsent();
      setFunctional(functionalAllowed(current));
      setAnalytics(analyticsAllowed(current));
      setSettings(true);
      setOpen(true);
      requestAnimationFrame(() => banner.current?.focus());
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  function choose(choice: ConsentChoice) {
    saveConsent(choice);
    setOpen(false);
    setSettings(false);
  }

  if (!open) return null;

  return (
    <section ref={banner} tabIndex={-1} className={styles.banner} aria-label="Preferințe cookie-uri">
      <p className={styles.text}>
        Folosim un cookie necesar, care reține alegerea de aici. Cu „Accept” folosim și două cookie-uri proprii care rețin de unde ați ajuns pe
        site (de exemplu, o căutare Google) și Google Analytics pentru statistici. Cu „Refuz” nu setăm alte cookie-uri. <Link href="/cookies/">Detalii</Link>
      </p>

      {settings && (
        <fieldset className={styles.options}>
          <legend className={styles.legend}>Alegeți ce acceptați</legend>
          <label className={styles.option}>
            <input type="checkbox" checked disabled /> Necesare (mereu active)
          </label>
          <label className={styles.option}>
            <input type="checkbox" checked={functional} onChange={(e) => setFunctional(e.target.checked)} /> Funcționale: sursa vizitei
          </label>
          <label className={styles.option}>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Statistici (Google Analytics 4)
          </label>
        </fieldset>
      )}

      <div className={styles.actions}>
        {settings ? (
          <button type="button" className={styles.primary} onClick={() => choose(choiceFor(functional, analytics))}>Salvez alegerea</button>
        ) : (
          <>
            <button type="button" className={styles.primary} onClick={() => choose("all")}>Accept</button>
            <button type="button" className={styles.secondary} onClick={() => choose("none")}>Refuz</button>
            <button type="button" className={styles.link} onClick={() => setSettings(true)}>Setări</button>
          </>
        )}
      </div>
    </section>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className ?? styles.inline} onClick={openConsentSettings}>
      Setări cookie-uri
    </button>
  );
}
