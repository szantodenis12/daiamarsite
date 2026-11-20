import Image from "next/image";
import { LOGO } from "@/lib/images";

type Props = { width?: number; priority?: boolean; className?: string; alt?: string };

// The only place that knows the logo file: swap LOGO in lib/images.ts for the vector version when the client sends it.
export default function Logo({ width = 168, priority, className, alt = "Daiamar, soluții contabilitate" }: Props) {
  const height = Math.round((width / LOGO.width) * LOGO.height);
  return <Image src={LOGO.src} alt={alt} width={width} height={height} priority={priority} className={className} unoptimized />;
}
