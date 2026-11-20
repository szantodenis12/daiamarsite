"use client";

import { useActionState } from "react";
import { CircleCheck, LoaderCircle } from "lucide-react";
import { accept, type AcceptState } from "./actions";
import styles from "./offer.module.css";

export function AcceptForm({ token }: { token: string }) {
  const [state, run, pending] = useActionState<AcceptState, FormData>(accept, {});
  if (state.ok) {
    return (
      <p className={styles.done} role="status">
        <CircleCheck aria-hidden size={18} /> Mulțumim! Oferta a fost acceptată. Vă contactăm în curând pentru pașii următori.
      </p>
    );
  }
  return (
    <form action={run} className={styles.accept}>
      <input type="hidden" name="token" value={token} />
      <label className={styles.field}>
        <span>Numele dumneavoastră (opțional)</span>
        <input name="name" autoComplete="name" />
      </label>
      <label className={styles.field}>
        <span>Comentariu (opțional)</span>
        <textarea name="comment" rows={2} />
      </label>
      {state.error && <p className={styles.error} role="alert">{state.error}</p>}
      <button type="submit" className={styles.primary} disabled={pending}>
        {pending ? <LoaderCircle aria-hidden size={18} className={styles.spin} /> : <CircleCheck aria-hidden size={18} />} Accept oferta
      </button>
    </form>
  );
}
