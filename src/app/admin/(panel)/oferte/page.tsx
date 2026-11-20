import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
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
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>{rows.length} oferte</p>
          <h1 className={admin.h1}>Oferte</h1>
        </div>
        <Link href="/admin/oferte/noua/" className={admin.primary}><Plus aria-hidden size={16} /> Ofertă nouă</Link>
      </div>

      <section className={admin.kpis}>
        <div className={admin.kpi}><span>În așteptare (trimise, văzute)</span><strong>{formatLeiExact(open.monthly)}<small>/lună</small></strong><small>{formatLeiExact(open.oneOff)} o singură dată</small></div>
        <div className={admin.kpi}><span>Acceptate</span><strong>{formatLeiExact(accepted.monthly)}<small>/lună</small></strong><small>{formatLeiExact(accepted.oneOff)} o singură dată</small></div>
        <div className={admin.kpi}><span>Trimise + văzute</span><strong>{count("trimisa") + count("vazuta")}</strong><small>{count("vazuta")} deschise de client</small></div>
        <div className={admin.kpi}><span>Ciorne</span><strong>{count("ciorna")}</strong><small>{count("expirata")} expirate</small></div>
      </section>

      <nav className={`${admin.segmented} ${styles.filters}`} aria-label="Status">
        <Link href="/admin/oferte/" aria-current={!status ? "true" : undefined}>Toate</Link>
        {(Object.keys(OFFER_STATUS_LABELS) as ShownStatus[]).map((s) => (
          <Link key={s} href={`/admin/oferte/?status=${s}`} aria-current={status === s ? "true" : undefined}>{OFFER_STATUS_LABELS[s]} {count(s)}</Link>
        ))}
      </nav>

      {rows.length ? (
        <ul className={styles.list}>
          {rows.map(({ offer, status: shown, totals }) => (
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
      ) : (
        <div className={admin.card}>
          <EmptyState icon={FileText} title={status ? "Nicio ofertă cu acest status" : "Nicio ofertă încă"} text="O ofertă se creează din pagina unei cereri sau de aici, pornind de la un șablon.">
            <Link href="/admin/oferte/noua/" className={admin.primary}>Ofertă nouă</Link>
          </EmptyState>
        </div>
      )}
      <p className={admin.footnote}>Valorile sunt fără TVA, după discount. O ofertă trimisă trece singură în „Expirată” după perioada de valabilitate.</p>
    </>
  );
}
