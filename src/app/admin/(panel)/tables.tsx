import { formatDuration, formatLei, formatNumber, formatPercent } from "../format";
import type { FunnelRow, RoiRow } from "../reports";
import styles from "../admin.module.css";

const lei = (value: number | null) => (value === null ? "-" : formatLei(value));
const rate = (part: number, whole: number) => (whole ? <small> {formatPercent(part / whole)}</small> : null);

export function RoiTable({ rows }: { rows: RoiRow[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Sursă</th><th>Cheltuit</th><th>Cereri</th><th>Clienți noi</th><th>Cost pe cerere</th><th>Cost pe client nou</th>
            <th>Câștig pe lună</th><th>Câștig estimat din reclame</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className={r.label === "Total reclame" ? styles.total : undefined}>
              <td>{r.label}</td>
              <td>{formatLei(r.spend)}</td>
              <td>{formatNumber(r.leads)}</td>
              <td>{formatNumber(r.clients)}</td>
              <td>{lei(r.costPerLead)}</td>
              <td>{lei(r.costPerClient)}</td>
              <td>{formatLei(r.wonMonthly)}</td>
              <td>{r.yearlyReturn === null ? "-" : `${r.yearlyReturn.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}×`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FunnelTable({ rows }: { rows: FunnelRow[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr><th>Sursă</th><th>Vizite</th><th>Cereri</th><th>Contactați</th><th>Clienți</th><th>Timp mediu până la primul telefon/mesaj</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.channel} className={r.channel === "Total" ? styles.total : undefined}>
              <td>{r.channel}</td>
              <td>{r.visits ? formatNumber(r.visits) : "-"}</td>
              <td>{formatNumber(r.leads)}{rate(r.leads, r.visits)}</td>
              <td>{formatNumber(r.contacted)}{rate(r.contacted, r.leads)}</td>
              <td>{formatNumber(r.clients)}{rate(r.clients, r.contacted)}</td>
              <td>{r.firstContactMs === null ? "-" : formatDuration(r.firstContactMs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
