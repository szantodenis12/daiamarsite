import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { baseGraph, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import PageHead from "@/components/ui/PageHead";
import CtaBand from "@/components/ui/CtaBand";
import JsonLd from "@/components/ui/JsonLd";
import styles from "../_shared/legal.module.css";

const title = "Politica de cookie-uri";
const description =
  "Ce cookie-uri folosește daiamar.ro: unul necesar pentru alegerea din banner și, numai cu acord, două cookie-uri care rețin sursa vizitei și Google Analytics 4.";

export const metadata: Metadata = pageMeta({ title, description, path: "/cookies/" });

const updated = "06.11.2026";

type Cookie = { name: string; purpose: string; duration: string; category: string };

// Must match the banner text in ConsentBanner.tsx and the table in README.md.
const cookies: Cookie[] = [
  {
    name: "dm_consent",
    purpose: "Reține alegerea dumneavoastră din bannerul de cookie-uri, ca să nu îl afișăm din nou.",
    duration: "180 de zile",
    category: "Necesar",
  },
  {
    name: "dm_ft",
    purpose: "Prima sursă prin care ați ajuns pe site (de exemplu Google Ads, Meta, QR flyer) și parametrii UTM, dacă există.",
    duration: "90 de zile",
    category: "Funcțional (cu acord)",
  },
  {
    name: "dm_lt",
    purpose: "Ultima sursă prin care ați ajuns pe site, înainte de a trimite o solicitare.",
    duration: "până la închiderea browserului",
    category: "Funcțional (cu acord)",
  },
  {
    name: "_ga, _ga_*",
    purpose: "Google Analytics 4: statistici de trafic (pagini vizitate, durata vizitei). Se instalează numai dacă acceptați.",
    duration: "până la 2 ani, conform documentației Google",
    category: "Statistică (consimțământ)",
  },
];

export default function CookiesPage() {
  return (
    <>
      <JsonLd
        data={baseGraph(
          webPageSchema("/cookies/", title, description),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Politica de cookie-uri", path: "/cookies/" },
          ]),
        )}
      />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Cookie-uri" }]}
        title="Politica de cookie-uri"
        intro={
          <p>
            Site-ul daiamar.ro folosește puține cookie-uri: unul necesar, care reține alegerea din banner. Numai dacă apăsați „Accept”
            folosim și două cookie-uri proprii, care rețin sursa vizitei, și Google Analytics 4. Cu „Refuz” nu setăm alte cookie-uri. Nu
            folosim cookie-uri de publicitate.
          </p>
        }
      />
      <article className={`wrap ${styles.doc}`}>
        <p className={styles.meta}>Ultima actualizare: {updated}</p>

        <h2>Ce este un cookie?</h2>
        <p>
          Un fișier text mic, salvat de browser la cererea site-ului. La următoarea vizită, site-ul îl poate citi. Cookie-urile de pe
          acest site nu conțin numele, telefonul sau e-mailul dumneavoastră.
        </p>

        <h2>Ce cookie-uri folosim?</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Scop</th>
              <th>Durată</th>
              <th>Categorie</th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((c) => (
              <tr key={c.name}>
                <td data-label="Cookie"><code>{c.name}</code></td>
                <td data-label="Scop">{c.purpose}</td>
                <td data-label="Durată">{c.duration}</td>
                <td data-label="Categorie">{c.category}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Cookie-uri necesare</h2>
        <p>
          Cookie-ul de consimțământ reține ce ați ales în banner. Fără el, bannerul ar apărea la fiecare pagină. Nu necesită acord
          și nu se transmite nimănui.
        </p>

        <h2>Cookie-uri funcționale, sursa vizitei (dm_ft, dm_lt)</h2>
        <p>
          Sunt cookie-uri proprii (first-party), setate de site, nu de terți, și numai după ce apăsați „Accept” (sau bifați „Funcționale”
          în „Setări”). Rețin de unde a venit vizita:
          dintr-un anunț Google Ads, dintr-o căutare, dintr-o postare, de pe codul QR al unui flyer sau direct. Nu conțin numele,
          telefonul sau e-mailul dumneavoastră și nu identifică o persoană. Când trimiteți o solicitare, vă abonați la newsletter sau
          apăsați pe un număr de telefon, pe WhatsApp ori pe un link către hartă, sursa se salvează împreună cu acțiunea, ca să știm ce
          canale aduc cereri. Nu sunt folosite pentru publicitate și nu se transmit către platforme de publicitate. Le puteți șterge
          oricând din browser; „Refuz” le șterge și pe cele salvate înainte.
        </p>
        <p>
          Fără acord, sursa vizitei rămâne doar în memoria paginii deschise, nu în browser: dispare când închideți pagina și ajunge la noi
          numai dacă trimiteți un formular. Vizitele le numărăm anonim, fără cookie: un singur rând cu canalul și pagina de intrare, fără
          niciun identificator. Fără cookie, o pagină reîncărcată poate fi numărată încă o dată.
        </p>

        <h2>Cookie-uri de publicitate</h2>
        <p>
          Site-ul nu setează cookie-uri de publicitate (Google Ads, Meta). Dacă acest lucru se schimbă, actualizăm această pagină și
          bannerul, iar cookie-urile respective se vor instala numai cu acordul dumneavoastră.
        </p>

        <h2>Statistici (Google Analytics 4, prin Google Tag Manager)</h2>
        <p>
          Google Analytics 4 și Google Tag Manager se încarcă numai după ce acceptați statisticile din banner. Până atunci browserul nu
          cere nimic de la Google. Dacă refuzați sau nu alegeți nimic, nu se instalează niciun cookie Google. Datele colectate: pagini vizitate, durata vizitei,
          tipul dispozitivului, sursa vizitei, evenimentele de conversie (formular trimis, click pe telefon). Google poate prelucra
          aceste date în afara SEE, conform propriilor condiții.
        </p>

        <h2>Conținut de la terți care nu setează cookie-uri</h2>
        <ul>
          <li>
            <strong>Harta OpenStreetMap</strong> (pagina de contact și prima pagină) se încarcă direct, fără cookie-uri. Browserul cere
            imaginile hărții de la serverele OpenStreetMap Foundation, care primesc astfel adresa dumneavoastră IP, ca la orice imagine
            încărcată de pe un alt site.
          </li>
          <li>
            <strong>Butonul WhatsApp</strong> este un link obișnuit. Nu se încarcă nimic de la WhatsApp până nu apăsați pe el; după aceea,
            discuția are loc în aplicația WhatsApp, în condițiile Meta.
          </li>
        </ul>

        <h2>Cum vă schimbați alegerea?</h2>
        <ul>
          <li>din bannerul de cookie-uri, la prima vizită;</li>
          <li>oricând, din „Setări cookie-uri”, în subsolul fiecărei pagini;</li>
          <li>ștergând cookie-urile din browser; bannerul va apărea din nou;</li>
          <li>din setările browserului, blocând cookie-urile pentru acest site.</li>
        </ul>
        <p>
          Detalii despre prelucrarea datelor personale găsiți în <Link href="/confidentialitate/">Politica de confidențialitate</Link>.
        </p>
      </article>
      <CtaBand placement="cookies" title="Aveți o întrebare despre cookie-uri?" />
    </>
  );
}
