import type { Metadata } from "next";
import { BarChart3, ClipboardList, Layers, MonitorSmartphone, SearchCheck } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import Landing, { type LandingContent } from "../_shared/Landing";

export const metadata: Metadata = pageMeta({
  title: "Schimbați contabilul? Contabilitate în Oradea",
  description: "Schimbați contabilul? Daiamar preia evidența firmei, o verifică și vă spune ce a găsit. Situații lunare pentru decizii, contabilitate adaptată activității.",
  path: "/schimba-contabilul/",
  noindex: true,
});

const content: LandingContent = {
  slug: "schimba-contabilul",
  service: "contabilitate",
  title: "Schimbați contabilul?",
  subtitle: "Preluăm evidența, o verificăm și vă spunem ce am găsit.",
  intro:
    "Dacă nu primiți la timp situațiile de care aveți nevoie pentru decizii, puteți schimba contabilul fără să rămână vreo lună neacoperită. Vă spunem ce documente cereți la predare și preluăm de la următoarea lună închisă.",
  form: {
    title: "Spuneți-ne ce vă lipsește acum",
    text: "Tipul firmei, domeniul, numărul de angajați și ce situații ați vrea să primiți lunar. Vă contactăm pentru pașii de preluare.",
  },
  help: {
    heading: "Cu ce vă ajutăm",
    lede: "Preluarea evidenței de la contabilul actual și situațiile lunare pentru conducere.",
    items: [
      { icon: ClipboardList, title: "Lista de predare-primire", text: "Ce documente și accesuri cereți de la contabilul actual, ca nimic să nu rămână în urmă." },
      { icon: SearchCheck, title: "Verificarea evidenței preluate", text: "Balanța, fișa pe plătitor din SPV, declarațiile depuse, soldurile. Vă spunem ce am găsit." },
      {
        icon: BarChart3,
        title: "Situații și analize economice",
        text: "Lunare sau trimestriale, adaptate la cerințele persoanelor de conducere. Conținutul, formatul și limba le stabiliți dumneavoastră.",
      },
      { icon: MonitorSmartphone, title: "Programe adaptate activității", text: "Programe de contabilitate adaptate la obiectul de activitate, cu operare online." },
      { icon: Layers, title: "Grupuri de firme", text: "Bilanțuri consolidate pentru grupuri de firme, inclusiv firme afiliate din state UE și non UE." },
    ],
  },
  steps: {
    heading: "Cum decurge preluarea",
    items: [
      { title: "Discutăm ce vă lipsește", text: "Ce situații nu primiți, ce termene s-au ratat, ce vă trebuie lunar." },
      { title: "Stabilim data și lista", text: "Data predării, după ultima lună închisă, și lista documentelor și accesurilor de transferat." },
      { title: "Preluăm și verificăm", text: "Verificăm evidența preluată și vă spunem ce este în regulă, ce lipsește și ce trebuie corectat." },
    ],
  },
  note:
    "Verificăm situația firmei, nu pe contabilul anterior. Nu facem comparații între contabili; vă spunem ce am găsit și ce propunem.",
  faq: [
    {
      q: "Când este momentul potrivit pentru schimbare?",
      a: "După depunerea declarațiilor pentru luna sau trimestrul încheiat, ori după depunerea situațiilor financiare anuale. Așa nu rămâne o perioadă fără responsabil.",
    },
    {
      q: "Trebuie să anunț eu contabilul actual?",
      a: "Da, conform preavizului din contractul pe care îl aveți. Vă spunem ce documente să cereți la predare.",
    },
    {
      q: "Ce se întâmplă dacă găsiți erori în evidența preluată?",
      a: "Vi le prezentăm, cu propunerea de corectare și termenul. Declarațiile rectificative se depun cu acordul dumneavoastră.",
    },
  ],
};

export default function SchimbaContabilulPage() {
  return <Landing content={content} />;
}
