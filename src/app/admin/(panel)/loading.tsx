import styles from "../admin.module.css";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Se încarcă">
      <div className={styles.skeleton} style={{ height: 34, width: 220, marginBottom: 20 }} />
      <div className={styles.kpis}>
        {[0, 1, 2, 3].map((i) => <div key={i} className={styles.skeleton} style={{ height: 92 }} />)}
      </div>
      <div className={styles.skeleton} style={{ height: 320 }} />
    </div>
  );
}
