import type { FaqItem } from "@/components/ui/Faq";
import type { ServiceGroup } from "@/lib/site";

// A line still waiting for the client's confirmation is rendered with a "de cerut de la client" badge.
export type Line = string | { text: string; todo: true };

type IncludeSection = { heading?: string; note?: string; items: Line[] };

type ServiceContent = {
  code: string;
  // Set for services that do not depend on the office location: Service schema becomes country-wide.
  national?: true;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  angle?: { title: string; text: string };
  includes: IncludeSection[];
  forWhom: string[];
  documents: Line[];
  steps: { title: string; text: string }[];
  faq: FaqItem[];
  related: string[];
};

export const groups: Record<ServiceGroup, { title: string; text: string }> = {
  control: {
    title: "Când firma este verificată",
    text: "Reprezentare la controale ANAF și ITM, audit intern și extern. Experiență din divizia control fiscal a ANAF.",
  },
  baza: {
    title: "Evidența de fiecare lună",
    text: "Contabilitate, salarizare și consultanță fiscală pentru societăți comerciale, PFA și întreprinderi individuale.",
  },
  situatii: { // ro-lint: ignore (slug din site.ts)
    title: "Când firma are o problemă",
    text: "Datorii, negocieri cu creditorii, litigii. Împreună cu specialiști și avocați colaboratori.",
  },
  specializate: {
    title: "Alte servicii",
    text: "Înființări și lichidări, TVA din UE, documente pentru personalul care lucrează în străinătate sau vine din afara UE.",
  },
};

const todo = (text: string): Line => ({ text, todo: true });

