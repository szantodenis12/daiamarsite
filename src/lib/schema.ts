import { MARK } from "@/lib/images";
import { company, services, SITE_URL } from "@/lib/site";

export const FIRM_ID = `${SITE_URL}/#firma`;
export const SITE_ID = `${SITE_URL}/#site`;
const LOGO = `${SITE_URL}${MARK}`;
const IMAGE = `${SITE_URL}/opengraph-image.png`;

// Wikidata: Romania Q218, Oradea Q93358, Bihor County Q179588 (checked 06.11.2026).
// The office is in Oradea; clients come from the whole country (Roland, 06.11.2026).
const country = { "@type": "Country", name: "România", sameAs: "https://www.wikidata.org/wiki/Q218" };
const areaServed = [
  country,
  { "@type": "City", name: "Oradea", sameAs: "https://www.wikidata.org/wiki/Q93358" },
  { "@type": "AdministrativeArea", name: "Județul Bihor", sameAs: "https://www.wikidata.org/wiki/Q179588" },
];

// No priceRange or ratings: unknown until the client confirms them.
export const businessSchema = {
  "@type": ["AccountingService", "ProfessionalService"],
  "@id": FIRM_ID,
  name: company.name,
  alternateName: "Daiamar Oradea",
  description:
    "Societate de contabilitate cu biroul în Oradea și clienți din toată România, membră CECCAR: contabilitate, consultanță fiscală, salarizare și resurse umane, reprezentare la controale ANAF și ITM, audit intern și extern. Peste 20 de ani de experiență în cadrul ANAF, divizia control fiscal.",
  url: `${SITE_URL}/`,
  logo: LOGO,
  image: IMAGE,
  telephone: company.phones.map((p) => p.href.replace("tel:", "")),
  email: company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: company.street,
    addressLocality: company.city,
    addressRegion: company.region,
    postalCode: company.postalCode,
    addressCountry: "RO",
  },
  geo: { "@type": "GeoCoordinates", latitude: company.geo.latitude, longitude: company.geo.longitude },
  hasMap: company.mapsUrl,
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: company.hours.days,
    opens: company.hours.opens,
    closes: company.hours.closes,
  },
  areaServed,
  knowsLanguage: ["ro", "en", "it"],
  memberOf: {
    "@type": "Organization",
    name: "CECCAR, Corpul Experților Contabili și Contabililor Autorizați din România",
    url: "https://ceccar.ro/",
  },
  knowsAbout: ["contabilitate", "fiscalitate", "inspecție fiscală ANAF", "salarizare", "resurse umane", "audit intern", "audit extern", "TVA intracomunitar"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicii Daiamar",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", "@id": `${SITE_URL}/servicii/${s.slug}/#serviciu`, name: s.title, url: `${SITE_URL}/servicii/${s.slug}/` },
    })),
  },
};

export const websiteSchema = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: `${SITE_URL}/`,
  name: company.name,
  inLanguage: ["ro", "en", "it"],
  publisher: { "@id": FIRM_ID },
};

type PageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ItemPage";

export function webPageSchema(path: string, name: string, description: string, type: PageType = "WebPage", inLanguage = "ro") {
  const url = `${SITE_URL}${path}`;
  return {
    "@type": type,
    "@id": `${url}#pagina`,
    url,
    name,
    description,
    inLanguage,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": FIRM_ID },
    primaryImageOfPage: { "@type": "ImageObject", url: IMAGE },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}${items[items.length - 1].path}#breadcrumb`,
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `${SITE_URL}${item.path}` })),
  };
}

// Services that do not depend on the office location (control ANAF, audit, consultanță, TVA UE, A1, permise) are served country-wide.
export function serviceSchema(slug: string, name: string, description: string, national = false) {
  const url = `${SITE_URL}/servicii/${slug}/`;
  return {
    "@type": "Service",
    "@id": `${url}#serviciu`,
    name,
    description,
    url,
    serviceType: name,
    provider: { "@id": FIRM_ID },
    areaServed: national ? country : areaServed,
    availableLanguage: company.languages,
  };
}

export function articleSchema(a: { slug: string; title: string; description: string; published: string; updated: string }) {
  const url = `${SITE_URL}/resurse/${a.slug}/`;
  return {
    "@type": "Article",
    "@id": `${url}#articol`,
    headline: a.title,
    description: a.description,
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: "ro",
    author: { "@id": FIRM_ID },
    publisher: { "@id": FIRM_ID },
    image: IMAGE,
    mainEntityOfPage: { "@id": `${url}#pagina` },
  };
}

// The firm and the site go on every page so the graph stays connected.
export function baseGraph(page: ReturnType<typeof webPageSchema>, ...rest: object[]) {
  return [businessSchema, websiteSchema, page, ...rest];
}
