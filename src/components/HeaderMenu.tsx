"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { company, nav } from "@/lib/site";
import TrackedLink from "@/components/TrackedLink";
import { pauseScroll } from "@/components/motion/scroll";
import LangSwitch from "./LangSwitch";
import styles from "./Header.module.css";

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const resume = pauseScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      resume();
    };
  }, [open]);

  // Only the most specific match is current, so /servicii/ is not highlighted on the ANAF page.
  const current = nav.filter((item) => pathname.startsWith(item.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const isActive = (href: string) => href === current;

  return (
    <>
      <nav className={styles.nav} aria-label="Principal">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={styles.actions}>
        <TrackedLink kind="phone" href={company.phones[0].href} placement="header" className={`${styles.phone} num`}>
          <Phone aria-hidden /> {company.phones[0].label}
        </TrackedLink>
        <Link href="/contact/#formular" className={styles.cta}>
          Solicitați o discuție <ArrowRight aria-hidden />
        </Link>
      </div>

      <div className={styles.mobileActions}>
        <TrackedLink kind="phone" href={company.phones[0].href} placement="header-mobile" className={styles.iconBtn}>
          <Phone aria-hidden />
          <span className="sr-only">Sună {company.phones[0].label}</span>
        </TrackedLink>
        <button ref={toggle} type="button" className={styles.iconBtn} aria-expanded={open} aria-controls="meniu-mobil" onClick={() => setOpen((v) => !v)}>
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
          <span className="sr-only">{open ? "Închide meniul" : "Deschide meniul"}</span>
        </button>
      </div>

      <div id="meniu-mobil" className={styles.panel} data-open={open} aria-hidden={!open} inert={!open}>
        <nav aria-label="Meniu mobil" className={styles.panelNav}>
          {nav.map((item, i) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} style={{ transitionDelay: `${60 + i * 40}ms` }}>
              {item.label}
              <ArrowRight aria-hidden />
            </Link>
          ))}
        </nav>
        <div className={styles.panelFoot}>
          {company.phones.map((p) => (
            <TrackedLink key={p.href} kind="phone" href={p.href} placement="header-mobile" className={`${styles.panelPhone} num`}>
              <Phone aria-hidden /> {p.label}
            </TrackedLink>
          ))}
          <Link href="/contact/#formular" className={styles.panelCta}>
            Solicitați o discuție <ArrowRight aria-hidden />
          </Link>
          <LangSwitch className={styles.panelLang} />
        </div>
      </div>
    </>
  );
}
