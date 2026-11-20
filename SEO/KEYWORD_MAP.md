# Daiamar, keyword map (06.11.2026, revised the same day for the national scope)

Internal working doc (EN). Source of the data: live Google results (google.com, hl=ro, gl=ro, pws=0) fetched on 06.11.2026 (morning) with Playwright for 17 queries, plus the Maps results from the strategy §03 (04.11.2026). Raw dump: `SEO/_serp_raw.json`. Search volumes were not measured (no Keyword Planner access); the order below follows commercial intent and the strategy's priorities, not volume.

**Scope change (Roland, 06.11.2026): Daiamar works with firms from all of Romania, not only Oradea/Bihor.** Oradea stays the office and the local base. The map is therefore split in two intents: national (service pages, no forced "Oradea") and local (home, contabilitate, înființări, GBP). The afternoon re-check of the national queries hit Google's bot wall (`/sorry/`, both Playwright and DuckDuckGo html; Bing returned junk), so the national rows use the morning Google dump where it already had the query (control ANAF, TVA UE, A1, permise, audit, consultanță) and the web-search results of the afternoon for the rest; they are marked.

## National vs local: who ranks today

| Query (national intent) | Who ranks (organic, 06.11.2026) | Daiamar page | Note |
|---|---|---|---|
| reprezentare control anaf | static.anaf.ro (manual de control fiscal, ghid inspecție), expertmind.ro/control-anaf-2024, lawyeresse.ro, dianex.ro, contavibe.ro, **daiamar.ro/servicii-contabilitate-oradea/ (old URL, position 7)**, eurocontgrup.ro | `/servicii/reprezentare-controale-anaf/` | No local pack, no AI summary: the query is national and informational-commercial. The ranking old URL redirects to the contabilitate page; the control page must carry the query with its own content. |
| asistență inspecție fiscală anaf | ANAF ghid inspecție (profit.ro summary), startupcafe.ro study, avocatnet.ro tags, KPMG / EY tax-litigation pages (web search, not Google) | same | Big-four and law firms own "asistență"; the mid-market gap is a firm that was inside ANAF. |
| consultanță fiscală online | Wolters Kluwer Sintact Q&A, KPMG, Deloitte, Forvis Mazars, Wolf Theiss, contabilul.manager.ro (web search) | `/servicii/consultanta-fiscala/` | Head term is owned by corporates and Q&A platforms. We take the long tail: "consultanță fiscală firme online", "eșalonare la plată ANAF dosar", "optimizare fiscală legală firmă". |
| contabilitate online firme | aprobat.ro, startco.ro, Realcont, contabilul.manager.ro top 30, Keez-type platforms (web search) | `/clienti-din-toata-tara/` (secondary) + `/servicii/contabilitate/` FAQ | Online platforms dominate; we do not chase the head term. The national page targets "contabilitate la distanță firme din toată țara", "contabil online alt județ". |
| audit intern firme | cafr.ro (model contract audit intern 2025), brig.ro city pages, job boards; for "audit intern oradea": auditgalis.ro ("în Oradea și în toată România"), partenerulcontabil.ro, contaoradea.com | `/servicii/audit-intern-extern/` | Intent "who signs the statutory audit" stays blocked until the client confirms ASPAAS auditors. Audit Galis already positions as Oradea + national: same model as ours. |
| rambursare tva ue | anaf.ro info_ue, europa.eu, asd-int.com, eur-lex, cargotrack.ro, nowium.com, edenred, Banca Transilvania (Taxback) | `/servicii/rambursari-tva-ue/` | National, informational. Winnable long tail: "formular 318 depunere", "recuperare TVA combustibil străinătate transportatori". |
| formular a1 | cnpp.ro, expertcontrol.ro, expertmind.ro, a1formular.ro, untrr.ro, avocatnet.ro, thinkpeople.ro; AI summary + PAA ("Când este necesar Formularul A1?", "Ce este documentul portabil A1?") | `/servicii/formulare-a1/` | National. The PAA questions are answered in the page FAQ. Never prominent on the site (client rule). |
| permis de muncă cetățeni non-UE | igi.mai.gov.ro, globalworker.ro, smart-med.ro; legislation changed in 2026 (OUG 32/2026) | `/servicii/permise-de-munca/` | Government + agencies; low priority, never prominent. |

