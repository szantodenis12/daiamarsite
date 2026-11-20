"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, NAV } from "./nav";
import styles from "../(panel)/panel.module.css";

export function NavLinks({ badge }: { badge: number }) {
  const pathname = usePathname();
  return (
    <nav className={styles.sideNav} aria-label="Admin">
      {NAV.map(({ href, label, icon: Icon, badge: hasBadge }) => (
        <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>
          <Icon aria-hidden size={18} strokeWidth={1.75} />
          <span>{label}</span>
          {hasBadge && badge > 0 && <span className={styles.badge} aria-label={`${badge} de făcut`}>{badge}</span>}
        </Link>
      ))}
    </nav>
  );
}
