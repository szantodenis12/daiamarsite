// Quick check of the channel rules: npm run check:channels
import type { Touch } from "../src/lib/attribution";

const { classify }: typeof import("../src/lib/channel") = await import(new URL("../src/lib/channel.ts", import.meta.url).href);

const t = (fields: Partial<Touch>): Touch => ({ landing: "/", at: new Date().toISOString(), ...fields });

const cases: [string, Touch | null, string][] = [
  ["no touch", null, "Direct"],
  ["empty touch", t({}), "Direct"],
  ["gclid", t({ gclid: "x" }), "Google Ads"],
  ["gbraid (iOS)", t({ gbraid: "x" }), "Google Ads"],
  ["utm google cpc", t({ utm_source: "google", utm_medium: "cpc" }), "Google Ads"],
  ["google referrer", t({ referrer: "https://www.google.ro/" }), "Google organic"],
  ["fbclid + paid utm", t({ fbclid: "x", utm_source: "fb", utm_medium: "paid" }), "Meta Ads"],
  ["instagram paid_social", t({ utm_source: "instagram", utm_medium: "paid_social" }), "Meta Ads"],
  ["fbclid only", t({ fbclid: "x", referrer: "https://l.facebook.com/" }), "Facebook / Instagram organic"],
  ["instagram referrer", t({ referrer: "https://l.instagram.com/" }), "Facebook / Instagram organic"],
  ["linkedin referrer", t({ referrer: "https://www.linkedin.com/" }), "LinkedIn"],
  ["li_fat_id", t({ li_fat_id: "x" }), "LinkedIn"],
  ["bing referrer", t({ referrer: "https://www.bing.com/search?q=x" }), "Bing"],
  ["msclkid", t({ msclkid: "x" }), "Bing"],
  ["chatgpt utm", t({ utm_source: "chatgpt.com" }), "AI (ChatGPT, Perplexity)"],
  ["perplexity referrer", t({ referrer: "https://www.perplexity.ai/" }), "AI (ChatGPT, Perplexity)"],
  ["gemini referrer", t({ referrer: "https://gemini.google.com/" }), "AI (ChatGPT, Perplexity)"],
  ["newsletter", t({ utm_source: "newsletter", utm_medium: "email" }), "Email"],
  ["gmail referrer", t({ referrer: "https://mail.google.com/" }), "Email"],
  ["ONRC flyer QR", t({ utm_source: "onrc", utm_medium: "print", utm_campaign: "firme-noi" }), "Flyer ONRC"],
  ["other print QR", t({ utm_source: "targ-bihor", utm_medium: "qr" }), "Print / QR"],
  ["referral", t({ referrer: "https://www.listafirme.ro/firma/x" }), "Alte site-uri"],
  ["unknown utm source", t({ utm_source: "partener" }), "Alte site-uri"],
];

let failed = 0;
for (const [name, touch, expected] of cases) {
  const { channel } = classify(touch);
  const ok = channel === expected;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${channel}${ok ? "" : ` (expected ${expected})`}`);
}
console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
