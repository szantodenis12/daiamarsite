export const OFFER_UNITS = ["lună", "document", "oră", "serviciu"] as const;
export type OfferUnit = (typeof OFFER_UNITS)[number];

export const VAT_MODES = { plus: "Plus TVA", inclus: "TVA inclus", fara: "Fără TVA" } as const;
export type VatMode = keyof typeof VAT_MODES;

export type OfferItem = {
  service: string | null;
  title: string;
  description: string;
  quantity: number;
  unit: OfferUnit;
  price: number | null;
  recurring: boolean;
};

/** What the person writes in the builder. Stored as one JSON document. */
export type OfferDoc = {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  intro: string;
  items: OfferItem[];
  discount: number;
  vatMode: VatMode;
  vatRate: number;
  validDays: number;
  paymentTerms: string;
  notes: string;
  preparedBy: string;
};

export const OFFER_STATUSES = ["ciorna", "trimisa", "vazuta", "acceptata", "refuzata"] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];
export type ShownStatus = OfferStatus | "expirata";

export const OFFER_STATUS_LABELS: Record<ShownStatus, string> = {
  ciorna: "Ciornă",
  trimisa: "Trimisă",
  vazuta: "Văzută",
  acceptata: "Acceptată",
  refuzata: "Refuzată",
  expirata: "Expirată",
};

export type OfferTracking = {
  status: OfferStatus;
  createdAt: string;
  sentAt: string | null;
  doc: Pick<OfferDoc, "validDays">;
};

const DAY = 86400_000;

/** Validity runs from the day the offer was sent (or created, while it is a draft). */
export const validUntil = (offer: OfferTracking) => new Date(new Date(offer.sentAt ?? offer.createdAt).getTime() + offer.doc.validDays * DAY);

export function shownStatus(offer: OfferTracking, now = new Date()): ShownStatus {
  if ((offer.status === "trimisa" || offer.status === "vazuta") && validUntil(offer) < now) return "expirata";
  return offer.status;
}

export type OfferTotals = {
  monthly: number;
  oneOff: number;
  discountMonthly: number;
  discountOneOff: number;
  /** Net = after discount, without VAT. These go on the lead when the offer is accepted. */
  netMonthly: number;
  netOneOff: number;
  vatMonthly: number;
  vatOneOff: number;
  totalMonthly: number;
  totalOneOff: number;
  missingPrices: number;
};

const round = (n: number) => Math.round(n * 100) / 100;

export function offerTotals(doc: Pick<OfferDoc, "items" | "discount" | "vatMode" | "vatRate">): OfferTotals {
  const sum = (recurring: boolean) => doc.items.filter((i) => i.recurring === recurring).reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
  const monthly = sum(true);
  const oneOff = sum(false);
  const factor = 1 - Math.min(100, Math.max(0, doc.discount)) / 100;
  const rate = doc.vatMode === "fara" ? 0 : doc.vatRate / 100;
  const split = (gross: number) => {
    const afterDiscount = gross * factor;
    if (doc.vatMode === "inclus") return { net: afterDiscount / (1 + rate), vat: afterDiscount - afterDiscount / (1 + rate), total: afterDiscount };
    return { net: afterDiscount, vat: afterDiscount * rate, total: afterDiscount * (1 + rate) };
  };
  const m = split(monthly);
  const o = split(oneOff);
  return {
    monthly: round(monthly),
    oneOff: round(oneOff),
    discountMonthly: round(monthly - monthly * factor),
    discountOneOff: round(oneOff - oneOff * factor),
    netMonthly: round(m.net),
    netOneOff: round(o.net),
    vatMonthly: round(m.vat),
    vatOneOff: round(o.vat),
    totalMonthly: round(m.total),
    totalOneOff: round(o.total),
    missingPrices: doc.items.filter((i) => i.price === null).length,
  };
}

const whole = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 });
const bani = new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatLeiExact = (value: number) => `${(Number.isInteger(Math.round(value * 100) / 100) ? whole : bani).format(value)} lei`;

export type OfferTemplate = { key: string; name: string; items: OfferItem[] };

const item = (service: string, title: string, recurring: boolean, unit: OfferUnit): OfferItem => ({
  service,
  title,
  description: "[de completat]",
  quantity: 1,
  unit,
  price: null,
  recurring,
});

// Structure only. Daiamar's prices and service details are not known yet, so prices stay empty.
export const DEFAULT_TEMPLATES: OfferTemplate[] = [
  {
    key: "firma-noua",
    name: "Pachet firmă nouă",
    items: [item("infiintari-lichidari-firme", "Înființare firmă", false, "serviciu"), item("contabilitate", "Contabilitate", true, "lună")],
  },
  {
    key: "contabilitate-srl",
    name: "Contabilitate lunară SRL",
    items: [item("contabilitate", "Contabilitate", true, "lună"), item("salarizare-resurse-umane", "Salarizare și resurse umane", true, "lună")],
  },
  {
    key: "reprezentare-control",
    name: "Reprezentare control",
    items: [item("reprezentare-controale-anaf", "Reprezentare la controale ANAF și ITM", false, "serviciu")],
  },
  {
    key: "audit",
    name: "Audit",
    items: [item("audit-intern-extern", "Audit intern și audit extern", false, "serviciu")],
  },
];

/** Texts and company data printed on every offer. Empty until the office fills them in Setări. */
export type OfferSettings = {
  intro: string;
  paymentTerms: string;
  terms: string;
  legalName: string;
  cui: string;
  regCom: string;
  bank: string;
  iban: string;
  replyTo: string;
  vatRate: number;
};

export const EMPTY_OFFER_SETTINGS: OfferSettings = {
  intro: "",
  paymentTerms: "",
  terms: "",
  legalName: "",
  cui: "",
  regCom: "",
  bank: "",
  iban: "",
  replyTo: "",
  vatRate: 21,
};
