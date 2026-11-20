"use client";

import { useState } from "react";
import { bucharestDay } from "@/lib/crm";
import { Field } from "../../../ui/Field";
import styles from "./lead.module.css";
import admin from "../../../admin.module.css";

const SHORTCUTS = [
  { label: "Mâine", days: 1 },
  { label: "+3 zile", days: 3 },
  { label: "+1 săpt.", days: 7 },
];

export function FollowUpFields({ date, text }: { date: string | null; text: string }) {
  const [value, setValue] = useState(date ?? "");
  return (
    <>
      <Field label="Data" name="nextActionAt">
        <input id="nextActionAt" name="nextActionAt" type="date" value={value} onChange={(e) => setValue(e.target.value)} className={admin.input} />
      </Field>
      <div className={styles.shortcuts}>
        {SHORTCUTS.map((s) => (
          <button key={s.days} type="button" className={`${admin.secondary} ${admin.small}`} onClick={() => setValue(bucharestDay(new Date(Date.now() + s.days * 86400_000)))}>
            {s.label}
          </button>
        ))}
      </div>
      <Field label="Ce urmează" name="nextAction">
        <input id="nextAction" name="nextAction" defaultValue={text} className={admin.input} placeholder="ex. Revin cu oferta" />
      </Field>
    </>
  );
}
