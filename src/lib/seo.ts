import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  // null = the route has its own opengraph-image.tsx; an explicit list here would override it.
  image?: string | null;
  noindex?: boolean;
  languages?: Record<string, string>;
  type?: "website" | "article";
  published?: string;
};

// The layout appends " | Daiamar" (10 chars), so page titles stay under 50 characters.
export function pageMeta({ title, description, path, image = "/opengraph-image.png", noindex, languages, type = "website", published }: PageMeta): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path, ...(languages && { languages }) },
    ...(noindex && { robots: { index: false, follow: false } }),
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: "Daiamar",
      locale: path.startsWith("/en/") ? "en_GB" : path.startsWith("/it/") ? "it_IT" : "ro_RO",
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
      ...(type === "article" && published && { publishedTime: published }),
    },
    twitter: { card: "summary_large_image", title, description, ...(image && { images: [image] }) },
  };
}
