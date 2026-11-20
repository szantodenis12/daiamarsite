import type { MetadataRoute } from "next";
import { IS_PRODUCTION_SITE, SITE_URL } from "@/lib/site";

const privatePaths = ["/admin/", "/api/", "/oferta/", "/firme-noi/", "/control-anaf/", "/schimba-contabilul/", "/multumim/", "/newsletter/", "/trimite-documente/"];

// AI search crawlers are allowed on purpose: the site is meant to be cited for "contabilitate Oradea" type questions.
const aiCrawlers = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_SITE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/", disallow: privatePaths })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
