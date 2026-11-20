import type { Metadata } from "next";
import { company } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import LanguagePage, { type LanguageContent } from "../_shared/LanguagePage";

const title = "Servizi di contabilità a Oradea, CECCAR";
const description =
  "Daiamar: studio di contabilità membro CECCAR a Oradea, Romania. Oltre 20 anni di esperienza in ANAF, assistenza nelle verifiche fiscali, audit, buste paga.";

export const metadata: Metadata = pageMeta({ title, description, path: "/it/", languages: { ro: "/", en: "/en/", it: "/it/", "x-default": "/" } });

// A1 and work permits stay under "Altri servizi".
const content: LanguageContent = {
  lang: "it",
  title: <>Servizi di contabilità a Oradea</>,
  intro: (
    <>
      Daiamar è uno studio di contabilità membro del CECCAR a Oradea, Romania, in {company.street}. Oltre 20 anni di esperienza in
      ambito ANAF (Agenzia fiscale), dipartimento ispezione fiscale. Assistenza durante le verifiche fiscali, audit interno ed esterno,
      contabilità, consulenza fiscale, risorse umane e servizi giuridici. Lavoriamo in rumeno, inglese e italiano.
    </>
  ),
  servicesHeading: "Di cosa si occupa Daiamar?",
  services: [
    { title: "Servizi di contabilità", text: "Contabilità per società e ditte individuali (PFA, ÎI), adattata all'attività." },
    { title: "Servizi di consulenza", text: "Analisi dei costi, ottimizzazione fiscale, pratiche di rateizzazione, assistenza durante le verifiche ANAF." },
    { title: "Risorse umane", text: "Buste paga, amministrazione del personale, registro generale dei dipendenti." },
    { title: "Servizi giuridici", text: "Costituzione di società, modifiche societarie, contenzioso tramite avvocati partner." },
    { title: "Audit interno ed esterno", text: "Audit per le imprese; l'ambito viene stabilito con ogni cliente." },
  ],
  otherKicker: "Altri servizi",
  other: ["Rimborso dell'IVA da paesi membri dell'UE", "Ottenimento del documento portatile A1", "Permessi di lavoro per cittadini UE e non UE"],
  workHeading: "Come lavoriamo?",
  values: "Lealtà e rispetto verso i clienti, qualità e performance, continuo perfezionamento del team Daiamar.",
  approach:
    "La conoscenza della normativa del settore e l'aggiornamento continuo sulle modifiche legislative, contabili e fiscali permettono agli esperti Daiamar di offrire ai clienti soluzioni contabili, fiscali e finanziarie integrate, in stretta correlazione con le esigenze dei clienti e con le tendenze economiche europee e mondiali.",
  closing: "Monica Diana Pop ha lavorato oltre 20 anni nella divisione controllo fiscale dell'ANAF.",
  description,
  path: "/it/",
  contactHeading: "Hai bisogno d'aiuto? Contattaci!",
  contactText: "Chiamaci oppure invia una richiesta tramite il modulo di contatto: rispondiamo in italiano.",
  requestLabel: "Invia una richiesta",
  labels: { email: "E-mail", address: "Indirizzo", languages: "Lingue" },
  languages: "Rumeno, inglese, italiano",
};

export default function ItPage() {
  return <LanguagePage content={content} />;
}
