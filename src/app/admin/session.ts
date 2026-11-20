import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const AUTHOR_COOKIE = "dm_author";

const signedIn = async () => verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);

/**
 * The middleware already guards /admin, but every page, server action and route handler checks the cookie again:
 * server actions can be posted to any URL, and one middleware bypass must not expose the leads.
 */
export async function requireSession() {
  if (!(await signedIn())) redirect("/admin/login/");
}

/** For route handlers: a 401 response when the session is missing, null when it is fine. */
export async function requireApiSession(): Promise<NextResponse | null> {
  return (await signedIn()) ? null : NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

/** Who is using the panel on this device. No user accounts: the person picks their name once. */
export async function currentAuthor(): Promise<string> {
  return (await cookies()).get(AUTHOR_COOKIE)?.value || "Echipa";
}
