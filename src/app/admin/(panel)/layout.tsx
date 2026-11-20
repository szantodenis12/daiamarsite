import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { getTeam } from "@/lib/settings";
import { logout, setAuthor } from "../actions/session";
import { attentionCount, todayLists } from "../reports";
import { currentAuthor, requireSession } from "../session";
import { AuthorPicker } from "../ui/AuthorPicker";
import { BottomNav } from "../ui/BottomNav";
import { GlobalSearch } from "../ui/GlobalSearch";
import { NavLinks } from "../ui/NavLinks";
import styles from "./panel.module.css";
import admin from "../admin.module.css";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  const [leads, team, author] = await Promise.all([db().leadsSince(new Date(0)), getTeam(), currentAuthor()]);
  const badge = attentionCount(todayLists(leads));

  return (
    <div className={styles.frame}>
      <aside className={styles.sidebar}>
        <Link href="/admin/" className={styles.brand}>Daiamar <span>CRM</span></Link>
        <Link href="/admin/leads/nou/" className={styles.add}><Plus aria-hidden size={16} /> Adaugă cerere</Link>
        <NavLinks badge={badge} />
        <div className={styles.sideFoot}>
          <AuthorPicker team={team} author={author} action={setAuthor} />
          <form action={logout}>
            <button type="submit" className={styles.logout}><LogOut aria-hidden size={16} /> Ieșire</button>
          </form>
        </div>
      </aside>
      <div className={styles.content}>
        <header className={styles.topbar}>
          <Link href="/admin/" className={styles.mobileBrand}>Daiamar</Link>
          <GlobalSearch />
          <Link href="/admin/leads/nou/" className={`${admin.primary} ${styles.topAdd}`}><Plus aria-hidden size={16} /> Adaugă</Link>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
      <BottomNav badge={badge} logout={logout} />
    </div>
  );
}
