import type { Metadata } from "next";
import { BookOpen, Calculator, Landmark, Scale, ShieldCheck, Users } from "lucide-react";
import { company } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import Landing, { type LandingContent } from "../_shared/Landing";

export const metadata: Metadata = pageMeta({
  title: "Ai deschis o firmă? Contabilitate în Oradea",
  description: `Ai deschis o firmă sau un PFA în Oradea? Daiamar îți explică obligațiile firmei și se ocupă de contabilitate de la primele documente. Sună la ${company.phones[0].label}.`,
  path: "/firme-noi/",
  noindex: true,
});

// Copy taken from the ONRC flyer (September 2026), which uses the informal register.
const content: LandingContent = {
  slug: "firme-noi",
  service: "contabilitate",
  register: "tu",
  title: "Ai deschis o firmă?",
  subtitle: "Ne ocupăm de contabilitate.",
  intro:
    "La început de drum, ai nevoie să știi ce ai de făcut și pe cine te poți baza. La Daiamar, îți explicăm clar obligațiile firmei și ne ocupăm de contabilitate, de la primele documente.",
  form: {
    title: "Ai firma înființată. Ce urmează?",
    text: "Sună-ne sau lasă-ne datele și îți explicăm ce documente sunt necesare și care sunt pașii următori.",
  },
  help: {
    heading: "Cu ce te ajutăm",
    lede: "De la contabilitatea lunară la consultanță fiscală și asistență în relația cu autoritățile.",
    items: [
      { icon: BookOpen, title: "Contabilitate", text: "Ne ocupăm de evidența contabilă pentru SRL-uri și PFA-uri." },
      {
        icon: Calculator,
        title: "Consultanță fiscală",
        text: "Analizăm costurile și opțiunile fiscale și pregătim documentația pentru eșalonarea obligațiilor de plată.",
      },
      { icon: ShieldCheck, title: "Asistență la controale ANAF și ITM", text: "Te asistăm și te reprezentăm pe parcursul controalelor." },
      {
        icon: Landmark,
        title: "TVA și fonduri europene",
        text: "Pregătim cereri de rambursare a TVA din statele UE și te informăm despre programele de finanțare disponibile.",
      },
      { icon: Scale, title: "Servicii juridice", text: "Oferim sprijin pentru contestații și acțiuni în instanță." },
      {
        icon: Users,
        title: "Resurse umane",
        text: "Te ajutăm cu documentația pentru angajarea cetățenilor străini și cu obținerea documentelor A1 pentru salariații care lucrează în UE.",
      },
    ],
  },
  steps: {
    heading: "Cum începem",
    items: [
      { title: "Ne suni sau trimiți formularul", text: "Spune-ne ce firmă ai (SRL sau PFA), ce activitate și dacă ai angajați." },
      { title: "Îți explicăm obligațiile firmei", text: "Ce declarații ai de depus, ce termene trebuie respectate și ce documente să păstrezi." },
      { title: "Preluăm contabilitatea", text: "De la primele documente. Urmărim schimbările legislative și îți spunem ce înseamnă pentru firma ta." },
    ],
  },
  note:
    "Suntem o societate de contabilitate din Oradea, membră CECCAR, cu peste 20 de ani de experiență. Lucrăm cu SRL-uri și PFA-uri din diverse domenii, de la înființare și pe tot parcursul activității. Vorbim română, engleză și italiană.",
  faq: [
    {
      q: "Am PFA, nu SRL. Mă puteți ajuta?",
      a: "Da. Ținem contabilitatea pentru societăți comerciale, persoane fizice autorizate și întreprinderi individuale.",
    },
    {
      q: "Trebuie să vin la birou?",
      a: "Nu neapărat. Documentele se pot transmite electronic, iar programele de contabilitate permit operare online. Ne vedem la birou când este nevoie.",
    },
    {
      q: "Cât costă contabilitatea pentru o firmă nouă?",
      a: "Depinde de volumul de documente, de numărul de angajați și de regimul de TVA. Primești o ofertă după o discuție despre firma ta.",
    },
  ],
};

export default function FirmeNoiPage() {
  return <Landing content={content} />;
}
