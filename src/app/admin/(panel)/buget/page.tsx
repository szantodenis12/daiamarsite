import type { Metadata } from "next";
import Link from "next/link";
import { AD_CHANNELS, bucharestMonth } from "@/lib/crm";
import { db } from "@/lib/db";
import { saveSpendMonth } from "../../actions/spend";
import { formatLei, formatMonth } from "../../format";
import { monthsFrom, monthStart, roiTable } from "../../reports";
import { ActionForm, FieldError } from "../../ui/ActionForm";
import { countable } from "../../stats";
import { RoiTable } from "../tables";
import styles from "./budget.module.css";
import admin from "../../admin.module.css";
import { requireSession } from "../../session";

export const metadata: Metadata = { title: "Buget reclame" };
export const dynamic = "force-dynamic";

const RANGES = { "3": "3 luni", "6": "6 luni", "12": "12 luni" } as const;
type Range = keyof typeof RANGES;

function monthsBack(count: number): string[] {
  const now = new Date();
  const [year, month] = bucharestMonth(now).split("-").map(Number);
  const start = new Date(Date.UTC(year, month - count, 1));
  return monthsFrom(`${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`, now);
}

type Props = { searchParams: Promise<{ m?: string }> };

export default async function BudgetPage({ searchParams }: Props) {
  await requireSession();
  const { m } = await searchParams;
  const range: Range = m && m in RANGES ? (m as Range) : "3";
  const roiMonths = monthsBack(Number(range));
  const [spend, allLeads] = await Promise.all([db().spend(), db().leadsSince(monthStart(roiMonths[0]))]);
  const leads = countable(allLeads);

  const editable = [...new Set([...monthsBack(6), ...spend.map((s) => s.month)])].sort().reverse().slice(0, 12);
  const amount = (month: string, key: string) => spend.find((s) => s.month === month && s.channel === key)?.amount;
  const monthTotal = (month: string) => spend.filter((s) => s.month === month).reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>Bugetul lunar pe canal, în lei</p>
          <h1 className={admin.h1}>Buget reclame</h1>
        </div>
      </div>

      <div className={admin.cards}>
        <section className={`${admin.card} ${admin.span2}`}>
          <div className={admin.cardHead}>
            <h2 className={admin.h2}>Randament pe canal</h2>
            <nav className={admin.segmented} aria-label="Perioada">
              {(Object.keys(RANGES) as Range[]).map((r) => (
                <Link key={r} href={`/admin/buget/?m=${r}`} aria-current={r === range ? "true" : undefined}>{RANGES[r]}</Link>
              ))}
            </nav>
          </div>
          <RoiTable rows={roiTable(leads, spend, roiMonths)} />
          <p className={admin.footnote}>
            {formatMonth(roiMonths[0])} – {formatMonth(roiMonths[roiMonths.length - 1])}. Print / ONRC adună Flyer ONRC și Print / QR.
            Randamentul estimat = abonamentul lunar al clienților câștigați × 12 / buget. Este o estimare pe un an, nu profit.
          </p>
        </section>

        <section className={`${admin.card} ${admin.span2}`}>
          <h2 className={admin.h2}>Cheltuieli pe lună <small>sumele din facturile Google, Meta, tipografie</small></h2>
          <div className={styles.months}>
            {editable.map((month) => (
              <ActionForm key={month} action={saveSpendMonth} submitLabel="Salvează" className={styles.month}>
                <input type="hidden" name="month" value={month} />
                <div className={styles.monthHead}>
                  <strong>{formatMonth(month)}</strong>
                  <span className={admin.muted}>{formatLei(monthTotal(month))}</span>
                </div>
                <div className={styles.inputs}>
                  {AD_CHANNELS.map((c) => (
                    <div key={c.key} className={admin.field}>
                      <label className={admin.label} htmlFor={`${month}-${c.key}`}>{c.label}</label>
                      <input id={`${month}-${c.key}`} name={c.key} inputMode="numeric" defaultValue={amount(month, c.key) ?? ""} placeholder="0" className={admin.input} />
                      <FieldError name={c.key} />
                    </div>
                  ))}
                </div>
              </ActionForm>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
