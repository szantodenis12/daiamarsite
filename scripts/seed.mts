// Demo data for /admin. Everything is marked demo=true and removed with "Șterge datele demo".
// Run: npm run seed (uses DATABASE_URL from .env.local when present, otherwise .data/db.json).
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import type { Touch } from "../src/lib/attribution";
import type { ActivityType, LeadStatus, LostReason } from "../src/lib/crm";
import type { Lead } from "../src/lib/db";
import type { OfferStatus } from "../src/lib/offers";

// The app imports "@/lib/..." without extensions (Next resolves them); teach Node the same rule.
const src = new URL("../src/", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    const local = specifier.startsWith("@/") ? new URL(specifier.slice(2), src) : specifier.startsWith(".") && context.parentURL?.startsWith(src.href) ? new URL(specifier, context.parentURL) : null;
    if (local && !/\.[cm]?[jt]sx?$/.test(local.pathname)) {
      for (const ext of [".ts", ".tsx"]) if (existsSync(new URL(local.href + ext))) return next(local.href + ext, context);
    }
    return next(local?.href ?? specifier, context);
  },
});

const { db }: typeof import("../src/lib/db") = await import(new URL("../src/lib/db.ts", import.meta.url).href);
const { classify }: typeof import("../src/lib/channel") = await import(new URL("../src/lib/channel.ts", import.meta.url).href);
const { bucharestDay, bucharestMonth }: typeof import("../src/lib/crm") = await import(new URL("../src/lib/crm.ts", import.meta.url).href);
const { newOfferToken, nextOfferNumber }: typeof import("../src/lib/offer-store") = await import(new URL("../src/lib/offer-store.ts", import.meta.url).href);
const { getTeam, setTeam }: typeof import("../src/lib/settings") = await import(new URL("../src/lib/settings.ts", import.meta.url).href);

