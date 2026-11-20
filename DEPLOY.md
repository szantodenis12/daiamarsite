# Deploy: daiamar.ro pe Vercel

RO mai jos, EN la final. Totul se face de către noi (Epic Digital Hub), fără alt developer.

## RO, pas cu pas

1. **Legați proiectul de Vercel** (o singură dată), din folderul proiectului:
   ```bash
   npx vercel link
   ```
   Alegeți echipa Epic Digital Hub și creați proiectul `daiamar`.

2. **Baza de date.** În Vercel: proiectul `daiamar` → Storage → Marketplace → **Neon** → Create → alegeți regiunea **Frankfurt (aws-eu-central-1)** → Connect to project.
   `DATABASE_URL` se adaugă singur. Tabelele (cereri, vizite, istoric, buget, linkuri, oferte, abonați, fișiere, setări) se creează automat la prima cerere, iar coloanele noi se adaugă singure la bazele existente. Schema e în `db/schema.sql`.
   Politica de confidențialitate spune că baza de date e „în Uniunea Europeană”: dacă regiunea nu e una europeană, schimbați fraza din `src/app/(site)/confidentialitate/page.tsx`.

2b. **Documente încărcate.** Vercel → Storage → **Blob** → Create, cu acces **Private** → Connect to project. `BLOB_READ_WRITE_TOKEN` se adaugă singur. Store-ul trebuie să fie privat: browserul încarcă fișierele direct în Blob (o funcție Vercel nu primește mai mult de 4,5 MB), iar un store public ar accepta și blob-uri publice. Fișierele de la `/trimite-documente/` se descarcă doar din `/admin/leads/<id>/`, după autentificare. Fără token, local, fișierele merg în `.data/uploads/`. Un fișier încărcat, dar pentru care formularul nu a mai fost trimis (vizitatorul a închis pagina), rămâne în Blob fără cerere: verificați din când în când Storage → Blob și ștergeți ce e mai vechi de câteva zile și nu apare în nicio cerere.

3. **Variabile** (Settings → Environment Variables, pentru Production și Preview):
   - `ADMIN_PASSWORD`: parola pentru `/admin/`
   - `ADMIN_SECRET`: un șir lung, aleator: `openssl rand -hex 32`
   - opțional `FORM_SECRET` (`openssl rand -hex 32`): semnează tokenul care măsoară timpul de completare a formularelor publice. Gol = se folosește `ADMIN_SECRET`. Fără niciunul, nicio trimitere nu e marcată „suspectă”.
   - `NEXT_PUBLIC_SITE_URL`: **doar pe demo/preview**, adresa deploy-ului (de exemplu `https://daiamar.vercel.app`), ca linkurile din e-mailuri, oferte, QR și newsletter să ducă acolo; site-ul primește și `noindex`. **În producție lăsați-o goală** (se folosește `https://www.daiamar.ro`).
   - opțional `RESEND_API_KEY`, `LEAD_NOTIFY_TO`, `LEAD_NOTIFY_FROM`: email la fiecare cerere nouă, e-mailul de confirmare a abonării la newsletter și ofertele (domeniul expeditorului trebuie verificat în Resend). Fără `RESEND_API_KEY`, abonații rămân „de confirmat” și se confirmă manual din `/admin/abonati/`.
   - opțional `NEXT_PUBLIC_GTM_ID`: containerul Google Tag Manager (GA4 se configurează în GTM)
   - `CRON_SECRET`: `openssl rand -hex 32`. Protejează rezumatul săptămânal (`/api/cron/weekly/`). Vercel îl trimite singur la cron.

   Adresele de notificare se pot schimba și din `/admin/setari/` (au prioritate față de `LEAD_NOTIFY_TO`). Tot acolo: textele ofertelor, datele firmei, IBAN-ul și adresa de răspuns.

4. **Publicare:**
   ```bash
   npx vercel deploy --prod
   ```

5. **Domeniul.** Vercel → Settings → Domains → adăugați `daiamar.ro` și `www.daiamar.ro` (www principal, `daiamar.ro` redirect către www).
   La registrar: `A @ 76.76.21.21` și `CNAME www cname.vercel-dns.com` (sau valorile afișate de Vercel). Nu atingeți înregistrările MX ale emailului.

6. **Test.** Deschideți `https://www.daiamar.ro/contact/?utm_source=test&utm_medium=test`, trimiteți o cerere cu numele „Test”. După trimitere ajungeți pe `/multumim/?tip=cerere`.
   În `/admin/` trebuie să apară cererea, cu canalul „Alte site-uri (test)”. Ștergeți-o din pagina ei („Șterge cererea”).
   Testați și: „Vă sunăm noi” de pe /contact/ (apare cu eticheta „Sună înapoi”), abonarea din /resurse/ (apare în Abonați), o încărcare de PDF pe /trimite-documente/ (fișierul se descarcă din cererea respectivă).

