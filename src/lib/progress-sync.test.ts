import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function jwt(sub: string) {
  const b = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, "");
  return `${b({ alg: "none" })}.${b({ sub })}.sig`;
}

class FakeStorage {
  m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
}

let ls: FakeStorage;
let fetchMock: ReturnType<typeof vi.fn>;
const P = "mogi-course:";
const setSession = (token = jwt("user-1")) => ls.setItem(P + "sb-session", JSON.stringify({ access_token: token, refresh_token: "r1" }));
const json = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status });

async function mods() {
  const sync = await import("./progress-sync.ts");
  const progress = await import("./progress.ts");
  sync._resetSync();
  return { sync, progress };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
  ls = new FakeStorage();
  vi.stubGlobal("localStorage", ls);
  fetchMock = vi.fn(async () => json(201));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("PUBLIC_SUPABASE_URL", "https://x.supabase.co");
  vi.stubEnv("PUBLIC_SUPABASE_ANON_KEY", "anon");
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("push", () => {
  it("does nothing without a session, and the save still lands locally", async () => {
    const { progress } = await mods();
    progress.save("prediction:a", 2);
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(progress.load("prediction:a")).toBe(2);
  });

  it("batches saves within the debounce into one upsert with the token's sub as user_id", async () => {
    setSession();
    const { progress } = await mods();
    progress.save("prediction:a", 1);
    progress.save("exercise:b", { done: true });
    progress.save("prediction:a", 3);
    await vi.advanceTimersByTimeAsync(1400);
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://x.supabase.co/rest/v1/progress?on_conflict=user_id,key");
    expect(init.method).toBe("POST");
    expect(init.headers.apikey).toBe("anon");
    expect(init.headers.Authorization).toBe(`Bearer ${jwt("user-1")}`);
    expect(init.headers.Prefer).toBe("resolution=merge-duplicates");
    const rows = JSON.parse(init.body);
    expect(rows).toHaveLength(2);
    expect(rows.every((r: any) => r.user_id === "user-1")).toBe(true);
    expect(rows.find((r: any) => r.key === "prediction:a").value).toBe(3);
  });

  it("never pushes sb-session or its own bookkeeping", async () => {
    setSession();
    const { progress } = await mods();
    progress.save("sb-session", { access_token: "x" });
    progress.save("sync-times", {});
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("on 401 asks the server (not Supabase) for a fresh token, stores it and retries once", async () => {
    setSession();
    const fresh = jwt("user-1") + "x";
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(200, { email: "a@first-edea.com", access_token: fresh }))
      .mockResolvedValueOnce(json(201));
    const { progress } = await mods();
    progress.save("exercise:a", 1);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("/auth/session");
    expect(init.method).toBe("GET");
    expect(init.cache).toBe("no-store");
    expect(init.headers["x-mogi-session"]).toBe("1");
    expect(fetchMock.mock.calls.some((c) => String(c[0]).includes("/auth/v1/token"))).toBe(false);
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe(`Bearer ${fresh}`);
    expect(JSON.parse(ls.getItem(P + "sb-session")!)).toEqual({ access_token: fresh });
  });

  it("replaces a token that is about to expire before using it", async () => {
    const soon = (sub: string, inSeconds: number) => {
      const b = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, "");
      return `${b({ alg: "none" })}.${b({ sub, exp: Math.floor(Date.now() / 1000) + inSeconds })}.sig`;
    };
    ls.setItem(P + "sb-session", JSON.stringify({ access_token: soon("user-1", 5) }));
    const fresh = soon("user-1", 3600);
    fetchMock.mockImplementation(async (url: string) => (url === "/auth/session" ? json(200, { access_token: fresh }) : json(201)));
    const { progress } = await mods();
    progress.save("exercise:a", 1);
    await vi.advanceTimersByTimeAsync(2000);
    const post = fetchMock.mock.calls.find((c) => c[1]?.method === "POST")!;
    expect(post[1].headers.Authorization).toBe(`Bearer ${fresh}`);
  });

  it("never keeps a refresh token in the page: a session saved by the earlier version is stripped", async () => {
    setSession();
    expect(JSON.parse(ls.getItem(P + "sb-session")!).refresh_token).toBe("r1");
    const { progress } = await mods();
    progress.save("exercise:a", 1);
    expect(JSON.parse(ls.getItem(P + "sb-session")!)).toEqual({ access_token: jwt("user-1") });
  });

  it("survives network failure and unavailable storage", async () => {
    setSession();
    fetchMock.mockRejectedValue(new Error("offline"));
    const { progress } = await mods();
    expect(() => progress.save("exercise:a", 1)).not.toThrow();
    await vi.advanceTimersByTimeAsync(5000);
    vi.stubGlobal("localStorage", { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } });
    expect(() => progress.save("exercise:a", 2)).not.toThrow();
    expect(progress.load("exercise:a")).toBeNull();
  });
});