export const content: Record<string, ServiceContent> = {
  contabilitate: {
    code: "Contabilitate",
    metaTitle: "Contabilitate Oradea: firme, PFA, ÎI",
    metaDescription:
      "Firmă de contabilitate în Oradea, membră CECCAR: evidență lunară, declarații, bilanț și situații pentru conducere, pentru societăți comerciale, PFA și ÎI.",
    intro: [
      "Daiamar ține contabilitatea societăților comerciale, a persoanelor fizice autorizate și a întreprinderilor individuale, din biroul din Oradea, pentru firme din Oradea, din Bihor și din toată țara. Daiamar este membră CECCAR.",
      "Contabilitatea, fiscalitatea și analizele economice le lucrăm împreună, după obiectul de activitate al fiecărui client.",
    ],
    includes: [
      {
        heading: "Contabilitate adaptată activității",
        items: [
          "Contabilitate adaptată în funcție de specificul activității economice",
          "Programe de contabilitate adaptate la obiectul de activitate, operare online",
          "Operare și verificare documente la sediul beneficiarului, atunci când se impune",
          "Implementarea programelor integrate de producție și contabilitate alese de beneficiar (am implementat deja programul SAP)",
          "Situații lunare sau trimestriale pentru conducere, care arată starea reală a firmei și pe baza cărora puteți lua decizii. Conținutul, formatul și limba lor le stabiliți dumneavoastră",
          "Bilanțuri consolidate pentru grupuri de firme, inclusiv firme afiliate din state UE și non-UE",
        ],
      },
      {
        heading: "Registrele contabile, lunar și anual",
        items: ["Fișe de cont lunare (componența conturilor)", "Registru jurnal lunar", "Balanța de verificare lunară", "Bilanț contabil anual"],
      },
      {
        heading: "Declarații și obligații fiscale",
        items: [
          "Decontul de TVA",
          "Declarația de impozite și taxe",
          "Declarația recapitulativă privind achizițiile intracomunitare și livrările intracomunitare",
          "Declarația recapitulativă privind achizițiile și livrările pe teritoriul național",
          "Orice situații cerute de legislația română în materie de contabilitate și fiscalitate",
          "Întocmirea documentației de recuperare a TVA de la buget",
          "Stabilirea rezultatului financiar pe baza veniturilor și cheltuielilor",
          "Stabilirea obligațiilor fiscale (impozite și taxe) datorate bugetului de stat",
        ],
      },
    ],
    forWhom: [
      "Societăți comerciale din Oradea, din Bihor sau din alt județ, de la microîntreprinderi la firme cu activitate de producție sau grupuri de firme.",
      "Persoane fizice autorizate și întreprinderi individuale care au nevoie de evidență și de declarații depuse la termen.",
      "Firme care preiau evidența de la alt contabil și vor să știe în ce stare este.",
      "Firme cu acționari străini, care au nevoie de situații în engleză sau italiană.",
    ],
    documents: [
      "Actele firmei: certificat de înregistrare, act constitutiv, certificat de înregistrare în scopuri de TVA, dacă este cazul.",
      "Balanța și fișele de cont la ultima lună închisă, dacă preluăm evidența de la alt contabil.",
      "Facturile de vânzare și de achiziție, extrasele de cont, registrul de casă.",
      "Contractele în derulare: chirie, leasing, credite, colaborări.",
      todo("Programul de contabilitate folosit și modul de predare a documentelor (fizic sau online)"),
    ],
    steps: [
      { title: "Discuția inițială", text: "Vedem ce activitate aveți, ce regim fiscal, câți angajați și de ce rapoarte are nevoie conducerea." },
      { title: "Preluarea evidenței", text: "Primim documentele. Dacă veniți de la alt contabil, verificăm balanța și declarațiile depuse până la zi și vă spunem ce am găsit." },
      { title: "Lucrul lunar", text: "Înregistrăm documentele, calculăm obligațiile fiscale, depunem declarațiile și trimitem situațiile convenite." },
      { title: "Închiderea anului", text: "Întocmim și depunem bilanțul contabil anual." },
    ],
    faq: [
      {
        q: "Cine răspunde de contabilitate dacă o externalizez?",
        a: "Potrivit Legii contabilității nr. 82/1991, răspunderea pentru organizarea și conducerea contabilității rămâne a administratorului. Contabilitatea poate fi condusă pe bază de contract cu un membru CECCAR, iar obligațiile noastre sunt cele din contract.",
      },
      {
        q: "Ce primesc lunar de la dumneavoastră?",
        a: "Fișele de cont, registrul jurnal, balanța de verificare și declarațiile depuse.",
      },
      {
        q: "Țineți contabilitate și pentru PFA?",
        a: "Da, pentru persoane fizice autorizate și întreprinderi individuale. Contabilitatea se adaptează la specificul activității.",
      },
      {
        q: "Cât costă contabilitatea?",
        a: "Onorariul depinde de volumul de documente, de numărul de angajați și de regimul de TVA. Îl stabilim după prima discuție, înainte de semnarea contractului.",
      },
    ],
    related: ["salarizare-resurse-umane", "consultanta-fiscala", "reprezentare-controale-anaf"],
  },

  "salarizare-resurse-umane": {
    code: "Salarizare și HR",
    metaTitle: "Salarizare și resurse umane Oradea",
    metaDescription:
      "Salarizare și personal pentru firme din Oradea și din toată țara: contracte, pontaj, state de plată, declarația 112, concedii medicale, REGES Online.",
    intro: [
      "Daiamar calculează salariile și administrează dosarele de personal pentru firme din Oradea, din Bihor și din toată țara: contracte, acte adiționale, decizii, concedii, declarații și registrul general de evidență a salariaților. Serviciul este pentru orice firmă cu angajați, indiferent de numărul lor.",
      "Salariul se calculează pornind de la toate elementele venitului: deducerea personală, reținerile, sporurile, bonusurile sau tichetele de masă.",
    ],
    includes: [
      {
        items: ["Servicii de personal și salarizare", "Servicii de administrare și consultanță de resurse umane"],
      },
      {
        heading: "Management personal",
        note: "Știm cât contează personalul pentru buna funcționare a firmei, așa că acordăm multă atenție evidenței de personal.",
        items: [
          "Fișa angajatului (definirea angajaților și a datelor personale, date de contact, date profesionale, persoane în întreținere, definirea tipului contractului de muncă și a duratei acestuia, definirea datelor referitoare la salarii, sporuri etc.)",
          "Fișa postului",
          "Întocmirea Regulamentului de organizare și funcționare (ROF)",
          "Gestionarea timpilor de lucru (planificarea orelor de program, administrarea orelor suplimentare, absențe, delegații, învoiri etc.)",
        ],
      },
      {
        heading: "Servicii personal",
        note: "Ținem evidența la zi pentru fiecare salariat și vă dăm oricând datele de care aveți nevoie despre activitatea angajaților.",
        items: [
          "Date personale angajați",
          "Modificarea și încetarea contractelor de muncă",
          "Evidența persoanelor cărora le expiră contractul",
          "Planificarea concediilor",
          "Decizii, cu opțiuni pentru acordul părților, de pensionare, demisie, suspendare",
          "Declarații concedii medicale",
          "Recuperarea sumelor de la Casa de Asigurări de Sănătate",
          "Registrul general de evidență a salariaților (RGES)",
          "Raportarea la termenele prevăzute de lege a datelor obligatorii în registrul de evidență a salariaților",
          "Fluturași salarii",
          "Centralizator salarii",
        ],
      },
    ],
    forWhom: [
      "Firme cu angajați, din orice domeniu, din Oradea sau din alt județ.",
      "Firme cu program în schimburi, ore suplimentare sau personal sezonier, unde pontajul contează la fiecare salariu.",
      "Firme care au trecut printr-un control ITM și vor evidența de personal pusă în ordine.",
      "Firme care angajează cetățeni străini și au nevoie de dosare de personal complete.",
    ],
    documents: [
      "Contractele individuale de muncă și actele adiționale existente.",
      "Pontajul lunar: ore lucrate, ore suplimentare, concedii, absențe.",
      "Certificatele de concediu medical și cererile de concediu.",
      "Datele de identificare ale angajaților și documentele de studii, unde postul le cere.",
      todo("Accesul la REGES Online și la programul de salarizare folosit până acum"),
    ],
    steps: [
      { title: "Preluăm dosarele", text: "Verificăm contractele, actele adiționale și registrul salariaților. Semnalăm ce lipsește." },
      { title: "Primim pontajul", text: "Până la o dată stabilită în fiecare lună primim de la dumneavoastră pontajul și modificările: angajări, plecări, concedii." },
      { title: "Calculăm și depunem", text: "Calculăm salariile, întocmim statele de plată și fluturașii, depunem declarația 112 la termen." },
      { title: "Raportăm", text: "Transmitem modificările în registrul general de evidență a salariaților la termenele prevăzute de lege și păstrăm evidența la zi." },
    ],
    faq: [
      {
        q: "Ce este registrul general de evidență a salariaților?",
        a: "Este registrul oficial în care angajatorul înregistrează contractele de muncă și modificările lor. Din 2025 se completează în platforma REGES Online a Inspecției Muncii, care a înlocuit Revisal. Transmiterea la termen este obligația angajatorului, iar noi o facem în numele dumneavoastră.",
      },
      {
        q: "Când trebuie să vă trimit pontajul?",
        a: "Stabilim împreună o dată lunară fixă. Pontajul primit la timp înseamnă salarii calculate și declarații depuse la termen.",
      },
      {
        q: "Vă ocupați și de concediile medicale?",
        a: "Da. Întocmim declarațiile pentru concediile medicale și documentația pentru recuperarea sumelor de la Casa de Asigurări de Sănătate.",
      },
      {
        q: "Faceți și fișe de post și regulament intern?",
        a: "Da. Întocmim fișa postului pentru fiecare funcție și regulamentul intern, pe baza informațiilor despre activitatea dumneavoastră.",
      },
    ],
    related: ["contabilitate", "reprezentare-controale-anaf", "audit-intern-extern"],
  },

  "consultanta-fiscala": {
    code: "Consultanță fiscală",
    national: true,
    metaTitle: "Consultanță fiscală firme, la birou sau online",
    metaDescription:
      "Consultanță fiscală pentru firme din toată țara, la biroul din Oradea sau online: analiza costurilor, optimizare fiscală legală, dosare de eșalonare la plată.",
    intro: [
      "Daiamar oferă consultanță fiscală firmelor din toată țara, la biroul din Oradea sau online: analiza costurilor, optimizare fiscală în limitele legii, dosare de eșalonare la plată și informări despre fonduri europene sau guvernamentale.",
      "Cu experiența de peste 20 de ani a Monicăi Diana Pop în controlul fiscal al ANAF, vă spunem și cum ar putea privi un inspector operațiunea respectivă.",
    ],
    includes: [
      {
        items: [
          "Analiza costurilor, propuneri de optimizare",
          "Optimizare fiscală",
          "Întocmire dosare eșalonare",
          "Informări privind fonduri europene care urmează să se deschidă, identificare tipuri de fonduri europene sau guvernamentale care pot fi accesate în funcție de domeniul de activitate",
          "Întocmire documentație pentru fonduri europene",
        ],
      },
    ],
    forWhom: [
      "Firme care vor să știe, înainte de o decizie, ce impozite și taxe presupune: o investiție, un contract nou, o schimbare de regim fiscal.",
      "Firme cu datorii la buget care au nevoie de un dosar de eșalonare la plată.",
      "Firme care caută finanțare din fonduri europene sau guvernamentale și vor să afle ce programe li se potrivesc.",
      "Administratori care au primit o notificare de la ANAF și vor o a doua opinie înainte să răspundă.",
    ],
    documents: [
      "Balanța de verificare la zi și ultimele situații financiare depuse.",
      "Certificatul de atestare fiscală sau fișa pe plătitor, pentru dosarele de eșalonare.",
      "Contractele sau proiectul pe care doriți să îl analizăm.",
      "Notificările sau adresele primite de la ANAF, dacă există.",
      todo("Documentele specifice pentru dosarul de eșalonare, în funcție de situația firmei"),
    ],
    steps: [
      { title: "Întrebarea", text: "Ne spuneți ce aveți de decis sau ce ați primit de la ANAF. Stabilim ce documente sunt necesare." },
      { title: "Analiza", text: "Verificăm cifrele și cadrul legal aplicabil. Unde legea permite mai multe variante, le punem pe hârtie cu efectele fiecăreia." },
      { title: "Răspunsul", text: "Primiți răspunsul, cu temeiul legal și pașii de urmat. Dacă este nevoie de un dosar, de exemplu pentru eșalonare, îl întocmim și îl depunem." },
    ],
    faq: [
      {
        q: "Ce înseamnă optimizare fiscală?",
        a: "Alegerea, între variantele permise de lege, a celei cu sarcina fiscală cea mai mică pentru situația firmei: regim de impozitare, mod de deducere, structura cheltuielilor. Nu înseamnă ascunderea veniturilor sau documente fictive. Lucrăm numai în cadrul legii.",
      },
      {
        q: "Ce este eșalonarea la plată?",
        a: "Un acord cu organul fiscal prin care datoriile la buget se plătesc în rate, pe o perioadă stabilită prin decizie. Codul de procedură fiscală reglementează condițiile, garanțiile și procedura. Întocmim dosarul și urmărim respectarea graficului.",
      },
      {
        q: "Vă ocupați și de fonduri europene?",
        a: "Vă informăm despre programele care urmează să se deschidă și identificăm tipurile de fonduri europene sau guvernamentale accesibile în funcție de domeniul de activitate. Întocmim documentația împreună cu dumneavoastră.",
      },
      {
        q: "Ce înseamnă un dosar de eșalonare bine întocmit?",
        a: "Un dosar complet, cu documentele cerute de Codul de procedură fiscală pentru situația firmei, depus la termen, cu un grafic de plată pe care firma îl poate respecta.",
      },
    ],
    related: ["contabilitate", "reprezentare-controale-anaf", "firme-cu-probleme-financiare"],
  },

  "reprezentare-controale-anaf": {
    code: "Control ANAF",
    national: true,
    metaTitle: "Reprezentare la control ANAF și ITM",
    metaDescription:
      "Reprezentare la controale ANAF și ITM pentru firme din toată țara: inspecții fiscale generale și parțiale, contestații, acțiuni în instanță. 20+ ani în ANAF.",
    intro: [
      "Daiamar reprezintă firme din toată țara în timpul controalelor ANAF (inspecții fiscale generale și parțiale) și ITM, întocmește contestațiile împotriva deciziilor de impunere și pregătește acțiunile în instanță, împreună cu avocați colaboratori. Biroul este în Oradea.",
    ],
    angle: {
      title: "Cu ce ajută experiența din ANAF?",
      text: "Echipa este condusă de Monica Diana Pop, cu peste două decenii în divizia control fiscal a ANAF. Știm ce verifică inspectorii și cum curge procedura, de la aviz și termene până la discuția finală și contestație.",
    },
    includes: [
      {
        items: [
          "Reprezentare în cadrul controalelor efectuate de ANAF (inspecții generale, parțiale), ITM",
          "Întocmire contestații, acțiuni în instanță",
          "Reprezentarea clientului în relația cu organul fiscal competent, inclusiv la inspecțiile fiscale",
        ],
      },
    ],
    forWhom: [
      "Firme care au primit un aviz de inspecție fiscală și vor alături de ele pe cineva care cunoaște procedura.",
      "Firme aflate deja în control, care nu știu cum să răspundă la solicitările inspectorilor.",
      "Firme care au primit o decizie de impunere și vor să o conteste în termen.",
      "Firme chemate la control ITM pentru contracte, pontaj sau salarizare.",
    ],
    documents: [
      "Avizul de inspecție fiscală sau invitația primită, cu data comunicării.",
      "Solicitările scrise ale inspectorilor și ce ați transmis până acum.",
      "Balanțele, declarațiile și documentele aferente perioadei controlate.",
      "Decizia de impunere și raportul de inspecție fiscală, dacă controlul s-a încheiat.",
      "O împuternicire pentru reprezentare, pe care o pregătim noi.",
    ],
    steps: [
      { title: "Analizăm avizul", text: "Verificăm perioada, impozitele vizate și tipul controlului. Vă spunem la ce să vă așteptați și ce documente să pregătiți primele." },
      { title: "Pregătim dosarul", text: "Trecem prin documentele perioadei controlate înaintea inspectorilor. Ce lipsește sau ce poate ridica întrebări este tratat din timp." },
      { title: "Participăm la control", text: "Răspundem solicitărilor, explicăm înregistrările și formulăm punctul de vedere al firmei la discuția finală." },
      { title: "Contestăm, dacă este cazul", text: "Dacă decizia de impunere conține constatări nefondate, întocmim contestația în termenul legal și, la nevoie, acțiunea în instanță, cu avocați colaboratori." },
    ],
    faq: [
      {
        q: "Ce este avizul de inspecție fiscală și cât timp am după ce îl primesc?",
        a: "Este documentul prin care ANAF vă anunță începerea inspecției, perioada și impozitele verificate. Potrivit Codului de procedură fiscală, se comunică în general cu 30 de zile înainte pentru marii contribuabili și cu 15 zile pentru ceilalți contribuabili. În acest interval se pregătesc documentele. Puteți solicita o singură dată amânarea începerii inspecției, pentru motive justificate.",
      },
      {
        q: "Care este diferența între inspecția generală și cea parțială?",
        a: "Inspecția generală verifică toate obligațiile fiscale ale firmei pentru o perioadă. Inspecția parțială verifică una sau mai multe obligații, de exemplu numai TVA. Tipul este menționat în aviz și stabilește ce documente pregătim.",
      },
      {
        q: "Am dreptul să fiu asistat de un specialist în timpul controlului?",
        a: "Da. Codul de procedură fiscală prevede dreptul contribuabilului de a fi asistat sau reprezentat în relația cu organul fiscal, precum și dreptul de a-și exprima punctul de vedere asupra constatărilor înainte de emiterea deciziei.",
      },
      {
        q: "În cât timp pot contesta o decizie de impunere?",
        a: "Contestația se depune în termen de 45 de zile de la comunicarea deciziei, sub sancțiunea decăderii. Termenul este scurt, de aceea este bine să ne contactați imediat după primirea deciziei. Nu promitem rezultatul unei contestații. Ne asigurăm că este motivată și depusă la termen.",
      },
      {
        q: "Vă ocupați și de controalele ITM?",
        a: "Da. Pregătim documentele de personal cerute de Inspecția Muncii (contracte, pontaje, state de plată, registrul salariaților) și participăm la control.",
      },
      {
        q: "Reprezentați și firme din alt județ?",
        a: "Da. Împuternicirea și documentele se transmit electronic, iar la inspecție participăm la sediul organului fiscal sau al firmei, după cum prevede avizul. Deplasarea se stabilește de la caz la caz.",
      },
    ],
    related: ["audit-intern-extern", "consultanta-fiscala", "servicii-juridice"],
  },

  "audit-intern-extern": {
    code: "Audit",
    national: true,
    metaTitle: "Audit intern și audit extern pentru firme",
    metaDescription:
      "Audit intern și audit extern pentru firme din toată țara, de la Daiamar, societate membră CECCAR cu biroul în Oradea. Sfera se stabilește cu fiecare firmă.",
    intro: [
      "Daiamar oferă firmelor din toată țara servicii de audit intern și audit extern. Auditul intern este o verificare făcută pentru conducerea firmei; auditul extern este o verificare pentru terți (acționari, bănci, parteneri). Sfera fiecărei lucrări se stabilește împreună cu firma, înainte de a începe.",
    ],
    includes: [
      {
        items: [
          "Audit intern",
          "Audit extern",
          todo("Sfera exactă a serviciilor de audit intern și extern și domeniile acoperite"),
          todo("Cine semnează rapoartele de audit extern (auditori financiari autorizați ASPAAS, direct sau prin colaboratori)"),
        ],
      },
    ],
    forWhom: [
      "Firme care vor o verificare a evidenței contabile și a procedurilor interne, înainte de un control.",
      "Firme care au nevoie de un raport de audit pentru acționari, bănci sau parteneri.",
      "Grupuri de firme și firme cu acționari străini, care au nevoie de raportul în engleză sau italiană.",
    ],
    documents: [
      "Situațiile financiare anuale și balanțele perioadei verificate.",
      "Registrele contabile și documentele justificative.",
      todo("Lista completă, în funcție de tipul și sfera auditului"),
    ],
    steps: [
      { title: "Stabilim sfera", text: "Ce verificăm, pentru ce perioadă și pentru cine este raportul: conducere, acționari, bancă." },
      { title: "Verificăm", text: "Primim documentele și verificăm înregistrările pentru perioada stabilită." },
      { title: "Primiți raportul", text: "Raportul de audit, cu constatările, pentru destinatarul stabilit la început." },
    ],
    faq: [
      {
        q: "Care este diferența între auditul intern și auditul extern?",
        a: "Auditul intern este făcut pentru conducerea firmei: verifică procedurile și evidența și propune remedieri. Auditul extern este făcut pentru terți (acționari, bănci, autorități) și dă o opinie independentă asupra situațiilor financiare.",
      },
      {
        q: "Un audit intern ajută înainte de un control ANAF?",
        a: "Da. Verificarea evidenței și a documentelor justificative înainte de control arată ce lipsește sau ce trebuie corectat, cât timp corecțiile se mai pot face.",
      },
      {
        q: "Cât durează un audit?",
        a: "Depinde de mărimea firmei, de perioada verificată și de starea documentelor. Calendarul se stabilește la începutul lucrării.",
      },
    ],
    related: ["reprezentare-controale-anaf", "contabilitate", "consultanta-fiscala"],
  },

  "infiintari-lichidari-firme": {
    code: "Înființări și lichidări",
    metaTitle: "Înființare firmă Oradea, modificări, lichidări",
    metaDescription:
      "Înființare de SRL și PFA în Oradea, modificări la Registrul Comerțului și lichidare de societăți comerciale. Vă explicăm obligațiile firmei de la început.",
    intro: [
      "Daiamar se ocupă de înființarea societăților și a PFA-urilor, în Oradea și în orice alt județ, de modificările ulterioare la Registrul Comerțului și de lichidarea societăților comerciale. Vă explicăm obligațiile firmei de la început și putem continua cu contabilitatea de la primele documente.",
    ],
    includes: [{ items: ["Înființări societăți", "Modificări în cadrul societăților", "Lichidări societăți comerciale"] }],
    forWhom: [
      "Persoane care deschid prima firmă sau un PFA și vor să știe ce obligații urmează.",
      "Firme care schimbă sediul, administratorul, obiectul de activitate sau structura asociaților.",
      "Asociați care închid o societate fără activitate sau cu activitatea încheiată.",
      "Cetățeni străini care înființează o firmă în România și au nevoie de comunicare în engleză sau italiană.",
    ],
    documents: [
      "Actele de identitate ale asociaților și administratorilor.",
      "Dovada sediului social: contract de închiriere, comodat sau act de proprietate.",
      "Denumirea dorită (trei variante, în ordinea preferinței) și obiectul de activitate.",
      "Pentru lichidare: ultimele situații financiare, situația datoriilor și hotărârea asociaților.",
    ],
    steps: [
      { title: "Discuția", text: "Alegem forma potrivită (SRL, PFA, întreprindere individuală), regimul fiscal și codurile CAEN." },
      { title: "Dosarul", text: "Pregătim actul constitutiv și celelalte documente și depunem dosarul la Oficiul Registrului Comerțului de care aparține sediul firmei; pentru Oradea, cel de pe lângă Tribunalul Bihor." },
      { title: "După înregistrare", text: "Vă explicăm obligațiile: declarațiile de depus, termenele, înregistrarea în scopuri de TVA dacă este cazul. Dacă doriți, preluăm contabilitatea." },
      { title: "Lichidarea", text: "Pentru închidere: dizolvare, lichidare și radiere, cu situațiile financiare și declarațiile aferente fiecărei etape." },
    ],
    faq: [
      {
        q: "SRL sau PFA?",
        a: "Depinde de activitate, de venituri și de câte persoane vor lucra în firmă. PFA-ul este mai simplu de administrat, dar răspunderea este personală. SRL-ul separă patrimoniul firmei de cel al asociaților. Discutăm variantele înainte de a depune dosarul.",
      },
      {
        q: "Ce obligații am imediat după înființare?",
        a: "Depinde de regimul fiscal ales. În general: evidența contabilă de la primul document, declarațiile periodice la ANAF, iar dacă aveți angajați, declarațiile de salarii și registrul salariaților. Vă explicăm obligațiile firmei dumneavoastră de la început.",
      },
      {
        q: "Firma nu a avut activitate. Pot să o închid simplu?",
        a: "O societate se închide prin dizolvare, lichidare și radiere de la Registrul Comerțului, chiar dacă nu a avut activitate. Procedura este mai simplă fără datorii și fără active de împărțit. Pregătim documentele pentru fiecare etapă.",
      },
      {
        q: "Vă ocupați și de modificări ulterioare?",
        a: "Da: schimbare de sediu, administrator, asociați, obiect de activitate, majorare de capital, puncte de lucru. Pregătim și depunem dosarul la Registrul Comerțului.",
      },
      {
        q: "Pot înființa firma dacă sunt cetățean străin?",
        a: "Da. Pregătim documentele și comunicăm în engleză sau italiană. Unele acte emise în străinătate au nevoie de traducere legalizată sau de apostilă.",
      },
    ],
    related: ["contabilitate", "servicii-juridice", "consultanta-fiscala"],
  },

  "rambursari-tva-ue": {
    code: "TVA din UE",
    national: true,
    metaTitle: "Rambursare TVA din UE, formular 318",
    metaDescription:
      "Recuperarea TVA plătit în alte state UE: combustibil, taxe de drum, cazare, târguri. Depunem formularul 318 la ANAF pentru firme din toată țara. Birou: Oradea.",
    intro: [
      "Daiamar întocmește și depune pentru firme din toată țara cererile de rambursare a TVA plătit în alte state membre UE: combustibil, taxe de drum, cazare, târguri, servicii achiziționate în străinătate. Cererea se depune electronic la ANAF, care o transmite statului de rambursare.",
    ],
    includes: [{ items: ["Rambursări TVA din țări membre UE"] }],
    forWhom: [
      "Transportatori care plătesc TVA pe combustibil și taxe de drum în alte state UE.",
      "Firme care participă la târguri sau trimit personal în delegație în UE.",
      "Firme care cumpără servicii sau bunuri în alte state membre, fără a fi înregistrate în scopuri de TVA acolo.",
    ],
    documents: [
      "Facturile și bonurile din statul respectiv, cu TVA evidențiat și cu datele firmei.",
      "Certificatul de înregistrare în scopuri de TVA în România.",
      "Acces la Spațiul Privat Virtual al firmei, pentru depunerea cererii.",
    ],
    steps: [
      { title: "Verificăm documentele", text: "Sortăm facturile pe state și verificăm dacă îndeplinesc condițiile de formă cerute de statul de rambursare." },
      { title: "Întocmim cererea", text: "Completăm formularul 318 pentru perioada aleasă (minimum trei luni, maximum un an calendaristic) și îl depunem electronic la ANAF." },
      { title: "Urmărim răspunsul", text: "Răspundem solicitărilor de informații suplimentare ale statului de rambursare și vă informăm când se aprobă plata." },
    ],
    faq: [
      {
        q: "Până când se depune cererea?",
        a: "Până la 30 septembrie a anului următor celui în care a fost plătit TVA. Cererea depusă după acest termen nu se mai ia în considerare pentru perioada respectivă.",
      },
      {
        q: "Pe ce bază se face rambursarea?",
        a: "Pe baza Directivei 2008/9/CE, transpusă în legislația fiecărui stat membru. Firma română depune cererea prin portalul ANAF (formularul 318), iar statul în care s-a plătit TVA o soluționează.",
      },
      {
        q: "Pentru ce cheltuieli se poate cere TVA înapoi?",
        a: "Pentru cheltuielile deductibile potrivit regulilor statului de rambursare: de regulă combustibil, taxe de drum, cazare, participare la târguri, anumite servicii. Fiecare stat are propriile restricții, pe care le verificăm înainte de a depune.",
      },
      {
        q: "Cât durează până primesc banii?",
        a: "Statul de rambursare are, ca regulă, patru luni de la primirea cererii pentru a decide. Termenul se prelungește dacă cere informații suplimentare. Nu depinde de noi, dar urmărim dosarul până la plată.",
      },
      {
        q: "Pot cere TVA pentru mai mulți ani în urmă?",
        a: "Nu. O cerere acoperă cel mult un an calendaristic, iar termenul de 30 septembrie este de decădere. Pentru anul în curs se pot depune și cereri trimestriale, dacă sumele depășesc pragul minim stabilit de statul de rambursare.",
      },
    ],
    related: ["contabilitate", "consultanta-fiscala", "formulare-a1"],
  },

  "formulare-a1": {
    code: "Formular A1",
    national: true,
    metaTitle: "Formular A1 pentru șoferi și detașări în UE",
    metaDescription:
      "Obținerea formularului A1 de la Casa Națională de Pensii Publice pentru șoferi, personal detașat sau în delegație în UE. Firme din toată țara; biroul în Oradea.",
    intro: [
      "Daiamar obține formularul A1 (documentul portabil A1) pentru firmele din toată țara care trimit personal în alte state UE: șoferi în transport internațional, angajați în delegație sau detașare. Formularul este emis de Casa Națională de Pensii Publice și atestă că salariatul rămâne asigurat în sistemul românesc de securitate socială în perioada lucrată în străinătate.",
    ],
    includes: [
      {
        items: [
          "Obținere formulare A1: certificat emis de Casa Națională de Pensii Publice; necesar personalului care lucrează în UE (delegație, detașare, șoferi)",
        ],
      },
    ],
    forWhom: [
      "Firme de transport internațional cu șoferi care circulă în mai multe state UE.",
      "Firme din construcții, montaj sau service care detașează angajați la lucrări în UE.",
      "Firme care trimit angajați în delegație la parteneri din alte state membre.",
      "PFA-uri și administratori care lucrează temporar în alt stat UE.",
    ],
    documents: [
      "Contractele individuale de muncă ale persoanelor pentru care se cere A1.",
      "Contractul sau comanda cu beneficiarul din statul UE, cu perioada și locul activității.",
      "Documentele firmei: certificat de înregistrare, certificat constatator de la Registrul Comerțului.",
      "Pentru transportatori: licența de transport și documentele vehiculelor.",
    ],
    steps: [
      { title: "Stabilim situația", text: "Detașare într-un singur stat sau activitate în două sau mai multe state, cazul șoferilor? De aceasta depind articolul din regulament și documentele cerute." },
      { title: "Pregătim dosarul", text: "Completăm cererea și adunăm documentele firmei și ale salariaților. Depunem la Casa Națională de Pensii Publice, prin platforma online." },
      { title: "Primiți formularul", text: "Vă transmitem formularul A1 pentru fiecare persoană. Salariatul îl are asupra lui în perioada lucrată în străinătate." },
    ],
    faq: [
      {
        q: "Ce este formularul A1?",
        a: "Un document emis în baza Regulamentelor (CE) nr. 883/2004 și 987/2009, care atestă legislația de securitate socială aplicabilă unei persoane care lucrează în alt stat membru. Cu A1, contribuțiile sociale se plătesc în continuare în România, iar angajatul nu este asigurat de două ori.",
      },
      {
        q: "Cine emite A1 în România?",
        a: "Casa Națională de Pensii Publice. Cererea se depune de către angajator, pentru salariați, sau de către persoana care desfășoară activitate independentă.",
      },
      {
        q: "Cât timp este valabil?",
        a: "Pentru detașare, perioada din contract, în general până la 24 de luni. Pentru persoanele care lucrează în mod obișnuit în două sau mai multe state, de exemplu șoferii, formularul se emite pe perioada stabilită de CNPP în funcție de situație.",
      },
      {
        q: "Ce se întâmplă dacă angajatul nu are A1 la un control în străinătate?",
        a: "Autoritățile din statul respectiv pot considera că persoana trebuia asigurată acolo și pot aplica sancțiuni angajatorului. Formularul se obține înainte de plecare.",
      },
      {
        q: "Șoferii de transport internațional au nevoie de A1?",
        a: "Da, atunci când lucrează în mod obișnuit în două sau mai multe state membre. Pentru ei se aplică regula activității în mai multe state, cu documente diferite față de detașare.",
      },
    ],
    related: ["salarizare-resurse-umane", "rambursari-tva-ue", "contabilitate"],
  },

  "permise-de-munca": {
    code: "Permise de muncă",
    national: true,
    metaTitle: "Permise de muncă pentru cetățeni non-UE",
    metaDescription:
      "Obținerea permiselor de muncă pentru cetățeni non-UE: documentele pentru angajarea cetățenilor străini, pentru firme din toată țara, cu biroul în Oradea.",
    intro: [
      "Daiamar se ocupă de obținerea permiselor de muncă pentru cetățeni non-UE, pentru firmele din toată țara care angajează personal din străinătate. Pregătim documentele cerute de autorități pentru angajare și, dacă doriți, preluăm apoi dosarul de personal și salarizarea.",
    ],
    includes: [
      {
        items: [
          "Obținerea permiselor de muncă pentru cetățeni non-UE",
          todo("Etapele procedurii în vigoare pentru cetățenii non-UE (cadrul legal a fost modificat în 2026) și lista documentelor cerute"),
        ],
      },
    ],
    forWhom: [
      "Firme din construcții, producție, HoReCa și transport care angajează muncitori din afara UE.",
      "Firme care au deja angajați străini și trebuie să prelungească documentele sau să schimbe funcția.",
    ],
    documents: [
      "Documentele firmei: certificat de înregistrare, certificat constatator, certificat de atestare fiscală.",
      "Datele cetățeanului străin: pașaport, studii și calificări, traduse și legalizate unde se cere.",
      "Fișa postului și oferta de angajare.",
      todo("Lista completă cerută de Inspectoratul General pentru Imigrări, conform procedurii în vigoare"),
    ],
    steps: [
      { title: "Verificăm condițiile", text: "Postul, firma și candidatul trebuie să îndeplinească cerințele în vigoare la data depunerii." },
      { title: "Pregătim dosarul", text: "Întocmim documentele și le depunem la autoritatea competentă. Răspundem solicitărilor de completare." },
      { title: "Angajarea", text: "Întocmim contractul de muncă, îl înregistrăm în registrul salariaților și preluăm salarizarea, dacă doriți." },
    ],
    faq: [
      {
        q: "Cetățenii UE au nevoie de permis de muncă?",
        a: "Nu. Cetățenii statelor membre UE, ai Spațiului Economic European și ai Elveției pot lucra în România fără aviz de angajare. Pentru șederi mai lungi au formalități de înregistrare a rezidenței.",
      },
      {
        q: "Cât durează obținerea documentelor pentru un angajat non-UE?",
        a: "Depinde de autoritatea competentă, de completitudinea dosarului și de contingentul anual de lucrători străini. Vă spunem la depunere la ce să vă așteptați.",
      },
      {
        q: "Se schimbă des regulile?",
        a: "Da. Legislația privind încadrarea în muncă a străinilor a fost modificată de mai multe ori în ultimii ani, inclusiv în 2026. Verificăm procedura în vigoare la data fiecărei depuneri.",
      },
    ],
    related: ["salarizare-resurse-umane", "contabilitate", "infiintari-lichidari-firme"],
  },

  "firme-cu-probleme-financiare": {
    code: "Dificultate financiară",
    national: true,
    metaTitle: "Firme cu probleme financiare: plan, eșalonare",
    metaDescription:
      "Asistență pentru firme în dificultate, din toată țara: plan de afaceri, negocieri cu bănci, furnizori și leasing, dosar de eșalonare la ANAF. Biroul în Oradea.",
    intro: [
      "Daiamar asistă firmele din toată țara care au ajuns în dificultate: datorii la buget, întârzieri la bănci sau leasing, furnizori neplătiți. Facem un plan de afaceri realist, negociem cu creditorii perioade de grație sau reeșalonări și întocmim dosarul de eșalonare la ANAF.",
    ],
    includes: [
      {
        items: [
          "Asistență pentru firme cu probleme financiare, inclusiv probleme majore: plan de afaceri, negocieri cu furnizorii și cu clienții, negocieri cu băncile și cu societățile de leasing pentru perioade de grație sau reeșalonarea datoriilor. Lucrăm împreună cu specialiști colaboratori în acest domeniu.",
          "Întocmire dosare eșalonare",
        ],
      },
    ],
    forWhom: [
      "Firme cu datorii la bugetul de stat care au primit somații sau au conturile poprite.",
      "Firme cu rate restante la bănci sau la societăți de leasing.",
      "Firme cu lichidități blocate în creanțe neîncasate.",
      "Administratori care vor să știe dacă firma mai poate fi redresată și cum.",
    ],
    documents: [
      "Balanța de verificare la zi și ultimele situații financiare.",
      "Fișa pe plătitor de la ANAF și somațiile sau popririle primite.",
      "Contractele de credit și de leasing, cu graficele de rambursare.",
      "Lista furnizorilor și a clienților cu sume restante.",
    ],
    steps: [
      { title: "Diagnosticul", text: "Stabilim cât datorați, cui și cu ce scadențe. Vedem ce încasări reale are firma în următoarele luni." },
      { title: "Planul", text: "Întocmim planul de afaceri și de plată a datoriilor, pe care îl puteți prezenta băncii, ANAF și furnizorilor." },
      { title: "Negocierile", text: "Discutăm cu băncile, societățile de leasing și furnizorii pentru perioade de grație sau reeșalonări. La ANAF depunem dosarul de eșalonare." },
      { title: "Urmărirea", text: "Urmărim respectarea graficelor convenite și vă semnalăm din timp dacă apar abateri." },
    ],
    faq: [
      {
        q: "Pot obține eșalonare la ANAF dacă am deja popriri?",
        a: "Eșalonarea la plată este reglementată de Codul de procedură fiscală și poate fi acordată dacă firma îndeplinește condițiile prevăzute. Ca regulă, după aprobarea eșalonării, executarea silită se suspendă pentru obligațiile eșalonate. Analizăm situația concretă înainte de a depune dosarul.",
      },
      {
        q: "Ce înseamnă o perioadă de grație?",
        a: "O perioadă convenită cu creditorul în care firma nu plătește ratele sau plătește numai dobânda, pentru a-și reface lichiditatea. Se negociază cu fiecare bancă sau societate de leasing în parte.",
      },
      {
        q: "Firma poate ajunge la insolvență?",
        a: "Dacă datoriile nu mai pot fi plătite, legea prevede procedura insolvenței, cu reorganizare sau faliment. Analizăm împreună cu avocați colaboratori dacă este cazul și ce variante există înainte de acest pas.",
      },
      {
        q: "Ce nu puteți face?",
        a: "Nu putem șterge datorii și nu putem promite rezultatul unei negocieri. Putem pune cifrele în ordine, propune un plan credibil și purta discuțiile cu creditorii în numele dumneavoastră.",
      },
    ],
    related: ["consultanta-fiscala", "reprezentare-controale-anaf", "servicii-juridice"],
  },

  "servicii-juridice": {
    code: "Juridic",
    metaTitle: "Servicii juridice pentru firme, Oradea",
    metaDescription:
      "Servicii juridice pentru firme în Oradea, prin avocați colaboratori: înființări și modificări de societăți, litigii comerciale, civile și penale, acte fiscale.",
    intro: [
      "Daiamar oferă firmelor din Oradea, din Bihor și din alte județe servicii juridice prin avocați colaboratori: înființări și modificări de societăți, litigii comerciale, civile și penale, inclusiv acțiunile în instanță împotriva actelor fiscale.",
    ],
    includes: [
      {
        note: "Lucrăm cu avocați colaboratori, fiecare pe domeniul lui. Avocatul vă reprezintă, iar Daiamar pregătește partea contabilă și fiscală a dosarului.",
        items: ["Înființări firme", "Modificări în cadrul societăților", "Litigii comerciale, civile, penale"],
      },
    ],
    forWhom: [
      "Firme care au nevoie de un avocat pentru un litigiu cu un partener, un client sau un furnizor.",
      "Firme care contestă în instanță o decizie ANAF sau ITM.",
      "Asociați care modifică structura societății sau rezolvă un conflict între ei.",
    ],
    documents: [
      "Actele firmei și hotărârile asociaților relevante.",
      "Contractele și corespondența legate de litigiu.",
      "Actele administrative contestate și dovada comunicării lor.",
    ],
    steps: [
      { title: "Analiza speței", text: "Avocatul colaborator și echipa Daiamar studiază documentele și vă spun care sunt variantele." },
      { title: "Strategia", text: "Stabilim împreună pașii: negociere, notificare, acțiune în instanță sau modificare la Registrul Comerțului." },
      { title: "Reprezentarea", text: "Avocatul vă reprezintă în instanță sau în fața autorităților, iar noi furnizăm partea contabilă și fiscală a dosarului." },
    ],
    faq: [
      {
        q: "Avocații sunt angajați ai Daiamar?",
        a: "Nu. Lucrăm cu avocați colaboratori, specializați pe fiecare domeniu. Daiamar coordonează dosarul și furnizează partea economică. Reprezentarea juridică este asigurată de avocat, potrivit legii.",
      },
      {
        q: "Ce tipuri de litigii acoperiți?",
        a: "Litigii comerciale (contracte, creanțe neîncasate), civile și penale legate de activitatea economică, precum și acțiunile în instanță împotriva actelor fiscale, după respingerea contestației administrative.",
      },
      {
        q: "Pot contesta o decizie ANAF direct în instanță?",
        a: "Ca regulă, mai întâi se depune contestația administrativă la organul fiscal, în 45 de zile de la comunicare. Decizia dată asupra contestației poate fi atacată apoi la instanța de contencios administrativ. Pregătim ambele etape.",
      },
    ],
    related: ["reprezentare-controale-anaf", "infiintari-lichidari-firme", "firme-cu-probleme-financiare"],
  },
};

