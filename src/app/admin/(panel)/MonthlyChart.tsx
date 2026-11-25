"use client";

import { useState } from "react";
import type { MonthPoint } from "../home";
import styles from "./home.module.css";
import admin from "../admin.module.css";

const RANGES = [6, 12] as const;

/** Requests per month: a light bar for all requests with a strong bar in front for those that became clients. */
export function MonthlyChart({ points }: { points: MonthPoint[] }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(6);
  const [active, setActive] = useState<number | null>(null);
  const data = points.slice(-range);
  const peak = Math.max(4, ...data.map((p) => p.leads));
  const step = Math.ceil(peak / 4);
  const top = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);
  const pct = (v: number) => `${(v / top) * 100}%`;
  const shown = active !== null && active < data.length ? active : null;
  const tip = shown !== null ? data[shown] : null;
  const edge = shown === null ? "mid" : shown <= 1 ? "start" : shown >= data.length - 2 ? "end" : "mid";

  return (
    <div>
      <div className={styles.chartTop}>
        <ul className={styles.legend} aria-hidden>
          <li><i style={{ background: "var(--bar-soft)" }} /> Cereri primite</li>
          <li><i style={{ background: "var(--bar-strong)" }} /> Din care deveniți clienți</li>
        </ul>
        <div className={admin.segmented} role="group" aria-label="Perioada graficului">
          {RANGES.map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => { setRange(r); setActive(null); }}>{r} luni</button>
          ))}
        </div>
      </div>

      <div className={styles.plotRow}>
        <div className={styles.yAxis} aria-hidden>
          {[...ticks].reverse().map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className={styles.plot}>
          {ticks.map((t) => <div key={t} className={styles.gridRow} style={{ bottom: pct(t) }} aria-hidden />)}
          <div className={styles.cols} onMouseLeave={() => setActive(null)}>
            {data.map((p, i) => (
              <button
                key={`${range}-${p.month}`}
                type="button"
                className={styles.col}
                data-active={shown === i || undefined}
                aria-label={`${p.full}: ${p.leads} cereri, din care ${p.clients} clienți`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <span className={styles.barSoft} style={{ height: pct(p.leads), "--i": i } as React.CSSProperties} />
                <span className={styles.barStrong} style={{ height: pct(p.clients), "--i": i } as React.CSSProperties} />
              </button>
            ))}
          </div>
          {tip && shown !== null && (
            <div className={styles.tip} data-edge={edge} style={{ left: `${((shown + 0.5) / data.length) * 100}%`, bottom: `calc(${pct(tip.leads)} + 10px)` }} aria-hidden>
              <strong>{tip.full}</strong>
              <span><i style={{ background: "var(--bar-soft)" }} /> Cereri <b>{tip.leads}</b></span>
              <span><i style={{ background: "var(--bar-strong)" }} /> Clienți <b>{tip.clients}</b></span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.xRow} aria-hidden>
        <span />
        <div>{data.map((p) => <span key={p.month}>{p.label}</span>)}</div>
      </div>

      <table className={admin.srOnly}>
        <caption>Cereri pe lună</caption>
        <thead><tr><th>Luna</th><th>Cereri</th><th>Clienți</th></tr></thead>
        <tbody>{data.map((p) => <tr key={p.month}><td>{p.full}</td><td>{p.leads}</td><td>{p.clients}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
