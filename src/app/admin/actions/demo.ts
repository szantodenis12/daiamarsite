import { cookies } from "next/headers";
import { DEMO_MESSAGE, isDemo, isDemoError } from "@/lib/demo";
import { requireSession } from "../session";
import { DEMO_COOKIE } from "./cookie";

async function announce() {
  (await cookies()).set(DEMO_COOKIE, String(Date.now()), { path: "/", maxAge: 30, sameSite: "lax" });
}

/** Wraps a server action that returns a result the UI shows (FormState and similar). In demo mode it answers `blocked` and runs nothing. */
export function guarded<A extends unknown[], R>(action: (...args: A) => Promise<R>, blocked: NoInfer<R>) {
  return async (...args: A): Promise<R> => {
    if (isDemo()) {
      await requireSession();
      return blocked;
    }
    try {
      return await action(...args);
    } catch (error) {
      if (isDemoError(error)) return blocked;
      throw error;
    }
  };
}

export const demoError = { error: DEMO_MESSAGE };

/** Wraps a form action that returns nothing: the message reaches the person through the toast in the panel layout. */
export function guardedVoid<A extends unknown[]>(action: (...args: A) => Promise<void>) {
  return async (...args: A): Promise<void> => {
    if (isDemo()) {
      await requireSession();
      return announce();
    }
    try {
      await action(...args);
    } catch (error) {
      if (isDemoError(error)) return announce();
      throw error;
    }
  };
}
