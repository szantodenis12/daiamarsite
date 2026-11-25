import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, FilePen, FileText, Hourglass, Plus, Send } from "lucide-react";
import { db } from "@/lib/db";
import { formatLeiExact, OFFER_STATUS_LABELS, offerTotals, shownStatus, type ShownStatus } from "@/lib/offers";
import { formatShortDate } from "../../format";
import { EmptyState } from "../../ui/EmptyState";
import { OfferStatus } from "./OfferStatus";
import styles from "./offers.module.css";
import admin from "../../admin.module.css";
import { requireSession } from "../../session";

export const metadata: Metadata = { title: "Oferte" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function OffersPage({ searchParams }: Props) {
  await requireSession();
  const { status, q } = await searchParams;
  const all = (await db().offers()).map((offer) => ({ offer, status: shownStatus(offer), totals: offerTotals(offer.doc) }));
  const query = q?.trim().toLowerCase();
  const rows = all.filter(
    (r) =>
      (!status || r.status === status) &&
      (!query || [r.offer.number, r.offer.doc.clientName, r.offer.doc.clientCompany].some((v) => v.toLowerCase().includes(query))),
  );
  const sum = (list: typeof rows) => list.reduce((s, r) => ({ monthly: s.monthly + r.totals.netMonthly, oneOff: s.oneOff + r.totals.netOneOff }), { monthly: 0, oneOff: 0 });
  const open = sum(rows.filter((r) => r.status === "trimisa" || r.status === "vazuta"));
  const accepted = sum(rows.filter((r) => r.status === "acceptata"));
  const count = (s: ShownStatus) => all.filter((r) => r.status === s).length;

  return (
    <>
      <h1 className={admin.srOnly}>Toate ofertele</h1>
      <div className={styles.bar}>
        <p className={styles.count}><strong>{rows.length}</strong> {rows.length === 1 ? "ofertă" : "oferte"}</p>
        <Link href="/admin/oferte/noua/" className={admin.primary}><Plus aria-hidden size={16} /> Ofertă nouă</Link>
      </div>

      <section className={admin.kpis}>
        <div className={admin.stat}>
          <span className={admin.statIcon} data-tone="amber"><Hourglass aria-hidden size={18} /></span>
          <div className={admin.statBody}><p className={admin.statLabel}>În așteptare (trimise, văzute)</p><p className={admin.statValue}>{formatLeiExact(open.monthly)}<small>/lună</small></p><p className={admin.statDelta}>{formatLeiExact(open.oneOff)} o singură dată</p></div>
        </div>
        <div className={admin.stat}>
          <span className={admin.statIcon} data-tone="green"><CircleCheck aria-hidden size={18} /></span>
          <div className={admin.statBody}><p className={admin.statLabel}>Acceptate</p><p className={admin.statValue}>{formatLeiExact(accepted.monthly)}<small>/lună</small></p><p className={admin.statDelta}>{formatLeiExact(accepted.oneOff)} o singură dată</p></div>
        </div>
        <div className={admin.stat}>
          <span className={admin.statIcon} data-tone="violet"><Send aria-hidden size={18} /></span>
          <div className={admin.statBody}><p className={admin.statLabel}>Trimise + văzute</p><p className={admin.statValue}>{count("trimisa") + count("vazuta")}</p><p className={admin.statDelta}>{count("vazuta")} deschise de client</p></div>
        </div>
        <div className={admin.stat}>
          <span className={admin.statIcon} data-tone="grey"><FilePen aria-hidden size={18} /></span>
          <div className={admin.statBody}><p className={admin.statLabel}>Ciorne</p><p className={admin.statValue}>{count("ciorna")}</p><p className={admin.statDelta}>{count("expirata")} expirate</p></div>
        </div>
      </section>

      <nav className={`${admin.segmented} ${styles.filters}`} aria-label="Status">
        <Link href="/admin/oferte/" aria-current={!status ? "true" : undefined}>Toate</Link>
        {(Object.keys(OFFER_STATUS_LABELS) as ShownStatus[]).map((s) => (
          <Link key={s} href={`/admin/oferte/?status=${s}`} aria-current={status === s ? "true" : undefined}>{OFFER_STATUS_LABELS[s]} {count(s)}</Link>
        ))}
      </nav>

      {rows.length ? (
        <div className={styles.list}>
          <div className={styles.listHead} aria-hidden="true"><span>Client / ofertă</span><span>Lunar</span><span>O singură dată</span><span>Data</span><span>Status</span></div>
          <ul className={styles.items}>
          {rows.slice(0, 100).map(({ offer, status: shown, totals }) => (
            <li key={offer.id}>
              <Link href={`/admin/oferte/${offer.id}/`} className={styles.row}>
                <span className={styles.rowMain}>
                  <strong>{offer.doc.clientCompany || offer.doc.clientName}</strong>
                  <span>{offer.number}{offer.doc.clientCompany ? ` · ${offer.doc.clientName}` : ""}</span>
                </span>
                <span className={`${styles.rowMeta} ${styles.amount}`}>{formatLeiExact(totals.netMonthly)}/lună</span>
                <span className={`${styles.rowMeta} ${styles.amount}`}>{totals.netOneOff ? `${formatLeiExact(totals.netOneOff)} unic` : ""}</span>
                <span className={styles.rowMeta}>{formatShortDate(offer.sentAt ?? offer.createdAt)}{offer.viewCount ? ` · ${offer.viewCount} vizualizări` : ""}</span>
                <span className={styles.rowStatus}><OfferStatus status={shown} /></span>
              </Link>
            </li>
          ))}
          </ul>
        </div>
      ) : (
        <div className={admin.panel}>
          <EmptyState icon={FileText} title={status ? "Nicio ofertă cu acest status" : "Nicio ofertă încă"} text="O ofertă se creează din pagina unei cereri sau de aici, pornind de la un șablon.">
            <Link href="/admin/oferte/noua/" className={admin.primary}>Ofertă nouă</Link>
          </EmptyState>
        </div>
      )}
      {rows.length > 100 && <p className={admin.footnote}>Sunt afișate primele 100. Restul: căutare sau filtru.</p>}
      <p className={admin.footnote}>Valorile sunt fără TVA, după discount. O ofertă trimisă trece singură în „Expirată” după perioada de valabilitate.</p>
    </>
  );
}
