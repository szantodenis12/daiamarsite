// Demo/preview deploys set NEXT_PUBLIC_SITE_URL to their own address so offer links, QR codes and e-mails point there.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.daiamar.ro").replace(/\/$/, "");
// Anything that isn't the real domain stays out of search engines.
export const IS_PRODUCTION_SITE = SITE_URL === "https://www.daiamar.ro";

type Company = {
  name: string;
  tagline: string;
  address: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  geo: { latitude: number; longitude: number };
  email: string;
  phones: { label: string; href: string }[];
  whatsapp: { label: string; number: string };
  languages: string[];
  hours: { label: string; days: string[]; opens: string; closes: string };
  mapsUrl: string;
  wazeUrl: string;
  googleMapsPlaceUrl: string;
  googleReviewUrl: string;
  /** CECCAR membership number; shown in the footer only when set. */
  ceccarNo?: string;
  legal: { name: string; cui: string; regCom: string };
};

const geo = { latitude: 47.0414479, longitude: 21.9399665 };

export const company: Company = {
  name: "Daiamar",
  tagline: "Soluții contabilitate",
  address: "Str. Beiușului nr. 52, Oradea",
  street: "Str. Beiușului nr. 52",
  city: "Oradea",
  region: "Bihor",
  // Postal code and coordinates: Google Maps place result for "Strada Beiușului 52, Oradea" (06.11.2026).
  postalCode: "410484",
  geo,
  email: "contact@daiamar.ro",
  phones: [
    { label: "0741 021 805", href: "tel:+40741021805" },
    { label: "0799 988 955", href: "tel:+40799988955" },
  ],
  // Confirmed by Roland (06.11.2026). wa.me wants the number without "+".
  whatsapp: { label: "0741 021 805", number: "40741021805" },
  languages: ["română", "engleză", "italiană"],
  // Confirmed by Roland (12.11.2026): L-V 8-16.
  hours: { label: "Luni - vineri, 08:00 - 16:00", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "16:00" },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Str.+Beiu%C8%99ului+52+Oradea",
  wazeUrl: `https://waze.com/ul?ll=${geo.latitude},${geo.longitude}&navigate=yes`,
  // TODO: after the Google Business Profile is claimed, put the place link and the g.page/r/.../review link here.
  googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Daiamar+Str.+Beiu%C8%99ului+52+Oradea",
  googleReviewUrl: "https://www.google.com/maps/search/?api=1&query=Daiamar+Str.+Beiu%C8%99ului+52+Oradea",
  // TODO: de cerut de la client numărul de membru CECCAR (ceccarNo).
  // Public data, firmepenet.ro (06.11.2026). TODO: de confirmat cu clientul care firmă este operator (au și Audit and Consultancy SRL, CUI 40283372).
  legal: { name: "DAIAMAR CONSULTING GROUP S.R.L.", cui: "51203220", regCom: "J2025006147001" },
};

const WHATSAPP_TEXT = "Bună ziua, vă scriu de pe site-ul daiamar.ro.";
export const whatsappHref = `https://wa.me/${company.whatsapp.number}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

export type ServiceGroup = "baza" | "control" | "specializate" | "situatii";

export type Service = {
  slug: string;
  title: string;
  short: string;
  group: ServiceGroup;
};

// Order = order on the hub page. A1 and work permits stay in "specializate", never in hero/top blocks.
export const services: Service[] = [
  { slug: "contabilitate", title: "Contabilitate", short: "Societăți comerciale, PFA, întreprinderi individuale.", group: "baza" },
  { slug: "salarizare-resurse-umane", title: "Salarizare și resurse umane", short: "Personal, salarizare, registrul general al salariaților.", group: "baza" },
  { slug: "consultanta-fiscala", title: "Consultanță fiscală", short: "Analiza costurilor, optimizare fiscală, dosare de eșalonare.", group: "baza" },
  { slug: "reprezentare-controale-anaf", title: "Reprezentare la controale ANAF și ITM", short: "Inspecții generale și parțiale, contestații, acțiuni în instanță.", group: "control" },
  { slug: "audit-intern-extern", title: "Audit intern și audit extern", short: "Pentru firme care vor să știe unde stau înainte de un control.", group: "control" },
  { slug: "infiintari-lichidari-firme", title: "Înființări și lichidări de firme", short: "Înființări de societăți și PFA, modificări la Registrul Comerțului, lichidări.", group: "specializate" },
  { slug: "rambursari-tva-ue", title: "Rambursări TVA din statele UE", short: "Documentația pentru recuperarea TVA plătit în alte state membre.", group: "specializate" },
  { slug: "formulare-a1", title: "Formulare A1", short: "Pentru personalul care lucrează în UE: delegație, detașare, șoferi.", group: "specializate" },
  { slug: "permise-de-munca", title: "Permise de muncă", short: "Pentru angajarea cetățenilor non-UE.", group: "specializate" },
  { slug: "firme-cu-probleme-financiare", title: "Firme cu probleme financiare", short: "Plan de afaceri, negocieri cu bănci, furnizori, leasing.", group: "situatii" },
  { slug: "servicii-juridice", title: "Servicii juridice", short: "Prin avocați colaboratori: comercial, civil, penal.", group: "situatii" },
];

export const nav = [
  { href: "/servicii/", label: "Servicii" },
  { href: "/servicii/reprezentare-controale-anaf/", label: "Controale ANAF" },
  { href: "/despre/", label: "Despre" },
  { href: "/echipa/", label: "Echipa" },
  { href: "/resurse/", label: "Resurse" },
  { href: "/contact/", label: "Contact" },
];
