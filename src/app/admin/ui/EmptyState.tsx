import type { LucideIcon } from "lucide-react";
import styles from "../admin.module.css";

type Props = { icon: LucideIcon; title: string; text?: string; children?: React.ReactNode };

export function EmptyState({ icon: Icon, title, text, children }: Props) {
  return (
    <div className={styles.empty}>
      <Icon aria-hidden size={28} strokeWidth={1.5} />
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
