# daiamar.ro

Site Daiamar (contabilitate, Oradea). Next.js 15 (App Router, TypeScript), Neon Postgres for leads, deployed on Vercel.
Deploy steps: [DEPLOY.md](./DEPLOY.md).

## Run locally

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD and ADMIN_SECRET to use /admin/
npm run dev                  # http://localhost:3000
npm run seed                 # optional: demo CRM data in /admin/ (replaces earlier demo data)
```

Without `DATABASE_URL`, leads and events go to `.data/db.json` (git-ignored). With it, they go to Neon.
`npm run check:channels` runs the channel classification cases.

## What's where

| Path | What |
|---|---|
| `src/lib/site.ts` | Company data (address, phones, WhatsApp, email, legal name/CUI, Google review links, optional `ceccarNo`), services, nav. Every page reads contact data from here. |
| `src/lib/images.ts` | Every photo on the site (key → file + alt) and the logo file. See "Înlocuire fotografii". |
| `src/components/Logo.tsx` | The only component that renders the logo. |
| `src/app/(site)/` | Public pages. Each page keeps its copy in a typed const at the top or in `content.ts` next to it. |
| `src/app/(site)/servicii/` | Services hub, one dynamic route for every service page (`[slug]/`) and all their copy in `content.ts`. |
| `src/app/(site)/_shared/` | Shared page templates: ad landings (`Landing.tsx`), the EN/IT page (`LanguagePage.tsx`), legal page styles. |
| `src/lib/schema.ts` | JSON-LD for the firm (`businessSchema`) and breadcrumbs. FAQ JSON-LD comes from `faqSchema()` in `ui/Faq.tsx`. |
| `src/lib/lead.ts` | Form validation, used by both `LeadForm` and `/api/leads`. |
| `src/components/LeadForm.tsx` | The request form. `<LeadForm placement="..." service="slug" />`; `variant="callback"` is the short "Vă sunăm noi" form (name + phone). After success every form redirects to `/multumim/?tip=cerere|apel|newsletter|documente`, which fires `generate_lead`. |
| `src/components/NewsletterForm.tsx`, `src/lib/newsletter.ts` | "Noutăți fiscale" signup (double opt-in, Resend). Placed on `/resurse/` and in the footer only. |
| `src/components/UploadForm.tsx`, `src/lib/storage.ts`, `src/lib/upload*.ts` | Document upload at `/trimite-documente/`. With `BLOB_READ_WRITE_TOKEN` the browser uploads each file straight to the private Blob store (token from `/api/documente/upload/`, which checks type, size, count and rate), then `/api/documente/` checks the first bytes of every stored file (deletes them all if one is wrong) and files them. Without the token: one multipart request to `/api/documente/`, files in `.data/uploads/`. Every upload creates a new lead (kind Documente); a matching phone/email only shows it as "Posibil duplicat", to merge by hand. |
| `src/components/MapEmbed.tsx`, `GoogleReviews.tsx`, `ContactBars.tsx` | OpenStreetMap embed with Google Maps / Waze links, the "Recenzii Google" block, the floating WhatsApp button and the mobile call bar. |
| `src/components/TrackedLink.tsx` | Phone/email/WhatsApp/maps/review links. Clicks are counted per channel in admin ("Panou"). |
| `src/components/Analytics.tsx` | Captures where a visitor came from (in memory; cookies `dm_ft`, `dm_lt` only after "Accept"), counts the visit anonymously, and injects GTM (`NEXT_PUBLIC_GTM_ID`) only after the visitor accepts statistics. |
| `src/components/ConsentBanner.tsx` | Cookie banner, Google Consent Mode v2. `CookieSettingsButton` reopens it. |
| `src/lib/attribution.ts` | Reads UTM / click IDs / referrer in the browser. Keeps first and last touch in a module-level store (survives client-side navigation, sent with every form); writes them to cookies only with consent. |
| `src/lib/form-token.ts`, `/api/form-token/` | Signed "form shown at" token (FORM_SECRET or ADMIN_SECRET). A form sent faster than 3 s (2 s for the newsletter) or without a valid token is stored with `suspect` = true: shown in admin with a filter, left out of reports, no redirect to `/multumim/`, no conversion. The honeypot field is still a silent drop. |
| `src/lib/channel.ts` | Turns a touch into a channel (Google Ads, Flyer ONRC, Direct...). Edit the rules here. |
| `src/lib/db.ts`, `db/schema.sql` | Storage: `db.ts` picks Neon (`db-neon.ts`) or the local JSON file (`db-file.ts`); shapes in `db-types.ts`. Tables and new columns are created on first use. |
| `src/lib/crm.ts`, `leads.ts`, `settings.ts`, `weekly.ts` | CRM rules: statuses, lost reasons, manual sources, ad channels, duplicate check, merge, notification addresses, weekly summary. |
| `src/lib/offers.ts`, `offer-store.ts`, `offer-pdf/` | Offers: totals and VAT, templates, numbering, online view/accept, the PDF (react-pdf, Inter Tight with latin-ext, OFL licence in `fonts/`). |
| `src/lib/qr.ts` | QR code encoder (no dependency), used by "Linkuri de campanie". |
| `src/app/api/leads`, `api/events`, `api/newsletter`, `api/documente` | Public endpoints: forms (incl. callback), click/visit beacons, newsletter signup, document upload. Shared rate limit + helpers in `api/request.ts`. |
| `src/app/api/admin/files/[id]` | Streams an uploaded document to a logged-in admin. Files never have public URLs. |
| `src/app/admin/` | Admin CRM. `src/middleware.ts` guards it, and every page, server action and `/api/admin/*` handler checks the session again. Login posts to `/api/login/`: 5 wrong passwords per IP in 15 min → 429 (counted in memory, per instance), every attempt waits 400 ms. See "Admin" below. |
| `src/app/oferta/[token]/` | Public online offer (noindex, unguessable token): view tracking, PDF, "Accept oferta". |
| `src/app/api/cron/weekly/` | Weekly summary email, called by Vercel Cron (`vercel.json`). |
| `scripts/seed.mts` | Demo data. |

## Admin

| Page | What |
|---|---|
| `/admin/` Azi | Overdue and today's follow-ups, new leads not contacted for 24 h. The number next to "Azi" in the menu counts them. |
| `/admin/leads/` | All leads with filters (status, channel, service, assignee, period), duplicate flag, CSV and Excel export (`;` + BOM). |
| `/admin/leads/nou/` | Add a lead from the phone, a referral, a walk-in or an event. The source becomes the lead's channel in reports. |
| `/admin/leads/<id>/` | Timeline, quick Sună / WhatsApp / Email (each logged), status (a lost lead needs a reason), next step, value, duplicates + merge, offers, uploaded documents (download + delete). Leads from the callback form carry the tag "Sună înapoi", uploads without an existing lead the tag "Documente". |
| `/admin/pipeline/` | Kanban: drag cards, or pick the status on the card on a phone. |
| `/admin/oferte/` | Offers: builder with templates, PDF, send by email (Resend) or WhatsApp, online link with accept. Accepting moves the lead to Client with the offer's values. |
| `/admin/abonati/` | Newsletter subscribers: status (de confirmat / confirmat / dezabonat), channel, manual confirm (when Resend is missing), unsubscribe, delete (GDPR), CSV/Excel export. The site only collects addresses; sending is done later from Resend Broadcasts or another tool, using the export. |
| `/admin/panou/` | Channels, value in progress and won, ad spend ROI, funnel and time to first contact, lost reasons, offers. |
| `/admin/linkuri/` | UTM links + QR (PNG/SVG) for print and ads, with visits and leads per saved link. |
| `/admin/buget/` | Monthly ad spend per channel and the ROI table. |
| `/admin/setari/` | Notification emails, team names, weekly summary test, offer texts and company data, templates, password instructions, database status, demo data. |

There are no user accounts: one password for everyone. Each device picks its name ("Lucrezi ca") so notes show who wrote them.
Offer templates and texts start without prices or terms: those come from Daiamar, never invent them.

## Add a service page

1. Add the service to `services` in `src/lib/site.ts` (`slug`, `title`, `short`, `group`). It then appears in the hub, the form's service list, the footer, the sitemap and admin.
2. Add its copy under the same slug in `content` in `src/app/(site)/servicii/content.ts`. The page at `/servicii/<slug>/` is generated from it, with its form, FAQ and JSON-LD.
3. Lines still waiting for the client go in as `todo("...")`; they render with a "de cerut de la client" badge.

## Înlocuire fotografii

Photos come from the Daiamar office shoot (`public/img/foto/`, `echipa/`, `ghiduri/`) and every page takes them from `src/lib/images.ts`. To swap one, change `src` + `alt` for its key and keep roughly the same aspect ratio (hero 4:5, cards 16:10, covers 16:9); then check the pages at 1440 and 390. Raw files and the Higgsfield originals are in `_ref/`, which is not in the zip.

Logo: `LOGO` in `src/lib/images.ts` points to `public/img/daiamar-logo.svg`, and `Logo.tsx` is the only component that renders it. The offer PDF (`src/lib/offer-pdf/OfferPdf.tsx`) still uses the legacy PNG.

## Cookies set by the site

| Cookie | Type | Duration | Purpose |
|---|---|---|---|
| `dm_consent` | necessary | 180 days | The visitor's cookie choice: `all` ("Accept"), `functional`, `analytics`, `none` ("Refuz"). |
| `dm_ft` | functional, first-party, **only with consent** | 90 days | First visit source (UTM, click ID, referrer, landing page). Never overwritten. Written only after "Accept" (or "Funcționale" in Setări). |
| `dm_lt` | functional, first-party, **only with consent** | session | Source of the current visit. Updated only when a visit brings new UTM/click IDs or comes from another site. |
| `dm_admin` | necessary, httpOnly | 14 days | Admin session, only for `/admin/`. |
| `dm_author` | necessary, httpOnly | 365 days | The team member's name on this device ("Lucrezi ca"), read by the admin only. |
| `_ga`, `_ga_*` (GA4 via GTM) | analytics | per Google | GTM is not even requested before the visitor accepts statistics. Consent Mode v2 defaults (all denied) are still set. |

No advertising cookies (Google Ads, Meta) are set. If a tag that sets them is added in GTM, update the banner (`ConsentBanner.tsx`), `/cookies/`, `/confidentialitate/` and this table first.
Before consent (and after "Refuz") nothing but `dm_consent` is written: first and last touch live only in memory for the open page and are still sent with a form submission, so the lead keeps its source. "Refuz" also deletes `dm_ft`/`dm_lt` left from an earlier "Accept". Visits are counted anonymously: one `/api/events/` row (channel, landing page) with no cookie and no identifier; without the cookie a full reload may count again, and bot user agents are not counted.
`dm_ft` and `dm_lt` hold no personal data and are not shared with third parties. They are attached to a request only when the visitor sends a form, subscribes, or taps a phone/WhatsApp/email/map link. The OpenStreetMap embed and the WhatsApp button set no cookies; loading the map sends the visitor's IP to the OpenStreetMap Foundation (documented on `/cookies/`).
