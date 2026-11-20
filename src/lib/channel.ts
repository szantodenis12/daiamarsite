import type { Touch } from "@/lib/attribution";

export const CHANNELS = [
  "Google Ads",
  "Google organic",
  "Meta Ads",
  "Facebook / Instagram organic",
  "LinkedIn",
  "Bing",
  "AI (ChatGPT, Perplexity)",
  "Email",
  "Flyer ONRC",
  "Print / QR",
  "Alte site-uri",
  "Direct",
] as const;

export type Channel = (typeof CHANNELS)[number];

export type Classified = { channel: Channel; detail?: string };

const PAID_MEDIUM = /^(cpc|ppc|cpm|cpv|paid|ads?|display|banner|paid[-_ ]?social|social[-_ ]?paid|paid[-_ ]?search|retargeting|remarketing)$/;
const PRINT_MEDIUM = /^(print|qr|qr[-_ ]?code|flyer|offline|poster|afis|brosura)$/;
const EMAIL_MEDIUM = /^(e-?mail|newsletter)$/;
const META_SOURCE = /^(facebook|fb|instagram|ig|meta|messenger|threads)(\.com)?$/;
const AI_SOURCE = /^(chatgpt(\.com)?|openai|perplexity(\.ai)?|gemini|copilot|claude(\.ai)?)$/;

const AI_HOSTS = ["chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "copilot.microsoft.com", "claude.ai"];
const EMAIL_HOSTS = ["mail.google.com", "outlook.live.com", "outlook.office.com", "mail.yahoo.com", "mail.yahoo.ro"];
const META_HOSTS = ["facebook.com", "instagram.com", "fb.com", "messenger.com", "threads.net"];
const LINKEDIN_HOSTS = ["linkedin.com", "lnkd.in"];

function matchesHost(host: string, domains: string[]): boolean {
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function referrerHost(referrer?: string): string | undefined {
  if (!referrer) return undefined;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return undefined;
  }
}

function fromReferrer(host: string): Classified {
  if (matchesHost(host, AI_HOSTS)) return { channel: "AI (ChatGPT, Perplexity)", detail: host };
  if (matchesHost(host, EMAIL_HOSTS)) return { channel: "Email", detail: host };
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return { channel: "Google organic" };
  if (matchesHost(host, ["bing.com"])) return { channel: "Bing" };
  if (matchesHost(host, META_HOSTS)) return { channel: "Facebook / Instagram organic", detail: host };
  if (matchesHost(host, LINKEDIN_HOSTS)) return { channel: "LinkedIn" };
  return { channel: "Alte site-uri", detail: host };
}

export function classify(touch: Touch | null | undefined): Classified {
  if (!touch) return { channel: "Direct" };

  const source = touch.utm_source?.toLowerCase() ?? "";
  const medium = touch.utm_medium?.toLowerCase() ?? "";
  const paid = PAID_MEDIUM.test(medium);
  const host = referrerHost(touch.referrer);

  if (source === "onrc") return { channel: "Flyer ONRC", detail: touch.utm_campaign };
  if (touch.gclid || touch.gbraid || touch.wbraid) return { channel: "Google Ads", detail: touch.utm_campaign };
  if (touch.msclkid) return { channel: "Bing", detail: "Microsoft Ads" };
  if (touch.li_fat_id) return { channel: "LinkedIn", detail: "LinkedIn Ads" };
  if (PRINT_MEDIUM.test(medium) || source === "qr") return { channel: "Print / QR", detail: source || undefined };
  if (EMAIL_MEDIUM.test(medium) || source === "newsletter") return { channel: "Email", detail: source || undefined };

  if (paid) {
    if (source === "google" || source === "adwords") return { channel: "Google Ads", detail: touch.utm_campaign };
    if (META_SOURCE.test(source) || touch.fbclid) return { channel: "Meta Ads", detail: touch.utm_campaign };
    if (source === "linkedin") return { channel: "LinkedIn", detail: "LinkedIn Ads" };
    if (source === "bing" || source === "microsoft") return { channel: "Bing", detail: "Microsoft Ads" };
  }

  if (source) {
    if (META_SOURCE.test(source)) return { channel: "Facebook / Instagram organic", detail: source };
    if (AI_SOURCE.test(source)) return { channel: "AI (ChatGPT, Perplexity)", detail: source };
    if (source === "google") return { channel: "Google organic", detail: medium || undefined };
    if (source === "linkedin") return { channel: "LinkedIn" };
    if (source === "bing") return { channel: "Bing" };
  }

  if (touch.fbclid) return { channel: "Facebook / Instagram organic", detail: host };
  if (host) return fromReferrer(host);
  if (source) return { channel: "Alte site-uri", detail: source };
  return { channel: "Direct" };
}
