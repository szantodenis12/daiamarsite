import { formatNumber } from "../../format";
import type { Count } from "../../stats";
import { Expand } from "./Expand";
import styles from "./panou.module.css";
import admin from "../../admin.module.css";

/** Compact horizontal bars, capped at `limit` with an inline "Arată toate (n)". */
export function MiniBars({ rows, empty, limit = 5, unit }: { rows: Count[]; empty: string; limit?: number; unit?: string }) {
  if (!rows.length) return <p className={admin.muted}>{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <Expand className={styles.miniBars} limit={limit}>
      {rows.map((r, i) => (
        <li key={r.label}>
          <span className={styles.miniLabel}>{r.label}</span>
          <span className={styles.miniValue}>{formatNumber(r.value)}{unit && <small> {unit}</small>}</span>
          <span className={styles.miniTrack} aria-hidden><i style={{ width: `${Math.max(3, (r.value / max) * 100)}%`, "--i": Math.min(i, 8) } as React.CSSProperties} /></span>
        </li>
      ))}
    </Expand>
  );
}
