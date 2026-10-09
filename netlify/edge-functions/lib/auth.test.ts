import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import { emailAllowed, isPublicPath, readCookie, refreshSession, sessionCookies, verifyAccess, type AuthConfig } from "./auth.ts";

const cfg: AuthConfig = { supabaseUrl: "https://example.supabase.co", anonKey: "anon", allowedDomain: "first-edea.com" };
let sign: (claims: Record<string, unknown>, opts?: { exp?: string | number; iss?: string; aud?: string }) => Promise<string>;
let keys: ReturnType<typeof createLocalJWKSet>;
let otherKey: CryptoKey;

beforeAll(async () => {
  const { publicKey, privateKey } = await generateKeyPair("ES256");
  const jwk = { ...(await exportJWK(publicKey)), kid: "k1", alg: "ES256" };
  keys = createLocalJWKSet({ keys: [jwk] });
  otherKey = (await generateKeyPair("ES256")).privateKey;
  sign = (claims, opts = {}) =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: "ES256", kid: "k1" })
      .setIssuer(opts.iss ?? `${cfg.supabaseUrl}/auth/v1`)
      .setAudience(opts.aud ?? "authenticated")
      .setIssuedAt()
      .setExpirationTime(opts.exp ?? "1h")
      .sign(privateKey);
});

describe("verifyAccess", () => {
  it("lets in a valid token from the company domain", async () => {
    const v = await verifyAccess(await sign({ email: "dvir@first-edea.com" }), cfg, keys);
    expect(v).toEqual({ ok: true, email: "dvir@first-edea.com" });
  });

  it("refuses another domain, even a look-alike", async () => {
    for (const email of ["someone@gmail.com", "x@first-edea.com.evil.com", "x@notfirst-edea.com"]) {
      expect(await verifyAccess(await sign({ email }), cfg, keys)).toEqual({ ok: false, reason: "wrong-domain" });
    }
  });

  it("refuses a token with no email", async () => {
    expect(await verifyAccess(await sign({}), cfg, keys)).toEqual({ ok: false, reason: "wrong-domain" });
  });

  it("reports an expired token as expired, so the gate can refresh it", async () => {
    const t = await sign({ email: "a@first-edea.com" }, { exp: Math.floor(Date.now() / 1000) - 60 });
    expect(await verifyAccess(t, cfg, keys)).toEqual({ ok: false, reason: "expired" });
  });

  it("refuses a token from another issuer, audience or key", async () => {
    expect((await verifyAccess(await sign({ email: "a@first-edea.com" }, { iss: "https://other.supabase.co/auth/v1" }), cfg, keys)).ok).toBe(false);
    expect((await verifyAccess(await sign({ email: "a@first-edea.com" }, { aud: "anon" }), cfg, keys)).ok).toBe(false);
    const forged = await new SignJWT({ email: "a@first-edea.com" })
      .setProtectedHeader({ alg: "ES256", kid: "k1" })
      .setIssuer(`${cfg.supabaseUrl}/auth/v1`)
      .setAudience("authenticated")
      .setExpirationTime("1h")
      .sign(otherKey);
    expect(await verifyAccess(forged, cfg, keys)).toEqual({ ok: false, reason: "invalid" });
  });

  it("refuses an unsigned token", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
    const body = Buffer.from(JSON.stringify({ email: "a@first-edea.com", aud: "authenticated", iss: `${cfg.supabaseUrl}/auth/v1` })).toString("base64url");
    expect(await verifyAccess(`${header}.${body}.`, cfg, keys)).toEqual({ ok: false, reason: "invalid" });
  });

  it("treats a missing token as missing", async () => {
    expect(await verifyAccess(undefined, cfg, keys)).toEqual({ ok: false, reason: "missing" });
  });
});

describe("helpers", () => {
  it("matches the domain exactly and without case", () => {
    expect(emailAllowed("A@First-EDEA.com", "first-edea.com")).toBe(true);
    expect(emailAllowed("first-edea.com", "first-edea.com")).toBe(false);
  });

  it("reads cookies", () => {
    expect(readCookie("a=1; mc_at=tok%2Ben; b=2", "mc_at")).toBe("tok+en");
    expect(readCookie(null, "mc_at")).toBeUndefined();
  });

  it("sets HttpOnly, Secure, SameSite=Lax cookies", () => {
    for (const c of sessionCookies("a", "r")) expect(c).toMatch(/HttpOnly; SameSite=Lax; Secure$/);
  });

  it("keeps everything gated except sign-in and fonts", () => {
    expect(isPublicPath("/login/")).toBe(true);
    expect(isPublicPath("/auth/callback/")).toBe(true);
    expect(isPublicPath("/_astro/heebo-hebrew-400-normal.woff2")).toBe(true);
    for (const p of ["/", "/lessons/0-3/", "/_astro/index.js", "/_astro/main.css", "/video/0-3.mp4", "/glossary/"]) {
      expect(isPublicPath(p)).toBe(false);
    }
  });

  it("returns null when Supabase refuses a refresh", async () => {
    const refused = (async () => new Response("{}", { status: 400 })) as typeof fetch;
    expect(await refreshSession("r", cfg, refused)).toBeNull();
  });
});
