// Runs in front of every course page and file. Without a valid session from the
// company domain, the request is sent to the sign-in page; nothing else is served.
import type { Config, Context } from "@netlify/edge-functions";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearedCookies, isPublicPath, readCookie, refreshSession, sessionCookies, verifyAccess, type AuthConfig } from "./lib/auth.ts";

const cfg = (): AuthConfig => ({
  supabaseUrl: Netlify.env.get("SUPABASE_URL") ?? "",
  anonKey: Netlify.env.get("SUPABASE_ANON_KEY") ?? "",
  allowedDomain: Netlify.env.get("ALLOWED_DOMAIN") ?? "first-edea.com",
});

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  if (isPublicPath(url.pathname)) return context.next();
  const c = cfg();
  if (!c.supabaseUrl) return new Response("The course is not configured (SUPABASE_URL is missing).", { status: 503 });

  const cookies = request.headers.get("cookie");
  const verdict = await verifyAccess(readCookie(cookies, ACCESS_COOKIE), c);
  if (verdict.ok) return context.next();

  const refresh = readCookie(cookies, REFRESH_COOKIE);
  if (verdict.reason !== "wrong-domain" && refresh) {
    const fresh = await refreshSession(refresh, c);
    if (fresh && (await verifyAccess(fresh.access, c)).ok) {
      const response = await context.next();
      for (const cookie of sessionCookies(fresh.access, fresh.refresh)) response.headers.append("set-cookie", cookie);
      return response;
    }
  }

  const login = new URL("/login/", url);
  if (verdict.reason === "wrong-domain") login.searchParams.set("error", "domain");
  else login.searchParams.set("next", url.pathname + url.search);
  const headers = new Headers({ location: login.toString(), "cache-control": "no-store" });
  for (const cookie of clearedCookies()) headers.append("set-cookie", cookie);
  return new Response(null, { status: 302, headers });
};

export const config: Config = { path: "/*", excludedPath: ["/login/", "/auth/*"] };
