import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Download, FileSpreadsheet, MailCheck, MailX, Search, Send, ShieldAlert, Users } from "lucide-react";
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
  const TONES = { pending: "amber", confirmed: "green", unsubscribed: "grey" } as const;
  const ICONS = { pending: <Clock aria-hidden size={18} />, confirmed: <Users aria-hidden size={18} />, unsubscribed: <MailX aria-hidden size={18} /> };
  const counts = Object.fromEntries(SUBSCRIBER_STATUSES.map((s) => [s, all.filter((x) => x.status === s).length]));

  return (
    <>
      <h1 className={admin.srOnly}>Abonați newsletter</h1>
      <div className={styles.bar}>
        <p className={styles.count}>Newsletter „Noutăți fiscale”: <strong>{counts.confirmed}</strong> abonați confirmați</p>
        <div className={admin.actions}>
          <a href={exportHref()} className={admin.secondary}><Download aria-hidden size={16} /> CSV</a>
          <a href={exportHref("excel")} className={admin.secondary}><FileSpreadsheet aria-hidden size={16} /> Excel</a>
        </div>
      </div>

      <section className={admin.kpis}>
        {SUBSCRIBER_STATUSES.map((s) => (
          <div key={s} className={admin.stat}>
            <span className={admin.statIcon} data-tone={TONES[s]}>{ICONS[s]}</span>
            <div className={admin.statBody}>
              <p className={admin.statLabel}>{SUBSCRIBER_LABELS[s]}</p>
              <p className={admin.statValue}>{counts[s]}</p>
            </div>
          </div>
        ))}
        <div className={admin.stat}>
          <span className={admin.statIcon} data-tone="violet"><Send aria-hidden size={18} /></span>
          <div className={admin.statBody}>
            <p className={admin.statLabel}>E-mail de confirmare</p>
            <p className={`${admin.statValue} ${styles.statText}`}>{canSendEmail() ? "Trimis automat" : "Confirmare manuală"}</p>
            <p className={admin.statDelta}>{canSendEmail() ? "Abonații confirmă singuri din e-mail." : "Confirmați din listă, după ce verificați adresa."}</p>
          </div>
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
        <select name="channel" defaultValue={filters.channel ?? ""} className={admin.input} aria-label="Sursă">
          <option value="">Toate sursele</option>
          {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className={admin.secondary}>Filtrează</button>
        {query && <Link href="/admin/abonati/" className={admin.ghost}>Șterge filtrele</Link>}
      </form>

      {list.length ? (
        <div className={styles.list}>
          <div className={styles.listHead} aria-hidden="true"><span>Adresă</span><span>Sursă</span><span>Formular / data</span><span>Status</span><span /></div>
          <ul className={styles.items}>
          {list.slice(0, 100).map((s) => (
            <li key={s.id} className={styles.row}>
              <span className={styles.main}>
                <strong>{s.email}</strong>
                {s.suspect && <span className={admin.chip} data-tone="warn" title="Formularul a fost trimis mai repede decât îl poate completa un om. Nu a primit e-mail de confirmare."><ShieldAlert aria-hidden size={11} /> Posibil spam</span>}
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
        </div>
      ) : (
        <div className={admin.panel}>
          <EmptyState icon={MailCheck} title={query ? "Niciun abonat pentru filtrele alese" : "Niciun abonat încă"} text={query ? undefined : "Abonările din pagina Resurse și din subsolul site-ului apar aici, cu sursa din care a venit vizita."} />
        </div>
      )}

      {list.length > 100 && <p className={admin.footnote}>Sunt afișate primele 100. Restul: filtre sau export.</p>}
      <p className={admin.footnote}>
        Site-ul doar colectează adresele (dublu opt-in). Newsletterul se trimite din instrumentul de e-mail folosit de firmă, cu exportul CSV de aici. Fiecare e-mail trebuie să conțină linkul de dezabonare al abonatului.</p>
    </>
  );
}
