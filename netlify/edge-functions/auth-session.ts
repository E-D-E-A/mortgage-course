// Turns a fresh Supabase sign-in into the course's session cookies, after
// checking the token and the company domain on the server.
import type { Config } from "@netlify/edge-functions";
import { clearedCookies, sessionCookies, verifyAccess } from "./lib/auth.ts";
import { pageSession } from "./lib/page-session.ts";

export default async (request: Request) => {
  // GET: a signed-in page asks for its own access token (same origin only; see lib/page-session.ts).
  if (request.method === "GET") {
    return pageSession(request, {
      supabaseUrl: Netlify.env.get("SUPABASE_URL") ?? "",
      anonKey: Netlify.env.get("SUPABASE_ANON_KEY") ?? "",
      allowedDomain: Netlify.env.get("ALLOWED_DOMAIN") ?? "first-edea.com",
    });
  }
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const { access_token, refresh_token } = (await request.json().catch(() => ({}))) as { access_token?: string; refresh_token?: string };
  const verdict = await verifyAccess(access_token, {
    supabaseUrl: Netlify.env.get("SUPABASE_URL") ?? "",
    anonKey: Netlify.env.get("SUPABASE_ANON_KEY") ?? "",
    allowedDomain: Netlify.env.get("ALLOWED_DOMAIN") ?? "first-edea.com",
  });
  const headers = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  if (!verdict.ok || !refresh_token) {
    for (const cookie of clearedCookies()) headers.append("set-cookie", cookie);
    return new Response(JSON.stringify({ error: verdict.ok ? "missing-refresh" : verdict.reason }), { status: 403, headers });
  }
  for (const cookie of sessionCookies(access_token!, refresh_token)) headers.append("set-cookie", cookie);
  return new Response(JSON.stringify({ email: verdict.email }), { status: 200, headers });
};

export const config: Config = { path: "/auth/session" };
