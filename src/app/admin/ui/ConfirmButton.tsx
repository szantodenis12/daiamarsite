"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import styles from "./dialog.module.css";
import admin from "../admin.module.css";

type Props = {
  label: React.ReactNode;
  title: string;
  text: string;
  confirmLabel: string;
  className?: string;
};

/** Lives inside the <form> it guards: the dialog's confirm button is that form's submit button. */
export function ConfirmButton({ label, title, text, confirmLabel, className }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { pending } = useFormStatus();

  return (
    <>
      <button type="button" className={className ?? admin.danger} onClick={() => dialog.current?.showModal()} disabled={pending}>
        {label}
      </button>
      <dialog ref={dialog} className={styles.dialog} onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        <div className={styles.body}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.text}>{text}</p>
          <div className={styles.buttons}>
            <button type="button" className={admin.secondary} onClick={() => dialog.current?.close()}>Renunță</button>
            <button type="submit" className={admin.primary} data-tone="danger" onClick={() => setTimeout(() => dialog.current?.close())}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
