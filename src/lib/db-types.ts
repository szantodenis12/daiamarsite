import type { Touch } from "@/lib/attribution";
import type { ActivityType, LeadKind, LeadStatus } from "@/lib/crm";
import type { OfferDoc, OfferStatus } from "@/lib/offers";

export const EVENT_KINDS = ["visit", "phone", "email", "whatsapp", "maps", "review"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

/** Everything the sales team edits on a lead after it arrives. */
export type LeadCrm = {
  status: LeadStatus;
  notes: string;
  assignee: string | null;
  referredBy: string | null;
  monthlyValue: number | null;
  oneOffValue: number | null;
  nextActionAt: string | null;
  nextAction: string;
  lostReason: string | null;
  firstContactAt: string | null;
  wonAt: string | null;
};

export type LeadInput = {
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  service: string | null;
  message: string | null;
  placement: string;
  page: string;
  channel: string;
  ft: Touch | null;
  lt: Touch | null;
  device: string;
  kind?: LeadKind;
  /** Sent faster than a person fills the form (or without a valid form token). Kept, but left out of reports. */
  suspect?: boolean;
  createdAt?: string;
  demo?: boolean;
} & Partial<LeadCrm>;

export type Lead = Required<Omit<LeadInput, "createdAt">> & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type LeadPatch = Partial<LeadCrm & Pick<Lead, "name" | "company" | "phone" | "email" | "service" | "message">>;

export type EventInput = {
  kind: EventKind;
  placement: string | null;
  page: string;
  channel: string;
  ft: Touch | null;
  lt: Touch | null;
  createdAt?: string;
  demo?: boolean;
};

export type TrackedEvent = Required<Omit<EventInput, "createdAt">> & { id: number; createdAt: string };

export type ActivityInput = { leadId: number; type: ActivityType; text: string; author: string; at?: string };
export type Activity = Required<ActivityInput> & { id: number };

export type Spend = { month: string; channel: string; amount: number; demo: boolean };

export type CampaignLinkInput = {
  label: string;
  page: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  createdAt?: string;
  demo?: boolean;
};
export type CampaignLink = Required<CampaignLinkInput> & { id: number };

export type OfferInput = {
  number: string;
  token: string;
  leadId: number | null;
  status: OfferStatus;
  doc: OfferDoc;
  sentAt: string | null;
  firstViewedAt: string | null;
  viewCount: number;
  acceptedAt: string | null;
  acceptedName: string | null;
  acceptedComment: string | null;
  createdAt?: string;
  demo?: boolean;
};
export type Offer = Required<Omit<OfferInput, "createdAt">> & { id: number; createdAt: string; updatedAt: string };
export type OfferPatch = Partial<Omit<OfferInput, "number" | "token" | "createdAt" | "demo">>;

export const SUBSCRIBER_STATUSES = ["pending", "confirmed", "unsubscribed"] as const;
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];

export type SubscriberInput = {
  email: string;
  name: string | null;
  company: string | null;
  status: SubscriberStatus;
  token: string;
  placement: string;
  page: string;
  channel: string;
  ft: Touch | null;
  lt: Touch | null;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  suspect?: boolean;
  createdAt?: string;
  demo?: boolean;
};
export type Subscriber = Required<Omit<SubscriberInput, "createdAt">> & { id: number; createdAt: string };
export type SubscriberPatch = Partial<Pick<Subscriber, "status" | "token" | "confirmedAt" | "unsubscribedAt" | "name" | "company">>;

/** A document uploaded by a visitor. `key` is the storage path (Vercel Blob pathname or the local file name), never a public URL. */
export type StoredFileInput = {
  leadId: number;
  name: string;
  size: number;
  type: string;
  key: string;
  createdAt?: string;
};
export type StoredFile = Required<StoredFileInput> & { id: number };

export type Backend = {
  kind: "neon" | "file" | "demo";
  insertLead(lead: LeadInput): Promise<number>;
  insertEvent(event: EventInput): Promise<void>;
  leadsSince(since: Date): Promise<Lead[]>;
  eventsSince(since: Date): Promise<TrackedEvent[]>;
  getLead(id: number): Promise<Lead | null>;
  updateLead(id: number, patch: LeadPatch): Promise<void>;
  deleteLead(id: number): Promise<void>;
  activities(leadId: number): Promise<Activity[]>;
  insertActivity(activity: ActivityInput): Promise<void>;
  /** Sets first_contact_at to `at` unless an earlier contact is already recorded. */
  markContacted(leadId: number, at: string): Promise<void>;
  moveActivities(fromLeadId: number, toLeadId: number): Promise<void>;
  moveFiles(fromLeadId: number, toLeadId: number): Promise<void>;
  moveOffers(fromLeadId: number, toLeadId: number): Promise<void>;
  spend(): Promise<Spend[]>;
  setSpend(month: string, channel: string, amount: number, demo?: boolean): Promise<void>;
  links(): Promise<CampaignLink[]>;
  insertLink(link: CampaignLinkInput): Promise<number>;
  deleteLink(id: number): Promise<void>;
  offers(): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | null>;
  offerByToken(token: string): Promise<Offer | null>;
  insertOffer(offer: OfferInput): Promise<number>;
  updateOffer(id: number, patch: OfferPatch): Promise<void>;
  deleteOffer(id: number): Promise<void>;
  subscribers(): Promise<Subscriber[]>;
  subscriberByEmail(email: string): Promise<Subscriber | null>;
  subscriberByToken(token: string): Promise<Subscriber | null>;
  insertSubscriber(subscriber: SubscriberInput): Promise<number>;
  updateSubscriber(id: number, patch: SubscriberPatch): Promise<void>;
  deleteSubscriber(id: number): Promise<void>;
  files(leadId: number): Promise<StoredFile[]>;
  demoFiles(): Promise<StoredFile[]>;
  getFile(id: number): Promise<StoredFile | null>;
  insertFile(file: StoredFileInput): Promise<number>;
  deleteFile(id: number): Promise<void>;
  getSetting(key: string): Promise<unknown>;
  setSetting(key: string, value: unknown): Promise<void>;
  deleteDemo(): Promise<void>;
};

export const CRM_DEFAULTS: LeadCrm = {
  status: "nou",
  notes: "",
  assignee: null,
  referredBy: null,
  monthlyValue: null,
  oneOffValue: null,
  nextActionAt: null,
  nextAction: "",
  lostReason: null,
  firstContactAt: null,
  wonAt: null,
};
