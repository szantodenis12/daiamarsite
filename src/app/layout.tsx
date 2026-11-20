import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Analytics from "@/components/Analytics";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-jakarta" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Daiamar | Servicii contabilitate Oradea", template: "%s | Daiamar" },
  description: "Servicii contabilitate în Oradea. Peste 20 de ani de experiență în cadrul ANAF, divizia control fiscal. Consultanță, resurse umane, reprezentare la controale.",
  applicationName: "Daiamar",
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  openGraph: { type: "website", siteName: "Daiamar", locale: "ro_RO", images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

// Marks the page as script-enabled before first paint so pre-reveal states apply only with JS. If the motion code has not
// started after 5s (blocked script, failed chunk), the class is dropped and everything shows.
const jsFlag = `document.documentElement.classList.add("js");setTimeout(function(){var c=document.documentElement.classList;if(!c.contains("motion-ready"))c.remove("js")},5000)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
