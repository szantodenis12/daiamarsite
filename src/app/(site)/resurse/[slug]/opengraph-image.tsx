import { getArticle } from "../articles";
import { ogImage, ogContentType, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Ghid practic Daiamar";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  return ogImage(article?.title ?? "Ghiduri practice");
}
