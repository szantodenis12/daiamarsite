import { company, services, SITE_URL } from "@/lib/site";
import { content, type Line } from "../(site)/servicii/content";
import { articles } from "../(site)/resurse/articles";

export const dynamic = "force-static";

// Generated at build from the same content the pages use. Lines still waiting for the client are skipped,
// and articles appear only once Daiamar has reviewed them.
const text = (line: Line) => (typeof line === "string" ? line : null);

function section(title: string, lines: (string | null)[]) {
  return [`## ${title}`, ...lines.filter((l): l is string => Boolean(l)), ""].join("\n");
}

export function GET() {
  const parts: string[] = [
    "# Daiamar, servicii contabilitate Oradea",
    "",
    "> Societate de contabilitate cu biroul în Oradea, județul Bihor, și clienți din toată România, membră CECCAR. Contabilitate, consultanță fiscală, salarizare și resurse umane, reprezentare la controale ANAF și ITM, audit intern și extern. Peste 20 de ani de experiență în cadrul ANAF, divizia control fiscal. Limbi de lucru: română, engleză, italiană.",
    "",
    section("Date de contact", [
      `Nume: ${company.name} (denumirea juridică completă: de confirmat)`,
      `Adresă: ${company.address}, județul ${company.region}, cod poștal ${company.postalCode}, România`,
      `Telefon: ${company.phones.map((p) => p.label).join(", ")}`,
      `E-mail: ${company.email}`,
      `Site: ${SITE_URL}/`,
      `Coordonate: ${company.geo.latitude}, ${company.geo.longitude}`,
      `Program de lucru: ${company.hours.label}`,
      "Arie de lucru: firme din toată România. Biroul este în Oradea; firmele din Oradea și din județul Bihor pot preda documentele și la birou. Documentele se transmit electronic, programele de contabilitate permit operare online, verificarea la sediul beneficiarului se face atunci când se impune.",
      `Cum colaborăm la distanță: ${SITE_URL}/clienti-din-toata-tara/`,
    ]),
  ];

  for (const s of services) {
    const c = content[s.slug];
    if (!c) continue;
    parts.push(
      section(`Serviciu: ${s.title}`, [
        `URL: ${SITE_URL}/servicii/${s.slug}/`,
        ...c.intro,
        "",
        "Ce include:",
        ...c.includes.flatMap((sec) => sec.items.map(text).map((t) => (t ? `- ${t}` : null))),
        "",
        "Pentru cine:",
        ...c.forWhom.map((f) => `- ${f}`),
        "",
        "Întrebări frecvente:",
        ...c.faq.flatMap((f) => [`Î: ${f.q}`, `R: ${f.a}`]),
      ]),
    );
  }

  for (const a of articles.filter((x) => x.reviewed)) {
    parts.push(
      section(`Ghid: ${a.title}`, [
        `URL: ${SITE_URL}/resurse/${a.slug}/`,
        `Publicat: ${a.published}, actualizat: ${a.updated}`,
        a.lead,
        ...a.sections.flatMap((sec) => [``, `### ${sec.title}`, ...(sec.text ?? []), ...(sec.list ?? []).map((l) => `- ${l}`)]),
        "",
        ...a.faq.flatMap((f) => [`Î: ${f.q}`, `R: ${f.a}`]),
      ]),
    );
  }

  parts.push(
    section("Ce nu face Daiamar", [
      "- Nu publică prețuri pe site; onorariul se stabilește după prima discuție.",
      "- Nu promite rezultatul unui control sau al unei contestații.",
      "- Nu ține evidența pentru persoane fizice fără activitate economică.",
    ]),
  );

  return new Response(parts.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
