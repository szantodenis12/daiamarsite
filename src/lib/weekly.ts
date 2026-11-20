import { bucharestDay, OPEN_STATUSES } from "@/lib/crm";
import { db, type Lead } from "@/lib/db";
import { notifyRecipients } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

const DAY = 86400_000;
const lei = new Intl.NumberFormat("ro-RO");

export type WeeklyResult =
  | { status: "sent"; to: string[]; subject: string }
  | { status: "skipped"; reason: string; subject: string; text: string }
  | { status: "error"; reason: string };

function countByChannel(leads: Lead[]): string[] {
  const counts = new Map<string, number>();
  for (const l of leads) counts.set(l.channel, (counts.get(l.channel) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).map(([channel, n]) => `  ${channel}: ${n}`);
}

export async function buildWeeklySummary(now = new Date()) {
  const since = new Date(now.getTime() - 7 * DAY);
  const all = (await db().leadsSince(new Date(0))).filter((l) => !l.suspect);
  const week = all.filter((l) => new Date(l.createdAt) >= since);
  const won = all.filter((l) => l.status === "client" && l.wonAt && new Date(l.wonAt) >= since);
  const today = bucharestDay(now);
  const overdue = all.filter((l) => OPEN_STATUSES.includes(l.status) && l.nextActionAt && l.nextActionAt < today);
  const untouched = all.filter((l) => l.status === "nou" && !l.firstContactAt && now.getTime() - new Date(l.createdAt).getTime() > DAY);
  const wonMonthly = won.reduce((sum, l) => sum + (l.monthlyValue ?? 0), 0);

  const lines = [
    `Rezumatul săptămânii (${bucharestDay(since).split("-").reverse().join(".")} – ${today.split("-").reverse().join(".")})`,
    "",
    `Cereri noi: ${week.length}`,
    ...countByChannel(week),
    "",
    `${won.length === 1 ? "Client câștigat" : "Clienți câștigați"}: ${won.length}${won.length ? ` (${lei.format(wonMonthly)} lei/lună)` : ""}`,
    ...won.map((l) => `  ${l.name}${l.company ? `, ${l.company}` : ""} (${l.channel})`),
    "",
    `Follow-up-uri restante: ${overdue.length}`,
    ...overdue.slice(0, 10).map((l) => `  ${l.name}: ${l.nextAction || "fără descriere"} (din ${l.nextActionAt?.split("-").reverse().join(".")})`),
    ...(overdue.length > 10 ? [`  și încă ${overdue.length - 10}`] : []),
    "",
    `Cereri noi necontactate de peste 24 h: ${untouched.length}`,
    "",
    `Panoul: ${SITE_URL}/admin/`,
  ];
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  return { subject: `Daiamar: ${plural(week.length, "cerere nouă", "cereri noi")}, ${plural(won.length, "client câștigat", "clienți câștigați")}`, text: lines.join("\n") };
}

export async function sendWeeklySummary(): Promise<WeeklyResult> {
  try {
    const { subject, text } = await buildWeeklySummary();
    const apiKey = process.env.RESEND_API_KEY;
    const { to } = await notifyRecipients();
    if (!apiKey) return { status: "skipped", reason: "RESEND_API_KEY nu este setat.", subject, text };
    if (!to.length) return { status: "skipped", reason: "Nu există nicio adresă de notificare.", subject, text };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.LEAD_NOTIFY_FROM ?? "Site Daiamar <onboarding@resend.dev>", to, subject, text }),
    });
    if (!response.ok) return { status: "error", reason: `Resend a răspuns ${response.status}: ${await response.text()}` };
    return { status: "sent", to, subject };
  } catch (error) {
    return { status: "error", reason: error instanceof Error ? error.message : String(error) };
  }
}
