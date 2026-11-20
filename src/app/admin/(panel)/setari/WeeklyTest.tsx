"use client";

import { useActionState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { sendWeeklyTest, type WeeklyTestState } from "../../actions/settings";
import styles from "./settings.module.css";
import admin from "../../admin.module.css";

export function WeeklyTest() {
  const [state, run, pending] = useActionState<WeeklyTestState>(sendWeeklyTest, {});
  return (
    <form action={run} className={styles.stack}>
      <div>
        <button type="submit" className={admin.secondary} disabled={pending}>
          {pending ? <LoaderCircle aria-hidden size={16} className={admin.spin} /> : <Send aria-hidden size={16} />} Trimite acum un test
        </button>
      </div>
      {state.message && <p className={admin.notice} data-tone={state.tone === "ok" ? undefined : "warn"} role="status">{state.message}</p>}
      {state.preview && <pre className={styles.preview}>{state.preview}</pre>}
    </form>
  );
}
