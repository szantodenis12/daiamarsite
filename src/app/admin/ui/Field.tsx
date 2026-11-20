import { FieldError } from "./ActionForm";
import styles from "../admin.module.css";

type Props = { label: string; name: string; hint?: string; className?: string; children: React.ReactNode };

export function Field({ label, name, hint, className, children }: Props) {
  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label className={styles.label} htmlFor={name}>{label}</label>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
      <FieldError name={name} />
    </div>
  );
}
