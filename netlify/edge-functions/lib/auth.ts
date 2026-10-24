/**
 * The course's access rule, as one testable module used by the edge functions.
 *
 * A request may see a course page only with a valid Supabase access token whose
 * email belongs to the company Google Workspace domain. The domain is checked
 * here, on the server, on every request — never only in the page.
 * (The same rule is enforced again in Supabase: a hook refuses to create a user
 * from another domain, and row-level security refuses another domain's rows.)
 */
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from "jose";

export const ACCESS_COOKIE = "mc_at";
export const REFRESH_COOKIE = "mc_rt";

export interface AuthConfig {
  supabaseUrl: string;
  anonKey: string;
  allowedDomain: string;
}

export type Verdict =
  | { ok: true; email: string }
  | { ok: false; reason: "missing" | "invalid" | "expired" | "wrong-domain" | "unverified-email" };

export function emailAllowed(email: unknown, domain: string): boolean {
  if (typeof email !== "string") return false;
  const at = email.lastIndexOf("@");
  return at > 0 && email.slice(at + 1).toLowerCase() === domain.toLowerCase();
}

const keySets = new Map<string, JWTVerifyGetKey>();
export function jwksFor(supabaseUrl: string): JWTVerifyGetKey {
  let set = keySets.get(supabaseUrl);
  if (!set) {
    set = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
    keySets.set(supabaseUrl, set);
  }
  return set;
}

/** Verifies a Supabase access token and the company-domain rule. `keys` is injectable for tests. */
export async function verifyAccess(token: string | undefined, cfg: AuthConfig, keys: JWTVerifyGetKey = jwksFor(cfg.supabaseUrl)): Promise<Verdict> {
  if (!token) return { ok: false, reason: "missing" };
  let payload: JWTPayload & { email?: unknown; user_metadata?: { email_verified?: boolean } };
  try {
    ({ payload } = await jwtVerify(token, keys, { issuer: `${cfg.supabaseUrl}/auth/v1`, audience: "authenticated" }));
  } catch (e) {
    return { ok: false, reason: (e as { code?: string }).code === "ERR_JWT_EXPIRED" ? "expired" : "invalid" };
  }
  if (!emailAllowed(payload.email, cfg.allowedDomain)) return { ok: false, reason: "wrong-domain" };
  if (payload.user_metadata?.email_verified === false) return { ok: false, reason: "unverified-email" };
  return { ok: true, email: payload.email as string };
}

export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

export function sessionCookies(access: string, refresh: string, secure = true): string[] {
  const flags = `Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
  return [`${ACCESS_COOKIE}=${encodeURIComponent(access)}; Max-Age=3600; ${flags}`, `${REFRESH_COOKIE}=${encodeURIComponent(refresh)}; Max-Age=2592000; ${flags}`];
}

export function clearedCookies(secure = true): string[] {
  const flags = `Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
  return [`${ACCESS_COOKIE}=; Max-Age=0; ${flags}`, `${REFRESH_COOKIE}=; Max-Age=0; ${flags}`];
}

/** Exchanges a refresh token for a new session at Supabase. Returns null when Supabase refuses it. */
export async function refreshSession(refresh: string, cfg: AuthConfig, fetchImpl: typeof fetch = fetch) {
  const res = await fetchImpl(`${cfg.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: cfg.anonKey },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { access_token?: string; refresh_token?: string };
  return body.access_token && body.refresh_token ? { access: body.access_token, refresh: body.refresh_token } : null;
}

/** The logo files the sign-in page and the tab icon use. They hold no course content. */
const PUBLIC_BRAND_FILES = new Set([
  "/brand/mogi-logo.png",
  "/brand/mogi-course-icon.svg",
  "/brand/mogi-course-favicon-64.png",
  "/brand/mogi-course-favicon-180.png",
]);

/** Paths anyone may load: the sign-in page and what it needs. Everything else is gated. */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login/" ||
    pathname === "/login" ||
    pathname.startsWith("/auth/") ||
    PUBLIC_BRAND_FILES.has(pathname) ||
    // The Heebo font files, so the sign-in page is in the brand's font. Fonts hold no course content.
    (pathname.startsWith("/_astro/") && /\.(woff2?)$/.test(pathname))
  );
}
