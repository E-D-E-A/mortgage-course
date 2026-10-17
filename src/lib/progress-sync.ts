/**
 * Per-learner progress sync with the course's Supabase project.
 * localStorage stays the source the components read (synchronously); this module mirrors it to
 * public.progress (row-level security keeps each learner to their own rows) and merges it back on sign-in.
 * Every function here is best-effort: no session, no storage, no network or a refused request is silent,
 * and the course keeps working from localStorage.
 */
const PREFIX = "mogi-course:";
const SESSION_KEY = "sb-session";
const TIMES_KEY = "sync-times";
const DEBOUNCE_MS = 1500;

type Session = { access_token: string; refresh_token: string };
type Row = { user_id: string; key: string; value: unknown; updated_at: string };

function env(name: "PUBLIC_SUPABASE_URL" | "PUBLIC_SUPABASE_ANON_KEY"): string {
  return String((import.meta as any).env?.[name] ?? "");
}

/** Keys that are not learner progress: the login session and this module's own bookkeeping. */
export function isProgressKey(key: string): boolean {
  return key.length > 0 && key.length <= 200 && key !== SESSION_KEY && key !== TIMES_KEY;
}

function store(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readSession(): Session | null {
  try {
    const raw = store()?.getItem(PREFIX + SESSION_KEY);
    const s = raw ? JSON.parse(raw) : null;
    return s?.access_token && s?.refresh_token ? s : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session): void {
  try {
    store()?.setItem(PREFIX + SESSION_KEY, JSON.stringify({ access_token: s.access_token, refresh_token: s.refresh_token }));
  } catch {
    /* ignore */
  }
}

/** The user id is the access token's `sub` claim. Not verified here: the server checks the token on every request. */
function userIdOf(token: string): string | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(Uint8Array.from(atob(part), (c) => c.charCodeAt(0)));
    const sub = JSON.parse(json).sub;
    return typeof sub === "string" && sub ? sub : null;
  } catch {
    return null;
  }
}

function readTimes(): Record<string, number> {
  try {
    const raw = store()?.getItem(PREFIX + TIMES_KEY);
    const t = raw ? JSON.parse(raw) : {};
    return t && typeof t === "object" ? t : {};
  } catch {
    return {};
  }
}

function writeTimes(t: Record<string, number>): void {
  try {
    store()?.setItem(PREFIX + TIMES_KEY, JSON.stringify(t));
  } catch {
    /* ignore */
  }
}

async function refresh(s: Session): Promise<Session | null> {
  try {
    const res = await fetch(`${env("PUBLIC_SUPABASE_URL")}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: env("PUBLIC_SUPABASE_ANON_KEY"), "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    if (!res.ok) return null;
    const b = await res.json();
    if (!b?.access_token || !b?.refresh_token) return null;
    const next = { access_token: b.access_token as string, refresh_token: b.refresh_token as string };
    writeSession(next);
    return next;
  } catch {
    return null;
  }
}

/** One authenticated REST call; on 401 refreshes the token once and retries. Returns null on any failure. */
async function rest(path: string, init: { method: string; body?: string; prefer?: string }): Promise<Response | null> {
  let session = readSession();
  if (!session || !env("PUBLIC_SUPABASE_URL") || !env("PUBLIC_SUPABASE_ANON_KEY")) return null;
  const go = (s: Session) =>
    fetch(`${env("PUBLIC_SUPABASE_URL")}/rest/v1/${path}`, {
      method: init.method,
      headers: {
        apikey: env("PUBLIC_SUPABASE_ANON_KEY"),
        Authorization: `Bearer ${s.access_token}`,
        "content-type": "application/json",
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
      body: init.body,
    });
  try {
    let res = await go(session);
    if (res.status === 401) {
      session = await refresh(session);
      if (!session) return null;
      res = await go(session);
    }
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

// ---- push -------------------------------------------------------------------------------------

const pending = new Map<string, unknown>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function upsert(rows: { key: string; value: unknown; at: number }[]): Promise<void> {
  const session = readSession();
  const uid = session && userIdOf(session.access_token);
  if (!uid || rows.length === 0) return;
  const body = JSON.stringify(
    rows.map((r) => ({ user_id: uid, key: r.key, value: r.value, updated_at: new Date(r.at).toISOString() })),
  );
  await rest("progress?on_conflict=user_id,key", { method: "POST", body, prefer: "resolution=merge-duplicates" });
}

function flush(): void {
  timer = null;
  const batch = [...pending];
  pending.clear();
  const times = readTimes();
  void upsert(batch.map(([key, value]) => ({ key, value, at: times[key] ?? Date.now() }))).catch(() => {});
}

/** Called by save(): stamps the key's local time and queues one debounced, batched upsert. Never throws. */
export function recordSave(key: string, value: unknown): void {
  try {
    if (!isProgressKey(key)) return;
    const times = readTimes();
    times[key] = Date.now();
    writeTimes(times);
    if (!readSession()) return;
    pending.set(key, value);
    if (timer === null) timer = setTimeout(flush, DEBOUNCE_MS);
  } catch {
    /* never block a save */
  }
}

// ---- pull -------------------------------------------------------------------------------------

/**
 * Reads all of the learner's rows and merges them into localStorage: a row newer than the key's local
 * timestamp replaces the local value; otherwise local is kept, and pushed when the server lacks it or is older.
 * Resolves to true when the server answered. Never throws.
 */
export async function pullProgress(): Promise<boolean> {
  try {
    const ls = store();
    if (!ls || !readSession()) return false;
    const res = await rest("progress?select=key,value,updated_at", { method: "GET" });
    if (!res) return false;
    const rows = (await res.json()) as Row[];
    if (!Array.isArray(rows)) return false;
    const times = readTimes();
    const seen = new Set<string>();
    for (const r of rows) {
      if (!r || !isProgressKey(r.key)) continue;
      seen.add(r.key);
      const serverAt = Date.parse(r.updated_at);
      const localAt = times[r.key] ?? 0;
      if (Number.isFinite(serverAt) && serverAt > localAt) {
        ls.setItem(PREFIX + r.key, JSON.stringify(r.value));
        times[r.key] = serverAt;
      } else if (localAt > serverAt) {
        const raw = ls.getItem(PREFIX + r.key);
        if (raw !== null) pending.set(r.key, JSON.parse(raw));
      }
    }
    // Local answers the server has never seen (made before signing in, or offline) go up.
    for (let i = 0; i < ls.length; i++) {
      const full = ls.key(i);
      if (!full?.startsWith(PREFIX)) continue;
      const key = full.slice(PREFIX.length);
      if (!isProgressKey(key) || seen.has(key)) continue;
      const raw = ls.getItem(full);
      if (raw === null) continue;
      if (times[key] === undefined) times[key] = Date.now();
      pending.set(key, JSON.parse(raw));
    }
    writeTimes(times);
    if (pending.size && timer === null) timer = setTimeout(flush, DEBOUNCE_MS);
    return true;
  } catch {
    return false;
  }
}

/** For the sign-in page: pull, but never wait longer than `ms` so login cannot hang. */
export function pullProgressWithTimeout(ms = 4000): Promise<boolean> {
  return Promise.race([pullProgress(), new Promise<boolean>((r) => setTimeout(() => r(false), ms))]);
}

/** Test hook: drop queued work. */
export function _resetSync(): void {
  pending.clear();
  if (timer !== null) clearTimeout(timer);
  timer = null;
}
