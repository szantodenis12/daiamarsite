"use client";

import { useState } from "react";
import { MANUAL_SOURCES, type ManualSource } from "@/lib/crm";
import { FieldError } from "../../../ui/ActionForm";
import styles from "./new.module.css";
import admin from "../../../admin.module.css";

export function SourcePicker() {
  const [source, setSource] = useState<ManualSource>("Telefon direct");
  return (
    <fieldset className={styles.sources}>
      <legend className={admin.label}>De unde a venit</legend>
      <div className={styles.chips}>
        {MANUAL_SOURCES.map((s) => (
          <label key={s} className={styles.chipOption}>
            <input type="radio" name="source" value={s} checked={source === s} onChange={() => setSource(s)} />
            {s}
          </label>
        ))}
      </div>
      <FieldError name="source" />
      {source === "Recomandare" && (
        <div className={admin.field}>
          <label className={admin.label} htmlFor="referredBy">Recomandat de</label>
          <input id="referredBy" name="referredBy" className={admin.input} placeholder="Numele clientului sau al firmei care v-a recomandat" />
        </div>
      )}
    </fieldset>
  );
}
