import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut, Plus, User } from "lucide-react";
import { db } from "@/lib/db";
import { isDemo } from "@/lib/demo";
import { getTeam } from "@/lib/settings";
import { DEMO_COOKIE } from "../actions/cookie";
import { logout, setAuthor } from "../actions/session";
import { attentionCount, todayLists } from "../reports";
import { currentAuthor, requireSession } from "../session";
import { AuthorPicker } from "../ui/AuthorPicker";
import { BottomNav } from "../ui/BottomNav";
import { DemoBadge, DemoNotice } from "../ui/DemoNotice";
import { GlobalSearch } from "../ui/GlobalSearch";
import { NavLinks } from "../ui/NavLinks";
import { ThemeToggle } from "../ui/ThemeToggle";
import { TopTitle } from "../ui/TopTitle";
import styles from "./panel.module.css";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  const [leads, team, author] = await Promise.all([db().leadsSince(new Date(0)), getTeam(), currentAuthor()]);
  const badge = attentionCount(todayLists(leads));
  const demo = isDemo();
  const demoStamp = demo ? ((await cookies()).get(DEMO_COOKIE)?.value ?? null) : null;
  const who = author === "Echipa" ? "" : initials(author);

  return (
    <div className={styles.canvas}>
      <div className={styles.frame}>
        <aside className={styles.sidebarCol}>
          <div className={styles.sidebar}>
            <Link href="/admin/" className={styles.brand}>
              <Image src="/img/mark.png" alt="" width={28} height={28} />
              Daiamar <span>CRM</span>
            </Link>
            <NavLinks badge={badge} />
            <div className={styles.sideCard}>
              <ThemeToggle />
              <AuthorPicker team={team} author={author} action={setAuthor} />
              <Link href="/admin/leads/nou/" className={styles.addDark}><Plus aria-hidden size={16} /> Adaugă cerere</Link>
            </div>
            <form action={logout} className={styles.logoutForm}>
              <button type="submit" className={styles.logout}><LogOut aria-hidden size={16} /> Ieșire</button>
            </form>
          </div>
        </aside>
        <div className={styles.content}>
          <header className={styles.topbar}>
            <Link href="/admin/" className={styles.mobileBrand} aria-label="Daiamar, acasă">
              <Image src="/img/mark.png" alt="" width={28} height={28} />
            </Link>
            <TopTitle />
            {demo && <DemoBadge />}
            <div className={styles.topSearch}><GlobalSearch /></div>
            <Link href="/admin/#de-facut" className={styles.bell} aria-label={badge ? `${badge} lucruri de făcut azi` : "Nimic de făcut azi"}>
              <Bell aria-hidden size={18} />
              {badge > 0 && <span className={styles.bellCount}>{badge}</span>}
            </Link>
            <span className={styles.avatar} title={author ? `Lucrezi ca ${author}` : "Echipa"}>{who || <User aria-hidden size={16} />}</span>
          </header>
          <main className={styles.main}>{children}</main>
          {demo && <DemoNotice stamp={demoStamp} />}
        </div>
        <BottomNav badge={badge} logout={logout} team={team} author={author} setAuthor={setAuthor} />
      </div>
    </div>
  );
}
