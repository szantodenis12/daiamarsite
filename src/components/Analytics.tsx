"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { captureAttribution, forgetAttribution, persistAttribution, sendEvent } from "@/lib/attribution";
import { analyticsAllowed, CONSENT_CHANGE_EVENT, CONSENT_CHOICES, CONSENT_COOKIE, consentState, functionalAllowed, readConsent, type ConsentChoice } from "@/lib/consent";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const states = Object.fromEntries(CONSENT_CHOICES.map((choice) => [choice, consentState(choice)]));

// Consent Mode v2 defaults, everything denied. GTM itself is only injected after the visitor accepts statistics.
const consentDefaults = `
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',${JSON.stringify(consentState(null))});
var c=document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=(${CONSENT_CHOICES.join("|")})(?:;|$)/);
if(c){gtag('consent','update',${JSON.stringify(states)}[c[1]]);}
`;

const gtmLoader = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;

// No tracking on the admin, the private offer pages or the newsletter pages (their URL carries the subscriber's token).
const PRIVATE_PATH = /^\/(admin|oferta|newsletter)(\/|$)/;

export default function Analytics() {
  const pathname = usePathname();
  const [statistics, setStatistics] = useState(false);

  // Runs once per full page load; client-side navigation keeps the touch from the landing URL.
  useEffect(() => {
    setStatistics(analyticsAllowed(readConsent()));
    const onChange = (event: Event) => {
      const choice = (event as CustomEvent<ConsentChoice>).detail;
      if (functionalAllowed(choice)) persistAttribution();
      else forgetAttribution();
      setStatistics(analyticsAllowed(choice));
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    if (!PRIVATE_PATH.test(location.pathname) && captureAttribution(functionalAllowed(readConsent()))) sendEvent("visit");
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  if (PRIVATE_PATH.test(pathname) || !GTM_ID) return null;
  return (
    <>
      <Script id="consent-defaults" strategy="afterInteractive">{consentDefaults}</Script>
      {statistics && <Script id="gtm" strategy="afterInteractive">{gtmLoader}</Script>}
    </>
  );
}
