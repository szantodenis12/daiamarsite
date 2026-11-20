"use client";

import { useCallback, useRef } from "react";
import type { ThanksKind } from "@/lib/thanks";

export type FormSession = { token: string | null; uploads: "blob" | "local" };

const fallback: FormSession = { token: null, uploads: "local" };

/**
 * Asks the server for a signed "form shown at" token the first time the visitor focuses the form (or at submit, at the
 * latest). The server compares it with the submit time; a form sent without one is kept but marked suspect.
 */
export function useFormSession(): () => Promise<FormSession> {
  const pending = useRef<Promise<FormSession> | null>(null);
  return useCallback(() => {
    pending.current ??= fetch("/api/form-token/", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<FormSession>) : fallback))
      .catch(() => fallback);
    return pending.current;
  }, []);
}

const CONVERSION_KEY = "dm_conversion";

/** Called right before the redirect to /multumim/: that page fires the conversion only if it finds this one-time id. */
export function rememberConversion(kind: ThanksKind) {
  const id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
  try {
    sessionStorage.setItem(CONVERSION_KEY, JSON.stringify({ id, kind }));
  } catch {
    // Storage blocked: no conversion is counted, the visitor still sees the thank-you page.
  }
}

/** Returns the id once and deletes it, so a reload, Back or a shared link does not count again. */
export function takeConversion(kind: string): string | null {
  try {
    const raw = sessionStorage.getItem(CONVERSION_KEY);
    sessionStorage.removeItem(CONVERSION_KEY);
    const saved = raw ? (JSON.parse(raw) as { id?: unknown; kind?: unknown }) : null;
    return saved?.kind === kind && typeof saved.id === "string" ? saved.id : null;
  } catch {
    return null;
  }
}
