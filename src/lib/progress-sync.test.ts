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

  it("refreshes the token on 401, stores the new session and retries once", async () => {
    setSession();
    const fresh = jwt("user-1");
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(200, { access_token: fresh + "x", refresh_token: "r2" }))
      .mockResolvedValueOnce(json(201));
    const { progress } = await mods();
    progress.save("exercise:a", 1);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe("https://x.supabase.co/auth/v1/token?grant_type=refresh_token");
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe(`Bearer ${fresh}x`);
    expect(JSON.parse(ls.getItem(P + "sb-session")!)).toEqual({ access_token: fresh + "x", refresh_token: "r2" });
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
    expect(JSON.parse(ls.getItem(P + "sb-session")!).refresh_token).toBe("r1");
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
