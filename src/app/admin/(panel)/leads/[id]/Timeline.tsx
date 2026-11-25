import { FileText, Mail, MessageCircle, NotebookPen, Paperclip, Phone, RefreshCw } from "lucide-react";
import { ACTIVITY_LABELS, type ActivityType } from "@/lib/crm";
import type { Activity } from "@/lib/db";
import { formatDate } from "../../../format";
import styles from "./lead.module.css";

const ICONS: Record<ActivityType, typeof Phone> = {
  nota: NotebookPen,
  apel: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  status: RefreshCw,
  oferta: FileText,
  documente: Paperclip,
};

export function Timeline({ activities, createdAt }: { activities: Activity[]; createdAt: string }) {
  return (
    <ol className={styles.timeline}>
      {activities.map((a, i) => {
        const Icon = ICONS[a.type] ?? NotebookPen;
        return (
          <li key={a.id} data-type={a.type} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}>
            <span className={styles.dot}><Icon aria-hidden size={14} /></span>
            <div>
              <p className={styles.entryHead}>
                <strong>{ACTIVITY_LABELS[a.type] ?? a.type}</strong>
                <span>{a.author} · {formatDate(a.at)}</span>
              </p>
              <p className={styles.entryText}>{a.text}</p>
            </div>
          </li>
        );
      })}
      <li data-type="start">
        <span className={styles.dot} />
        <div>
          <p className={styles.entryHead}><strong>Cererea a intrat</strong><span>{formatDate(createdAt)}</span></p>
        </div>
      </li>
    </ol>
  );
}
