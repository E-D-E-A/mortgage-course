/**
 * What a signed-in page may ask the server for: its own access token, so the browser can talk to
 * Supabase for the learner's progress (row-level security keeps each learner to their own rows).
 *
 * The rule is the gate's rule, not a new one: the access cookie must verify against the company
 * domain (verifyAccess, unchanged). When it has expired, the HttpOnly refresh cookie is exchanged at
 * Supabase on the server, exactly as the gate does, and the new cookies are set on this response.
 * The refresh token itself never leaves the cookie: the page gets an access token (valid for up to an
 * hour) and, when it expires, asks here again. Handing the page a copy of the refresh token would
 * defeat HttpOnly and, because Supabase rotates refresh tokens, would also race the gate's own refresh
 * and get the whole session revoked.
 *
 * Same origin only: no CORS headers, a custom request header a cross-site page cannot send without a
 * preflight (which is never answered), and Sec-Fetch-Site must not say cross-site. Never cached, never logged.
 */
import { ACCESS_COOKIE, REFRESH_COOKIE, clearedCookies, readCookie, refreshSession, sessionCookies, verifyAccess, type AuthConfig } from "./auth.ts";
import type { JWTVerifyGetKey } from "jose";

export const PAGE_SESSION_HEADER = "x-mogi-session";

export interface PageSessionDeps {
  keys?: JWTVerifyGetKey;
  fetchImpl?: typeof fetch;
  secure?: boolean;
}

const baseHeaders = () =>
  new Headers({
    "content-type": "application/json",
    "cache-control": "no-store, max-age=0",
    pragma: "no-cache",
    vary: "Cookie, Sec-Fetch-Site",
    "x-content-type-options": "nosniff",
  });

const reply = (status: number, body: unknown, cookies: string[] = []) => {
  const headers = baseHeaders();
  for (const c of cookies) headers.append("set-cookie", c);
  return new Response(JSON.stringify(body), { status, headers });
};

/** The `exp` claim (seconds). Read after verifyAccess has accepted the token; not a check on its own. */
export function tokenExpiry(token: string): number | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const exp = JSON.parse(atob(part)).exp;
    return typeof exp === "number" && Number.isFinite(exp) ? exp : null;
  } catch {
    return null;
  }
}

/** True for a request the browser sent from our own pages with fetch(): never a navigation or a cross-site request. */
export function isSameOriginPageRequest(request: Request): boolean {
  if (request.headers.get(PAGE_SESSION_HEADER) !== "1") return false;
  const site = request.headers.get("sec-fetch-site");
  if (site !== null && site !== "same-origin") return false;
  const mode = request.headers.get("sec-fetch-mode");
  return mode === null || mode === "cors" || mode === "same-origin";
}

export async function pageSession(request: Request, cfg: AuthConfig, deps: PageSessionDeps = {}): Promise<Response> {
  if (request.method !== "GET") return new Response(null, { status: 405, headers: { allow: "GET, POST" } });
  if (!isSameOriginPageRequest(request)) return reply(403, { error: "same-origin-only" });

  const secure = deps.secure ?? true;
  const cookies = request.headers.get("cookie");
  const access = readCookie(cookies, ACCESS_COOKIE);
  const verdict = await verifyAccess(access, cfg, deps.keys);
  if (verdict.ok) return reply(200, { email: verdict.email, access_token: access, expires_at: tokenExpiry(access!) });
  if (verdict.reason === "wrong-domain") return reply(403, { error: "wrong-domain" }, clearedCookies(secure));

  const refresh = readCookie(cookies, REFRESH_COOKIE);
  if (refresh && verdict.reason !== "unverified-email") {
    const fresh = await refreshSession(refresh, cfg, deps.fetchImpl).catch(() => null);
    if (fresh) {
      const again = await verifyAccess(fresh.access, cfg, deps.keys);
      if (again.ok) {
        return reply(200, { email: again.email, access_token: fresh.access, expires_at: tokenExpiry(fresh.access) }, sessionCookies(fresh.access, fresh.refresh, secure));
      }
    }
  }
  return reply(401, { error: "signed-out" });
}
