import type { LeadKind } from "@/lib/crm";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^[\d\s+().-]+$/;

export type LeadFields = { name: string; phone: string; email: string; consent: boolean };
export type LeadErrors = Partial<Record<keyof LeadFields | "service", string>>;

export const isEmail = (value: string) => EMAIL.test(value.trim());

// Shared by the forms (instant feedback) and the API routes (the check that counts).
// The callback form has no email field, so it needs the phone.
export function validateLead({ name, phone, email, consent }: LeadFields, kind: LeadKind = "cerere"): LeadErrors {
  const errors: LeadErrors = {};
  if (name.trim().length < 2) errors.name = "Scrieți numele dumneavoastră.";
  const digits = phone.replace(/\D/g, "").length;
  if (phone.trim() && !PHONE_CHARS.test(phone.trim())) errors.phone = "Numărul de telefon poate conține doar cifre, spații, +, -, . și paranteze.";
  else if (phone.trim() && digits < 9) errors.phone = "Numărul de telefon pare incomplet.";
  else if (digits > 15) errors.phone = "Numărul de telefon are prea multe cifre.";
  if (email.trim() && !isEmail(email)) errors.email = "Adresa de email nu este validă.";
  if (kind === "apel" && !phone.trim()) errors.phone = "Scrieți numărul la care să vă sunăm.";
  else if (!phone.trim() && !email.trim()) errors.phone = "Lăsați un telefon sau o adresă de email.";
  if (!consent) errors.consent = "Avem nevoie de acordul dumneavoastră ca să vă putem contacta.";
  return errors;
}
