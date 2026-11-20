-- The app runs these statements itself on first use (src/lib/db-neon.ts, SCHEMA).
-- Keep both in sync and bump SCHEMA_VERSION there after a change. Every statement is idempotent, so new columns reach existing databases.
-- Run this file by hand only to inspect or recreate the tables.

CREATE TABLE IF NOT EXISTS leads (
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
);

ALTER TABLE leads
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
  ADD COLUMN IF NOT EXISTS suspect BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  kind TEXT NOT NULL,
  placement TEXT,
  page TEXT NOT NULL,
  channel TEXT NOT NULL,
  ft JSONB,
  lt JSONB,
  demo BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS ad_spend (
  month TEXT NOT NULL,
  channel TEXT NOT NULL,
  amount INTEGER NOT NULL,
  demo BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (month, channel)
);

CREATE TABLE IF NOT EXISTS campaign_links (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  label TEXT NOT NULL,
  page TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  utm_content TEXT NOT NULL DEFAULT '',
  demo BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS offers (
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
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
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
);

ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS suspect BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_id INTEGER NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at);

CREATE INDEX IF NOT EXISTS events_created_at_idx ON events (created_at);

CREATE INDEX IF NOT EXISTS offers_lead_idx ON offers (lead_id);

CREATE INDEX IF NOT EXISTS activities_lead_idx ON activities (lead_id, at);

CREATE INDEX IF NOT EXISTS files_lead_idx ON files (lead_id);
