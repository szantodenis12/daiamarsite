import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { baseGraph, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import PageHead from "@/components/ui/PageHead";
import CtaBand from "@/components/ui/CtaBand";
import JsonLd from "@/components/ui/JsonLd";
import TrackedLink from "@/components/TrackedLink";
import styles from "../_shared/legal.module.css";

const title = "Politica de confidențialitate";
const description =
  "Cum prelucrează Daiamar datele de pe daiamar.ro: formulare, apel înapoi, newsletter, documente, sursa vizitei, statistici. Temei, durată și drepturi GDPR.";

export const metadata: Metadata = pageMeta({ title, description, path: "/confidentialitate/" });

const updated = "06.11.2026";

// Retention periods below are proposals. TODO: de confirmat cu clientul fiecare termen (24 luni, 12 luni, 14 luni).
const retention = {
  leads: "24 de luni de la ultimul contact, dacă nu urmează un contract",
  clients: "pe durata contractului și apoi conform termenelor legale de arhivare a documentelor contabile și fiscale",
  documents: "12 luni de la primire, dacă nu urmează un contract; apoi se șterg",
  newsletter: "până la dezabonare; după dezabonare păstrăm doar adresa, ca să nu o mai folosim",
  analytics: "14 luni, setarea de păstrare din Google Analytics 4",
};

type Processing = { title: string; what: string; why: string; basis: string; keep: string; note?: string };

const processings: Processing[] = [
  {
    title: "Formularul de solicitare",
    what: "Nume și prenume, firma (opțional), telefon sau e-mail, serviciul care vă interesează, mesajul, pagina de pe care ați trimis, data și ora, tipul dispozitivului.",
    why: "Să vă răspundem la solicitare și să discutăm o eventuală colaborare.",
    basis: "Demersuri la cererea dumneavoastră înainte de încheierea unui contract, art. 6 alin. (1) lit. b) GDPR.",
    keep: retention.leads,
  },
  {
    title: "„Vă sunăm noi” (apel înapoi)",
    what: "Nume și prenume, numărul de telefon, pagina de pe care ați trimis, data și ora.",
    why: "Să vă sunăm la numărul lăsat.",
    basis: "Demersuri la cererea dumneavoastră înainte de încheierea unui contract, art. 6 alin. (1) lit. b) GDPR.",
    keep: retention.leads,
  },
  {
    title: "WhatsApp",
    what: "Când apăsați pe butonul WhatsApp, înregistrăm doar faptul că s-a dat click și sursa vizitei, fără nume sau număr. Conversația are loc în aplicația WhatsApp, cu numărul dumneavoastră și al nostru.",
    why: "Să răspundem la mesajul dumneavoastră și să știm ce canale aduc solicitări.",
    basis: "Răspunsul la mesaj: art. 6 alin. (1) lit. b) GDPR. Numărarea clickurilor: interesul nostru legitim de a ne administra activitatea, art. 6 alin. (1) lit. f) GDPR.",
    keep: "Mesajele WhatsApp: cât timp durează discuția și, dacă urmează o colaborare, conform termenelor de mai jos pentru clienți.",
    note: "WhatsApp (Meta Platforms Ireland Ltd.) prelucrează mesajele și metadatele ca operator independent, conform propriei politici de confidențialitate. Dacă nu doriți acest lucru, folosiți telefonul, e-mailul sau formularul.",
  },
  {
    title: "Apeluri telefonice și click pe telefon sau e-mail",
    what: "Când apăsați pe un număr de telefon sau pe adresa de e-mail de pe site, înregistrăm faptul că s-a dat click, pagina și sursa vizitei, fără date de identificare. Nu înregistrăm convorbirile telefonice.",
    why: "Să știm ce pagini și ce canale aduc apeluri.",
    basis: "Interesul nostru legitim de a ne administra activitatea, art. 6 alin. (1) lit. f) GDPR. Impactul asupra dumneavoastră este minim: nu se salvează niciun identificator personal.",
    keep: retention.leads,
  },
  {
    title: "Newsletterul „Noutăți fiscale”",
    what: "Adresa de e-mail, numele și firma (opționale), data abonării, data confirmării, sursa vizitei. Confirmarea se face printr-un link trimis pe e-mail (dublu opt-in): fără confirmare nu trimitem nimic.",
    why: "Să vă trimitem pe e-mail informații despre modificări fiscale și contabile.",
    basis: "Consimțământul dumneavoastră, art. 6 alin. (1) lit. a) GDPR. Îl puteți retrage oricând din linkul de dezabonare din fiecare e-mail; retragerea nu afectează ce s-a trimis înainte.",
    keep: retention.newsletter,
  },
  {
    title: "Documentele trimise prin site",
    what: "Fișierele încărcate pe pagina „Trimiteți documente” (PDF, JPG, PNG, HEIC) și datele din ele, care pot fi date personale și financiare ale dumneavoastră, ale firmei sau ale angajaților, plus nume, telefon sau e-mail și mesajul.",
    why: "Să analizăm situația pentru care ne-ați scris și să vă răspundem.",
    basis: "Demersuri la cererea dumneavoastră înainte de încheierea unui contract, art. 6 alin. (1) lit. b) GDPR. Pentru datele altor persoane din documente, dumneavoastră răspundeți de temeiul pentru care ni le transmiteți.",
    keep: retention.documents,
    note: "Fișierele se păstrează într-un spațiu de stocare privat, fără linkuri publice, și se pot descărca doar din panoul intern, după autentificare.",
  },
  {
    title: "Gestionarea solicitărilor (evidența internă)",
    what: "Solicitările de mai sus, statusul lor (nou, contactat, ofertă, client, pierdut), notele colegilor despre discuții, pașii următori, valoarea estimată, ofertele trimise și, pentru ofertele deschise online, data primei deschideri, numărul de deschideri și acceptarea cu numele persoanei care a acceptat.",
    why: "Să ținem evidența discuțiilor, să nu vă contactăm de două ori pentru același lucru și să urmărim ofertele trimise.",
    basis: "Demersuri precontractuale, art. 6 alin. (1) lit. b) GDPR, și interesul nostru legitim de a ne organiza activitatea comercială, art. 6 alin. (1) lit. f) GDPR. Evidența conține doar ce ne-ați transmis și ce am discutat.",
    keep: `${retention.leads}; pentru clienți, ${retention.clients}`,
  },
  {
    title: "Sursa vizitei (atribuire)",
    what: "Parametrii de campanie din linkul pe care ați dat click (utm_source, utm_medium, utm_campaign, utm_term, utm_content), identificatorii de click ai platformelor de publicitate (gclid, gbraid, wbraid, fbclid, msclkid, li_fat_id), site-ul de pe care ați venit, prima pagină vizitată, data. Fără acordul dumneavoastră, acestea rămân doar în memoria paginii deschise (nu se salvează nimic în browser) și ajung la noi numai dacă trimiteți un formular. Dacă apăsați „Accept” în banner, se rețin și în două cookie-uri proprii, dm_ft și dm_lt, descrise în politica de cookie-uri. Vizitele se numără anonim, fără cookie: un rând cu canalul și pagina de intrare, fără niciun identificator.",
    why: "Să știm din ce canal a venit o solicitare (Google Ads, căutare Google, Meta, LinkedIn, un flyer cu cod QR, acces direct) și să ne împărțim bugetul în consecință.",
    basis: "Interesul nostru legitim de a măsura eficiența canalelor noastre de comunicare, art. 6 alin. (1) lit. f) GDPR. Datele nu identifică o persoană și nu se transmit către platforme de publicitate; se asociază cu o persoană numai când aceasta trimite o solicitare.",
    keep: "Cookie-urile, numai cu acord: 90 de zile (dm_ft) și până la închiderea browserului (dm_lt). Odată atașate unei solicitări, urmează termenul solicitării.",
  },
  {
    title: "Statistici de trafic și publicitate",
    what: "Dacă acceptați cookie-urile de statistică din banner, Google Tag Manager încarcă Google Analytics 4: pagini vizitate, durata vizitei, tipul dispozitivului, sursa vizitei, evenimentele de conversie (trimiterea unui formular, click pe telefon). Fără acordul dumneavoastră nu se încarcă niciun script Google.",
    why: "Să înțelegem cum este folosit site-ul și să măsurăm campaniile.",
    basis: "Consimțământul dumneavoastră, art. 6 alin. (1) lit. a) GDPR, exprimat în bannerul de cookie-uri. Îl puteți retrage din „Setări cookie-uri”, în subsolul paginii.",
    keep: retention.analytics,
    note: "În prezent nu folosim cookie-uri de publicitate (Google Ads, Meta). Dacă le vom folosi, actualizăm această pagină și bannerul, iar ele se vor instala numai cu acordul dumneavoastră.",
  },
  {
    title: "Harta",
    what: "Harta de pe pagina de contact și de pe prima pagină este încărcată de la OpenStreetMap. Browserul dumneavoastră cere imaginile hărții direct de la serverele OpenStreetMap Foundation, care primesc astfel adresa IP. Harta nu setează cookie-uri.",
    why: "Să vă arătăm unde este biroul.",
    basis: "Interesul nostru legitim de a afișa locația biroului, art. 6 alin. (1) lit. f) GDPR. Impactul este cel al încărcării oricărei imagini de pe un alt site.",
    keep: "Noi nu păstrăm nimic. OpenStreetMap Foundation își aplică propria politică de confidențialitate.",
  },
];

const rights = [
  "dreptul de acces la datele dumneavoastră (art. 15);",
  "dreptul la rectificare (art. 16);",
  "dreptul la ștergere (art. 17);",
  "dreptul la restricționarea prelucrării (art. 18);",
  "dreptul la portabilitatea datelor (art. 20);",
  "dreptul de opoziție, inclusiv față de prelucrările bazate pe interes legitim (art. 21);",
  "dreptul de a nu face obiectul unei decizii bazate exclusiv pe prelucrare automată (art. 22);",
  "dreptul de a vă retrage consimțământul, oricând, pentru prelucrările bazate pe consimțământ, fără să afecteze ce s-a prelucrat înainte.",
];

export default function ConfidentialitatePage() {
  return (
    <>
      <JsonLd
        data={baseGraph(
          webPageSchema("/confidentialitate/", title, description),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Politica de confidențialitate", path: "/confidentialitate/" },
          ]),
        )}
      />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Confidențialitate" }]}
        title="Politica de confidențialitate"
        intro={
          <p>
            Această pagină explică ce date personale prelucrează site-ul daiamar.ro și firma din spatele lui, în ce scop, pe ce temei, cât timp
            le păstrăm, cui le transmitem și ce drepturi aveți, conform Regulamentului (UE) 2016/679 (GDPR) și Legii nr. 190/2018.
          </p>
        }
      />
      <article className={`wrap ${styles.doc}`}>
        <p className={styles.meta}>Ultima actualizare: {updated}</p>

        <h2>Cine este operatorul datelor?</h2>
        {/* TODO: de confirmat cu clientul care firmă este operator (au și Audit and Consultancy SRL, CUI 40283372) */}
        <p>
          {company.legal.name}, CUI {company.legal.cui}, nr. Registrul Comerțului {company.legal.regCom}, cu sediul în {company.address}, județul{" "}
          {company.region}, denumită în continuare „Daiamar”. Pentru orice întrebare sau cerere legată de datele dumneavoastră, scrieți la{" "}
          <TrackedLink kind="email" href={`mailto:${company.email}`} placement="confidentialitate">{company.email}</TrackedLink> sau prin poștă la
          adresa de mai sus.
        </p>

        <h2>Pe scurt</h2>
        <ul>
          <li>Colectăm doar ce ne trimiteți dumneavoastră (formulare, apel înapoi, documente, abonare) și sursa vizitei, ca să știm din ce canal ați venit.</li>
          <li>Nu vindem date și nu le folosim pentru mesaje comerciale nesolicitate. Newsletterul pleacă numai după ce confirmați adresa.</li>
          <li>Google Tag Manager și Google Analytics se încarcă numai dacă acceptați statisticile. Fără acord nu se încarcă nimic de la Google și nu setăm alte cookie-uri decât cel care reține alegerea.</li>
          <li>Nu luăm decizii automate cu efecte asupra dumneavoastră și nu facem profilare.</li>
        </ul>

        <h2>Ce date prelucrăm, de ce, pe ce temei și cât timp?</h2>
        <p>Fiecare punct de mai jos este o prelucrare separată. Puteți folosi site-ul fără niciuna dintre ele, în afară de afișarea hărții.</p>
        {processings.map((p) => (
          <section key={p.title} className={styles.block}>
            <h3>{p.title}</h3>
            <dl>
              <div><dt>Date</dt><dd>{p.what}</dd></div>
              <div><dt>Scop</dt><dd>{p.why}</dd></div>
              <div><dt>Temei</dt><dd>{p.basis}</dd></div>
              <div><dt>Păstrare</dt><dd>{p.keep}.</dd></div>
            </dl>
            {p.note && <p className={styles.note}>{p.note}</p>}
          </section>
        ))}

        <h2>Cui transmitem datele?</h2>
        <p>Nu transmitem datele către terți pentru scopurile lor. Folosim însă furnizori care prelucrează date în numele nostru, pe bază de contract (persoane împuternicite):</p>
        <ul>
          <li><strong>Vercel Inc.</strong> (SUA), găzduirea site-ului și rularea codului care primește formularele.</li>
          <li>
            <strong>Neon Inc.</strong> (SUA), baza de date în care se salvează solicitările, abonații și evidența internă. Baza de date este găzduită în Uniunea
            Europeană.
            {/* TODO: de verificat la deploy că proiectul Neon este în regiunea aws-eu-central-1 (Frankfurt); altfel se schimbă fraza de mai sus. */}
          </li>
          <li><strong>Resend Inc.</strong> (SUA), trimiterea e-mailurilor: notificarea internă la o solicitare nouă, e-mailul de confirmare a abonării, ofertele.</li>
          <li><strong>Google Ireland Ltd.</strong>, Google Tag Manager și Google Analytics 4, numai cu consimțământul dumneavoastră.</li>
          <li><strong>OpenStreetMap Foundation</strong> (Regatul Unit), imaginile hărții; primește adresa IP la încărcarea hărții.</li>
          <li><strong>Epic Digital Hub</strong> (România), agenția care a realizat site-ul și îl întreține tehnic; are acces la panoul intern în calitate de persoană împuternicită, numai pentru întreținere și suport.</li>
          <li>autorități publice, dacă legea ne obligă.</li>
        </ul>
        <p>
          WhatsApp (Meta Platforms Ireland Ltd.) nu este persoană împuternicită a noastră: când ne scrieți pe WhatsApp, Meta prelucrează datele ca operator
          independent, conform propriilor condiții.
        </p>
        <p>
          Furnizorii din SUA pot prelucra date în afara Spațiului Economic European. Transferul se face în baza clauzelor contractuale standard aprobate de
          Comisia Europeană și, acolo unde furnizorul este certificat, a Cadrului UE-SUA privind confidențialitatea datelor (EU-US Data Privacy Framework).
        </p>

        <h2>Ce drepturi aveți?</h2>
        <ul>
          {rights.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p>
          Pentru exercitarea acestor drepturi, scrieți la{" "}
          <TrackedLink kind="email" href={`mailto:${company.email}`} placement="confidentialitate">{company.email}</TrackedLink>. Răspundem în cel mult o
          lună; dacă cererea este complexă, termenul se poate prelungi cu două luni, caz în care vă anunțăm. Ca să ne asigurăm că răspundem persoanei
          corecte, putem cere o confirmare a identității.
        </p>
        <p>
          Aveți și dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), B-dul G-ral
          Gheorghe Magheru nr. 28-30, sector 1, București,{" "}
          <a href="https://www.dataprotection.ro/" rel="noopener noreferrer" target="_blank">www.dataprotection.ro</a>.
        </p>

        <h2>Luăm decizii automate?</h2>
        <p>Nu. Nicio solicitare nu este tratată automat; fiecare este citită de un om din echipa Daiamar. Nu facem profilare.</p>

        <h2>Cum protejăm datele?</h2>
        <ul>
          <li>conexiune criptată (HTTPS) pe tot site-ul, inclusiv la trimiterea formularelor și a documentelor;</li>
          <li>documentele încărcate stau într-un spațiu privat, fără linkuri publice, și se descarcă doar din panoul intern, după autentificare;</li>
          <li>panoul intern este protejat cu parolă, iar accesul la el îl au doar persoanele din echipă și agenția care întreține site-ul;</li>
          <li>e-mailurile de notificare conțin datele solicitării și pleacă doar către adresele firmei;</li>
          <li>limităm numărul de trimiteri de pe aceeași adresă IP, ca să prevenim abuzurile; adresa IP nu se salvează.</li>
        </ul>

        <h2>Minori</h2>
        <p>
          Serviciile noastre se adresează firmelor și persoanelor care administrează o activitate economică. Nu colectăm cu intenție date de la persoane sub
          16 ani. Dacă aflăm că am primit astfel de date, le ștergem.
        </p>

        <h2>Modificări ale acestei politici</h2>
        <p>
          Dacă modificăm politica, publicăm versiunea nouă pe această pagină, cu data actualizării. Pentru modificări care vă afectează (de exemplu un
          furnizor nou sau un scop nou), vă anunțăm și prin e-mail, dacă avem adresa dumneavoastră. Politica de cookie-uri este pe{" "}
          <Link href="/cookies/">pagina dedicată</Link>.
        </p>
      </article>
      <CtaBand placement="confidentialitate" title="Aveți o întrebare despre datele dumneavoastră?" />
    </>
  );
}
