import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { CRM_DEFAULTS, type Activity, type Backend, type CampaignLink, type Lead, type Offer, type Spend, type StoredFile, type Subscriber, type TrackedEvent } from "@/lib/db-types";

type FileData = {
  nextId: number;
  leads: Lead[];
  events: TrackedEvent[];
  activities: Activity[];
  spend: Spend[];
  links: CampaignLink[];
  offers: Offer[];
  subscribers: Subscriber[];
  files: StoredFile[];
  settings: Record<string, unknown>;
};

// Files written before the CRM fields existed are filled in on read, like the ALTER TABLEs do on Neon.
function normalize(raw: Partial<FileData>): FileData {
  return {
    nextId: raw.nextId ?? 1,
    leads: (raw.leads ?? []).map((lead) => ({ ...CRM_DEFAULTS, ...lead, kind: lead.kind ?? "cerere", suspect: lead.suspect ?? false })),
    events: raw.events ?? [],
    activities: raw.activities ?? [],
    spend: raw.spend ?? [],
    links: raw.links ?? [],
    offers: raw.offers ?? [],
    subscribers: (raw.subscribers ?? []).map((s) => ({ ...s, suspect: s.suspect ?? false })),
    files: raw.files ?? [],
    settings: raw.settings ?? {},
  };
}

const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

type Io = { load(): Promise<FileData>; save(data: FileData): Promise<void> };

// Local development only: Vercel's filesystem is read-only, so production needs DATABASE_URL.
export function fileBackend(): Backend {
  const file = path.join(process.cwd(), ".data", "db.json");

  // A missing file is an empty database. A file that does not parse is an error: treating it as empty would let the next
  // write replace every lead with almost nothing.
  async function load(): Promise<FileData> {
    let raw: string;
    try {
      raw = await readFile(file, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return normalize({});
      throw error;
    }
    return normalize(JSON.parse(raw) as Partial<FileData>);
  }

  async function save(data: FileData) {
    await mkdir(path.dirname(file), { recursive: true });
    // Write a temp file and rename it, so a reader in another process never sees half a file.
    const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temp, JSON.stringify(data, null, 1));
    await rename(temp, file);
  }

  return build("file", { load, save });
}

/** Same behaviour as the file backend, but the data lives in memory only (used by the demo mode). */
export function memoryBackend(): Backend {
  let data = normalize({});
  return build("file", { load: async () => structuredClone(data), save: async (next) => void (data = next) });
}