describe("pull", () => {
  it("is a no-op without a session", async () => {
    const { sync } = await mods();
    expect(await sync.pullProgress()).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("server wins where newer, local wins (and is pushed) where newer or missing on the server", async () => {
    setSession();
    ls.setItem(P + "sync-times", JSON.stringify({ "exercise:old": 1000, "exercise:new": Date.parse("2030-01-01") }));
    ls.setItem(P + "exercise:old", JSON.stringify("local-old"));
    ls.setItem(P + "exercise:new", JSON.stringify("local-new"));
    ls.setItem(P + "exercise:only-local", JSON.stringify("mine"));
    fetchMock.mockImplementation(async (_u: string, init: any) =>
      init.method === "GET"
        ? json(200, [
            { user_id: "user-1", key: "exercise:old", value: "server-new", updated_at: "2026-01-01T00:00:00Z" },
            { user_id: "user-1", key: "exercise:new", value: "server-old", updated_at: "2026-01-01T00:00:00Z" },
            { user_id: "user-1", key: "prediction:remote", value: 4, updated_at: "2026-01-01T00:00:00Z" },
            { user_id: "user-1", key: "sb-session", value: "evil", updated_at: "2030-01-01T00:00:00Z" },
          ])
        : json(201),
    );
    const { sync, progress } = await mods();
    expect(await sync.pullProgress()).toBe(true);
    expect(progress.load("exercise:old")).toBe("server-new");
    expect(progress.load("exercise:new")).toBe("local-new");
    expect(progress.load("prediction:remote")).toBe(4);
    expect(JSON.parse(ls.getItem(P + "sb-session")!).access_token).toBe(jwt("user-1"));
    await vi.advanceTimersByTimeAsync(2000);
    const post = fetchMock.mock.calls.find((c) => c[1].method === "POST")!;
    const keys = JSON.parse(post[1].body).map((r: any) => r.key).sort();
    expect(keys).toEqual(["exercise:new", "exercise:only-local"]);
  });

  it("returns false (and leaves local data) when the server fails; the timeout wrapper never hangs", async () => {
    setSession();
    ls.setItem(P + "exercise:a", "1");
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const { sync } = await mods();
    const p = sync.pullProgressWithTimeout(4000);
    await vi.advanceTimersByTimeAsync(4001);
    expect(await p).toBe(false);
    expect(ls.getItem(P + "exercise:a")).toBe("1");
  });
});

describe("startSync without a stored session", () => {
  const serverSession = (sub = "user-1", extra: object = {}) => json(200, { email: "a@first-edea.com", access_token: jwt(sub), expires_at: 9999999999, ...extra });

  it("fetches the session from the server, stores it, pulls, then pushes what the server lacks", async () => {
    ls.setItem(P + "exercise:mine", JSON.stringify("local"));
    fetchMock.mockImplementation(async (url: string, init: any) => {
      if (url === "/auth/session") return serverSession();
      return init.method === "GET" ? json(200, [{ user_id: "user-1", key: "prediction:remote", value: 4, updated_at: "2026-01-01T00:00:00Z" }]) : json(201);
    });
    const { sync, progress } = await mods();
    expect(await sync.startSync()).toBe(true);
    const order = fetchMock.mock.calls.map((c) => `${c[1]?.method ?? "GET"} ${c[0]}`);
    expect(order[0]).toBe("GET /auth/session");
    expect(order[1]).toBe("GET https://x.supabase.co/rest/v1/progress?select=key,value,updated_at");
    expect(JSON.parse(ls.getItem(P + "sb-session")!)).toEqual({ access_token: jwt("user-1") });
    expect(progress.load("prediction:remote")).toBe(4);
    await vi.advanceTimersByTimeAsync(2000);
    const post = fetchMock.mock.calls.find((c) => c[1]?.method === "POST")!;
    expect(JSON.parse(post[1].body).map((r: any) => r.key)).toEqual(["exercise:mine"]);
  });

  it("sends the same-origin GET and never puts the session in a pushed row", async () => {
    fetchMock.mockImplementation(async (url: string, init: any) => (url === "/auth/session" ? serverSession() : init.method === "GET" ? json(200, []) : json(201)));
    const { sync } = await mods();
    await sync.startSync();
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "GET", credentials: "same-origin", cache: "no-store" });
    for (const c of fetchMock.mock.calls.filter((c) => c[1]?.method === "POST")) {
      expect(JSON.parse(c[1].body).some((r: any) => r.key === "sb-session" || r.key === "owner")).toBe(false);
    }
  });

  it("stays local when the server says signed out, and does not retry on every call", async () => {
    fetchMock.mockImplementation(async () => json(401, { error: "signed-out" }));
    const { sync, progress } = await mods();
    expect(await sync.startSync()).toBe(false);
    expect(await sync.startSync()).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    progress.save("exercise:a", 1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(progress.load("exercise:a")).toBe(1);
    expect(ls.getItem(P + "sb-session")).toBeNull();
  });

  it("does not hit the network at all without the Supabase settings", async () => {
    vi.stubEnv("PUBLIC_SUPABASE_URL", "");
    const { sync } = await mods();
    expect(await sync.startSync()).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the stored session when there is one (no server call)", async () => {
    setSession();
    fetchMock.mockImplementation(async (_u: string, init: any) => (init.method === "GET" ? json(200, []) : json(201)));
    const { sync } = await mods();
    expect(await sync.startSync()).toBe(true);
    expect(fetchMock.mock.calls.some((c) => c[0] === "/auth/session")).toBe(false);
  });

  it("shares one server request between concurrent callers", async () => {
    fetchMock.mockImplementation(async (url: string) => (url === "/auth/session" ? serverSession() : json(200, [])));
    const { sync } = await mods();
    await Promise.all([sync.fetchServerSession(), sync.fetchServerSession(), sync.startSync()]);
    expect(fetchMock.mock.calls.filter((c) => c[0] === "/auth/session")).toHaveLength(1);
  });

  it("ignores a malformed answer", async () => {
    fetchMock.mockImplementation(async () => json(200, { access_token: 5 }));
    const { sync } = await mods();
    expect(await sync.fetchServerSession()).toBeNull();
    expect(ls.getItem(P + "sb-session")).toBeNull();
  });
});

describe("two people on one browser", () => {
  const rowsFor = (sub: string) => (_u: string, init: any) =>
    Promise.resolve(init.method === "GET" ? json(200, [{ user_id: sub, key: `exercise:of-${sub}`, value: sub, updated_at: "2026-01-01T00:00:00Z" }]) : json(201));

  it("removes the previous person's answers when another person signs in, and pushes none of them", async () => {
    setSession(jwt("user-1"));
    ls.setItem(P + "owner", "user-1");
    ls.setItem(P + "exercise:of-user-1", JSON.stringify("user-1"));
    ls.setItem(P + "sync-times", JSON.stringify({ "exercise:of-user-1": 5 }));
    // a new sign-in as user-2 leaves a stale session of user-1 nowhere: the callback clears it, so the server is asked
    ls.removeItem(P + "sb-session");
    fetchMock.mockImplementation(async (url: string, init: any) => (url === "/auth/session" ? json(200, { access_token: jwt("user-2") }) : rowsFor("user-2")(url, init)));
    const { sync, progress } = await mods();
    await sync.startSync();
    await vi.advanceTimersByTimeAsync(5000);
    expect(progress.load("exercise:of-user-1")).toBeNull();
    expect(progress.load("exercise:of-user-2")).toBe("user-2");
    expect(ls.getItem(P + "owner")).toBe("user-2");
    for (const c of fetchMock.mock.calls.filter((c) => c[1]?.method === "POST")) {
      expect(c[1].body).not.toContain("of-user-1");
    }
  });

  it("keeps the same person's answers across sign-ins", async () => {
    ls.setItem(P + "owner", "user-1");
    ls.setItem(P + "exercise:local-only", JSON.stringify("kept"));
    fetchMock.mockImplementation(async (url: string, init: any) => (url === "/auth/session" ? json(200, { access_token: jwt("user-1") }) : rowsFor("user-1")(url, init)));
    const { sync, progress } = await mods();
    await sync.startSync();
    expect(progress.load("exercise:local-only")).toBe("kept");
  });

  it("claims an untagged mirror for the first person who signs in", async () => {
    ls.setItem(P + "exercise:old", JSON.stringify("old"));
    fetchMock.mockImplementation(async (url: string, init: any) => (url === "/auth/session" ? json(200, { access_token: jwt("user-1") }) : rowsFor("user-1")(url, init)));
    const { sync, progress } = await mods();
    await sync.startSync();
    expect(ls.getItem(P + "owner")).toBe("user-1");
    expect(progress.load("exercise:old")).toBe("old");
  });

  it("endSession sends what is queued, then removes the session, the mirror and the owner tag", async () => {
    setSession();
    ls.setItem(P + "owner", "user-1");
    fetchMock.mockImplementation(async (_u: string, init: any) => (init.method === "GET" ? json(200, []) : json(201)));
    const { sync, progress } = await mods();
    progress.save("exercise:last", { n: 1 });
    ls.setItem("unrelated", "stays");
    await sync.endSession();
    const post = fetchMock.mock.calls.find((c) => c[1]?.method === "POST");
    expect(post && JSON.parse(post[1].body)[0].key).toBe("exercise:last");
    expect([...ls.m.keys()].filter((k) => k.startsWith(P))).toEqual([]);
    expect(ls.getItem("unrelated")).toBe("stays");
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock.mock.calls.filter((c) => c[1]?.method === "POST")).toHaveLength(1);
  });

  it("endSession does not wait for a hung request longer than its limit", async () => {
    setSession();
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const { sync, progress } = await mods();
    progress.save("exercise:last", 1);
    const done = sync.endSession(2500);
    await vi.advanceTimersByTimeAsync(2600);
    await done;
    expect(ls.getItem(P + "sb-session")).toBeNull();
    expect(ls.getItem(P + "exercise:last")).toBeNull();
  });

  it("currentUser reads the email from the cached session, for display", async () => {
    const b = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, "");
    ls.setItem(P + "sb-session", JSON.stringify({ access_token: `${b({})}.${b({ sub: "u9", email: "dvir@first-edea.com" })}.s` }));
    const { sync } = await mods();
    expect(sync.currentUser()).toEqual({ id: "u9", email: "dvir@first-edea.com" });
    ls.clear?.();
    ls.m.clear();
    expect(sync.currentUser()).toBeNull();
  });
});
