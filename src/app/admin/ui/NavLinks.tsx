"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { isActive, isGroupActive, NAV_GROUPS, type NavItem } from "./nav";
import styles from "../(panel)/panel.module.css";

export function NavLinks({ badge }: { badge: number }) {
  const pathname = usePathname();
  const [toggled, setToggled] = useState<Record<string, { path: string; open: boolean }>>({});

  const renderLeaf = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <Link key={item.href} href={item.href} className={styles.navItem} aria-current={isActive(pathname, item) ? "page" : undefined}>
        <Icon aria-hidden size={18} strokeWidth={1.75} />
        <span className={styles.navLabel}>{item.label}</span>
        {item.badge && badge > 0 && <span className={styles.badge} aria-label={`${badge} de făcut`}>{badge}</span>}
      </Link>
    );
  };

  const renderGroup = (item: NavItem) => {
    const Icon = item.icon;
    const active = isGroupActive(pathname, item);
    const t = toggled[item.label];
    const open = t && t.path === pathname ? t.open : active;
    const id = `nav-${item.label.toLowerCase()}`;
    return (
      <div key={item.label}>
        <button
          type="button"
          className={styles.navItem}
          data-group-active={active || undefined}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setToggled((s) => ({ ...s, [item.label]: { path: pathname, open: !open } }))}
        >
          <Icon aria-hidden size={18} strokeWidth={1.75} />
          <span className={styles.navLabel}>{item.label}</span>
          <ChevronDown aria-hidden size={16} className={styles.chev} data-open={open || undefined} />
        </button>
        <div className={styles.subWrap} data-open={open || undefined} id={id}>
          <div className={styles.subClip}>
            <div className={styles.subNav}>
              {item.children?.map((c) => (
                <Link key={c.href} href={c.href} tabIndex={open ? undefined : -1} aria-current={isActive(pathname, c) ? "page" : undefined}>{c.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className={styles.sideNav} aria-label="Admin">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className={styles.navGroup}>
          <p className={styles.navGroupLabel}>{group.label}</p>
          {group.items.map((item) => (item.children ? renderGroup(item) : renderLeaf(item)))}
        </div>
      ))}
    </nav>
  );
}
