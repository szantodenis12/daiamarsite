import type { Metadata } from "next";
import Link from "next/link";
import { Copy, Download, FileSpreadsheet, Inbox, Plus, Search, ShieldAlert } from "lucide-react";
import { CHANNELS } from "@/lib/channel";
import { bucharestDay, LEAD_KIND_LABELS, LEAD_STATUSES, MANUAL_SOURCES } from "@/lib/crm";
import { db } from "@/lib/db";
import { findDuplicates } from "@/lib/leads";
import { getTeam } from "@/lib/settings";
import { services } from "@/lib/site";
import { formatDay, formatLei, formatShortDate, serviceTitle, STATUS_LABELS } from "../../format";
import { loadFilteredLeads, PERIODS, type LeadFilters } from "../../stats";
import { EmptyState } from "../../ui/EmptyState";
import styles from "./leads.module.css";
import admin from "../../admin.module.css";
import { requireSession } from "../../session";

const PAGE_SIZE = 100;

export const metadata: Metadata = { title: "Cereri" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<LeadFilters> };

export default async function LeadsPage({ searchParams }: Props) {
  await requireSession();
  const filters = await searchParams;
  const [all, team] = await Promise.all([db().leadsSince(new Date(0)), getTeam()]);
  const leads = await loadFilteredLeads(filters, async (since) => all.filter((l) => new Date(l.createdAt) >= since));
  const duplicates = findDuplicates(all);
  const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();
  const exportHref = (format?: string) => `/api/admin/export/?${[query, format && `format=${format}`].filter(Boolean).join("&")}`;
  const today = bucharestDay();
  const filtered = Boolean(query);

  return (
    <>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>Cereri</p>
          <h1 className={admin.h1}>{leads.length} {leads.length === 1 ? "cerere" : "cereri"}</h1>
        </div>
        <div className={admin.actions}>
          <a href={exportHref()} className={admin.secondary}><Download aria-hidden size={16} /> CSV</a>
          <a href={exportHref("excel")} className={admin.secondary}><FileSpreadsheet aria-hidden size={16} /> Excel</a>
          <Link href="/admin/leads/nou/" className={admin.primary}><Plus aria-hidden size={16} /> Adaugă</Link>
        </div>
      </div>

      <form className={styles.filters}>
        <label className={styles.search}>
          <Search aria-hidden size={16} />
          <span className={admin.srOnly}>Caută</span>
          <input name="q" defaultValue={filters.q} placeholder="Nume, firmă, telefon, email" className={admin.input} />
        </label>
        <select name="status" defaultValue={filters.status ?? ""} className={admin.input} aria-label="Status">
          <option value="">Toate statusurile</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select name="channel" defaultValue={filters.channel ?? ""} className={admin.input} aria-label="Canal">
          <option value="">Toate canalele</option>
          {[...CHANNELS, ...MANUAL_SOURCES.filter((s) => s !== "Altul")].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="service" defaultValue={filters.service ?? ""} className={admin.input} aria-label="Serviciu">
          <option value="">Toate serviciile</option>
          {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
        </select>
        <select name="assignee" defaultValue={filters.assignee ?? ""} className={admin.input} aria-label="Asignat">
          <option value="">Toți colegii</option>
          {team.map((name) => <option key={name} value={name}>{name}</option>)}
          <option value="-">Neasignat</option>
        </select>
        <select name="s" defaultValue={filters.s ?? ""} className={admin.input} aria-label="Trimiteri suspecte">
          <option value="">Toate trimiterile</option>
          <option value="nu">Fără cele suspecte</option>
          <option value="da">Doar cele suspecte</option>
        </select>
        <select name="p" defaultValue={filters.p ?? "all"} className={admin.input} aria-label="Perioada">
          {Object.entries(PERIODS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="submit" className={admin.primary}>Filtrează</button>
        {filtered && <Link href="/admin/leads/" className={admin.ghost}>Șterge filtrele</Link>}
      </form>

      {leads.length ? (
        <ul className={styles.list}>
          {leads.slice(0, PAGE_SIZE).map((lead) => {
            const late = lead.nextActionAt && lead.nextActionAt < today && ["nou", "contactat", "oferta"].includes(lead.status);
            return (
              <li key={lead.id}>
                <Link href={`/admin/leads/${lead.id}/`} className={styles.row}>
                  <span className={styles.main}>
                    <strong>
                      {lead.name}
                      {lead.kind !== "cerere" && <span className={admin.chip} data-tone="brand">{LEAD_KIND_LABELS[lead.kind]}</span>}
                      {lead.suspect && <span className={admin.chip} data-tone="warn" title="Trimisă mai repede decât poate completa un om formularul. Nu intră în rapoarte."><ShieldAlert aria-hidden size={11} /> suspectă</span>}
                      {duplicates.has(lead.id) && <span className={admin.chip} data-tone="warn" title="Același telefon sau email ca altă cerere"><Copy aria-hidden size={11} /> duplicat</span>}
                    </strong>
                    <span>{lead.company ?? lead.phone ?? lead.email}</span>
                  </span>
                  <span className={styles.meta}>{serviceTitle(lead.service)}</span>
                  <span className={styles.meta}><span className={admin.chip}>{lead.channel}</span></span>
                  <span className={styles.meta} data-late={late || undefined}>
                    {lead.nextActionAt ? `${formatDay(lead.nextActionAt)} · ${lead.nextAction || "follow-up"}` : lead.monthlyValue ? `${formatLei(lead.monthlyValue)}/lună` : ""}
                  </span>
                  <span className={styles.meta}>{formatShortDate(lead.createdAt)}</span>
                  <span className={`${admin.status} ${styles.status}`} data-status={lead.status}>{STATUS_LABELS[lead.status]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={admin.card}>
          <EmptyState icon={Inbox} title={filtered ? "Nicio cerere pentru filtrele alese" : "Nicio cerere încă"} text={filtered ? undefined : "Cererile din formularul de pe site apar aici. Pe cele venite la telefon le puteți adăuga manual."}>
            {filtered ? <Link href="/admin/leads/" className={admin.secondary}>Șterge filtrele</Link> : <Link href="/admin/leads/nou/" className={admin.primary}>Adaugă o cerere</Link>}
          </EmptyState>
        </div>
      )}
      {leads.length > PAGE_SIZE && <p className={admin.footnote}>Sunt afișate primele {PAGE_SIZE}. Restul: filtre sau export.</p>}
    </>
  );
}
