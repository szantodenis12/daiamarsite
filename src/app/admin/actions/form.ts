export type FormState = { ok?: boolean; error?: string; errors?: Record<string, string> };

export function text(form: FormData, name: string, max: number): string | null {
  const value = form.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

/** Whole lei ("2.500" or "2500"), empty means unknown. Returns undefined for decimals or anything that is not a sane amount. */
export function lei(form: FormData, name: string): number | null | undefined {
  const raw = text(form, name, 20)?.replace(/\s/g, "");
  if (!raw) return null;
  if (!/^\d{1,3}(\.\d{3})*$|^\d+$/.test(raw)) return undefined;
  const value = Number(raw.replace(/\./g, ""));
  return value < 100_000_000 ? value : undefined;
}

/** A YYYY-MM-DD date from <input type="date">. Returns undefined when it is not a real day. */
export function day(form: FormData, name: string): string | null | undefined {
  const raw = text(form, name, 10);
  if (!raw) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(`${raw}T00:00:00Z`)) ? raw : undefined;
}

export const id = (form: FormData, name = "id") => {
  const value = Number(form.get(name));
  return Number.isInteger(value) && value > 0 ? value : null;
};
