"use client";

import { useState } from "react";
import { LEAD_STATUSES, LOST_LABELS, LOST_REASONS, STATUS_DISPLAY, type LeadStatus } from "@/lib/crm";
import { Field } from "../../../ui/Field";
import styles from "../../../admin.module.css";

export function StatusFields({ status, lostReason }: { status: LeadStatus; lostReason: string | null }) {
  const [value, setValue] = useState(status);
  return (
    <>
      <Field label="Status" name="status">
        <select id="status" name="status" value={value} onChange={(e) => setValue(e.target.value as LeadStatus)} className={styles.input}>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_DISPLAY[s]}</option>)}
        </select>
      </Field>
      {value === "pierdut" && (
        <Field label="Motivul pierderii" name="lostReason">
          <select id="lostReason" name="lostReason" defaultValue={lostReason ?? ""} required className={styles.input}>
            <option value="" disabled>Alegeți motivul</option>
            {LOST_REASONS.map((r) => <option key={r} value={r}>{LOST_LABELS[r]}</option>)}
          </select>
        </Field>
      )}
    </>
  );
}