7. **Date demo** (doar pentru prezentare): `npm run seed` local, cu `DATABASE_URL` de la Neon în `.env.local`
   (`npx vercel env pull .env.local`). Se șterg din admin cu butonul „Șterge datele demo”.

### Conversii în Google Ads / Meta (GTM)

Orice formular trimis cu succes redirecționează către **`/multumim/?tip=cerere|apel|newsletter|documente`** (noindex, nu e în sitemap). Pagina trimite în `dataLayer` evenimentul `generate_lead` cu `lead_type` și `form_placement`, numai dacă vizitatorul a acceptat statisticile (Consent Mode v2).
Evenimentul pleacă **o singură dată pe trimitere**: formularul lasă un id de unică folosință în `sessionStorage`, iar pagina îl consumă (o reîncărcare, Back sau un link deschis direct nu mai trimit nimic). Id-ul vine în `conversion_id` (folosiți-l ca `transaction_id` în Google Ads, pentru deduplicare). Trimiterile prea rapide („suspecte”) nu ajung pe `/multumim/` și nu trimit evenimentul.
În GTM: declanșator **Custom Event** `generate_lead` (nu Page View pe `/multumim/`, care s-ar declanșa la fiecare încărcare) → tag Google Ads Conversion / GA4 event / Meta Pixel Lead; condiție `lead_type` = `cerere` pentru doar cererile de contact. Newsletterul (`lead_type` = `newsletter`) se exclude din conversiile de vânzare. GTM se încarcă abia după ce vizitatorul acceptă statisticile.

### Rezumatul săptămânal

`vercel.json` programează `/api/cron/weekly/` lunea la 06:00 UTC: 08:00 la Oradea iarna (EET) și 09:00 vara (EEST). Vercel Cron merge doar în UTC.
Testul se face din `/admin/setari/` → „Trimite acum un test”. Fără `RESEND_API_KEY` panoul arată textul care ar fi plecat.

### Link-uri cu sursă

Linkurile și codurile QR se fac din `/admin/linkuri/`. Tabelul de mai jos rămâne ca referință.


| Unde | URL |
|---|---|
| QR pe flyerul ONRC | `https://www.daiamar.ro/firme-noi/?utm_source=onrc&utm_medium=print&utm_campaign=firme-noi` |
| Google Ads | auto-tagging pornit (gclid), nimic de adăugat |
| Meta Ads | `?utm_source=facebook&utm_medium=paid_social&utm_campaign=<nume>` |
| Newsletter | `?utm_source=newsletter&utm_medium=email&utm_campaign=<nume>` |
| Alt material tipărit | `?utm_source=<loc>&utm_medium=print&utm_campaign=<nume>` |

Pagina din QR-ul ONRC (`/firme-noi/`) trebuie să existe înainte de tipărire. Verificați link-ul cu telefonul.

### Ce trebuie știut
- Fără `DATABASE_URL`, local cererile se salvează în `.data/db.json`. Pe Vercel acest mod nu funcționează: site-ul dă eroare la trimiterea formularului până se conectează Neon.
- Limita de cereri (5 la 10 minute de la aceeași adresă) și limita de autentificare în admin (5 parole greșite în 15 minute de la aceeași adresă, apoi 429) sunt ținute în memorie, per instanță Vercel: frânează ghicitul, dar nu sunt o limită globală. Adresa IP nu se salvează nicăieri.
- Ieșirea din admin șterge cookie-ul de pe dispozitiv, dar un cookie copiat rămâne valabil până la 14 zile. Pentru a deloga pe toată lumea, schimbați `ADMIN_SECRET` și faceți redeploy.
- Parola de admin se schimbă din variabile + redeploy. Schimbarea `ADMIN_SECRET` deloghează pe toată lumea.

---

## EN, short

1. `npx vercel link`
2. Vercel → Storage → Marketplace → Neon → connect (sets `DATABASE_URL`; tables auto-create on first use).
2b. Vercel → Storage → Blob → connect (sets `BLOB_READ_WRITE_TOKEN`; uploads at /trimite-documente/ are private blobs, downloaded only via /admin/).
3. Env vars: `ADMIN_PASSWORD`, `ADMIN_SECRET` (`openssl rand -hex 32`), `CRON_SECRET`, optional `RESEND_API_KEY` + `LEAD_NOTIFY_TO` + `LEAD_NOTIFY_FROM` (also sends the newsletter double opt-in email), optional `NEXT_PUBLIC_GTM_ID`. Weekly cron: Mondays 06:00 UTC (08:00/09:00 Oradea).
   Optional `FORM_SECRET` (falls back to `ADMIN_SECRET`). `NEXT_PUBLIC_SITE_URL` only on demo/preview (the vercel.app URL); leave it empty in production. Blob store must be **private** (browser uploads go straight to it).
   GTM conversions: Custom Event trigger `generate_lead` (fires once per real submission, carries `conversion_id`), not Page View on `/multumim/`. GTM loads only after the visitor accepts statistics.
