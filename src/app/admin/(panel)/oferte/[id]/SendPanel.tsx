"use client";

import { startTransition, useActionState } from "react";
import { Download, LoaderCircle, Mail, Send } from "lucide-react";
import { sendOffer, type SendState } from "../../../actions/offers";
import styles from "../offers.module.css";
import admin from "../../../admin.module.css";

type Props = { offerId: number; to: string; subject: string; body: string; pdfHref: string };

export function SendPanel({ offerId, to, subject, body, pdfHref }: Props) {
  const [state, run, pending] = useActionState<SendState, FormData>(sendOffer, {});

  return (
    <form
      className={styles.stack}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => run(data));
      }}
    >
      <input type="hidden" name="id" value={offerId} />
      <label className={admin.field}>
        <span className={admin.label}>Către</span>
        <input name="to" type="email" defaultValue={to} className={admin.input} aria-invalid={Boolean(state.errors?.to) || undefined} />
      </label>
      <label className={admin.field}>
        <span className={admin.label}>Subiect</span>
        <input name="subject" defaultValue={subject} className={admin.input} />
      </label>
      <label className={admin.field}>
        <span className={admin.label}>Mesaj</span>
        <textarea name="body" rows={8} defaultValue={body} className={admin.input} />
      </label>
      <div className={styles.buttons}>
        <button type="submit" className={admin.primary} disabled={pending}>
          {pending ? <LoaderCircle aria-hidden size={16} className={admin.spin} /> : <Send aria-hidden size={16} />} Trimite cu PDF atașat
        </button>
      </div>
      {state.ok && <p className={admin.notice} role="status">Oferta a fost trimisă.</p>}
      {state.error && <p className={admin.notice} data-tone="warn" role="alert">{state.error}</p>}
      {state.fallback && (
        <div className={styles.buttons}>
          <a href={pdfHref} className={admin.secondary}><Download aria-hidden size={16} /> Descarcă PDF</a>
          <a href={`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`} className={admin.secondary}>
            <Mail aria-hidden size={16} /> Deschide în e-mail
          </a>
        </div>
      )}
    </form>
  );
}