| Query (local intent) | Who ranks | Daiamar page |
|---|---|---|
| contabilitate Oradea / servicii contabilitate Oradea | local pack (Taddo, Contabil Bihor, CF Bara, Diaccounting, Roline, Contatina, Elizcont), necesit.ro, quickconta.ro, contabilitate-oradea.ro, gaminvest.ro, audit-serv.ro, medconta.ro | `/` (H1 "Servicii contabilitate în Oradea", kept from the live site) |
| firmă contabilitate Oradea / contabil Oradea | same players; AI summary on "contabil oradea" | `/servicii/contabilitate/` + GBP |
| înființare firmă Oradea | randai.ro, gaminvest.ro, ecojur.com, infiintarefirmaoradea.ro | `/servicii/infiintari-lichidari-firme/` |
| salarizare firmă Oradea | brig.ro/salarizare/oradea; no local firm ranks | `/servicii/salarizare-resurse-umane/` |
| contabilitate Bihor / Salonta / Marghita / Beiuș | quickconta.ro/contabilitate-bihor, necesit.ro | `/clienti-din-toata-tara/`, Bihor section (one paragraph, no per-town pages) |

## What the SERPs look like

- **"contabilitate Oradea" / "firma contabilitate oradea" / "servicii contabilitate oradea"**: a local pack (Taddo Expert Contabil, Contabil Bihor SRL, CF Bara, Diaccounting, Roline, Contatina, Elizcont, Balan Luminița), then aggregator "top" lists (necesit.ro, quickconta.ro, contabili24.ro), then 4-5 firm sites: contabilitate-oradea.ro (Tonț & Cîmpean), gaminvest.ro, audit-serv.ro, medconta.ro, conturaccounting.ro, servicii-contabilitate-oradea.ro. Sponsored results from online accounting platforms sit on top. An AI summary ("Rezumat generat de AI") appears for "contabil oradea". The firm sites that rank have: the city in title + H1, a services list, phones in the header, a contact form, and in most cases a Google profile with 20-70 reviews.
- **"contabilitate pfa oradea"**: ecount.tax, superconta.ro, contatina.ro, roline.ro, nmc-conta.ro: dedicated PFA pages rank, so a PFA angle inside the contabilitate page (not a separate thin page) is enough for now.
- **"infiintare firma oradea"**: randai.ro, gaminvest.ro, ecojur.com/infiintare-srl-oradea, infiintarefirmaoradea.ro: pages that explain acte, costuri, procedură and lead to a form.
- **"reprezentare control anaf"**: national, informational (ANAF manual, expertmind.ro, lawyeresse.ro, contavibe.ro) and **daiamar.ro/servicii-contabilitate-oradea/ ranks in the top 7** today. That ranking must be kept: the old URL redirects (308) to `/servicii/contabilitate/`; the control page is `/servicii/reprezentare-controale-anaf/`. Decision: the old URL keeps pointing at the contabilitate page (it was the accounting page), and the control page earns the query with its own content + the ad landing.
- **"consultanta fiscala oradea"**: necesit.ro, topfin.ro, contabili24.ro, ecojur.com, ecount.tax; local pack with Contatina, Profidoc, Creț Gorgan.
- **"audit intern oradea" / "audit financiar oradea"**: auditgalis.ro, partenerulcontabil.ro, contaoradea.com (AMC Audit Accounting), profidoc.ro, topfin.ro; the audit intent is "who can sign the statutory audit", which Daiamar cannot claim until the client confirms ASPAAS auditors.
- **"salarizare oradea"**: no commercial intent in the SERP (public salary disclosures, job ads, Reddit). The commercial query is "salarizare firma oradea" / "servicii salarizare oradea" / "externalizare salarizare oradea" (brig.ro/salarizare/oradea, brig.ro/payroll/oradea).
- **"rambursare tva ue"**: ANAF, europa.eu, eur-lex, asd-int.com, cargotrack.ro, edenred: national informational. A local page can only win long-tail ("rambursare TVA UE transportatori Bihor").
- **"formular a1"**: CNPP, expertcontrol.ro, expertmind.ro, a1formular.ro, untrr.ro, avocatnet.ro, thinkpeople.ro. People also ask: "Când este necesar Formularul A1?", "Ce este documentul portabil A1?", "La ce folosește?". Covered in the A1 page FAQ.
- **"permis de munca oradea"**: IGI Bihor, smart-med.ro, globalworker.ro, IGI pages: government + one agency. Low priority by client rule (never prominent).
- **"lichidare firma oradea"**: randai.ro, ecojur.com/radiere-firma, conturaccounting.ro, insolvency practitioners (UNPIR Bihor). Intent splits between "dizolvare/radiere SRL" and insolvency.
- **"schimbare contabil"**: national guides (contabilultau.com.ro, regnet.ro, econta.ro, taxolia.ro, Reddit r/RoFiscalitate2): informational. Our article + landing match this intent; the landing is noindex (ads), the article is noindex until Daiamar validates it.

