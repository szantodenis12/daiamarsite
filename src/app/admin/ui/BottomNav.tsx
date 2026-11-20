"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Ellipsis, LogOut, Plus, X } from "lucide-react";
import { isActive, NAV } from "./nav";
import styles from "../(panel)/panel.module.css";

const MAIN = NAV.slice(0, 4);
const MORE = NAV.slice(4);

export function BottomNav({ badge, logout }: { badge: number; logout: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = MORE.some((item) => isActive(pathname, item.href));

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {open && <button type="button" className={styles.sheetBackdrop} aria-label="Închide meniul" onClick={() => setOpen(false)} />}
      {open && (
        <div className={styles.sheet} id="mai-mult">
          <div className={styles.sheetHead}>
            <strong>Mai mult</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Închide"><X aria-hidden size={18} /></button>
          </div>
          <Link href="/admin/leads/nou/"><Plus aria-hidden size={18} /> Adaugă cerere</Link>
          {MORE.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}><Icon aria-hidden size={18} /> {label}</Link>
          ))}
          <a href="/api/admin/export/?format=excel"><Download aria-hidden size={18} /> Export Excel</a>
          <form action={logout}>
            <button type="submit"><LogOut aria-hidden size={18} /> Ieșire</button>
          </form>
        </div>
      )}
      <nav className={styles.bottomNav} aria-label="Admin mobil">
        {MAIN.map(({ href, label, short, icon: Icon, badge: hasBadge }) => (
          <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>
            <span className={styles.bottomIcon}>
              <Icon aria-hidden size={20} strokeWidth={1.75} />
              {hasBadge && badge > 0 && <span className={styles.badge}>{badge}</span>}
            </span>
            {short ?? label}
          </Link>
        ))}
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mai-mult" aria-current={moreActive ? "page" : undefined}>
          <span className={styles.bottomIcon}><Ellipsis aria-hidden size={20} /></span>
          Mai mult
        </button>
      </nav>
    </>
  );
}
