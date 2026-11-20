# Daiamar: new website, shared team brief

Internal working doc in English. ALL site copy is Romanian, except /en/ and /it/.

## UPDATE 12.11.2026 (overrides the older rules below where they conflict)
- **Copy:** Roland approved rewriting the live-site text (12.11). Rule 1 "keep the current text" no longer applies. Unbacked superlatives ("de top", "cei mai buni") are removed. The "top firme" claim on /despre/ stays, with its TODO, until the client names the source.
- **No repeated content:** each fact lives on one page and the other pages link to it. Questions are not repeated across pages. Working with firms outside Bihor is explained only on /clienti-din-toata-tara/. Check with a duplicate-sentence scan before shipping.
- **20+ ani ANAF = Monica Diana Pop** (the owner). It is important: keep it in the hero, the chip and the stat, and on other pages name her and word it differently each time. Never repeat the same sentence.
- **Photos:** stock is gone. Everything is a real Daiamar shoot (`public/img/foto/`, `public/img/echipa/`, `public/img/ghiduri/`), registered in `src/lib/images.ts`. Some are retouched with Higgsfield and await Monica's approval. The homepage hero is a video (`HeroVideo.tsx`, `public/video/`).
- **Echipa:** 7 real people (names, roles and languages confirmed by Monica). No text notes on the cards; languages show as flags (`LanguageFlags.tsx`).
- **Design:** no kicker/eyebrow pills (all `.tag` were removed, do not add them back). Wide layout (`--wrap: 1680px`). Coloured bands are rounded inset `.block`s, never gradient fades. New vector logo `public/img/daiamar-logo.svg`; the offer PDF still uses the PNG. No grey top bar in the header.
- **Program:** Luni - vineri, 08:00 - 16:00 (`company.hours`), shown on Contact, in the footer and in the JSON-LD.
- **`todo()` lines** are hidden in production builds and only show in dev.

## What this is
A complete new site for **Daiamar** (accounting, tax consultancy, HR, ANAF control representation, audit; Oradea). It is built by Epic Digital Hub and replaces the 2019 WordPress site at daiamar.ro. It must be production-ready and **deployable by us alone**: Next.js 15 (App Router, TypeScript) on Vercel, with Neon Postgres for leads. Nobody else (no external developer) will touch it, so the code must be clean and obvious.

Goal = **conversion**: firms in Bihor find Daiamar themselves, understand what it does and send a request (form or phone). Every lead must be attributed to its source (Google Ads, Google organic, Meta, LinkedIn, ONRC flyer QR, direct, referral...) and shown in `/admin`.

Strategy source (read the sections named in your task): `../PROSPECT_DAIAMAR_2026-11.md` (§04 positioning, §05 offer levels, §06 segments, §08 campaigns, §11 website, §12 Google).
Live-site text (the copy we KEEP): `_ref/text_site_actual_ro.md` and `_ref/text_site_actual_en_it.md`. ONRC flyer done in Sept (tone + layout reference): `_ref/flyer_onrc.png`.

## Roland's rules for this site (non-negotiable)
1. **Keep the current text of the site as it is.** Reuse the live wording (add correct diacritics ș ț ă â î, fix obvious typos like "sericii", "desosebite", "tax"). Do not rewrite existing sentences into marketing copy. New copy is allowed ONLY where the old site has nothing: new pages from the strategy (who the service is for, documents, steps, FAQ), section labels, form microcopy.
2. **A1 forms and work permits for non-EU workers must NOT be in prominent places.** No hero, no first screen, no top of the homepage services, no main nav, no top of the footer. They live in their service pages and lower in lists ("Alte servicii" / "Servicii specializate").
3. **Lead with:** ANAF control representation (from 20+ years inside ANAF, divizia control fiscal), **audit intern și audit extern** for businesses, contabilitate, consultanță fiscală, resurse umane.
4. **Correct contact data:** Str. Beiușului nr. 52, Oradea · phones **0741 021 805** and **0799 988 955** (0721 885 459 is OLD, never use it) · contact@daiamar.ro. Everything comes from `src/lib/site.ts` (`company`), never hard-code.
5. **Echipa page:** 6 people, all placeholders (grey image placeholder, `Nume Prenume`, `Funcție` marked with `.todo`). Do not invent names, titles or bios.
6. Visual direction: **Dr. Iova style, but different** (see below).

## Facts you may state (only these)
- Live title: "Peste 20 ani experiență în cadrul ANAF, divizia control fiscal". Membră CECCAR.
- Live "despre" claim "făcând parte doi ani consecutivi din topul celor mai bune firme de contabilitate din România" = keep the text (rule 1), but wrap the claim in a `{/* TODO: de confirmat sursa topului cu clientul */}` comment.
- Services and sub-items exactly as listed on the live site (see `_ref`). Plus **audit intern și audit extern** (confirmed by Roland; no details known, so describe it generally and mark specifics `de cerut de la client`).
- Implemented SAP (live text). Languages: română, engleză, italiană.
- UNKNOWN (never invent): prices, team names/titles, year founded, number of clients, office hours (`de cerut de la client`), photos of the office, reviews.