People also ask boxes were present only on "formular a1"; the other queries showed an AI summary or none. Questions seen in the AI summaries and aggregator pages that the FAQs now answer: cât costă contabilitatea, trebuie contabil din prima lună, cât timp am după aviz, cât durează un control, cine semnează auditul statutar, SRL sau PFA.

## Map: one primary keyword per URL, no overlaps

Scope column: **N** = national (title/H1/intro without "Oradea"; Service schema `areaServed` = România), **L** = local (Oradea in title + H1; `areaServed` = România + Oradea + Bihor).

| URL | Scope | Primary keyword | Secondary | Intent | Top 3 today (organic) |
|---|---|---|---|---|---|
| `/` | L | servicii contabilitate Oradea | firmă contabilitate Oradea, contabilitate Oradea, experiență ANAF | local commercial | contabilitate-oradea.ro, necesit.ro, gaminvest.ro |
| `/servicii/` | L | servicii contabilitate și fiscalitate Oradea | servicii fiscale Oradea, firmă contabilitate și consultanță Oradea | local commercial (hub) | necesit.ro, quickconta.ro, contabilitate-oradea.ro |
| `/servicii/contabilitate/` | L | contabilitate Oradea firme PFA | contabilitate PFA Oradea, contabilitate SRL Oradea, expert contabil Oradea, contabil Oradea; FAQ: contabilitate la distanță | local commercial | ecount.tax, superconta.ro, contatina.ro |
| `/servicii/reprezentare-controale-anaf/` | N | reprezentare control ANAF | asistență inspecție fiscală, contestație decizie de impunere, reprezentare ITM, control ANAF alt județ | commercial, urgent | static.anaf.ro, expertmind.ro, lawyeresse.ro (+ daiamar.ro old URL at 7) |
| `/servicii/audit-intern-extern/` | N | audit intern firme | audit extern firme, audit înainte de control ANAF, audit financiar (only after ASPAAS is confirmed) | commercial | cafr.ro, auditgalis.ro, partenerulcontabil.ro |
| `/servicii/consultanta-fiscala/` | N | consultanță fiscală firme online | optimizare fiscală legală, dosar eșalonare la plată ANAF, consultant fiscal firmă | commercial | sintact (Wolters Kluwer), KPMG, Forvis Mazars |
| `/servicii/salarizare-resurse-umane/` | L | salarizare Oradea firme | servicii salarizare Oradea, externalizare salarizare, resurse umane Oradea, REGES Online | commercial | brig.ro/salarizare/oradea, brig.ro/payroll/oradea, (no local firm ranks) |
| `/servicii/infiintari-lichidari-firme/` | L | înființare firmă Oradea | înființare SRL Oradea, înființare PFA Oradea, lichidare firmă Oradea, radiere SRL | commercial / transactional | randai.ro, gaminvest.ro, ecojur.com |
| `/servicii/rambursari-tva-ue/` | N | rambursare TVA UE firme | formular 318, recuperare TVA din alt stat membru, TVA combustibil străinătate transportatori | informational > commercial | anaf.ro, europa.eu, asd-int.com |
| `/servicii/formulare-a1/` | N | formular A1 | document portabil A1, A1 șoferi, detașare UE, CNPP | informational > commercial | cnpp.ro, expertcontrol.ro, expertmind.ro |
| `/servicii/permise-de-munca/` | N | permis de muncă cetățeni non-UE | aviz de angajare IGI, angajare străini firmă | commercial, low priority | igi.mai.gov.ro, globalworker.ro |
| `/servicii/firme-cu-probleme-financiare/` | N | firmă cu datorii ANAF eșalonare | reeșalonare debite bancă leasing, plan de afaceri redresare | commercial, urgent | (no direct competitor page; insolvency practitioners) |
| `/servicii/servicii-juridice/` | L | servicii juridice firme Oradea | avocat litigii comerciale Oradea (through partners), contestație în instanță act fiscal | commercial, secondary | ecojur.com, local law firms |
| `/clienti-din-toata-tara/` (was `/zone-deservite/`, 308) | N (+ Bihor section) | contabilitate la distanță firme din toată țara | contabil online alt județ, firmă contabilitate toată țara, contabilitate Bihor, contabil Salonta / Marghita / Beiuș / Aleșd | commercial | aprobat.ro, startco.ro, auditgalis.ro (national angle); quickconta.ro/contabilitate-bihor (Bihor angle) |
| `/despre/` | Daiamar Oradea | firmă contabilitate membră CECCAR Oradea | brand / navigational | daiamar.ro |
| `/echipa/` | echipa Daiamar | expert contabil Oradea (after names are confirmed) | brand | daiamar.ro |
| `/contact/` | Daiamar contact | contabilitate Oradea Beiușului, telefon contabil Oradea | navigational | daiamar.ro, Google Maps |
| `/resurse/` | ghiduri fiscale firme | obligații firmă nouă, control ANAF pași, schimbare contabil | informational | startco.ro, avocatnet.ro, contzilla.ro |
| `/resurse/obligatii-firma-noua-primul-an/` (noindex until reviewed) | obligații firmă nouă primul an | ce declarații depune o firmă nouă, vector fiscal | informational | startco.ro, contzilla.ro |
| `/resurse/control-fiscal-anaf-cum-decurge/` (noindex until reviewed) | cum decurge un control ANAF | aviz inspecție fiscală 15 zile, durata inspecției 45 zile, contestație 45 zile | informational | static.anaf.ro, startco.ro, expertmind.ro |
| `/resurse/schimbarea-contabilului-ce-verificati/` (noindex until reviewed) | schimbarea contabilului ce verifici | proces-verbal predare primire contabil | informational | contabilultau.com.ro, regnet.ro, econta.ro |
| `/en/` | accounting services Oradea Romania | accountant Oradea English, CECCAR accounting firm Oradea | commercial, foreign owners | gaminvest.ro/en, contabilitate-oradea.ro |
| `/it/` | servizi di contabilità Oradea | commercialista Oradea Romania, contabilità Romania italiano | commercial, Italian owners | (no local competitor in Italian) |
| `/firme-noi/`, `/control-anaf/`, `/schimba-contabilul/` | none (noindex ad landings) | | ads only | |

