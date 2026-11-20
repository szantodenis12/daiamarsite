export type SiteImage = { src: string; alt: string };

// Vector redraw of the old 295x35 PNG (Higgsfield redraw + potrace, 12.11.2026; source in _ref/logo/), without the thin tagline.
// Replace with the official vector if the client has one (de cerut de la client).
export const LOGO = { src: "/img/daiamar-logo.svg", width: 5685, height: 1372 };
export const MARK = "/img/mark.png";

// Every photo on the site comes from here. Daiamar office shoot, 11.11.2026 (originals in Roland's Downloads).
// Monitors showing client lists are blurred (GDPR). Hero photos retouched with Higgsfield from the real shots, faces checked against the team portraits; raw files in _ref/foto-hero-higgsfield/.
export const images = {
  intalnire: { src: "/img/foto/echipa-sala-sedinte-4898-original.jpg", alt: "Echipa Daiamar în sala de ședințe a biroului din Oradea" },
  daianaBirou: { src: "/img/foto/daiana-pop-birou.jpg", alt: "Daiana Maria Pop, expert contabil, verificând documente la birou" },
  mariusDosare: { src: "/img/foto/marius-pop-dosare.jpg", alt: "Marius Pop, economist senior, la raftul cu dosare" },
  sedintaEcran: { src: "/img/foto/echipa-sedinta-ecran.jpg", alt: "Echipa Daiamar analizează o situație pe ecran, în sala de ședințe" },
  monicaControl: { src: "/img/foto/monica-pop-control.jpg", alt: "Monica Diana Pop, expert contabil și consultant fiscal, la biroul ei din Oradea" },
  monicaBirou: { src: "/img/foto/monica-pop-birou.jpg", alt: "Monica Diana Pop, expert contabil, la biroul ei din Oradea" },
  monicaBiroulLat: { src: "/img/foto/monica-pop-birou-lat.jpg", alt: "Monica Diana Pop la biroul ei, în sediul Daiamar din Oradea" },
  strangereMana: { src: "/img/foto/predare-documente.jpg", alt: "Documente predate peste masă, în sala de ședințe Daiamar" },
  documenteMasa: { src: "/img/foto/birou-bibliorafturi.jpg", alt: "Bibliorafturi și laptop pe un birou Daiamar" },
  calculatorNotite: { src: "/img/foto/notite-calculator.jpg", alt: "Notițe, pix și calculator pe birou" },
  calculatorLaptop: { src: "/img/foto/birou-detaliu.jpg", alt: "Laptopuri și markere pe un birou de contabil" },
  birouColegi: { src: "/img/foto/colega-birou.jpg", alt: "Colegă Daiamar lucrând la birou, printre dosare" },
  contabilLaptop: { src: "/img/foto/coleg-laptop.jpg", alt: "Coleg Daiamar lucrând la laptop, în birou" },
  birouLaptop: { src: "/img/foto/birou-fereastra.jpg", alt: "Colegă Daiamar la birou, lângă fereastră" },
  birouDocumente: { src: "/img/foto/verificare-documente.jpg", alt: "Verificarea documentelor la birou" },
  birouDoiColegi: { src: "/img/foto/birou-echipa.jpg", alt: "Colege Daiamar în biroul de contabilitate" },
} satisfies Record<string, SiteImage>;
