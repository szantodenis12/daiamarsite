// Demo data for /admin. Everything is marked demo=true and removed with "Șterge datele demo".
// Run: npm run seed (uses DATABASE_URL from .env.local when present, otherwise .data/db.json).
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";

// The app imports "@/lib/..." without extensions (Next resolves them); teach Node the same rule.
const src = new URL("../src/", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    const local = specifier.startsWith("@/") ? new URL(specifier.slice(2), src) : specifier.startsWith(".") && context.parentURL?.startsWith(src.href) ? new URL(specifier, context.parentURL) : null;
    if (local && !/\.[cm]?[jt]sx?$/.test(local.pathname)) {
      for (const ext of [".ts", ".tsx"]) if (existsSync(new URL(local.href + ext))) return next(local.href + ext, context);
    }
    return next(local?.href ?? specifier, context);
  },
});

const { db }: typeof import("../src/lib/db") = await import(new URL("../src/lib/db.ts", import.meta.url).href);
const { generateDemo }: typeof import("../src/lib/demo-data") = await import(new URL("../src/lib/demo-data.ts", import.meta.url).href);

const store = db();
const result = await generateDemo(store, { reset: true });
console.log(
  `Seeded ${result.offers} demo offers, ${result.leads} demo leads, ${result.activities} activities, ${result.months} months of ad spend and ${result.links} links, ${result.subscribers} subscribers (${process.env.DATABASE_URL ? "Neon" : ".data/db.json"}).`,
);