let state = 42;
const random = () => ((state = (state * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)];
const chance = (p: number) => random() < p;
const HOUR = 3600_000;
const DAY = 24 * HOUR;
const now = Date.now();

type Source = { weight: number; leads: number; touch: () => Omit<Touch, "landing" | "at">; landing?: string };

const sources: Source[] = [
  { weight: 60, leads: 13, touch: () => ({ utm_source: "google", utm_medium: "cpc", utm_campaign: pick(["control-anaf-oradea", "contabilitate-oradea"]), utm_term: pick(["control anaf", "firma contabilitate oradea", "contabil oradea"]), gclid: "demo-gclid" }) },
  { weight: 70, leads: 10, touch: () => ({ referrer: "https://www.google.com/" }) },
  { weight: 14, leads: 7, landing: "/firme-noi/", touch: () => ({ utm_source: "onrc", utm_medium: "print", utm_campaign: "firme-noi" }) },
  { weight: 40, leads: 7, landing: "/firme-noi/", touch: () => ({ utm_source: "facebook", utm_medium: "paid_social", utm_campaign: "firme-noi-bihor", fbclid: "demo-fbclid" }) },
  { weight: 6, leads: 2, touch: () => ({ utm_source: "carte-vizita", utm_medium: "print", utm_campaign: "carte-vizita" }) },
  { weight: 5, leads: 1, touch: () => ({ utm_source: "semnatura-email", utm_medium: "email", utm_campaign: "semnatura" }) },
  { weight: 18, leads: 2, touch: () => ({ referrer: "https://l.facebook.com/" }) },
  { weight: 10, leads: 2, touch: () => ({ referrer: "https://www.linkedin.com/" }) },
  { weight: 8, leads: 2, touch: () => ({ utm_source: "chatgpt.com" }) },
  { weight: 30, leads: 3, touch: () => ({}) },
  { weight: 8, leads: 1, touch: () => ({ referrer: pick(["https://www.listafirme.ro/", "https://www.ceccarbihor.ro/"]) }) },
  { weight: 5, leads: 1, touch: () => ({ referrer: "https://www.bing.com/" }) },
];

const landings = ["/", "/servicii/reprezentare-controale-anaf/", "/servicii/contabilitate/", "/servicii/audit-intern-extern/", "/control-anaf/", "/schimba-contabilul/"];
const firstNames = ["Andrei", "Ioana", "Florin", "Raluca", "Mihai", "Alina", "Cristian", "Bianca", "Sorin", "Diana", "Paul", "Larisa", "Tudor", "Monica", "Gabriel", "Oana", "Vlad", "Roxana", "Lucian", "Simona", "Emil", "Daniela", "Horia", "Carmen"];
const lastNames = ["Pop", "Mureșan", "Bogdan", "Szabo", "Tripon", "Hodoș", "Filip", "Kovács", "Bulzan", "Rus", "Negruț", "Pașca", "Ardelean", "Bălaj", "Toth", "Sabău", "Iancu", "Boca", "Haiduc", "Vida", "Crișan", "Moga", "Lazăr", "Oros"];
const usedNames = new Set<string>();
function person(): string {
  for (;;) {
    const name = `${pick(firstNames)} ${pick(lastNames)}`;
    if (!usedNames.has(name)) return usedNames.add(name), name;
  }
}
const companies = ["Atelier Lemn Nord SRL", "Transbihor Logistic SRL", "Clinica Verde SRL", "Pensiunea Crișul SRL", "Nord Construct Instal SRL", "Agro Câmpia SRL", "Studio Foto Lumen SRL", "Brutăria Veche SRL", null, null];
const messages = ["Am primit notificare de control de la ANAF și aș vrea o discuție.", "Deschid o firmă nouă și caut contabil.", "Vrem să schimbăm firma de contabilitate de la 1 ianuarie.", "Avem 12 angajați, ne interesează salarizarea.", "Aș vrea un audit înainte de un control.", null, null];
const serviceSlugs = ["reprezentare-controale-anaf", "contabilitate", "contabilitate", "infiintari-lichidari-firme", "audit-intern-extern", "salarizare-resurse-umane", "consultanta-fiscala"];
const monthly = [400, 500, 600, 800, 900, 1000, 1200, 1500, 2000];
const oneOff: Record<string, number[]> = { "infiintari-lichidari-firme": [800, 1000], "audit-intern-extern": [3000, 4500], "reprezentare-controale-anaf": [2500, 4000] };
const lostReasons: LostReason[] = ["pret", "pret", "alt-contabil", "nu-a-raspuns", "nu-a-raspuns", "nepotrivit", "altul"];
const contactTypes: ActivityType[] = ["apel", "apel", "apel", "email", "whatsapp"];
const nextSteps = ["Revin cu oferta", "Sun pentru răspuns la ofertă", "Trimit lista de documente", "Întâlnire la birou", "Verific actele primite"];
const callNotes = ["Am vorbit, vrea ofertă.", "Nu a răspuns, revin mâine.", "A trimis balanța pe email.", "Discuție de 15 minute, are 3 angajați.", "Vrea să înceapă de luna viitoare."];

const phone = () => `07${pick(["21", "23", "40", "41", "45", "52", "55", "88"])} ${String(100 + Math.floor(random() * 900))} ${String(100 + Math.floor(random() * 900))}`;
const emailOf = (name: string) => `${name.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").replace(" ", ".")}@exemplu.ro`;
const iso = (ms: number) => new Date(Math.min(ms, now - 60_000)).toISOString();

const store = db();
await store.deleteDemo();
if (!(await getTeam()).length) await setTeam(["Administrator", "Contabil 1", "Contabil 2"]);
const team = await getTeam();

function statusFor(ageDays: number): LeadStatus {
  if (ageDays < 1.5) return "nou";
  const r = random();
  if (r < 0.14) return ageDays < 14 ? "nou" : "contactat";
  if (r < 0.38) return "contactat";
  if (r < 0.58) return "oferta";
  if (r < 0.82) return "client";
  return "pierdut";
}

function followUp(status: LeadStatus): string | null {
  if (status === "client" || status === "pierdut" || chance(0.25)) return null;
  return bucharestDay(new Date(now + (Math.floor(random() * 13) - 5) * DAY));
}

type Created = { id: number; phone: string; email: string | null; name: string };
const created: Created[] = [];
let activities = 0;

async function addLead(input: {
  name: string;
  phone: string;
  email: string | null;
  createdAt: number;
  channel: string;
  placement: string;
  page: string;
  ft: Touch | null;
  lt: Touch | null;
  device: string;
  referredBy?: string;
}) {
  const ageDays = (now - input.createdAt) / DAY;
  const status = input.placement === "manual" && ageDays > 1.5 && chance(0.6) ? pick(["contactat", "oferta", "client"] as const) : statusFor(ageDays);
  const service = pick(serviceSlugs);
  const contactedAt = input.createdAt + (chance(0.5) ? 0.5 + random() * 5 : 6 + random() * 40) * HOUR;
  const wonAt = input.createdAt + (3 + random() * 14) * DAY;
  const hasValue = status !== "nou" && (status !== "contactat" || chance(0.4));
  const id = await store.insertLead({
    name: input.name,
    company: pick(companies),
    phone: input.phone,
    email: input.email,
    service,
    message: pick(messages),
    placement: input.placement,
    page: input.page,
    channel: input.channel,
    ft: input.ft,
    lt: input.lt,
    device: input.device,
    createdAt: iso(input.createdAt),
    status,
    demo: true,
    assignee: status === "nou" && chance(0.5) ? null : pick(team),
    referredBy: input.referredBy ?? null,
    monthlyValue: hasValue ? pick(monthly) : null,
    oneOffValue: hasValue && oneOff[service] && chance(0.7) ? pick(oneOff[service]) : null,
    nextActionAt: followUp(status),
    nextAction: pick(nextSteps),
    lostReason: status === "pierdut" ? pick(lostReasons) : null,
    wonAt: status === "client" ? iso(wonAt) : null,
  });
  created.push({ id, phone: input.phone, email: input.email, name: input.name });

  if (status === "nou") return;
  const author = pick(team);
  const log = async (type: ActivityType, text: string, at: number) => {
    await store.insertActivity({ leadId: id, type, text, author, at: iso(at) });
    // Same rule as the app (lib/leads.ts): only outbound contact by the team counts as first contact.
    if (type !== "status") await store.markContacted(id, iso(at));
    activities++;
  };
  await log(pick(contactTypes), pick(callNotes), contactedAt);
  await log("status", "Nou → Contactat", contactedAt + 60_000);
  if (status === "contactat") return;
  const offerAt = contactedAt + (1 + random() * 3) * DAY;
  const offered = status !== "pierdut" || chance(0.6);
  if (offered) {
    await log("oferta", "Ofertă trimisă pe email.", offerAt);
    await log("status", "Contactat → Ofertă", offerAt + 60_000);
  }
  if (status === "client") await log("status", "Ofertă → Client", wonAt);
  if (status === "pierdut") await log("status", `${offered ? "Ofertă" : "Contactat"} → Pierdut`, offerAt + 2 * DAY);
}

for (const source of sources) {
  for (let i = 0; i < source.leads; i++) {
    const at = now - random() * 88 * DAY;
    const landing = source.landing ?? pick(landings);
    const lt: Touch = { ...source.touch(), landing, at: iso(at) };
    const ftSource = chance(0.75) ? source : pick(sources);
    const ft: Touch = { ...ftSource.touch(), landing: ftSource.landing ?? pick(landings), at: iso(at - random() * 10 * DAY) };
    const name = person();
    await addLead({
      name,
      phone: phone(),
      email: chance(0.6) ? emailOf(name) : null,
      createdAt: at,
      channel: classify(lt).channel,
      placement: landing === "/firme-noi/" ? "landing-firme-noi" : pick(["home-hero", "contact", "serviciu", "cta-band"]),
      page: landing,
      ft,
      lt,
      device: pick(["mobil", "mobil", "desktop", "tabletă"]),
    });
  }
  for (let i = 0; i < source.weight * 3; i++) {
    const at = now - random() * 88 * DAY;
    const touch: Touch = { ...source.touch(), landing: source.landing ?? pick(landings), at: iso(at) };
    const kind = i % 25 === 0 ? "phone" : i % 61 === 0 ? "email" : "visit";
    await store.insertEvent({ kind, placement: kind === "visit" ? null : "header", page: touch.landing, channel: classify(touch).channel, ft: touch, lt: touch, createdAt: iso(at), demo: true });
  }
}

const manual: { channel: string; referredBy?: string }[] = [
  { channel: "Recomandare", referredBy: "Transbihor Logistic SRL" },
  { channel: "Recomandare", referredBy: "Clinica Verde SRL" },
  { channel: "Recomandare", referredBy: "Pensiunea Crișul SRL" },
  { channel: "Telefon direct" },
  { channel: "Telefon direct" },
  { channel: "Vizită la birou" },
  { channel: "Eveniment" },
];
for (const m of manual) {
  const name = person();
  await addLead({ name, phone: phone(), email: chance(0.4) ? emailOf(name) : null, createdAt: now - random() * 80 * DAY, channel: m.channel, placement: "manual", page: "-", ft: null, lt: null, device: "-", referredBy: m.referredBy });
}

// Two people who wrote again: one with the same phone, one with the same email.
const [first, second] = [created[3], created.find((c) => c.email) ?? created[5]];
const recent = (ms: number): Touch => ({ referrer: "https://www.google.com/", landing: "/contact/", at: iso(ms) });
await addLead({ name: first.name, phone: first.phone.replace(/ /g, ""), email: null, createdAt: now - 2 * HOUR, channel: "Google organic", placement: "contact", page: "/contact/", ft: recent(now - 3 * HOUR), lt: recent(now - 2 * HOUR), device: "mobil" });
await addLead({ name: second.name, phone: phone(), email: second.email?.toUpperCase() ?? null, createdAt: now - 30 * HOUR, channel: "Google organic", placement: "contact", page: "/contact/", ft: recent(now - 31 * HOUR), lt: recent(now - 30 * HOUR), device: "desktop" });

const months = [2, 1, 0].map((back) => {
  const d = new Date(now);
  d.setUTCDate(15);
  d.setUTCMonth(d.getUTCMonth() - back);
  return bucharestMonth(d);
});
for (const [i, month] of months.entries()) {
  await store.setSpend(month, "google", [1800, 2100, 1200][i], true);
  await store.setSpend(month, "meta", [900, 1100, 650][i], true);
  if (i === 0) await store.setSpend(month, "print", 650, true);
  if (i === 1) await store.setSpend(month, "altul", 300, true);
}

const links = [
  { label: "Flyer ONRC", page: "/firme-noi/", source: "onrc", medium: "print", campaign: "firme-noi", content: "" },
  { label: "Carte de vizită", page: "/", source: "carte-vizita", medium: "print", campaign: "carte-vizita", content: "" },
  { label: "Meta: firme noi Bihor", page: "/firme-noi/", source: "facebook", medium: "paid_social", campaign: "firme-noi-bihor", content: "" },
  { label: "Semnătură email", page: "/", source: "semnatura-email", medium: "email", campaign: "semnatura", content: "" },
];
for (const [i, link] of links.entries()) await store.insertLink({ ...link, createdAt: iso(now - (85 - i * 5) * DAY), demo: true });

// Demo prices exist only here, so the offers screens have something to show. Real templates stay without prices.
const allLeads = await store.leadsSince(new Date(0));
const demoLeads = (status: LeadStatus) => allLeads.filter((l) => l.demo && l.status === status);
const plan: [Lead | undefined, OfferStatus, number][] = [
  ...demoLeads("client").slice(0, 3).map((l) => [l, "acceptata", 20] as [Lead, OfferStatus, number]),
  ...demoLeads("oferta").slice(0, 2).map((l) => [l, "vazuta", 6] as [Lead, OfferStatus, number]),
  ...demoLeads("oferta").slice(2, 4).map((l) => [l, "trimisa", 3] as [Lead, OfferStatus, number]),
  [demoLeads("oferta")[4], "trimisa", 45],
  [demoLeads("pierdut")[0], "refuzata", 25],
  ...demoLeads("contactat").slice(0, 2).map((l) => [l, "ciorna", 1] as [Lead, OfferStatus, number]),
];
const numbers: { number: string }[] = await store.offers();
let offers = 0;
for (const [lead, status, daysAgo] of plan) {
  if (!lead) continue;
  const sentAt = status === "ciorna" ? null : iso(now - daysAgo * DAY);
  const monthlyPrice = lead.monthlyValue ?? pick(monthly);
  const number = nextOfferNumber(numbers);
  numbers.push({ number });
  await store.insertOffer({
    number,
    token: newOfferToken(),
    leadId: lead.id,
    status,
    demo: true,
    createdAt: iso(now - (daysAgo + 1) * DAY),
    sentAt,
    firstViewedAt: status === "vazuta" || status === "acceptata" ? iso(now - (daysAgo - 1) * DAY) : null,
    viewCount: status === "vazuta" ? 2 : status === "acceptata" ? 3 : 0,
    acceptedAt: status === "acceptata" ? iso(now - (daysAgo - 2) * DAY) : null,
    acceptedName: status === "acceptata" ? lead.name : null,
    acceptedComment: null,
    doc: {
      clientName: lead.name,
      clientCompany: lead.company ?? "",
      clientEmail: lead.email ?? "",
      intro: "Ofertă demo, generată pentru prezentarea panoului. Prețurile nu sunt prețurile Daiamar.",
      items: [
        { service: "contabilitate", title: "Contabilitate", description: "Demo", quantity: 1, unit: "lună", price: monthlyPrice, recurring: true },
        ...(lead.oneOffValue ? [{ service: lead.service, title: "Serviciu unic", description: "Demo", quantity: 1, unit: "serviciu" as const, price: lead.oneOffValue, recurring: false }] : []),
      ],
      discount: 0,
      vatMode: "plus",
      vatRate: 21,
      validDays: 30,
      paymentTerms: "",
      notes: "",
      preparedBy: lead.assignee ?? "",
    },
  });
  if (sentAt) {
    await store.insertActivity({ leadId: lead.id, type: "oferta", text: `Oferta ${number} trimisă pe email.`, author: lead.assignee ?? "Echipa", at: sentAt });
    await store.markContacted(lead.id, sentAt);
  }
  offers++;
}

console.log(
  `Seeded ${offers} demo offers, ${created.length} demo leads, ${activities} activities, ${months.length} months of ad spend and ${links.length} links (${process.env.DATABASE_URL ? "Neon" : ".data/db.json"}).`,
);
