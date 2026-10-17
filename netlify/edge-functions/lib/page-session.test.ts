import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { AuthConfig } from "./auth.ts";
import { isSameOriginPageRequest, pageSession, tokenExpiry } from "./page-session.ts";

const cfg: AuthConfig = { supabaseUrl: "https://example.supabase.co", anonKey: "anon", allowedDomain: "first-edea.com" };
let sign: (claims: Record<string, unknown>, exp?: string | number) => Promise<string>;
let keys: ReturnType<typeof createLocalJWKSet>;

beforeAll(async () => {
  const { publicKey, privateKey } = await generateKeyPair("ES256");
  keys = createLocalJWKSet({ keys: [{ ...(await exportJWK(publicKey)), kid: "k1", alg: "ES256" }] });
  sign = (claims, exp = "1h") =>
    new SignJWT(claims).setProtectedHeader({ alg: "ES256", kid: "k1" }).setIssuer(`${cfg.supabaseUrl}/auth/v1`).setAudience("authenticated").setIssuedAt().setExpirationTime(exp).sign(privateKey);
});

const ask = (cookie: string | null, headers: Record<string, string> = {}, method = "GET") =>
  new Request("https://course.example/auth/session", { method, headers: { "x-mogi-session": "1", "sec-fetch-site": "same-origin", "sec-fetch-mode": "cors", ...(cookie ? { cookie } : {}), ...headers } });

describe("GET /auth/session", () => {
  it("gives a valid company session its own access token, uncached, with no CORS headers and no cookie changes", async () => {
    const token = await sign({ email: "dvir@first-edea.com" });
    const res = await pageSession(ask(`mc_at=${token}; mc_rt=r1`), cfg, { keys });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe("dvir@first-edea.com");
    expect(body.access_token).toBe(token);
    expect(body.expires_at).toBe(tokenExpiry(token));
    expect(body).not.toHaveProperty("refresh_token");
    expect(JSON.stringify(body)).not.toContain("r1");
    expect(res.headers.get("cache-control")).toMatch(/no-store/);
    expect(res.headers.get("set-cookie")).toBeNull();
    expect([...res.headers.keys()].filter((h) => h.startsWith("access-control-"))).toEqual([]);
  });

  it("refuses another domain and clears the cookies, even with a valid signature", async () => {
    const token = await sign({ email: "someone@gmail.com" });
    const res = await pageSession(ask(`mc_at=${token}; mc_rt=r1`), cfg, { keys });
    expect(res.status).toBe(403);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ error: "wrong-domain" });
    expect(text).not.toContain(token);
    expect(res.headers.get("set-cookie")).toMatch(/Max-Age=0/);
  });

  it("answers 401 with nothing to hand out when signed out", async () => {
    const res = await pageSession(ask(null), cfg, { keys });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "signed-out" });
  });

  it("refreshes an expired access token on the server, sets the new cookies and returns only the new access token", async () => {
    const expired = await sign({ email: "a@first-edea.com" }, Math.floor(Date.now() / 1000) - 60);
    const fresh = await sign({ email: "a@first-edea.com" });
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ access_token: fresh, refresh_token: "r2" }), { status: 200 })) as unknown as typeof fetch;
    const res = await pageSession(ask(`mc_at=${expired}; mc_rt=r1`), cfg, { keys, fetchImpl });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.access_token).toBe(fresh);
    expect(JSON.stringify(body)).not.toContain("r2");
    const cookies = res.headers.getSetCookie().join("\n");
    expect(cookies).toContain("mc_rt=r2");
    expect(cookies).toMatch(/HttpOnly/);
  });

  it("does not hand out a token from a refresh that returns another domain's session", async () => {
    const fresh = await sign({ email: "x@gmail.com" });
    const fetchImpl = (async () => new Response(JSON.stringify({ access_token: fresh, refresh_token: "r2" }), { status: 200 })) as unknown as typeof fetch;
    const res = await pageSession(ask(`mc_rt=r1`), cfg, { keys, fetchImpl });
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("is 401 when Supabase refuses the refresh", async () => {
    const fetchImpl = (async () => new Response("{}", { status: 400 })) as unknown as typeof fetch;
    expect((await pageSession(ask("mc_rt=r1"), cfg, { keys, fetchImpl })).status).toBe(401);
    const boom = (async () => { throw new Error("down"); }) as unknown as typeof fetch;
    expect((await pageSession(ask("mc_rt=r1"), cfg, { keys, fetchImpl: boom })).status).toBe(401);
  });

  it("is for fetch() from our own pages only", async () => {
    const token = await sign({ email: "a@first-edea.com" });
    const cookie = `mc_at=${token}`;
    expect((await pageSession(ask(cookie, { "x-mogi-session": "" }), cfg, { keys })).status).toBe(403);
    expect((await pageSession(ask(cookie, { "sec-fetch-site": "cross-site" }), cfg, { keys })).status).toBe(403);
    expect((await pageSession(ask(cookie, { "sec-fetch-site": "same-site" }), cfg, { keys })).status).toBe(403);
    expect((await pageSession(ask(cookie, { "sec-fetch-site": "none", "sec-fetch-mode": "navigate" }), cfg, { keys })).status).toBe(403);
    expect((await pageSession(ask(cookie, { "sec-fetch-mode": "navigate" }), cfg, { keys })).status).toBe(403);
    expect(isSameOriginPageRequest(new Request("https://course.example/auth/session", { headers: { "x-mogi-session": "1" } }))).toBe(true);
  });

  it("only answers GET here (POST stays the sign-in exchange)", async () => {
    expect((await pageSession(ask(null, {}, "DELETE"), cfg, { keys })).status).toBe(405);
  });
});
