"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Ellipsis, LogOut, Plus, SquareKanban, X } from "lucide-react";
import { isActive, isGroupActive, MOBILE_MAIN, NAV_GROUPS } from "./nav";
import { AuthorPicker } from "./AuthorPicker";
import { ThemeToggle } from "./ThemeToggle";
import styles from "../(panel)/panel.module.css";

const MORE = [...NAV_GROUPS[1].items, ...NAV_GROUPS[2].items];

type Props = { badge: number; logout: () => Promise<void>; team: string[]; author: string; setAuthor: (form: FormData) => Promise<void> };

export function BottomNav({ badge, logout, team, author, setAuthor }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = MORE.some((item) => isActive(pathname, item));

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
          <Link href="/admin/leads/nou/" className={styles.sheetPrimary}><Plus aria-hidden size={18} /> Adaugă cerere</Link>
          <Link href="/admin/pipeline/" aria-current={pathname.startsWith("/admin/pipeline/") ? "page" : undefined}><SquareKanban aria-hidden size={18} /> Cereri pe etape</Link>
          {MORE.map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} aria-current={isActive(pathname, item) ? "page" : undefined}><Icon aria-hidden size={18} /> {item.label}</Link>;
          })}
          <a href="/api/admin/export/?format=excel"><Download aria-hidden size={18} /> Export Excel</a>
          <div className={styles.sheetAuthor}><ThemeToggle /></div>
          <div className={styles.sheetAuthor}><AuthorPicker team={team} author={author} action={setAuthor} id="author-mobil" /></div>
          <form action={logout}>
            <button type="submit"><LogOut aria-hidden size={18} /> Ieșire</button>
          </form>
        </div>
      )}
      <nav className={styles.bottomNav} aria-label="Admin mobil">
        {MOBILE_MAIN.map(({ href, label, icon: Icon, badge: hasBadge, item }) => (
          <Link key={href} href={href} aria-current={isGroupActive(pathname, item) ? "page" : undefined}>
            <span className={styles.bottomIcon}>
              <Icon aria-hidden size={20} strokeWidth={1.75} />
              {hasBadge && badge > 0 && <span className={styles.badge}>{badge}</span>}
            </span>
            {label}
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
