export const LEAD_STATUSES = ["nou", "contactat", "oferta", "client", "pierdut"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const OPEN_STATUSES: readonly LeadStatus[] = ["nou", "contactat", "oferta"];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  nou: "Nou",
  contactat: "Contactat",
  oferta: "Ofertă",
  client: "Client",
  pierdut: "Pierdut",
};

/** What the team sees on screen. STATUS_LABELS stays as is: it is written into the timeline and the Excel export. */
export const STATUS_DISPLAY: Record<LeadStatus, string> = {
  nou: "Nou",
  contactat: "Contactat",
  oferta: "Ofertă trimisă",
  client: "Client",
  pierdut: "Pierdut",
};

export const ACTIVITY_TYPES = ["nota", "apel", "email", "whatsapp", "status", "oferta", "documente"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  nota: "Notă",
  apel: "Apel",
  email: "Email",
  whatsapp: "WhatsApp",
  status: "Status",
  oferta: "Ofertă",
  documente: "Documente",
};

// Written by the site, not by the team, so they are not offered in the activity form.
export const SYSTEM_ACTIVITY_TYPES: readonly ActivityType[] = ["status", "documente"];

/** Outbound contact by the team. Only these, or moving a lead to one of CONTACTED_STATUSES by hand, set first_contact_at. */
export const CONTACT_ACTIVITY_TYPES: readonly ActivityType[] = ["apel", "email", "whatsapp", "oferta"];
export const CONTACTED_STATUSES: readonly LeadStatus[] = ["contactat", "oferta", "client"];

/** Author of timeline entries written by the public site (uploads). Never "Client": nobody has checked who sent them. */
export const PUBLIC_FORM_AUTHOR = "Formular public";

/** How the request reached us: the contact form, the "Vă sunăm noi" callback or the document upload. */
export const LEAD_KINDS = ["cerere", "apel", "documente"] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];
export const LEAD_KIND_LABELS: Record<LeadKind, string> = { cerere: "Cerere", apel: "Sună înapoi", documente: "Documente" };

export const LOST_REASONS = ["pret", "alt-contabil", "nu-a-raspuns", "nepotrivit", "altul"] as const;
export type LostReason = (typeof LOST_REASONS)[number];

export const LOST_LABELS: Record<LostReason, string> = {
  pret: "Preț",
  "alt-contabil": "A ales alt contabil",
  "nu-a-raspuns": "Nu a răspuns",
  nepotrivit: "Nu e client potrivit",
  altul: "Altul",
};

// Leads typed in by hand keep their source in `channel`, so reports group them like site channels.
export const MANUAL_SOURCES = ["Recomandare", "Telefon direct", "Vizită la birou", "Eveniment", "Altul"] as const;
export type ManualSource = (typeof MANUAL_SOURCES)[number];
export const MANUAL_PLACEMENT = "manual";

export const AD_CHANNELS = [
  { key: "google", label: "Google Ads", leadChannels: ["Google Ads"] },
  { key: "meta", label: "Meta Ads", leadChannels: ["Meta Ads"] },
  { key: "linkedin", label: "LinkedIn", leadChannels: ["LinkedIn"] },
  { key: "print", label: "Print / ONRC", leadChannels: ["Flyer ONRC", "Print / QR"] },
  { key: "altul", label: "Altul", leadChannels: [] },
] as const;
export type AdChannel = (typeof AD_CHANNELS)[number]["key"];

export const isOneOf = <T extends string>(list: readonly T[], value: unknown): value is T => list.includes(value as T);

export function normalizePhone(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length < 9) return null;
  if (digits.startsWith("0040")) return `0${digits.slice(4)}`;
  if (digits.startsWith("40") && digits.length === 11) return `0${digits.slice(2)}`;
  return digits;
}

export const normalizeEmail = (email: string | null | undefined) => email?.trim().toLowerCase() || null;

/** wa.me wants the number in international format without "+" or leading zeros. */
export function whatsappNumber(phone: string): string | null {
  const local = normalizePhone(phone);
  if (!local) return null;
  return local.startsWith("0") && local.length === 10 ? `40${local.slice(1)}` : local;
}

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest", year: "numeric", month: "2-digit", day: "2-digit" });

/** Calendar day in Oradea as YYYY-MM-DD, which compares correctly as a string. */
export const bucharestDay = (date: Date = new Date()) => dayFormat.format(date);
export const bucharestMonth = (date: Date = new Date()) => bucharestDay(date).slice(0, 7);
