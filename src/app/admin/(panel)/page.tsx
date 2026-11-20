import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, CheckCheck, Hourglass, Inbox, TriangleAlert } from "lucide-react";
import { bucharestDay } from "@/lib/crm";
import { db, type Lead } from "@/lib/db";
import { clearFollowUp } from "../actions/leads";
import { formatAge, formatDay, serviceTitle } from "../format";
import { todayLists } from "../reports";
import { EmptyState } from "../ui/EmptyState";
import { QuickActions } from "../ui/QuickActions";
import styles from "./today.module.css";
import admin from "../admin.module.css";
import { requireSession } from "../session";

export const metadata: Metadata = { title: "Azi" };
export const dynamic = "force-dynamic";

const longDate = new Intl.DateTimeFormat("ro-RO", { timeZone: "Europe/Bucharest", weekday: "long", day: "numeric", month: "long" });

function daysLate(day: string, today: string) {
  const diff = Math.round((Date.parse(today) - Date.parse(day)) / 86400_000);
  return diff === 1 ? "de ieri" : `de ${diff} zile`;
}

const receivedAgo = (age: string) => (age === "azi" || age === "ieri" ? age : `acum ${age}`);

function Row({ lead, note, done }: { lead: Lead; note: React.ReactNode; done?: boolean }) {
  return (
    <li className={styles.row}>
      <Link href={`/admin/leads/${lead.id}/`} className={styles.who}>
        <strong>{lead.name}</strong>
        <span>{[lead.company, serviceTitle(lead.service)].filter(Boolean).join(" · ")}</span>
      </Link>
      <div className={styles.note}>
        {note}
        <span className={admin.chip}>{lead.channel}</span>
        {lead.assignee && <span className={admin.chip} data-tone="brand">{lead.assignee}</span>}
      </div>
      <div className={styles.rowActions}>
        <QuickActions leadId={lead.id} phone={lead.phone} email={lead.email} service={serviceTitle(lead.service)} compact />
        {done && (
          <form action={clearFollowUp}>
            <input type="hidden" name="id" value={lead.id} />
            <button type="submit" className={`${admin.secondary} ${admin.small}`}><CheckCheck aria-hidden size={14} /> Gata</button>
          </form>
        )}
      </div>
    </li>
  );
}

function Section({ title, icon: Icon, tone, count, children, empty }: { title: string; icon: typeof Inbox; tone?: "warn"; count: number; children: React.ReactNode; empty: string }) {
  return (
    <section className={admin.card}>
      <h2 className={admin.h2}>
        <Icon aria-hidden size={16} className={tone ? styles.warnIcon : styles.icon} /> {title}
        <span className={admin.chip} data-tone={tone ?? "brand"}>{count}</span>
      </h2>
      {count ? <ul className={styles.list}>{children}</ul> : <p className={admin.muted}>{empty}</p>}
    </section>
  );
}

export default async function TodayPage() {
  await requireSession();
  const leads = await db().leadsSince(new Date(0));
  const { overdue, today, stale, fresh } = todayLists(leads);
  const day = bucharestDay();
  const nothing = !overdue.length && !today.length && !stale.length && !fresh.length;

  return (
    <>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>{longDate.format(new Date())}</p>
          <h1 className={admin.h1}>Azi</h1>
        </div>
        <Link href="/admin/pipeline/" className={admin.secondary}>Vezi pipeline-ul</Link>
      </div>

      {nothing ? (
        <div className={admin.card}>
          <EmptyState icon={CheckCheck} title="Nimic de făcut azi" text="Niciun follow-up programat și nicio cerere nouă necontactată.">
            <Link href="/admin/leads/" className={admin.secondary}>Toate cererile</Link>
          </EmptyState>
        </div>
      ) : (
        <div className={styles.grid}>
          <Section title="Restante" icon={TriangleAlert} tone="warn" count={overdue.length} empty="Nimic restant.">
            {overdue.map((l) => (
              <Row key={l.id} lead={l} done note={<span className={styles.late}>{l.nextAction || "Follow-up"} · {daysLate(l.nextActionAt as string, day)}</span>} />
            ))}
          </Section>
          <Section title="De făcut azi" icon={CalendarClock} count={today.length} empty="Niciun follow-up programat pentru azi.">
            {today.map((l) => <Row key={l.id} lead={l} done note={<span>{l.nextAction || "Follow-up"}</span>} />)}
          </Section>
          <Section title="Necontactate de peste 24 h" icon={Hourglass} tone="warn" count={stale.length} empty="Toate cererile mai vechi de o zi au fost contactate.">
            {stale.map((l) => <Row key={l.id} lead={l} note={<span className={styles.late}>Primită {receivedAgo(formatAge(l.createdAt))}</span>} />)}
          </Section>
          <Section title="Cereri noi (ultimele 24 h)" icon={Inbox} count={fresh.length} empty="Nicio cerere nouă în ultima zi.">
            {fresh.map((l) => <Row key={l.id} lead={l} note={<span>{l.message ? `„${l.message.slice(0, 80)}${l.message.length > 80 ? "…" : ""}”` : "Fără mesaj"}</span>} />)}
          </Section>
        </div>
      )}
      <p className={admin.footnote}>
        Restante și de azi: cereri deschise (nou, contactat, ofertă) cu un pas programat până azi, {formatDay(day)}.
        Cifra de lângă „Azi” din meniu le adună cu cererile necontactate de peste 24 h.
      </p>
    </>
  );
}
