import type { FaqItem } from "@/components/ui/Faq";
import type { SiteImage } from "@/lib/images";

export type Section = {
  title: string;
  text?: string[];
  list?: string[];
  after?: string;
};

export type Article = {
  slug: string;
  title: string;
  // Still life generated with Higgsfield for the guide (no people, no readable text); raw files in _ref/ghiduri-higgsfield/.
  cover: SiteImage;
  metaTitle: string;
  description: string;
  published: string;
  updated: string;
  // Set to true only after Daiamar has validated the text. Until then the article is noindex, out of the sitemap and has no byline.
  reviewed: boolean;
  // Service slugs the article supports; used for the "Servicii conexe" links in both directions.
  services: string[];
  lead: string;
  sections: Section[];
  faq: FaqItem[];
  related: { href: string; label: string };
};

export const author = "Echipa Daiamar";

/*
Sources checked on 05.11.2026. Figures and article numbers come from these, not from memory:
- Codul fiscal art. 47 (plafon microîntreprindere 100.000 EUR de la 01.01.2026). Cotele micro nu sunt citate: OUG 89/24.12.2025 a schimbat regimul, de confirmat cu Daiamar.
  fiscalitatea.ro/plafoane-fiscale-2026-24595/ (22.12.2025), contzilla.ro/plafoane-fiscale-2026-micro-tva-intrastat/
- O.G. nr. 22/2025, plafon TVA 395.000 lei de la 01.09.2025: aceleași surse
- RO e-Factura B2B (firme stabilite în România) și B2C de la 01.01.2025 (O.U.G. 69/2024):
  static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_RO_eFactura.pdf, ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eInvoicing+in+Romania (ro-lint: ignore)
- SAF-T (D406) obligatoriu și pentru contribuabilii mici din 2025: contzilla.ro/saf-t-obligatoriu-din-2025-pentru-firmele-mici/
- Legea contabilității nr. 82/1991: art. 10 (organizarea contabilității, contracte cu membri CECCAR), art. 36 (situații financiare în 150 de zile);
  Legea nr. 36/2023 (păstrare 5 ani de la 1 iulie a anului următor, inclusiv state de salarii):
  contabilul.manager.ro/a/27941/termenul-de-pastrare-a-documentelor-justificative.html
- REGES-Online, H.G. nr. 295/2025 (contract transmis cel târziu în ziua anterioară începerii activității; aceeași regulă exista în H.G. 905/2017):
  startco.ro/blog/reges-online/, inspectiamuncii.ro comunicat 21.01.2026
- Legea nr. 207/2015 (Codul de procedură fiscală), text consolidat ANAF, static.anaf.ro/static/10/Anaf/legislatie/Cod_Procedura_Fiscala_2023.htm:
  art. 18 (împuterniciți), art. 122 (aviz: 30 de zile mari contribuabili / 15 zile ceilalți; amânare o singură dată), art. 124 (colaborare),
  art. 125 (locul: de regulă la sediul organului fiscal), art. 126 (durata: 180 / 90 / 45 de zile), art. 127 (suspendare), art. 128 (reverificare),
  art. 130 (discuție finală după cel puțin 3 / 5 zile lucrătoare; punct de vedere scris în 5 / 7 zile lucrătoare), art. 131 (raport),
  art. 133 (decizie de impunere provizorie), art. 158 (certificat de atestare fiscală), art. 270 (contestație în 45 de zile)
- O.M.F.P. nr. 2634/2015 (documentele financiar-contabile, proces-verbal de predare-primire): portalcodulfiscal.ro/model-proces-verbal-predare-primire-documente-contabile-74281.htm
*/
export const articles: Article[] = [
  {
    slug: "obligatii-firma-noua-primul-an",
    cover: { src: "/img/ghiduri/firme-noi.jpg", alt: "Dosar nou deschis pe birou, cu ștampilă, stilou și calculator" },
    title: "Ce obligații are o firmă nou înființată în primul an",
    metaTitle: "Obligațiile unei firme noi în primul an",
    description:
      "Ce obligații are o firmă nou înființată în primul an: vector fiscal, contabilitate, impozit micro sau profit, TVA, e-Factura, angajați, situații financiare.",
    published: "2026-11-05",
    updated: "2026-11-06",
    reviewed: false,
    services: ["infiintari-lichidari-firme", "contabilitate"],
    lead:
      "O firmă nou înființată are obligații fiscale și contabile din prima lună, chiar dacă nu a emis nicio factură. Acest ghid trece prin ce trebuie făcut în primul an: înregistrarea fiscală, contabilitatea, declarațiile, TVA, facturarea electronică, angajații și situațiile financiare anuale. Informațiile sunt generale și valabile la data publicării; regulile exacte depind de activitatea firmei.",
    sections: [
      {
        title: "Ce se întâmplă imediat după înmatricularea la ONRC?",
        text: [
          "După înmatriculare, firma primește certificatul de înregistrare și codul unic de identificare (CUI). Din acest moment există ca persoană juridică și are obligații, indiferent dacă a început sau nu activitatea.",
        ],
        list: [
          "Vectorul fiscal: la înființare, firma declară ce impozite și taxe datorează (impozit pe veniturile microîntreprinderilor sau impozit pe profit, TVA, contribuții pentru salariați). Orice modificare ulterioară se declară la ANAF prin formularul 700, în termenul prevăzut de Codul de procedură fiscală.",
          "Spațiul Privat Virtual (SPV): comunicarea cu ANAF se face electronic. Firma are nevoie de acces la SPV, prin administrator sau prin contabilul împuternicit.",
          "Contul bancar: capitalul social se varsă în cont, iar încasările și plățile firmei trec prin conturile firmei, nu prin conturile personale ale asociaților.",
          "Beneficiarul real: declarația privind beneficiarul real se depune la Registrul Comerțului la înmatriculare și ori de câte ori datele se modifică.",
        ],
      },
      {
        title: "Cine ține contabilitatea și de când?",
        text: [
          "Potrivit Legii contabilității nr. 82/1991, fiecare societate organizează și conduce contabilitatea de la înființare. Contabilitatea poate fi ținută de un angajat cu studii economice sau pe bază de contract cu o persoană fizică sau juridică membră CECCAR.",
          "Primele documente contează: actul constitutiv, dovada capitalului vărsat, facturile și chitanțele de la înființare intră în evidență din prima lună. Lunar, contabilul întocmește registrul jurnal, fișele de cont și balanța de verificare.",
          "Documentele justificative și registrele se păstrează 5 ani, calculați de la 1 iulie a anului următor încheierii exercițiului financiar în care au fost întocmite (Legea nr. 36/2023). Regula se aplică și statelor de salarii.",
        ],
      },
      {
        title: "Microîntreprindere sau impozit pe profit?",
        text: [
          "O firmă nouă plătește, dacă îndeplinește condițiile din Codul fiscal (inclusiv cele privind salariații și asociații), impozit pe veniturile microîntreprinderilor. De la 1 ianuarie 2026, plafonul de încadrare este de 100.000 euro venituri (art. 47 Cod fiscal). Cota se verifică în Codul fiscal în vigoare la data încadrării.",
          "Dacă firma nu îndeplinește condițiile sau depășește plafonul, trece la impozit pe profit. Impozitul pe veniturile microîntreprinderilor se declară și se plătește trimestrial (formularul 100). Impozitul pe profit se declară trimestrial, cu regularizare anuală prin formularul 101.",
        ],
      },
      {
        title: "Trebuie să mă înregistrez în scopuri de TVA?",
        text: [
          "Nu automat. Firma devine obligatoriu plătitoare de TVA când cifra de afaceri depășește plafonul de 395.000 lei (O.G. nr. 22/2025, în vigoare de la 1 septembrie 2025). Înregistrarea se poate cere și de la început, prin opțiune, de exemplu dacă firma are TVA de recuperat din investiții sau lucrează cu clienți plătitori de TVA.",
          "După înregistrare, firma depune decontul de TVA (formularul 300) lunar sau trimestrial și declarațiile recapitulative pentru operațiuni intracomunitare, când este cazul. Dacă achizițiile intracomunitare de bunuri depășesc 34.000 lei pe an, firma neînregistrată în scopuri de TVA obține cod special de TVA înainte de achiziția care depășește plafonul. Pentru servicii cumpărate din UE, codul special se cere de la prima achiziție.",
        ],
      },
      {
        title: "Ce înseamnă e-Factura și SAF-T pentru o firmă nouă?",
        text: [
          "Facturile emise către alte firme stabilite în România se transmit obligatoriu prin sistemul RO e-Factura, iar de la 1 ianuarie 2025 și facturile către persoane fizice. Firma are nevoie de acces la SPV și de un program de facturare conectat la sistem.",
          "Separat, declarația informativă D406 (SAF-T) este obligatorie și pentru contribuabilii mici începând cu 2025; termenele urmează perioada fiscală a firmei. Ambele cad, de regulă, în sarcina contabilului, dar firma trebuie să îi asigure accesul și documentele la timp.",
        ],
      },
      {
        title: "Ce obligații apar la primul angajat?",
        list: [
          "Contractul individual de muncă se semnează înainte de începerea activității și se transmite în registrul salariaților (REGES-Online) cel târziu în ziua anterioară primei zile de lucru.",
          "Lunar sau trimestrial, firma depune declarația 112 și plătește impozitul pe venit și contribuțiile sociale reținute.",
          "Dosarul fiecărui angajat: fișa postului, regulamentul intern, evidența timpului de lucru, concediile, adeverințele.",
          "Controlul medical la angajare și instruirea de securitate și sănătate în muncă se fac înainte de începerea activității.",
        ],
      },
      {
        title: "Ce depune firma la sfârșitul primului an?",
        text: [
          "Situațiile financiare anuale se depun în termen de 150 de zile de la încheierea exercițiului financiar, chiar dacă firma a avut activitate doar câteva luni. Dacă firma nu a avut deloc activitate de la înființare, depune o declarație de inactivitate în locul situațiilor financiare.",
          "Tot la început de an se verifică încadrarea fiscală pentru anul următor (microîntreprindere sau impozit pe profit, perioada fiscală de TVA) și se actualizează vectorul fiscal dacă s-a schimbat ceva.",
        ],
      },
      {
        title: "Ce riscă o firmă care nu respectă termenele?",
        text: [
          "Nedepunerea declarațiilor la termen se sancționează cu amenzi, iar obligațiile neplătite acumulează dobânzi și penalități. Nedepunerea situațiilor financiare poate duce la declararea firmei ca inactivă fiscal. Sumele exacte sunt în Codul de procedură fiscală și în Legea contabilității și se modifică periodic.",
        ],
      },
      {
        title: "Lista scurtă pentru primul an",
        list: [
          "Contract cu un contabil din prima lună și acces la SPV.",
          "Vector fiscal corect: micro sau profit, TVA, salariați.",
          "Facturi emise prin e-Factura; D406 (SAF-T) la termen.",
          "Declarația 100 trimestrial; 300 și 112 dacă sunt în vectorul fiscal.",
          "Contracte de muncă transmise în REGES înainte de prima zi de lucru.",
          "Situații financiare anuale în 150 de zile de la închiderea exercițiului.",
          "Documentele păstrate 5 ani, ordonate pe luni.",
        ],
        after:
          "Daiamar explică obligațiile firmei la prima întâlnire și preia contabilitatea de la primele documente.",
      },
    ],
    faq: [
      {
        q: "Trebuie să am contabil din prima lună?",
        a: "Da. Contabilitatea se conduce de la înființare, iar primele declarații pot fi scadente la o lună după înmatriculare, în funcție de vectorul fiscal.",
      },
      {
        q: "O firmă nouă plătește TVA?",
        a: "Nu, până la depășirea plafonului de 395.000 lei cifră de afaceri sau până la înregistrarea prin opțiune. Până atunci, facturile se emit fără TVA, iar TVA din achiziții nu se deduce.",
      },
      {
        q: "Ce impozit plătește o firmă nouă în 2026?",
        a: "Dacă îndeplinește condițiile de microîntreprindere, impozit pe veniturile microîntreprinderilor; altfel, impozit pe profit. Cotele și condițiile se verifică în Codul fiscal în vigoare, pentru că s-au modificat de mai multe ori în ultimii ani.",
      },
      {
        q: "Dacă firma nu are activitate, mai am obligații?",
        a: "Da. Declarațiile din vectorul fiscal se depun și cu zero, iar la sfârșitul anului se depun situațiile financiare sau declarația de inactivitate, după caz.",
      },
      {
        q: "Ce documente îi dau contabilului lunar?",
        a: "Facturile emise și primite, extrasele de cont, chitanțele și bonurile cu numărul de înregistrare fiscală al firmei, contractele noi și documentele de personal (angajări, încetări, concedii).",
      },
    ],
    related: { href: "/firme-noi/", label: "Contabilitate pentru firme noi" },
  },
  {
    slug: "control-fiscal-anaf-cum-decurge",
    cover: { src: "/img/ghiduri/control-anaf.jpg", alt: "Bibliorafturi ordonate pe raft și un dosar cu separatoare pregătit pe birou" },
    title: "Cum se desfășoară un control fiscal ANAF și cum vă pregătiți",
    metaTitle: "Cum decurge un control fiscal ANAF",
    description:
      "Pașii unui control fiscal ANAF după Codul de procedură fiscală: aviz, durată, drepturile contribuabilului, raport, decizie, contestație în 45 de zile.",
    published: "2026-11-05",
    updated: "2026-11-06",
    reviewed: false,
    services: ["reprezentare-controale-anaf", "audit-intern-extern", "consultanta-fiscala"],
    lead:
      "Un control fiscal ANAF (inspecția fiscală) urmează o procedură scrisă în Codul de procedură fiscală: aviz, verificare, proiect de raport, discuție finală, raport și decizie de impunere. Contribuabilul are drepturi și termene la fiecare pas.",
    sections: [
      {
        title: "Cum aflați că urmează un control?",
        text: [
          "Înainte de inspecție, organul fiscal trimite un aviz de inspecție fiscală, în scris (art. 122). Avizul se trimite cu 30 de zile înainte pentru marii contribuabili și cu 15 zile înainte pentru ceilalți contribuabili. Puteți renunța la acest termen dacă doriți să înceapă mai repede.",
          "Avizul cuprinde temeiul juridic, data de începere, obligațiile fiscale și perioadele care vor fi verificate. În câteva situații, avizul se comunică chiar la începerea inspecției: firme în insolvență, un control inopinat care impune începerea imediată a inspecției, extinderea inspecției la alte perioade sau refacerea ei după o contestație.",
        ],
      },
      {
        title: "Puteți cere amânarea?",
        text: [
          "Da, o singură dată și pentru motive justificate (art. 122 alin. 5). Amânarea se aprobă sau se respinge prin decizie a conducătorului activității de inspecție, iar decizia menționează noua dată. Folosiți perioada până la începere pentru a pune ordine în documente, nu pentru a amâna fără motiv.",
        ],
      },
      {
        title: "Unde și cât durează un control?",
        text: [
          "Inspecția se desfășoară, de regulă, la sediul organului fiscal (art. 125). La cererea motivată a contribuabilului, se poate desfășura la sediul firmei; cererea se soluționează în 3 zile, iar lipsa unui răspuns înseamnă acceptare tacită.",
          "Durata este stabilită de organul fiscal în funcție de obiective și nu poate depăși (art. 126): 180 de zile pentru contribuabilii mari, pentru cei cu sedii secundare și pentru nerezidenți; 90 de zile pentru contribuabilii mijlocii; 45 de zile pentru ceilalți contribuabili. Dacă inspecția nu se încheie în dublul acestei perioade, fără a socoti suspendările legale, ea încetează fără raport și fără decizie.",
          "Suspendarea inspecției (art. 127), de exemplu pentru controale încrucișate la parteneri, prelungește în practică durata. Cereți să vi se comunice în scris fiecare suspendare și reluare.",
        ],
      },
      {
        title: "Ce trebuie să puneți la dispoziție?",
        text: [
          "Contribuabilul are obligația să colaboreze: să dea informații și să prezinte la locul inspecției toate documentele și datele necesare clarificării situației fiscale (art. 124). La începerea inspecției, puteți numi persoanele care dau informații în numele firmei.",
        ],
        list: [
          "Registrele contabile, balanțele de verificare și fișele de cont pentru perioada verificată.",
          "Declarațiile depuse și recipisele; jurnalele de vânzări și cumpărări; deconturile de TVA.",
          "Facturile emise și primite, contractele cu clienții și furnizorii, extrasele de cont.",
          "Documentele de personal și statele de salarii, dacă inspecția vizează contribuțiile.",
          "Inventarele, evidența mijloacelor fixe, documentele pentru tranzacțiile cu părți afiliate, dacă există.",
        ],
      },
      {
        title: "Ce drepturi aveți în timpul controlului?",
        text: [
          "Puteți fi reprezentat printr-un împuternicit, de exemplu contabilul sau un consultant fiscal, pe baza unei împuterniciri depuse la organul fiscal (art. 18). Trebuie să fiți informat pe parcurs despre ce se constată, iar la final despre constatări și consecințele lor fiscale (art. 130).",
          "La încheiere, primiți proiectul de raport de inspecție fiscală împreună cu data discuției finale, programată la cel puțin 3 zile lucrătoare după comunicarea proiectului (5 zile lucrătoare pentru marii contribuabili). Puteți renunța la discuția finală.",
          "Aveți dreptul să prezentați în scris un punct de vedere asupra constatărilor, în cel mult 5 zile lucrătoare de la încheierea inspecției (7 zile lucrătoare pentru marii contribuabili). Termenul poate fi prelungit pentru motive justificate, cu acordul conducătorului organului de inspecție. Raportul final trebuie să cuprindă și opinia motivată a inspectorilor asupra punctului dumneavoastră de vedere.",
        ],
      },
      {
        title: "Cum se încheie controlul?",
        text: [
          "Rezultatul se consemnează într-un raport de inspecție fiscală, cu constatările de fapt și de drept și consecințele lor fiscale (art. 131). Pe baza raportului se emite decizia de impunere, dacă rezultă diferențe, sau decizia de nemodificare a bazei de impozitare.",
          "Pentru o parte deja verificată, organul fiscal emite o decizie de impunere provizorie (art. 133). Sumele din ea se contestă odată cu decizia finală, dar decizia permite plata anticipată a diferențelor, pentru a opri acumularea dobânzilor și penalităților.",
        ],
      },
      {
        title: "Ce puteți face dacă nu sunteți de acord cu decizia?",
        text: [
          "Contestația se depune în termen de 45 de zile de la comunicarea deciziei, sub sancțiunea decăderii (art. 270). Se depune la organul fiscal emitent și se soluționează de structura competentă din ANAF. Decizia de soluționare poate fi atacată apoi la instanța de contencios administrativ.",
          "Contestația nu suspendă de la sine executarea; dobânzile și penalitățile curg în continuare. De aceea, se analizează separat plata, eșalonarea sau cererea de suspendare a executării. Nicio contestație nu garantează un rezultat.",
        ],
      },
      {
        title: "Poate ANAF să verifice din nou aceeași perioadă?",
        text: [
          "Numai prin excepție, în condițiile art. 128: dacă după încheierea inspecției apar date suplimentare, necunoscute la data inspecției, care influențează rezultatul. Reverificarea se decide de conducătorul organului de inspecție și poate fi cerută și de contribuabil.",
        ],
      },
      {
        title: "Cum vă pregătiți înainte de control?",
        list: [
          "Documentele ordonate pe luni și pe tipuri, cu registrele și balanțele listate pentru perioada din aviz.",
          "Verificarea concordanței între balanțe, declarațiile depuse și fișa pe plătitor din SPV.",
          "Contractele semnate și în vigoare pentru toate cheltuielile importante; justificarea cheltuielilor și a TVA deduse.",
          "O singură persoană de contact pentru inspectori; informațiile se dau în scris, după verificare.",
          "Toate cererile și notele explicative se păstrează în copie, cu numărul de înregistrare.",
          "Reprezentarea de către cineva care cunoaște procedura: contabilul firmei, un consultant fiscal sau Daiamar, pe bază de împuternicire.",
        ],
        after:
          "Daiamar reprezintă clienții în timpul inspecțiilor fiscale generale și parțiale, pe bază de împuternicire.",
      },
    ],
    faq: [
      {
        q: "Cu cât timp înainte sunt anunțat de un control ANAF?",
        a: "Cu 15 zile înainte pentru majoritatea firmelor și cu 30 de zile înainte pentru marii contribuabili, prin avizul de inspecție fiscală (art. 122 Cod procedură fiscală). Controalele inopinate nu se anunță.",
      },
      {
        q: "Pot cere amânarea controlului?",
        a: "Da, o singură dată, pentru motive justificate, după primirea avizului. Amânarea se aprobă prin decizie a conducătorului activității de inspecție.",
      },
      {
        q: "Cât poate dura un control ANAF?",
        a: "Cel mult 45 de zile pentru contribuabilii mici, 90 de zile pentru cei mijlocii și 180 de zile pentru marii contribuabili, cei cu sedii secundare și nerezidenți (art. 126). Perioadele de suspendare nu se socotesc.",
      },
      {
        q: "Trebuie să fiu prezent personal?",
        a: "Nu. Puteți fi reprezentat printr-un împuternicit, de exemplu contabilul sau un consultant fiscal (art. 18). Împuternicirea se depune la organul fiscal.",
      },
      {
        q: "Pot contesta decizia de impunere?",
        a: "Da, în 45 de zile de la comunicare (art. 270). După acest termen, dreptul de a contesta se pierde.",
      },
      {
        q: "Ce se întâmplă dacă nu prezint documentele cerute?",
        a: "Contribuabilul are obligația legală de a colabora (art. 124). Lipsa documentelor poate duce la stabilirea obligațiilor prin estimare și la sancțiuni. Dacă nu puteți prezenta ceva la timp, cereți în scris un termen.",
      },
    ],
    related: { href: "/control-anaf/", label: "Aveți un control acum?" },
  },
  {
    slug: "schimbarea-contabilului-ce-verificati",
    cover: { src: "/img/ghiduri/schimba-contabilul.jpg", alt: "Teancuri de dosare și o cutie de arhivă pe masa de ședințe, pregătite pentru predare" },
    title: "Ce verificați când schimbați contabilul",
    metaTitle: "Ce verificați când schimbați contabilul",
    description:
      "Când schimbați contabilul, ce documente primiți la predare, ce verificați în prima lună și ce accesuri transferați. Ghid practic Daiamar, Oradea.",
    published: "2026-11-05",
    updated: "2026-11-06",
    reviewed: false,
    services: ["contabilitate", "salarizare-resurse-umane"],
    lead:
      "Schimbarea contabilului nu are o procedură impusă de lege, dar are un moment potrivit și o listă de documente de predat. Dacă predarea se face ordonat, noul contabil continuă evidența fără goluri.",
    sections: [
      {
        title: "Când este momentul potrivit?",
        text: [
          "După depunerea declarațiilor pentru luna sau trimestrul încheiat, ca să nu rămână o perioadă în care nu este clar cine depune. Cel mai simplu este după închiderea exercițiului financiar și depunerea situațiilor financiare anuale, sau la început de trimestru.",
          "Citiți contractul cu contabilul actual înainte de a anunța schimbarea: termenul de preaviz, ce servicii include, cine deține licența programului de contabilitate și baza de date.",
        ],
      },
      {
        title: "Ce documente primiți la predare?",
        text: [
          "Predarea se face cu un proces-verbal de predare-primire, semnat de ambele părți, cu lista documentelor și a perioadelor acoperite. Documentele contabile sunt ale firmei, nu ale contabilului.",
        ],
        list: [
          "Actele constitutive, certificatul de înregistrare, certificatul de înregistrare în scopuri de TVA, dacă există.",
          "Registrele contabile: registrul jurnal, registrul inventar, cartea mare; balanțele lunare și fișele de cont.",
          "Jurnalele de vânzări și cumpărări, deconturile de TVA, declarațiile depuse și recipisele.",
          "Situațiile financiare anuale depuse și dovada depunerii.",
          "Dosarele de personal, contractele de muncă, statele de salarii, declarațiile 112.",
          "Documentele justificative (facturi, extrase, chitanțe), ordonate pe ani și pe luni.",
          "Registrul de evidență fiscală, pentru plătitorii de impozit pe profit.",
          "Exportul datelor din programul de contabilitate și evidența mijloacelor fixe și a stocurilor.",
          "Actele controalelor anterioare: avize, rapoarte, decizii, contestații.",
        ],
      },
      {
        title: "Ce verificați în prima lună?",
        list: [
          "Balanța de verificare la ultima lună închisă corespunde cu declarațiile depuse.",
          "Fișa pe plătitor din SPV (obligații, plăți, solduri) corespunde cu evidența contabilă.",
          "Certificatul de atestare fiscală (art. 158 Cod procedură fiscală) arată dacă firma are obligații restante.",
          "Soldurile clienților și furnizorilor mari, confirmate cu partenerii.",
          "Soldul de casă din evidență față de numerarul real; conturile bancare față de extrase.",
          "TVA de plată sau de recuperat, cu documentele care îl susțin.",
          "Concordanța între registrul salariaților (REGES) și statele de salarii.",
          "Declarații lipsă sau depuse cu întârziere, pentru care pot apărea sancțiuni.",
          "Facturile emise și primite prin e-Factura față de cele înregistrate.",
        ],
      },
      {
        title: "Ce accesuri transferați?",
        text: [
          "Accesul la SPV și la e-Factura (certificat digital sau împuternicire), la registrul salariaților, la programul de contabilitate și, dacă este cazul, la vizualizarea conturilor bancare. Revocați împuternicirile vechi la ANAF și înregistrați-le pe cele noi, ca declarațiile să poată fi depuse fără întrerupere.",
          "Stabiliți în scris cine depune declarațiile din luna schimbării. O lună fără responsabil clar înseamnă declarații depuse târziu.",
        ],
      },
    ],
    faq: [
      {
        q: "Pot schimba contabilul în mijlocul anului?",
        a: "Da. Alegeți sfârșitul unei luni sau al unui trimestru, după depunerea declarațiilor, ca predarea să nu lase o perioadă neacoperită.",
      },
      {
        q: "Contabilul vechi poate refuza predarea documentelor?",
        a: "Documentele contabile aparțin firmei. Cereți predarea în scris, cu proces-verbal, respectând preavizul din contract. Dacă există sume neachitate, clarificați-le separat de predare.",
      },
      {
        q: "Cine depune declarațiile din luna schimbării?",
        a: "Se stabilește în scris înainte de predare. De regulă, contabilul care a ținut evidența lunii respective depune declarațiile pentru ea, iar noul contabil preia de la luna următoare.",
      },
      {
        q: "Cât durează preluarea?",
        a: "Depinde de volumul documentelor și de starea evidenței. După prima verificare primiți un termen și lista a ceea ce lipsește.",
      },
      {
        q: "Am nevoie de certificatul de atestare fiscală?",
        a: "Este util. Arată obligațiile restante la data emiterii și se obține de la ANAF, prin SPV. Îl comparați cu evidența contabilă la preluare.",
      },
    ],
    related: { href: "/schimba-contabilul/", label: "Schimbați contabilul?" },
  },
];

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
