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

const title = "Termeni și condiții de utilizare a site-ului";
const description =
  "Termenii de utilizare ai site-ului daiamar.ro: conținut informativ, formulare și documente trimise, newsletter, drepturi de autor, răspundere, legea aplicabilă.";

export const metadata: Metadata = pageMeta({ title, description, path: "/termeni/" });

const updated = "06.11.2026";

export default function TermeniPage() {
  return (
    <>
      <JsonLd
        data={baseGraph(
          webPageSchema("/termeni/", title, description),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Termeni și condiții", path: "/termeni/" },
          ]),
        )}
      />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Termeni și condiții" }]}
        title="Termeni și condiții"
        intro={<p>Condițiile în care puteți folosi site-ul daiamar.ro. Prin folosirea site-ului, acceptați acești termeni.</p>}
      />
      <article className={`wrap ${styles.doc}`}>
        <p className={styles.meta}>Ultima actualizare: {updated}</p>

        <h2>Cine administrează site-ul?</h2>
        {/* TODO: de confirmat cu clientul care firmă este operator (au și Audit and Consultancy SRL, CUI 40283372) */}
        <p>
          Site-ul daiamar.ro este administrat de {company.legal.name}, CUI {company.legal.cui}, nr. Registrul Comerțului {company.legal.regCom}, cu
          sediul în {company.address}, județul {company.region}, societate membră CECCAR, denumită în continuare „Daiamar”.
        </p>

        <h2>Ce caracter are conținutul?</h2>
        <p>
          Informațiile de pe site, inclusiv articolele din secțiunea Resurse și newsletterul „Noutăți fiscale”, au caracter general și informativ.
          Ele nu constituie consultanță contabilă, fiscală sau juridică pentru o situație concretă și nu înlocuiesc o discuție cu un specialist.
          Legislația se modifică; verificați termenele și sumele înainte de a lua o decizie pe baza lor.
        </p>
        <p>
          Serviciile Daiamar se prestează numai pe baza unui contract scris, încheiat separat. Prezentarea serviciilor pe site nu reprezintă o
          ofertă fermă. Ofertele transmise individual, pe e-mail sau printr-un link online, sunt valabile în termenul scris pe ele.
        </p>

        <h2>Cum folosiți formularele de pe site?</h2>
        <ul>
          <li>furnizați date corecte, ca să vă putem contacta;</li>
          <li>nu trimiteți prin formularul de solicitare sau prin „Vă sunăm noi” documente contabile ori date bancare; pentru documente există pagina dedicată;</li>
          <li>nu folosiți formularele pentru mesaje comerciale nesolicitate;</li>
          <li>trimiterea unei solicitări nu creează o relație contractuală.</li>
        </ul>

        <h2>Cum trimiteți documente?</h2>
        <ul>
          <li>pagina „Trimiteți documente” acceptă PDF, JPG, PNG și HEIC, cel mult 5 fișiere de 10 MB fiecare la o trimitere;</li>
          <li>trimiteți doar documente pe care aveți dreptul să le transmiteți; pentru datele altor persoane din ele (de exemplu angajați), dumneavoastră răspundeți de temeiul transmiterii;</li>
          <li>fișierele pe care sistemul nu le recunoaște ca fiind de tipul declarat sunt respinse;</li>
          <li>primirea documentelor nu înseamnă începerea unei colaborări și nu înlocuiește contractul.</li>
        </ul>

        <h2>Newsletterul „Noutăți fiscale”</h2>
        <p>
          Abonarea se face cu adresa de e-mail și acordul dumneavoastră și devine activă numai după ce confirmați adresa din e-mailul primit. Vă
          puteți dezabona oricând, din linkul aflat în fiecare e-mail. Nu transmitem adresele abonaților către terți pentru scopurile lor.
        </p>

        <h2>WhatsApp</h2>
        <p>
          Butonul WhatsApp deschide o conversație cu numărul {company.whatsapp.label}. Conversația are loc în aplicația WhatsApp, în condițiile Meta.
          Nu trimiteți pe WhatsApp documente cu date bancare sau cu date ale altor persoane; folosiți pagina de trimitere a documentelor.
        </p>
        <p>Modul în care prelucrăm datele din formulare, documente și newsletter este descris în <Link href="/confidentialitate/">Politica de confidențialitate</Link>.</p>

        <h2>Cui aparține conținutul?</h2>
        <p>
          Textele, structura și elementele grafice ale site-ului aparțin Daiamar sau sunt folosite cu acordul titularilor. Puteți cita fragmente
          scurte cu indicarea sursei. Reproducerea integrală sau folosirea comercială a conținutului necesită acordul nostru scris.
        </p>

        <h2>Linkuri către alte site-uri</h2>
        <p>
          Site-ul conține linkuri către site-uri ale autorităților sau ale altor terți (de exemplu ANAF, ANPC, Google Maps, Waze, OpenStreetMap). Nu
          răspundem pentru conținutul sau practicile acestora.
        </p>

        <h2>Care este răspunderea Daiamar?</h2>
        <p>
          Ne străduim ca informațiile să fie corecte la data publicării, dar nu garantăm că sunt complete sau actuale în orice moment. Nu răspundem
          pentru pagube rezultate din folosirea informațiilor de pe site fără verificare, nici pentru întreruperi temporare ale site-ului.
        </p>

        <h2>Soluționarea litigiilor</h2>
        <p>
          Acești termeni sunt guvernați de legea română. Eventualele litigii se soluționează pe cale amiabilă sau, dacă nu este posibil, de
          instanțele competente din România. Dacă sunteți consumator, puteți apela la Autoritatea Națională pentru Protecția Consumatorilor și la
          mecanismul de soluționare alternativă a litigiilor (SAL),{" "}
          <a href="https://anpc.ro/sal" rel="noopener noreferrer" target="_blank">anpc.ro/sal</a>, respectiv la pagina Comisiei Europene pentru
          soluționarea litigiilor în materie de consum,{" "}
          <a href="https://consumer-redress.ec.europa.eu/index_ro" rel="noopener noreferrer" target="_blank">consumer-redress.ec.europa.eu</a>.
        </p>

        <h2>Contact</h2>
        <p>
          {company.name}, {company.address}, e-mail{" "}
          <TrackedLink kind="email" href={`mailto:${company.email}`} placement="termeni">{company.email}</TrackedLink>.
        </p>
      </article>
      <CtaBand placement="termeni" />
    </>
  );
}
