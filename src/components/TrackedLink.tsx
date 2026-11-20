"use client";

import { sendEvent } from "@/lib/attribution";
import { track } from "@/lib/consent";

export type TrackedLinkProps = {
  kind: "phone" | "email" | "whatsapp" | "maps" | "review";
  href: string;
  placement: string;
  className?: string;
  "aria-label"?: string;
  children: React.ReactNode;
};

export default function TrackedLink({ kind, href, placement, className, children, ...rest }: TrackedLinkProps) {
  const external = kind === "whatsapp" || kind === "maps" || kind === "review";

  function handleClick() {
    sendEvent(kind, placement);
    track("contact_click", { contact_kind: kind, placement });
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...rest} {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
      {children}
    </a>
  );
}
