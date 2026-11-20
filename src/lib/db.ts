import { fileBackend } from "@/lib/db-file";
import { neonBackend } from "@/lib/db-neon";
import type { Backend } from "@/lib/db-types";

export { LEAD_STATUSES, type LeadStatus } from "@/lib/crm";
export { EVENT_KINDS, SUBSCRIBER_STATUSES } from "@/lib/db-types";
export type * from "@/lib/db-types";

let backend: Backend | null = null;

export function db(): Backend {
  if (backend) return backend;
  const url = process.env.DATABASE_URL;
  if (!url && process.env.VERCEL) throw new Error("DATABASE_URL is not set. Connect Neon in Vercel (see DEPLOY.md).");
  backend = url ? neonBackend(url) : fileBackend();
  return backend;
}
