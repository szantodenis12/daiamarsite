import { services, SITE_URL } from "@/lib/site";

export const LINK_PAGES = [
  { path: "/", label: "Prima pagină" },
  { path: "/firme-noi/", label: "Landing: Firme noi" },
  { path: "/control-anaf/", label: "Landing: Control ANAF" },
  { path: "/schimba-contabilul/", label: "Landing: Schimbă contabilul" },
  { path: "/servicii/", label: "Servicii" },
  ...services.map((s) => ({ path: `/servicii/${s.slug}/`, label: `Serviciu: ${s.title}` })),
  { path: "/despre/", label: "Despre" },
  { path: "/resurse/", label: "Resurse" },
  { path: "/contact/", label: "Contact" },
];

export type LinkFields = { page: string; source: string; medium: string; campaign: string; content: string };

export const LINK_PRESETS: { label: string; fields: Omit<LinkFields, "content"> }[] = [
  { label: "Flyer ONRC", fields: { page: "/firme-noi/", source: "onrc", medium: "print", campaign: "firme-noi" } },
  { label: "Carte de vizită", fields: { page: "/", source: "carte-vizita", medium: "print", campaign: "carte-vizita" } },
  { label: "Google Ads", fields: { page: "/control-anaf/", source: "google", medium: "cpc", campaign: "control-anaf" } },
  { label: "Meta", fields: { page: "/firme-noi/", source: "facebook", medium: "paid_social", campaign: "firme-noi" } },
  { label: "LinkedIn", fields: { page: "/", source: "linkedin", medium: "social", campaign: "linkedin" } },
  { label: "Semnătură email", fields: { page: "/", source: "semnatura-email", medium: "email", campaign: "semnatura" } },
];

export function campaignUrl({ page, source, medium, campaign, content }: LinkFields): string {
  const params = new URLSearchParams({ utm_source: source, utm_medium: medium, utm_campaign: campaign });
  if (content) params.set("utm_content", content);
  return `${SITE_URL}${page}?${params}`;
}
