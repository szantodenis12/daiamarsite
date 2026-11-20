import type { MetadataRoute } from "next";
import { SITE_URL, services } from "@/lib/site";
import { articles } from "./(site)/resurse/articles";

// Date of the last content change per page. Bump it when the copy changes, not on every deploy.
const updated = {
  home: "2026-11-06",
  servicii: "2026-11-06",
  despre: "2026-11-06",
  echipa: "2026-11-06",
  contact: "2026-11-06",
  resurse: "2026-11-06",
  zone: "2026-11-06",
  en: "2026-11-06",
  it: "2026-11-06",
  legal: "2026-11-06",
};

const languages = { ro: `${SITE_URL}/`, en: `${SITE_URL}/en/`, it: `${SITE_URL}/it/`, "x-default": `${SITE_URL}/` };

// Left out on purpose: ad landings (/firme-noi/, /control-anaf/, /schimba-contabilul/), unreviewed articles, /multumim/, /newsletter/*, /trimite-documente/, /admin/, /api/.
export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, lastModified: string, alternates?: { languages: Record<string, string> }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(lastModified),
    ...(alternates && { alternates }),
  });

  return [
    entry("/", updated.home, { languages }),
    entry("/en/", updated.en, { languages }),
    entry("/it/", updated.it, { languages }),
    entry("/servicii/", updated.servicii),
    ...services.map((s) => entry(`/servicii/${s.slug}/`, updated.servicii)),
    entry("/clienti-din-toata-tara/", updated.zone),
    entry("/despre/", updated.despre),
    entry("/echipa/", updated.echipa),
    entry("/contact/", updated.contact),
    entry("/resurse/", updated.resurse),
    ...articles.filter((a) => a.reviewed).map((a) => entry(`/resurse/${a.slug}/`, a.updated)),
    entry("/confidentialitate/", updated.legal),
    entry("/cookies/", updated.legal),
    entry("/termeni/", updated.legal),
  ];
}
