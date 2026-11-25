import type { Bucket } from "../../stats";
import styles from "./panou.module.css";
import admin from "../../admin.module.css";

/** Requests over time as growing CSS bars. Hover shows a tooltip; the sr-only table is the text alternative. */
export function TimeBars({ buckets, total }: { buckets: Bucket[]; total: number }) {
  const peak = Math.max(2, ...buckets.map((b) => b.value));
  const top = peak % 2 ? peak + 1 : peak;
  const ticks = [0, top / 2, top];
  const every = Math.ceil(buckets.length / 7);
  const n = buckets.length;

  return (
    <div>
      <div className={styles.plotRow}>
        <div className={styles.yAxis} aria-hidden>
          {[...ticks].reverse().map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className={styles.plot}>
          {ticks.map((t) => <div key={t} className={styles.gridRow} style={{ bottom: `${(t / top) * 100}%` }} aria-hidden />)}
          <div className={styles.cols}>
            {buckets.map((b, i) => (
              <div key={b.start.toISOString()} className={styles.col} data-edge={i < 2 ? "start" : i >= n - 2 ? "end" : undefined}>
                <span className={styles.bar} style={{ height: `${(b.value / top) * 100}%`, "--i": Math.min(i, 30) } as React.CSSProperties} />
                <span className={styles.tip} aria-hidden><strong>{b.label}</strong> {b.value} {b.value === 1 ? "cerere" : "cereri"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.xRow} aria-hidden>
        <span />
        <div>{buckets.map((b, i) => <span key={b.start.toISOString()}>{i % every === 0 && <em>{b.label}</em>}</span>)}</div>
      </div>
      <table className={admin.srOnly}>
        <caption>Cereri în timp, {total} în total</caption>
        <thead><tr><th>Începând cu</th><th>Cereri</th></tr></thead>
        <tbody>{buckets.map((b) => <tr key={b.start.toISOString()}><td>{b.label}</td><td>{b.value}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