4. `npx vercel deploy --prod`
5. Domains: add `daiamar.ro` + `www.daiamar.ro`; DNS `A @ 76.76.21.21`, `CNAME www cname.vercel-dns.com`. Keep MX records.
6. Send a test lead with `?utm_source=test&utm_medium=test`, check it in `/admin/`.
7. Demo data: `npx vercel env pull .env.local && npm run seed`; remove with "Șterge datele demo".

ONRC flyer QR: `https://www.daiamar.ro/firme-noi/?utm_source=onrc&utm_medium=print&utm_campaign=firme-noi`

---

## SEO / securitate (adăugat 06.11.2026)

**www vs apex.** Canonicalul este `https://www.daiamar.ro` (`SITE_URL` în `src/lib/site.ts`; sitemap, robots, llms.txt și JSON-LD îl folosesc). În Vercel → Domains, `www.daiamar.ro` = domeniu principal, `daiamar.ro` = „Redirect to www.daiamar.ro” (308). Ca plasă de siguranță, `next.config.ts` redirecționează și el cererile cu host `daiamar.ro` către www, păstrând slash-ul final (un URL apex fără slash face doi pași: întâi slash-ul, apoi www). După deploy: `curl -sI https://daiamar.ro/servicii/ | grep -i "^location"` trebuie să dea `https://www.daiamar.ro/servicii/`. Domeniul `*.vercel.app` nu se indexează: adăugați în Vercel „Deployment Protection” sau lăsați-l, Google ia canonicalul www din `<link rel=canonical>`.

**Redirecturi vechi (WordPress).** Lista din `next.config.ts` acoperă toate cele 8 URL-uri din sitemap-ul vechi (verificat 06.11.2026), cu și fără slash final (fără slash: doi pași, întâi slash-ul adăugat de Next, apoi pagina nouă). `/en/` și `/it/` au același path. Imaginile vechi din `/wp-content/uploads/2019/10/` nu au echivalent și întorc 404, intenționat.

**Antete de securitate.** HSTS (2 ani, preload), `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` sunt active. CSP este livrat **Report-Only** (`Content-Security-Policy-Report-Only`), pentru că scripturile inline ale Next și tag-urile încărcate din GTM ar avea nevoie de nonce-uri. Pași pentru a-l face blocant: 1) configurați GTM și verificați că nu apar rapoarte CSP (în consolă și în Vercel → Logs, linia „CSP report”, trimisă la `/api/csp-report/`) pe toate paginile (inclusiv harta OpenStreetMap, butonul WhatsApp și formularele); 2) adăugați domeniile lipsă în `csp` din `next.config.ts`; 3) redenumiți antetul în `Content-Security-Policy`.

**La lansare.**
- Google Search Console: proprietate de tip domeniu `daiamar.ro`, trimiteți `https://www.daiamar.ro/sitemap.xml`, cereți indexarea pentru `/`, `/servicii/`, `/servicii/reprezentare-controale-anaf/`, `/servicii/contabilitate/`, `/zone-deservite/`.
- Bing Webmaster Tools: importați proprietatea din GSC, trimiteți același sitemap.
- IndexNow (Bing, Yandex): generați o cheie, puneți fișierul `public/<cheie>.txt` cu cheia în el și trimiteți URL-urile la `https://api.indexnow.org/indexnow?url=<URL>&key=<cheie>` (sau POST cu lista). Fără cheie în repo până la lansare.
- `https://www.daiamar.ro/llms.txt` și `/llms-full.txt` trebuie să răspundă 200 (al doilea se generează la build din conținutul paginilor).
- Verificare rapidă: `curl -s https://www.daiamar.ro/ | grep -c '<h1'` = 1 · `curl -s https://www.daiamar.ro/robots.txt` · `curl -sI https://www.daiamar.ro/ | grep -i strict-transport`.

**Articolele din /resurse/.** Sunt `reviewed: false` în `src/app/(site)/resurse/articles.ts`: noindex, lipsesc din sitemap și din `llms-full.txt`, fără autor afișat. După validarea de către Daiamar, treceți `reviewed: true` și actualizați `updated`.