/*
Regulatory statements above were checked on 05.11.2026 against:
- Legea nr. 207/2015 (Codul de procedură fiscală): art. 115 inspecție generală/parțială, art. 122 aviz de inspecție
  (30 zile mari contribuabili / 15 zile ceilalți, amânare o singură dată), art. 270 contestație în 45 de zile, art. 281 contencios.
  https://static.anaf.ro/static/10/Anaf/legislatie/OPANAF_1229_2023.pdf · https://startupcafe.ro/cum-pot-sa-conteste-antreprenorii-deciziile-de-impunere-anaf-avocat-99215
- Legea contabilității nr. 82/1991, art. 10: contabilitate pe bază de contract cu membri CECCAR, răspunderea administratorului.
  https://legeaz.net/82-1991-legea-contabilitatii/art-10
- Legea nr. 162/2017 audit statutar; auditori autorizați ASPAAS; obligația de audit la depășirea a 2 din 3 criterii, 2 exerciții consecutive;
  audit intern obligatoriu pentru entitățile auditate statutar. https://static.anaf.ro/static/10/Anaf/legislatie/L_162_2017.pdf
  · https://www.contzilla.ro/ce-este-auditul-statutar-si-cand-este-obligatoriu-in-romania/
- Rambursare TVA din alt stat membru: Directiva 2008/9/CE, formular 318, termen 30 septembrie anul următor, perioadă 3 luni–1 an, decizie în 4 luni.
  https://static.anaf.ro/static/10/Galati/Vrancea/rambursare-TVA-318.pdf · https://www.contzilla.ro/recuperarea-tva-achitata-in-alt-stat-membru-ue/
- Formular A1: Regulamentele (CE) 883/2004 (art. 12 detașare max. 24 luni, art. 13 activitate în mai multe state) și 987/2009; emis de CNPP.
  https://www.contzilla.ro/documentul-portabil-a1-ce-este-si-cum-se-obtine/ · https://folositor.ro/ghid/formular-a1-detasare-asigurari-sociale-2026
- Aviz de angajare emis de IGI; contingent anual prin HG. Cadrul legal pentru lucrătorii non-UE a fost modificat în 2026 (OUG 32/2026 abrogă
  Titlul I din OG 25/2014, conform https://www.crowe.com/ro/news/se-schimba-cu-totul-cadrul-legal-pentru-angajarea-si-plasarea-lucratorilor-din-afara-ue-in-romania),
  de aceea pagina nu citează numere de acte și poartă un todo pentru lista de documente.
- REGES Online a înlocuit Revisal: HG 295/2025. https://www.inspectiamuncii.ro/reges-online
*/
