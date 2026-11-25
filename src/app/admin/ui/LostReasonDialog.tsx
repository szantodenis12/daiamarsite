"use client";

import { useEffect, useRef, useState } from "react";
import { LOST_LABELS, LOST_REASONS, type LostReason } from "@/lib/crm";
import styles from "./dialog.module.css";
import admin from "../admin.module.css";

type Props = { leadName: string | null; onCancel: () => void; onConfirm: (reason: LostReason) => void };

/** Opens whenever leadName is set. Moving a lead to "pierdut" always needs a reason. */
export function LostReasonDialog({ leadName, onCancel, onConfirm }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<LostReason | null>(null);

  useEffect(() => {
    if (leadName) {
      setReason(null);
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [leadName]);

  return (
    <dialog ref={dialog} className={styles.dialog} onCancel={onCancel}>
      <form
        className={styles.body}
        onSubmit={(e) => {
          e.preventDefault();
          if (reason) onConfirm(reason);
        }}
      >
        <h2 className={styles.title}>De ce s-a pierdut?</h2>
        <p className={styles.text}>{leadName}. Motivul apare în Rapoarte, la „De ce pierdem cereri”.</p>
        <div className={styles.options} role="radiogroup">
          {LOST_REASONS.map((r) => (
            <label key={r} className={styles.option}>
              <input type="radio" name="lostReason" value={r} checked={reason === r} onChange={() => setReason(r)} />
              {LOST_LABELS[r]}
            </label>
          ))}
        </div>
        <div className={styles.buttons}>
          <button type="button" className={admin.secondary} onClick={onCancel}>Renunță</button>
          <button type="submit" className={admin.primary} disabled={!reason}>Marchează pierdut</button>
        </div>
      </form>
    </dialog>
  );
}
