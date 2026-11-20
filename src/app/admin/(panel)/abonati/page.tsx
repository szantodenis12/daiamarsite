import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileSpreadsheet, MailCheck, Search, ShieldAlert } from "lucide-react";
import { CHANNELS } from "@/lib/channel";
import { db, SUBSCRIBER_STATUSES } from "@/lib/db";
import { canSendEmail } from "@/lib/email";
import { confirmManually, deleteSubscriber, unsubscribeManually } from "../../actions/subscribers";
import { formatShortDate } from "../../format";
import { SUBSCRIBER_LABELS } from "../../subscribers";
import { ConfirmButton } from "../../ui/ConfirmButton";
import { EmptyState } from "../../ui/EmptyState";
import styles from "./subscribers.module.css";
import admin from "../../admin.module.css";
import { requireSession } from "../../session";

export const metadata: Metadata = { title: "Abonați" };
export const dynamic = "force-dynamic";

type Filters = { status?: string; channel?: string; q?: string };
type Props = { searchParams: Promise<Filters> };

export default async function SubscribersPage({ searchParams }: Props) {
  await requireSession();
  const filters = await searchParams;
  const all = await db().subscribers();
  const q = filters.q?.trim().toLowerCase();
  const list = all.filter(
    (s) =>
      (!filters.status || s.status === filters.status) &&
      (!filters.channel || s.channel === filters.channel) &&
      (!q || [s.email, s.name, s.company].some((v) => v?.toLowerCase().includes(q))),
  );
  const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();
  const exportHref = (format?: string) => `/api/admin/abonati/?${[query, format && `format=${format}`].filter(Boolean).join("&")}`;
  const counts = Object.fromEntries(SUBSCRIBER_STATUSES.map((s) => [s, all.filter((x) => x.status === s).length]));

  return (
    <>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>Newsletter „Noutăți fiscale”</p>
          <h1 className={admin.h1}>{counts.confirmed} abonați confirmați</h1>
        </div>
        <div className={admin.actions}>
          <a href={exportHref()} className={admin.secondary}><Download aria-hidden size={16} /> CSV</a>
          <a href={exportHref("excel")} className={admin.secondary}><FileSpreadsheet aria-hidden size={16} /> Excel</a>
        </div>
      </div>

      <section className={admin.kpis}>
        {SUBSCRIBER_STATUSES.map((s) => (
          <div key={s} className={admin.kpi}>
            <span>{SUBSCRIBER_LABELS[s]}</span>
            <strong>{counts[s]}</strong>
          </div>
        ))}
        <div className={admin.kpi}>
          <span>Email de confirmare</span>
          <strong className={admin.kpiText}>{canSendEmail() ? "Resend activ" : "Fără Resend"}</strong>
          <small>{canSendEmail() ? "Abonații confirmă singuri din e-mail." : "Confirmați manual, din listă, după ce verificați adresa."}</small>
        </div>
      </section>

      <form className={styles.filters}>
        <label className={styles.search}>
          <Search aria-hidden size={16} />
          <span className={admin.srOnly}>Caută</span>
          <input name="q" defaultValue={filters.q} placeholder="Email, nume, firmă" className={admin.input} />
        </label>
        <select name="status" defaultValue={filters.status ?? ""} className={admin.input} aria-label="Status">
          <option value="">Toate statusurile</option>
          {SUBSCRIBER_STATUSES.map((s) => <option key={s} value={s}>{SUBSCRIBER_LABELS[s]}</option>)}
        </select>
        <select name="channel" defaultValue={filters.channel ?? ""} className={admin.input} aria-label="Canal">
          <option value="">Toate canalele</option>
          {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className={admin.primary}>Filtrează</button>
        {query && <Link href="/admin/abonati/" className={admin.ghost}>Șterge filtrele</Link>}
      </form>

      {list.length ? (
        <ul className={styles.list}>
          {list.map((s) => (
            <li key={s.id} className={styles.row}>
              <span className={styles.main}>
                <strong>{s.email}</strong>
                {s.suspect && <span className={admin.chip} data-tone="warn" title="Trimis mai repede decât poate completa un om formularul. Nu a primit e-mail de confirmare."><ShieldAlert aria-hidden size={11} /> suspect</span>}
                <span>{[s.name, s.company].filter(Boolean).join(", ") || "fără nume"}</span>
              </span>
              <span className={styles.meta}><span className={admin.chip}>{s.channel}</span></span>
              <span className={styles.meta}>{s.placement} · {formatShortDate(s.createdAt)}</span>
              <span className={`${admin.status} ${styles.status}`} data-status={s.status}>{SUBSCRIBER_LABELS[s.status]}</span>
              <span className={styles.actions}>
                {s.status !== "confirmed" && (
                  <form action={confirmManually}>
                    <input type="hidden" name="token" value={s.token} />
                    <button type="submit" className={`${admin.secondary} ${admin.small}`}>Confirmă</button>
                  </form>
                )}
                {s.status === "confirmed" && (
                  <form action={unsubscribeManually}>
                    <input type="hidden" name="token" value={s.token} />
                    <button type="submit" className={`${admin.secondary} ${admin.small}`}>Dezabonează</button>
                  </form>
                )}
                <form action={deleteSubscriber}>
                  <input type="hidden" name="token" value={s.token} />
                  <ConfirmButton
                    className={`${admin.danger} ${admin.small}`}
                    label="Șterge"
                    title={`Ștergeți ${s.email}?`}
                    text="Adresa dispare din listă și din export. Pentru o cerere de ștergere GDPR, aceasta este calea."
                    confirmLabel="Șterge"
                  />
                </form>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className={admin.card}>
          <EmptyState icon={MailCheck} title={query ? "Niciun abonat pentru filtrele alese" : "Niciun abonat încă"} text={query ? undefined : "Abonările din /resurse/ și din subsolul site-ului apar aici, cu canalul din care a venit vizita."} />
        </div>
      )}

      <p className={admin.footnote}>
        Site-ul doar colectează adresele (dublu opt-in). Trimiterea newsletterului se face din Resend Broadcasts sau alt instrument, cu exportul CSV de aici. Fiecare email trebuie să conțină linkul de dezabonare al abonatului.
      </p>
    </>
  );
}
