import { formatNumber } from "../../format";
import type { Count } from "../../stats";
import { topSlices } from "../../home";
import { Expand } from "./Expand";
import styles from "./panou.module.css";
import admin from "../../admin.module.css";

const color = (i: number) => `var(--donut-${(i % 5) + 1})`;
const TOP = 4;

/** Donut of requests per source: top 4 plus "Altele"; the sources inside "Altele" are listed behind the disclosure. */
export function SourceDonut({ rows, empty }: { rows: Count[]; empty: string }) {
  const sorted = rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
  const slices = topSlices(sorted, TOP);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (!total) return <p className={admin.muted}>{empty}</p>;

  const R = 70;
  const STROKE = 20;
  const C = 2 * Math.PI * R;
  const GAP = 6;
  let cumulative = 0;
  const rest = sorted.slice(TOP);
  const pct = (v: number) => `${Math.round((v / total) * 100)}%`;

  return (
    <div className={styles.donutRow}>
      <div className={styles.donutBox}>
        <svg viewBox="0 0 180 180" role="img" aria-label={`Cereri pe surse: ${sorted.map((s) => `${s.label} ${s.value}`).join(", ")}`}>
          <circle cx="90" cy="90" r={R} fill="none" stroke="var(--donut-track)" strokeWidth={STROKE} />
          {slices.map((s, i) => {
            const length = (s.value / total) * C;
            const dash = Math.max(0.1, length - GAP - STROKE);
            const offset = -(cumulative + (GAP + STROKE) / 2);
            cumulative += length;
            return (
              <circle
                key={s.label}
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke={color(i)}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={offset}
                transform="rotate(-90 90 90)"
                className={styles.arc}
                style={{ "--i": i, "--c": C, "--dash": dash } as React.CSSProperties}
              />
            );
          })}
        </svg>
        <div className={styles.donutCentre}>
          <span>Total cereri</span>
          <strong>{formatNumber(total)}</strong>
        </div>
      </div>
      <div className={styles.legendBox}>
        <Expand className={styles.legend} limit={slices.length} label="Vezi toate sursele" count={sorted.length}>
          {[
            ...slices.map((s, i) => (
              <li key={s.label}>
                <i style={{ background: color(i) }} />
                <span className={styles.legendName}>{s.label}</span>
                <span className={styles.legendValue}>{formatNumber(s.value)}</span>
                <b>{pct(s.value)}</b>
              </li>
            )),
            ...rest.map((s) => (
              <li key={`rest-${s.label}`} data-sub className={styles.fadeIn}>
                <i />
                <span className={styles.legendName}>{s.label}</span>
                <span className={styles.legendValue}>{formatNumber(s.value)}</span>
                <b>{pct(s.value)}</b>
              </li>
            )),
          ]}
        </Expand>
      </div>
    </div>
  );
}
