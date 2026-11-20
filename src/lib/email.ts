export type SendResult = { ok: true } | { ok: false; reason: string };

/** One Resend call for every email the site sends. Without RESEND_API_KEY nothing goes out and the caller decides what to show. */
export async function sendEmail(payload: Record<string, unknown>): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "RESEND_API_KEY nu este setat." };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.LEAD_NOTIFY_FROM ?? "Site Daiamar <onboarding@resend.dev>", ...payload }),
  });
  return response.ok ? { ok: true } : { ok: false, reason: `Resend a răspuns ${response.status}: ${await response.text()}` };
}

export const canSendEmail = () => Boolean(process.env.RESEND_API_KEY);
