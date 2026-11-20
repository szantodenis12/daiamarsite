import type { Metadata } from "next";
import { CalendarClock, FileCheck, FileText, Gavel, ShieldCheck } from "lucide-react";
import { company } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import Landing, { type LandingContent } from "../_shared/Landing";

export const metadata: Metadata = pageMeta({
  title: "Aveți un control ANAF? Reprezentare în Oradea",
  description: `Reprezentare la controale ANAF și ITM pentru firme din toată țara. Peste 20 de ani de experiență în cadrul ANAF, divizia control fiscal. Sunați la ${company.phones[0].label}.`,
  path: "/control-anaf/",
  noindex: true,
});

const content: LandingContent = {
  slug: "control-anaf",
  service: "reprezentare-controale-anaf",
  title: "Aveți un control?",
  subtitle: "Vă reprezentăm în fața ANAF.",
  intro:
    "Monica Diana Pop a stat peste 20 de ani de cealaltă parte a mesei, în divizia control fiscal a ANAF. Procedura o știe din interior: avizul, termenele, discuția finală, contestația. Sunați înainte de data de începere din aviz.",
  form: {
    title: "Ați primit un aviz de inspecție?",
    text: "Lăsați-ne numărul și vă sunăm. Avizul ni-l trimiteți după discuție, nu prin acest formular.",
  },
  help: {
    heading: "Cu ce vă ajutăm",
    lede: "Reprezentare în cadrul controalelor efectuate de ANAF (inspecții generale, parțiale) și ITM.",
    items: [
      { icon: FileCheck, title: "Pregătirea înainte de control", text: "Verificăm evidența pentru perioada din aviz și punem documentele în ordine." },
      { icon: ShieldCheck, title: "Reprezentare în timpul inspecției", text: "Pe bază de împuternicire, în relația cu organul de inspecție fiscală." },
      { icon: FileText, title: "Răspunsul la constatările inspectorilor", text: "Înainte de raportul final aveți dreptul să vă spuneți punctul de vedere. Îl scriem noi, în termenul legal, cu argumente de fapt și de drept." },
      { icon: Gavel, title: "Contestații și acțiuni în instanță", text: "Contestația la decizia de impunere, în termen de 45 de zile de la comunicare." },
      { icon: CalendarClock, title: "Dosare de eșalonare", text: "Dacă rezultă obligații de plată, întocmim documentația pentru eșalonare." },
    ],
  },
  steps: {
    heading: "Cum decurge",
    items: [
      { title: "Ne trimiteți avizul", text: "Perioada și obligațiile verificate sunt în aviz. De aici stabilim ce documente contează." },
      { title: "Verificăm evidența", text: "Balanțe, declarații, fișa pe plătitor, contracte. Vă spunem ce lipsește înainte să întrebe inspectorii." },
      { title: "Vă reprezentăm", text: "Pe parcursul inspecției, la discuția finală și, dacă este cazul, în contestație." },
    ],
  },
  note:
    "Nu facem promisiuni privind rezultatul unui control sau al unei contestații. Ce putem asigura: procedura respectată, termenele urmărite și documentele în ordine.",
  faq: [
    {
      q: "Cât timp am la dispoziție după primirea avizului?",
      a: "Avizul se trimite cu 15 zile înainte de începerea inspecției (30 de zile pentru marii contribuabili). Puteți cere o singură dată amânarea, pentru motive justificate.",
    },
    {
      q: "Ce documente pregătesc?",
      a: "Registrele și balanțele pentru perioada din aviz, declarațiile depuse, jurnalele de TVA, facturile, contractele, extrasele de cont și documentele de personal, când se verifică contribuțiile.",
    },
  ],
};

export default function ControlAnafPage() {
  return <Landing content={content} />;
}
