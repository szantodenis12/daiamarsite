import { formatNumber } from "../format";
import type { Bucket, Count } from "../stats";
import styles from "../admin.module.css";

export function Bars({ rows, empty, note }: { rows: Count[]; empty: string; note?: (row: Count) => string }) {
  if (!rows.length) return <p className={styles.empty}>{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className={styles.bars}>
      {rows.map((row) => (
        <li key={row.label}>
          <div className={styles.barHead}>
            <span className={styles.barLabel}>{row.label}</span>
            <span className={styles.barValue}>
              {formatNumber(row.value)}
              {note && <small> {note(row)}</small>}
            </span>
          </div>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

const W = 640;
const H = 180;
const PAD = { top: 12, right: 8, bottom: 26, left: 28 };

export function TimeChart({ buckets }: { buckets: Bucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.value));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / buckets.length;
  const barW = Math.max(2, slot * 0.62);
  const labelEvery = Math.ceil(buckets.length / 8);
  const total = buckets.reduce((sum, b) => sum + b.value, 0);

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label={`${total} cereri în perioada aleasă`}>
        {[0, 0.5, 1].map((t) => {
          const y = PAD.top + plotH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} className={styles.gridLine} />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" className={styles.axis}>{Math.round(max * t)}</text>
            </g>
          );
        })}
        {buckets.map((b, i) => {
          const h = (b.value / max) * plotH;
          const x = PAD.left + i * slot + (slot - barW) / 2;
          return (
            <g key={b.start.toISOString()}>
              <rect x={x} y={PAD.top + plotH - h} width={barW} height={h} rx={2} className={styles.chartBar}>
                <title>{`${b.label}: ${b.value}`}</title>
              </rect>
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" className={styles.axis}>{b.label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