## Visual direction: "dosarul fiscal"
Dr. Iova DNA we keep: huge tight headlines (Inter Tight, -0.03em, 600–700), lots of white space, pill buttons, frosted glass cards, 12px radius, grey/paper cards, dark navy footer, calm premium motion.
What makes it Daiamar (different from Iova):
- Warm **paper** background (`--paper #F5F3EE`) instead of white, ink text, the brand blue `#245482` from their logo; `--brand-bright #0095EB` used sparingly (links, focus); `--stamp #B4532A` only for tiny "stamp" details (e.g. a "CONTROL FISCAL" stamp mark). No other colours, no gradient text.
- **Ledger / document language**: thin ruled lines, tabular numerals, mono kickers (`.kicker`, JetBrains Mono) like `DOSAR 01 · CONTROL ANAF`, cards that look like files/forms (fișă de cont, balanță, decont TVA) stacked in glass, small serif italic accents (`.serif`, Instrument Serif) on 1–2 words per headline max.
- No stock photos of people, no AI people. Imagery = typographic + document-like UI built in code, plus the logo. Legacy images in `public/img/legacy/` are low quality: avoid except the logo.
- Icons: **lucide-react only**. Never emoji.
- Motion: `Reveal` component for entrances; subtle hover lifts; nothing bouncy. Respect reduced motion.
- Mobile first: check at 390px wide, no horizontal overflow.

## Code standards ("clean, no AI structures")
- Plain, idiomatic Next.js. Server components by default; `"use client"` only where needed.
- Styling: tokens in `src/app/globals.css`; each component/page its own `*.module.css`. No Tailwind, no CSS-in-JS, no UI libraries.
- **No AI-looking code**: no banner comments (`// ===== HERO =====`), no comments that restate the code, no emoji, no "enhanced/robust/seamless" names, no unused props or abstractions "for future use", no giant config objects for 3 items, no `any`. Comments only for a non-obvious *why*. Names in English for code, Romanian for content.
- Content lives next to the page (a typed const at the top of the page file or `content.ts` in the route folder), not in a CMS.
- Each page exports `metadata` (Romanian title ≤ 60 chars with "Oradea" where natural, description 140–160 chars, `alternates.canonical`).
- One H1 per page. GEO: open each page with a 2–3 sentence direct answer (who, what, where in Oradea), question-style H2s, FAQ of 4–6 real questions with `faqSchema()` JSON-LD.
- Internal links: root-relative with trailing slash (`/servicii/contabilitate/`).

## Shared building blocks (already exist, import, don't fork)
- `@/lib/site` → `company`, `services` (slugs + titles + group), `nav`.
- `@/components/ui/Button`, `PageHead`, `Faq` + `faqSchema`, `CtaBand` (every page ends with one, pass `placement`), `JsonLd`, `Reveal`.
- `@/components/LeadForm` (`placement`, optional `service`, `title`, `compact`) and `@/components/TrackedLink` (`kind` phone|email|whatsapp|maps, `href`, `placement`). **Every phone/email link on the site must be a `TrackedLink`**, every form a `LeadForm`. The backend agent implements them; the API won't change.
- The **design lead** owns `globals.css`, `ui/*`, Header, Footer and may restyle them, keeping the props API stable.

## Ownership (don't touch other agents' files)
| Agent | Owns |
|---|---|
| design (home) | `src/app/globals.css`, `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx` + `home.module.css`, `src/components/Header*`, `Footer*`, `src/components/ui/*`, `src/components/home/*`, `src/app/icon.*`, `opengraph-image` |
| services | `src/app/(site)/servicii/**` |
| pages | `src/app/(site)/{despre,echipa,contact,resurse,firme-noi,control-anaf,schimba-contabilul,confidentialitate,cookies,termeni,en,it}/**`, `src/app/sitemap.ts`, `src/app/robots.ts`, `public/llms.txt` |
| backend | `src/app/api/**`, `src/app/admin/**`, `src/lib/db.ts`, `src/lib/attribution.ts`, `src/lib/auth.ts`, `src/middleware.ts`, `src/components/LeadForm*`, `src/components/TrackedLink*`, `src/components/ConsentBanner*`, `src/components/Analytics*`, `db/schema.sql`, `.env.example`, `DEPLOY.md`, `README.md` |
| orchestrator | `next.config.ts`, `package.json`, `src/lib/site.ts`, this brief |

Need a shared change (new field in `site.ts`, new dependency)? Say so in your final report; don't edit.

## Dev / preview (several agents work at once)
- Run your own dev server with your own build dir: `NEXT_DIST_DIR=.next-<agent> npx next dev -p <port>` (ports: design 3101, services 3102, pages 3103, backend 3104). Run it in the background.
- Check your pages with Playwright (python `playwright.async_api`, chromium) at 1440×900 and 390×844; `document.documentElement.scrollWidth` must be 390 on mobile. Screenshots go to `_shots/<agent>/`.
- Before finishing: `npx tsc --noEmit` and `npx eslint src/<your paths>` must be clean for your files.
- Never run `next build` into `.next` (orchestrator does the final build).

## Romanian writing rules
- Correct diacritics with comma below (ș ț), never cedilla. **No em dashes (—) in Romanian copy**.
- Register: **dumneavoastră** on service/legal pages; the live site mixes "Contactează-ne", which is fine for CTAs.
- Check every new sentence against `/Users/rolandsipos/Documents/Epic Digital Hub/AI_SLOP_BLACKLIST.md` (no "fără bătăi de cap", "soluții personalizate", "echipă dedicată", "fără griji", "Hai să...", "într-o lume...", "nu doar X, ci Y"). Short sentences, concrete. If it sounds like a brochure or LinkedIn, rewrite it.
- No superlatives in NEW copy ("cel mai bun", "lider", "de top"). Live text that has them stays (rule 1).

## Final report (each agent)
Short English report: files written, what you checked (screenshots), open `de cerut de la client` items, any shared change you need.
