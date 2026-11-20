import { neon } from "@neondatabase/serverless";
import type { Touch } from "@/lib/attribution";
import type { ActivityType, LeadKind, LeadStatus } from "@/lib/crm";
import type { OfferDoc, OfferStatus } from "@/lib/offers";
import {
  CRM_DEFAULTS,
  type Activity,
  type Backend,
  type CampaignLink,
  type EventKind,
  type Lead,
  type Offer,
  type StoredFile,
  type Subscriber,
  type SubscriberStatus,
  type TrackedEvent,
} from "@/lib/db-types";

// Same statements as db/schema.sql. Each one is safe to run again, so new columns reach old databases.
// Bump SCHEMA_VERSION whenever a statement is added or changed: an up-to-date database skips them all on a cold start.
const SCHEMA_VERSION = 2;
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    email TEXT,
    service TEXT,
    message TEXT,
    placement TEXT NOT NULL,
    page TEXT NOT NULL,
    channel TEXT NOT NULL,
    ft JSONB,
    lt JSONB,
    device TEXT,
    status TEXT NOT NULL DEFAULT 'nou',
    notes TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    demo BOOLEAN NOT NULL DEFAULT false
  )`,
  `ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS assignee TEXT,
    ADD COLUMN IF NOT EXISTS referred_by TEXT,
    ADD COLUMN IF NOT EXISTS monthly_value INTEGER,
    ADD COLUMN IF NOT EXISTS one_off_value INTEGER,
    ADD COLUMN IF NOT EXISTS next_action_at DATE,
    ADD COLUMN IF NOT EXISTS next_action TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS lost_reason TEXT,
    ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS won_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'cerere',
    ADD COLUMN IF NOT EXISTS suspect BOOLEAN NOT NULL DEFAULT false`,
  `CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    kind TEXT NOT NULL,
    placement TEXT,
    page TEXT NOT NULL,
    channel TEXT NOT NULL,
    ft JSONB,
    lt JSONB,
    demo BOOLEAN NOT NULL DEFAULT false
  )`,
  `CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
    at TIMESTAMPTZ NOT NULL DEFAULT now(),
    type TEXT NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    author TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS ad_spend (
    month TEXT NOT NULL,
    channel TEXT NOT NULL,
    amount INTEGER NOT NULL,
    demo BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (month, channel)
  )`,
  `CREATE TABLE IF NOT EXISTS campaign_links (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    label TEXT NOT NULL,
    page TEXT NOT NULL,
    utm_source TEXT NOT NULL,
    utm_medium TEXT NOT NULL,
    utm_campaign TEXT NOT NULL,
    utm_content TEXT NOT NULL DEFAULT '',
    demo BOOLEAN NOT NULL DEFAULT false
  )`,
  `CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    number TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    lead_id INTEGER REFERENCES leads (id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'ciorna',
    doc JSONB NOT NULL,
    sent_at TIMESTAMPTZ,
    first_viewed_at TIMESTAMPTZ,
    view_count INTEGER NOT NULL DEFAULT 0,
    accepted_at TIMESTAMPTZ,
    accepted_name TEXT,
    accepted_comment TEXT,
    demo BOOLEAN NOT NULL DEFAULT false
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    company TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    token TEXT NOT NULL UNIQUE,
    placement TEXT NOT NULL,
    page TEXT NOT NULL,
    channel TEXT NOT NULL,
    ft JSONB,
    lt JSONB,
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    demo BOOLEAN NOT NULL DEFAULT false
  )`,
  `ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS suspect BOOLEAN NOT NULL DEFAULT false`,
  `CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    lead_id INTEGER NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE
  )`,
  `CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at)`,
  `CREATE INDEX IF NOT EXISTS events_created_at_idx ON events (created_at)`,
  `CREATE INDEX IF NOT EXISTS offers_lead_idx ON offers (lead_id)`,
  `CREATE INDEX IF NOT EXISTS activities_lead_idx ON activities (lead_id, at)`,
  `CREATE INDEX IF NOT EXISTS files_lead_idx ON files (lead_id)`,
];

type Row = Record<string, unknown>;

const iso = (value: unknown) => new Date(value as string).toISOString();
const isoOrNull = (value: unknown) => (value ? iso(value) : null);
const json = (touch: Touch | null) => (touch ? JSON.stringify(touch) : null);
const numberOrNull = (value: unknown) => (value === null || value === undefined ? null : Number(value));

// The driver turns DATE columns into a Date at local midnight, so read the local parts back.
function day(value: unknown): string | null {
  if (!value) return null;
  if (!(value instanceof Date)) return String(value).slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function toLead(row: Row): Lead {
  return {
    id: Number(row.id),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    name: row.name as string,
    company: row.company as string | null,
    phone: row.phone as string | null,
    email: row.email as string | null,
    service: row.service as string | null,
    message: row.message as string | null,
    placement: row.placement as string,
    page: row.page as string,
    channel: row.channel as string,
    ft: row.ft as Touch | null,
    lt: row.lt as Touch | null,
    device: (row.device as string) ?? "",
    kind: (row.kind as LeadKind) ?? "cerere",
    suspect: Boolean(row.suspect),
    status: row.status as LeadStatus,
    notes: (row.notes as string) ?? "",
    demo: Boolean(row.demo),
    assignee: (row.assignee as string | null) ?? null,
    referredBy: (row.referred_by as string | null) ?? null,
    monthlyValue: numberOrNull(row.monthly_value),
    oneOffValue: numberOrNull(row.one_off_value),
    nextActionAt: day(row.next_action_at),
    nextAction: (row.next_action as string) ?? "",
    lostReason: (row.lost_reason as string | null) ?? null,
    firstContactAt: isoOrNull(row.first_contact_at),
    wonAt: isoOrNull(row.won_at),
  };
}

function toEvent(row: Row): TrackedEvent {
  return {
    id: Number(row.id),
    createdAt: iso(row.created_at),
    kind: row.kind as EventKind,
    placement: row.placement as string | null,
    page: row.page as string,
    channel: row.channel as string,
    ft: row.ft as Touch | null,
    lt: row.lt as Touch | null,
    demo: Boolean(row.demo),
  };
}

const toActivity = (row: Row): Activity => ({
  id: Number(row.id),
  leadId: Number(row.lead_id),
  at: iso(row.at),
  type: row.type as ActivityType,
  text: row.text as string,
  author: row.author as string,
});

const toLink = (row: Row): CampaignLink => ({
  id: Number(row.id),
  createdAt: iso(row.created_at),
  label: row.label as string,
  page: row.page as string,
  source: row.utm_source as string,
  medium: row.utm_medium as string,
  campaign: row.utm_campaign as string,
  content: row.utm_content as string,
  demo: Boolean(row.demo),
});

const toSubscriber = (row: Row): Subscriber => ({
  id: Number(row.id),
  createdAt: iso(row.created_at),
  email: row.email as string,
  name: (row.name as string | null) ?? null,
  company: (row.company as string | null) ?? null,
  status: row.status as SubscriberStatus,
  token: row.token as string,
  placement: row.placement as string,
  page: row.page as string,
  channel: row.channel as string,
  ft: row.ft as Touch | null,
  lt: row.lt as Touch | null,
  confirmedAt: isoOrNull(row.confirmed_at),
  unsubscribedAt: isoOrNull(row.unsubscribed_at),
  suspect: Boolean(row.suspect),
  demo: Boolean(row.demo),
});

const toFile = (row: Row): StoredFile => ({
  id: Number(row.id),
  createdAt: iso(row.created_at),
  leadId: Number(row.lead_id),
  name: row.name as string,
  size: Number(row.size),
  type: row.type as string,
  key: row.key as string,
});

const toOffer = (row: Row): Offer => ({
  id: Number(row.id),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
  number: row.number as string,
  token: row.token as string,
  leadId: row.lead_id === null ? null : Number(row.lead_id),
  status: row.status as OfferStatus,
  doc: row.doc as OfferDoc,
  sentAt: isoOrNull(row.sent_at),
  firstViewedAt: isoOrNull(row.first_viewed_at),
  viewCount: Number(row.view_count),
  acceptedAt: isoOrNull(row.accepted_at),
  acceptedName: (row.accepted_name as string | null) ?? null,
  acceptedComment: (row.accepted_comment as string | null) ?? null,
  demo: Boolean(row.demo),
});

export function neonBackend(url: string): Backend {
  const sql = neon(url);
  let ready: Promise<void> | null = null;

  async function migrate() {
    const current = await sql`SELECT value FROM settings WHERE key = 'schema_version'`.catch(() => []);
    if (Number(current[0]?.value) === SCHEMA_VERSION) return;
    for (const statement of SCHEMA) await sql(statement);
    await sql`INSERT INTO settings (key, value) VALUES ('schema_version', ${JSON.stringify(SCHEMA_VERSION)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  }

  // A failed connection or migration is not remembered: the next call tries again instead of failing until the instance is recycled.
  const init = () =>
    (ready ??= migrate().catch((error) => {
      ready = null;
      throw error;
    }));

  async function getOffer(id: number) {
    await init();
    const rows = await sql`SELECT * FROM offers WHERE id = ${id}`;
    return rows[0] ? toOffer(rows[0]) : null;
  }

  async function getLead(id: number) {
    await init();
    const rows = await sql`SELECT * FROM leads WHERE id = ${id}`;
    return rows[0] ? toLead(rows[0]) : null;
  }

  return {
    kind: "neon",
    async insertLead(input) {
      await init();
      const l = { ...CRM_DEFAULTS, ...input };
      const rows = await sql`
        INSERT INTO leads (created_at, name, company, phone, email, service, message, placement, page, channel, ft, lt, device, kind, suspect, status, demo,
          notes, assignee, referred_by, monthly_value, one_off_value, next_action_at, next_action, lost_reason, first_contact_at, won_at)
        VALUES (COALESCE(${l.createdAt ?? null}::timestamptz, now()), ${l.name}, ${l.company}, ${l.phone}, ${l.email}, ${l.service}, ${l.message},
          ${l.placement}, ${l.page}, ${l.channel}, ${json(l.ft)}::jsonb, ${json(l.lt)}::jsonb, ${l.device}, ${l.kind ?? "cerere"}, ${l.suspect ?? false}, ${l.status}, ${l.demo ?? false},
          ${l.notes}, ${l.assignee}, ${l.referredBy}, ${l.monthlyValue}, ${l.oneOffValue}, ${l.nextActionAt}::date, ${l.nextAction},
          ${l.lostReason}, ${l.firstContactAt}::timestamptz, ${l.wonAt}::timestamptz)
        RETURNING id`;
      return Number(rows[0].id);
    },
    async insertEvent(e) {
      await init();
      await sql`
        INSERT INTO events (created_at, kind, placement, page, channel, ft, lt, demo)
        VALUES (COALESCE(${e.createdAt ?? null}::timestamptz, now()), ${e.kind}, ${e.placement}, ${e.page}, ${e.channel},
          ${json(e.ft)}::jsonb, ${json(e.lt)}::jsonb, ${e.demo ?? false})`;
    },
    async leadsSince(since) {
      await init();
      const rows = await sql`SELECT * FROM leads WHERE created_at >= ${since.toISOString()} ORDER BY created_at DESC`;
      return rows.map(toLead);
    },
    async eventsSince(since) {
      await init();
      const rows = await sql`SELECT * FROM events WHERE created_at >= ${since.toISOString()} ORDER BY created_at DESC`;
      return rows.map(toEvent);
    },
    getLead,
    // Read, merge, write back: a handful of users editing one lead at a time, so no partial UPDATE builder.
    async updateLead(id, patch) {
      await init();
      const current = await getLead(id);
      if (!current) return;
      const l = { ...current, ...patch };
      await sql`
        UPDATE leads SET name = ${l.name}, company = ${l.company}, phone = ${l.phone}, email = ${l.email}, service = ${l.service},
          message = ${l.message}, status = ${l.status}, notes = ${l.notes}, assignee = ${l.assignee}, referred_by = ${l.referredBy},
          monthly_value = ${l.monthlyValue}, one_off_value = ${l.oneOffValue}, next_action_at = ${l.nextActionAt}::date,
          next_action = ${l.nextAction}, lost_reason = ${l.lostReason}, first_contact_at = ${l.firstContactAt}::timestamptz,
          won_at = ${l.wonAt}::timestamptz, updated_at = now()
        WHERE id = ${id}`;
    },
    async deleteLead(id) {
      await init();
      await sql`DELETE FROM leads WHERE id = ${id}`;
    },
    async activities(leadId) {
      await init();
      const rows = await sql`SELECT * FROM activities WHERE lead_id = ${leadId} ORDER BY at DESC, id DESC`;
      return rows.map(toActivity);
    },
    async insertActivity(a) {
      await init();
      const at = a.at ?? new Date().toISOString();
      await sql`INSERT INTO activities (lead_id, at, type, text, author) VALUES (${a.leadId}, ${at}::timestamptz, ${a.type}, ${a.text}, ${a.author})`;
    },
    async markContacted(leadId, at) {
      await init();
      await sql`UPDATE leads SET first_contact_at = ${at}::timestamptz WHERE id = ${leadId} AND (first_contact_at IS NULL OR first_contact_at > ${at}::timestamptz)`;
    },
    async moveActivities(fromLeadId, toLeadId) {
      await init();
      await sql`UPDATE activities SET lead_id = ${toLeadId} WHERE lead_id = ${fromLeadId}`;
    },
    async moveFiles(fromLeadId, toLeadId) {
      await init();
      await sql`UPDATE files SET lead_id = ${toLeadId} WHERE lead_id = ${fromLeadId}`;
    },
    async moveOffers(fromLeadId, toLeadId) {
      await init();
      await sql`UPDATE offers SET lead_id = ${toLeadId} WHERE lead_id = ${fromLeadId}`;
    },
    async spend() {
      await init();
      const rows = await sql`SELECT * FROM ad_spend ORDER BY month DESC, channel`;
      return rows.map((r) => ({ month: r.month as string, channel: r.channel as string, amount: Number(r.amount), demo: Boolean(r.demo) }));
    },
    async setSpend(month, channel, amount, demo = false) {
      await init();
      if (amount > 0) {
        await sql`INSERT INTO ad_spend (month, channel, amount, demo) VALUES (${month}, ${channel}, ${amount}, ${demo})
          ON CONFLICT (month, channel) DO UPDATE SET amount = EXCLUDED.amount, demo = EXCLUDED.demo`;
      } else {
        await sql`DELETE FROM ad_spend WHERE month = ${month} AND channel = ${channel}`;
      }
    },
    async links() {
      await init();
      const rows = await sql`SELECT * FROM campaign_links ORDER BY created_at DESC`;
      return rows.map(toLink);
    },
    async insertLink(link) {
      await init();
      const rows = await sql`
        INSERT INTO campaign_links (created_at, label, page, utm_source, utm_medium, utm_campaign, utm_content, demo)
        VALUES (COALESCE(${link.createdAt ?? null}::timestamptz, now()), ${link.label}, ${link.page}, ${link.source}, ${link.medium},
          ${link.campaign}, ${link.content}, ${link.demo ?? false})
        RETURNING id`;
      return Number(rows[0].id);
    },
    async deleteLink(id) {
      await init();
      await sql`DELETE FROM campaign_links WHERE id = ${id}`;
    },
    async offers() {
      await init();
      const rows = await sql`SELECT * FROM offers ORDER BY created_at DESC`;
      return rows.map(toOffer);
    },
    getOffer,
    async offerByToken(token) {
      await init();
      const rows = await sql`SELECT * FROM offers WHERE token = ${token}`;
      return rows[0] ? toOffer(rows[0]) : null;
    },
    async insertOffer(o) {
      await init();
      const rows = await sql`
        INSERT INTO offers (created_at, number, token, lead_id, status, doc, sent_at, first_viewed_at, view_count, accepted_at, accepted_name, accepted_comment, demo)
        VALUES (COALESCE(${o.createdAt ?? null}::timestamptz, now()), ${o.number}, ${o.token}, ${o.leadId}, ${o.status}, ${JSON.stringify(o.doc)}::jsonb,
          ${o.sentAt}::timestamptz, ${o.firstViewedAt}::timestamptz, ${o.viewCount}, ${o.acceptedAt}::timestamptz, ${o.acceptedName}, ${o.acceptedComment}, ${o.demo ?? false})
        RETURNING id`;
      return Number(rows[0].id);
    },
    async updateOffer(id, patch) {
      await init();
      const current = await getOffer(id);
      if (!current) return;
      const o = { ...current, ...patch };
      await sql`
        UPDATE offers SET lead_id = ${o.leadId}, status = ${o.status}, doc = ${JSON.stringify(o.doc)}::jsonb, sent_at = ${o.sentAt}::timestamptz,
          first_viewed_at = ${o.firstViewedAt}::timestamptz, view_count = ${o.viewCount}, accepted_at = ${o.acceptedAt}::timestamptz,
          accepted_name = ${o.acceptedName}, accepted_comment = ${o.acceptedComment}, updated_at = now()
        WHERE id = ${id}`;
    },
    async deleteOffer(id) {
      await init();
      await sql`DELETE FROM offers WHERE id = ${id}`;
    },
    async subscribers() {
      await init();
      const rows = await sql`SELECT * FROM subscribers ORDER BY created_at DESC`;
      return rows.map(toSubscriber);
    },
    async subscriberByEmail(email) {
      await init();
      const rows = await sql`SELECT * FROM subscribers WHERE email = ${email}`;
      return rows[0] ? toSubscriber(rows[0]) : null;
    },
    async subscriberByToken(token) {
      await init();
      const rows = await sql`SELECT * FROM subscribers WHERE token = ${token}`;
      return rows[0] ? toSubscriber(rows[0]) : null;
    },
    async insertSubscriber(s) {
      await init();
      const rows = await sql`
        INSERT INTO subscribers (created_at, email, name, company, status, token, placement, page, channel, ft, lt, confirmed_at, unsubscribed_at, suspect, demo)
        VALUES (COALESCE(${s.createdAt ?? null}::timestamptz, now()), ${s.email}, ${s.name}, ${s.company}, ${s.status}, ${s.token}, ${s.placement}, ${s.page},
          ${s.channel}, ${json(s.ft)}::jsonb, ${json(s.lt)}::jsonb, ${s.confirmedAt}::timestamptz, ${s.unsubscribedAt}::timestamptz, ${s.suspect ?? false}, ${s.demo ?? false})
        RETURNING id`;
      return Number(rows[0].id);
    },
    async updateSubscriber(id, patch) {
      await init();
      const rows = await sql`SELECT * FROM subscribers WHERE id = ${id}`;
      if (!rows[0]) return;
      const s = { ...toSubscriber(rows[0]), ...patch };
      await sql`
        UPDATE subscribers SET name = ${s.name}, company = ${s.company}, status = ${s.status}, token = ${s.token},
          confirmed_at = ${s.confirmedAt}::timestamptz, unsubscribed_at = ${s.unsubscribedAt}::timestamptz
        WHERE id = ${id}`;
    },
    async deleteSubscriber(id) {
      await init();
      await sql`DELETE FROM subscribers WHERE id = ${id}`;
    },
    async files(leadId) {
      await init();
      const rows = await sql`SELECT * FROM files WHERE lead_id = ${leadId} ORDER BY created_at, id`;
      return rows.map(toFile);
    },
    async demoFiles() {
      await init();
      const rows = await sql`SELECT files.* FROM files JOIN leads ON leads.id = files.lead_id WHERE leads.demo`;
      return rows.map(toFile);
    },
    async getFile(id) {
      await init();
      const rows = await sql`SELECT * FROM files WHERE id = ${id}`;
      return rows[0] ? toFile(rows[0]) : null;
    },
    async insertFile(f) {
      await init();
      const rows = await sql`
        INSERT INTO files (created_at, lead_id, name, size, type, key)
        VALUES (COALESCE(${f.createdAt ?? null}::timestamptz, now()), ${f.leadId}, ${f.name}, ${f.size}, ${f.type}, ${f.key})
        RETURNING id`;
      return Number(rows[0].id);
    },
    async deleteFile(id) {
      await init();
      await sql`DELETE FROM files WHERE id = ${id}`;
    },
    async getSetting(key) {
      await init();
      const rows = await sql`SELECT value FROM settings WHERE key = ${key}`;
      return rows[0]?.value ?? null;
    },
    async setSetting(key, value) {
      await init();
      await sql`INSERT INTO settings (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    },
    async deleteDemo() {
      await init();
      await sql`DELETE FROM leads WHERE demo`;
      await sql`DELETE FROM events WHERE demo`;
      await sql`DELETE FROM ad_spend WHERE demo`;
      await sql`DELETE FROM campaign_links WHERE demo`;
      await sql`DELETE FROM offers WHERE demo`;
      await sql`DELETE FROM subscribers WHERE demo`;
    },
  };
}
