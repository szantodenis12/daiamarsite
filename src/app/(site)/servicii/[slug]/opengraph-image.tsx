import { services } from "@/lib/site";
import { ogImage, ogContentType, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Daiamar, servicii contabilitate în Oradea";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  return ogImage(service?.title ?? "Servicii contabilitate");
}
