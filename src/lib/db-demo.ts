import { bucharestDay } from "@/lib/crm";
import { generateDemo } from "@/lib/demo-data";
import { DemoReadOnlyError } from "@/lib/demo";
import { memoryBackend } from "@/lib/db-file";
import type { Backend } from "@/lib/db-types";

const READ_ONLY = new Set<string>([
  "leadsSince", "eventsSince", "getLead", "activities", "spend", "links", "offers", "getOffer", "offerByToken", "subscribers",
  "subscriberByEmail", "subscriberByToken", "files", "demoFiles", "getFile", "getSetting",
]);

/** Sample data generated in memory for today's date (same for every server instance), exposed read-only. */
async function build(day: string): Promise<Backend> {
  const [y, m, d] = day.split("-").map(Number);
  const store = memoryBackend();
  // Anchored to the start of today, so every instance generates identical data for the same day.
  await generateDemo(store, { now: Date.UTC(y, m - 1, d), stableTokens: true });
  return new Proxy(store, {
    get(target, key: string) {
      const value = (target as Record<string, unknown>)[key];
      if (typeof value !== "function" || READ_ONLY.has(key)) return value;
      return async () => {
        throw new DemoReadOnlyError();
      };
    },
  });
}

export function demoBackend(): Backend {
  let current: { day: string; ready: Promise<Backend> } | null = null;
  const ready = () => {
    const day = bucharestDay(new Date());
    if (!current || current.day !== day) current = { day, ready: build(day) };
    return current.ready;
  };
  return new Proxy({ kind: "demo" } as unknown as Backend, {
    get(target, key: string) {
      if (key === "kind") return "demo";
      return async (...args: unknown[]) => ((await ready()) as unknown as Record<string, (...a: unknown[]) => unknown>)[key](...args);
    },
  });
}