function build(kind: Backend["kind"], { load, save }: Io): Backend {
  let queue: Promise<unknown> = Promise.resolve();

  function mutate<T>(change: (data: FileData) => T): Promise<T> {
    const next = queue.then(async () => {
      const data = await load();
      const result = change(data);
      await save(data);
      return result;
    });
    queue = next.catch(() => undefined);
    return next;
  }

  return {
    kind,
    insertLead: ({ createdAt, ...input }) =>
      mutate((data) => {
        const now = new Date().toISOString();
        const id = data.nextId++;
        data.leads.push({ ...CRM_DEFAULTS, demo: false, kind: "cerere", suspect: false, ...input, id, createdAt: createdAt ?? now, updatedAt: now });
        return id;
      }),
    insertEvent: ({ createdAt, ...e }) =>
      mutate((data) => {
        data.events.push({ demo: false, ...e, id: data.nextId++, createdAt: createdAt ?? new Date().toISOString() });
      }),
    leadsSince: async (since) => (await load()).leads.filter((l) => new Date(l.createdAt) >= since).sort(byNewest),
    eventsSince: async (since) => (await load()).events.filter((e) => new Date(e.createdAt) >= since).sort(byNewest),
    getLead: async (id) => (await load()).leads.find((l) => l.id === id) ?? null,
    updateLead: (id, patch) =>
      mutate((data) => {
        const lead = data.leads.find((l) => l.id === id);
        if (lead) Object.assign(lead, patch, { updatedAt: new Date().toISOString() });
      }),
    deleteLead: (id) =>
      mutate((data) => {
        data.leads = data.leads.filter((l) => l.id !== id);
        for (const offer of data.offers) if (offer.leadId === id) offer.leadId = null;
        data.activities = data.activities.filter((a) => a.leadId !== id);
        data.files = data.files.filter((f) => f.leadId !== id);
      }),
    activities: async (leadId) =>
      (await load()).activities.filter((a) => a.leadId === leadId).sort((a, b) => b.at.localeCompare(a.at) || b.id - a.id),
    insertActivity: (input) =>
      mutate((data) => {
        const at = input.at ?? new Date().toISOString();
        data.activities.push({ ...input, at, id: data.nextId++ });
      }),
    markContacted: (leadId, at) =>
      mutate((data) => {
        const lead = data.leads.find((l) => l.id === leadId);
        if (lead && (!lead.firstContactAt || lead.firstContactAt > at)) lead.firstContactAt = at;
      }),
    moveActivities: (fromLeadId, toLeadId) =>
      mutate((data) => {
        for (const activity of data.activities) if (activity.leadId === fromLeadId) activity.leadId = toLeadId;
      }),
    moveFiles: (fromLeadId, toLeadId) =>
      mutate((data) => {
        for (const file of data.files) if (file.leadId === fromLeadId) file.leadId = toLeadId;
      }),
    moveOffers: (fromLeadId, toLeadId) =>
      mutate((data) => {
        for (const offer of data.offers) if (offer.leadId === fromLeadId) offer.leadId = toLeadId;
      }),
    spend: async () => (await load()).spend.sort((a, b) => b.month.localeCompare(a.month) || a.channel.localeCompare(b.channel)),
    setSpend: (month, channel, amount, demo = false) =>
      mutate((data) => {
        data.spend = data.spend.filter((s) => !(s.month === month && s.channel === channel));
        if (amount > 0) data.spend.push({ month, channel, amount, demo });
      }),
    links: async () => (await load()).links.sort(byNewest),
    insertLink: ({ createdAt, ...link }) =>
      mutate((data) => {
        const id = data.nextId++;
        data.links.push({ demo: false, ...link, id, createdAt: createdAt ?? new Date().toISOString() });
        return id;
      }),
    deleteLink: (id) =>
      mutate((data) => {
        data.links = data.links.filter((l) => l.id !== id);
      }),
    offers: async () => (await load()).offers.sort(byNewest),
    getOffer: async (id) => (await load()).offers.find((o) => o.id === id) ?? null,
    offerByToken: async (token) => (await load()).offers.find((o) => o.token === token) ?? null,
    insertOffer: ({ createdAt, ...offer }) =>
      mutate((data) => {
        const id = data.nextId++;
        const now = new Date().toISOString();
        data.offers.push({ demo: false, ...offer, id, createdAt: createdAt ?? now, updatedAt: now });
        return id;
      }),
    updateOffer: (id, patch) =>
      mutate((data) => {
        const offer = data.offers.find((o) => o.id === id);
        if (offer) Object.assign(offer, patch, { updatedAt: new Date().toISOString() });
      }),
    deleteOffer: (id) =>
      mutate((data) => {
        data.offers = data.offers.filter((o) => o.id !== id);
      }),
    subscribers: async () => (await load()).subscribers.sort(byNewest),
    subscriberByEmail: async (email) => (await load()).subscribers.find((s) => s.email === email) ?? null,
    subscriberByToken: async (token) => (await load()).subscribers.find((s) => s.token === token) ?? null,
    insertSubscriber: ({ createdAt, ...subscriber }) =>
      mutate((data) => {
        const id = data.nextId++;
        data.subscribers.push({ demo: false, suspect: false, ...subscriber, id, createdAt: createdAt ?? new Date().toISOString() });
        return id;
      }),
    updateSubscriber: (id, patch) =>
      mutate((data) => {
        const subscriber = data.subscribers.find((s) => s.id === id);
        if (subscriber) Object.assign(subscriber, patch);
      }),
    deleteSubscriber: (id) =>
      mutate((data) => {
        data.subscribers = data.subscribers.filter((s) => s.id !== id);
      }),
    files: async (leadId) => (await load()).files.filter((f) => f.leadId === leadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id),
    demoFiles: async () => {
      const data = await load();
      const demoIds = new Set(data.leads.filter((l) => l.demo).map((l) => l.id));
      return data.files.filter((f) => demoIds.has(f.leadId));
    },
    getFile: async (id) => (await load()).files.find((f) => f.id === id) ?? null,
    insertFile: ({ createdAt, ...file }) =>
      mutate((data) => {
        const id = data.nextId++;
        data.files.push({ ...file, id, createdAt: createdAt ?? new Date().toISOString() });
        return id;
      }),
    deleteFile: (id) =>
      mutate((data) => {
        data.files = data.files.filter((f) => f.id !== id);
      }),
    getSetting: async (key) => (await load()).settings[key] ?? null,
    setSetting: (key, value) =>
      mutate((data) => {
        data.settings[key] = value;
      }),
    deleteDemo: () =>
      mutate((data) => {
        const demoIds = new Set(data.leads.filter((l) => l.demo).map((l) => l.id));
        data.leads = data.leads.filter((l) => !l.demo);
        data.activities = data.activities.filter((a) => !demoIds.has(a.leadId));
        data.events = data.events.filter((e) => !e.demo);
        data.spend = data.spend.filter((s) => !s.demo);
        data.links = data.links.filter((l) => !l.demo);
        data.offers = data.offers.filter((o) => !o.demo);
        data.subscribers = data.subscribers.filter((s) => !s.demo);
        data.files = data.files.filter((f) => !demoIds.has(f.leadId));
        for (const offer of data.offers) if (offer.leadId !== null && demoIds.has(offer.leadId)) offer.leadId = null;
      }),
  };
}