Cannibalisation rules applied:
- "contabilitate Oradea" belongs to `/servicii/contabilitate/` (service page), the home targets the broader "servicii contabilitate Oradea" and the brand.
- "control ANAF" belongs to the service page; the ad landing `/control-anaf/` is noindex; the article is informational and noindex until reviewed.
- "înființare" and "lichidare" share one page (same SERP players, same documents); no separate lichidare page.
- "Bihor" + localities belong to `/clienti-din-toata-tara/` only (one paragraph, no per-town pages); service pages say "din Oradea, din Bihor și din toată țara" once, in the intro.
- "Online" is used only where the intent is national: the national page, the consultanță fiscală title and the contabilitate FAQ. Local pages (home, contabilitate, salarizare, înființări) keep "Oradea" and do not add "online" to titles or H1s.
- PFA stays inside `/servicii/contabilitate/` (H1 + FAQ), no separate PFA page until there is content for it.
- A1 and permise de muncă keep their pages but are never linked from the hero, the top of the hub or the top of the footer (client rule); on the national page they are the last two in the services list.

## Zone page decision (06.11.2026)

`/zone-deservite/` was renamed to `/clienti-din-toata-tara/`, with a permanent redirect from the old slug (`next.config.ts`). Reasons: the site is not live, so the old slug has no backlinks, no index history and no GSC data; nothing is lost by renaming. "Zone deservite" signals a service-area page (local pack logic), which is the opposite of what the page now says. The redirect exists only for preview links already shared. The page keeps one Bihor paragraph (office, map link, nearby towns) so the "contabilitate Bihor / Salonta / Marghita" long tail still has a home without thin per-city pages.

## How each page was aligned

Title (≤ 50 chars + " | Daiamar"), H1, first paragraph (who / what / where), question-style H2s and the FAQ follow the row above. National pages: title and H1 without "Oradea", intro says "firme din toată țara" and names the office once, kicker "… · toată țara", one FAQ about working from another county. Local pages: Oradea in title + H1, intro says "din Oradea, din Bihor și din toată țara". Kept live wording was not rewritten; only new copy, headings and FAQs were adjusted. Facts stay as confirmed in `TEAM_BRIEF.md`; anything else is marked `de cerut de la client`. How online work happens is stated only as far as the live site does (operare online, verificare la sediul beneficiarului când se impune) plus generic truths (documents sent electronically, phone / e-mail / WhatsApp, upload form on the site). E-signature tools, platforms, meeting software: `de cerut de la client`, not on the site.

## Next measurements

- GSC after launch: queries per URL, compare with this map monthly; move a keyword to another URL only if GSC shows the wrong page ranking. Watch especially whether "reprezentare control anaf" moves from the old URL (now the contabilitate page) to the control page.
- Re-run `SEO/_serp_raw.json` collection quarterly (same 17 queries + the 8 national ones above) from a normal browser session, not headless: Google's bot wall blocked the afternoon run.
- AI visibility: prompt list in `SEO/PLAN_OFFSITE.md`, monthly.
