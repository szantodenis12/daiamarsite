// "all" = the banner's Accept: the two attribution cookies (functional) and statistics (GA4 via GTM).
// The site sets no advertising cookies, so ad storage is never granted (see /cookies/).
export const CONSENT_CHOICES = ["all", "functional", "analytics", "none"] as const;
export type ConsentChoice = (typeof CONSENT_CHOICES)[number];

export const CONSENT_COOKIE = "dm_consent";
export const CONSENT_OPEN_EVENT = "dm:consent-open";
export const CONSENT_CHANGE_EVENT = "dm:consent-change";
const CONSENT_DAYS = 180;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// Consent Mode only accepts the real `arguments` object, not an array, so the parameters go unused.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

export const functionalAllowed = (choice: ConsentChoice | null) => choice === "all" || choice === "functional";
export const analyticsAllowed = (choice: ConsentChoice | null) => choice === "all" || choice === "analytics";

export function consentState(choice: ConsentChoice | null) {
  return { analytics_storage: analyticsAllowed(choice) ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
}

export function readConsent(): ConsentChoice | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(${CONSENT_CHOICES.join("|")})(?:;|$)`));
  return match ? (match[1] as ConsentChoice) : null;
}

export function saveConsent(choice: ConsentChoice) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${choice}; path=/; max-age=${CONSENT_DAYS * 86400}; samesite=lax${secure}`;
  gtag("consent", "update", consentState(choice));
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_CHANGE_EVENT, { detail: choice }));
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

export function track(event: string, params: Record<string, string | undefined>) {
  if (!analyticsAllowed(readConsent())) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
