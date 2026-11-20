import type { NextConfig } from "next";

// Report-Only until GTM is configured: a blocking CSP would need nonces for Next's inline scripts
// and a complete list of the tags GTM loads. Switch the header name once reports are clean (see DEPLOY.md).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.google.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.google.com https://stats.g.doubleclick.net https://www.facebook.com",
  "frame-src 'self' https://www.openstreetmap.org https://www.googletagmanager.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "report-uri /api/csp-report/",
  "report-to csp",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Reporting-Endpoints", value: 'csp="/api/csp-report/"' },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: __dirname,
  trailingSlash: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    const isDemo = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.daiamar.ro") !== "https://www.daiamar.ro";
    const headers = isDemo ? [...securityHeaders, { key: "X-Robots-Tag", value: "noindex, nofollow" }] : securityHeaders;
    return [{ source: "/(.*)", headers }];
  },
  async redirects() {
    // Old WordPress URLs (live sitemap, 06.11.2026). /en/ and /it/ keep their paths. Old /wp-content/ images have no equivalent and return 404.
    const old: [string, string][] = [
      ["/despre-daiamar-servicii-contabilitate-oradea", "/despre/"],
      ["/servicii-contabilitate-consultanta-juridice", "/servicii/"],
      ["/servicii-contabilitate-oradea", "/servicii/contabilitate/"],
      ["/servicii-consultanta-audit-oradea", "/servicii/consultanta-fiscala/"],
      ["/servicii-hr-resurse-umane-oradea", "/servicii/salarizare-resurse-umane/"],
      ["/servicii-juridice-oradea", "/servicii/servicii-juridice/"],
    ];
    return [
      // Canonical host is www, with the trailing slash kept so the apex lands on the final URL. Vercel does the same at the
      // domain level. Next's own trailing-slash redirect runs first, so an apex URL without the slash takes two hops.
      { source: "/", has: [{ type: "host", value: "daiamar.ro" }], destination: "https://www.daiamar.ro/", permanent: true },
      { source: "/:file(.+\\.[a-zA-Z0-9]+)", has: [{ type: "host", value: "daiamar.ro" }], destination: "https://www.daiamar.ro/:file", permanent: true },
      { source: "/:path+", has: [{ type: "host", value: "daiamar.ro" }], destination: "https://www.daiamar.ro/:path+/", permanent: true },
      ...old.map(([source, destination]) => ({ source: `${source}/`, destination, permanent: true })),
      ...old.map(([source, destination]) => ({ source, destination, permanent: true })),
      // Pre-launch slug of the national page (preview links only).
      { source: "/zone-deservite/", destination: "/clienti-din-toata-tara/", permanent: true },
      { source: "/zone-deservite", destination: "/clienti-din-toata-tara/", permanent: true },
    ];
  },
};

export default nextConfig;
