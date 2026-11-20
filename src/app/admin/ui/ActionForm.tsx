"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef } from "react";
import { Check, LoaderCircle } from "lucide-react";
import type { FormState } from "../actions/form";
import styles from "../admin.module.css";

const StateContext = createContext<FormState>({});

type Props = {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
};

// Submits through onSubmit instead of the form action so React does not reset the fields when validation fails.
export function ActionForm({ action, submitLabel, children, className, resetOnSuccess }: Props) {
  const [state, dispatch, pending] = useActionState(action, {});
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) form.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <StateContext value={state}>
      <form
        ref={form}
        className={className}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => dispatch(data));
        }}
      >
        {children}
        <div className={styles.formFoot}>
          <button type="submit" className={styles.primary} disabled={pending}>
            {pending && <LoaderCircle aria-hidden size={16} className={styles.spin} />}
            {submitLabel}
          </button>
          {!pending && state.error && <p className={styles.fieldError} role="alert">{state.error}</p>}
          {!pending && state.ok && <span className={styles.saved} role="status"><Check aria-hidden size={14} /> Salvat</span>}
        </div>
      </form>
    </StateContext>
  );
}

export function FieldError({ name }: { name: string }) {
  const message = useContext(StateContext).errors?.[name];
  return message ? <span className={styles.fieldError}>{message}</span> : null;
}
