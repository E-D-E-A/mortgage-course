/**
 * Per-learner progress sync with the course's Supabase project.
 * The page never holds a refresh token. Its Supabase access token comes from the server (GET /auth/session,
 * which checks the HttpOnly cookies and the company domain, and refreshes them when needed), is cached in
 * localStorage, and is fetched again when it is missing, nearly expired or refused. That also covers learners
 * who signed in before sync existed, and a browser whose storage was cleared.
 *
 * localStorage stays the source the components read (synchronously); this module mirrors it to
 * public.progress (row-level security keeps each learner to their own rows) and merges it back on sign-in.
 * Every function here is best-effort: no session, no storage, no network or a refused request is silent,
 * and the course keeps working from localStorage.
 */
const PREFIX = "mogi-course:";
const SESSION_KEY = "sb-session";
const TIMES_KEY = "sync-times";
/** Whose progress this browser's mirror holds (the token's `sub`). Never pushed. */
const OWNER_KEY = "owner";
const DEBOUNCE_MS = 1500;
/** A token with less than this left is replaced before it is used. */
const EXPIRY_MARGIN_S = 30;

type Session = { access_token: string };
type Row = { user_id: string; key: string; value: unknown; updated_at: string };

function env(name: "PUBLIC_SUPABASE_URL" | "PUBLIC_SUPABASE_ANON_KEY"): string {
  return String((import.meta.env as Record<string, string | undefined>)[name] ?? "");
}

/** Keys that are not learner progress: the login session and this module's own bookkeeping. */
export function isProgressKey(key: string): boolean {
  return key.length > 0 && key.length <= 200 && key !== SESSION_KEY && key !== TIMES_KEY && key !== OWNER_KEY;
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
    if (!s?.access_token || typeof s.access_token !== "string") return null;
    // A session saved by an earlier version also holds a refresh token. It must not stay in the page: Supabase
    // rotates refresh tokens, so a copy here goes stale when the server refreshes the cookie's, and using a stale
    // one makes Supabase revoke the whole session. Drop it.
    if ("refresh_token" in s) writeSession({ access_token: s.access_token });
    return { access_token: s.access_token };
  } catch {
    return null;
  }
}

function writeSession(s: Session): void {
  try {
    store()?.setItem(PREFIX + SESSION_KEY, JSON.stringify({ access_token: s.access_token }));
  } catch {
    /* ignore */
  }
}

function claimsOf(token: string): { sub?: string; email?: string; exp?: number } | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(Uint8Array.from(atob(part), (c) => c.charCodeAt(0)));
    const c = JSON.parse(json);
    return c && typeof c === "object" ? c : null;
  } catch {
    return null;
  }
}

/** The user id is the access token's `sub` claim. Not verified here: the server checks the token on every request. */
function userIdOf(token: string): string | null {
  const sub = claimsOf(token)?.sub;
  return typeof sub === "string" && sub ? sub : null;
}

function expiresSoon(token: string): boolean {
  const exp = claimsOf(token)?.exp;
  return typeof exp === "number" && exp - EXPIRY_MARGIN_S <= Date.now() / 1000;
}

/** Who is signed in, as far as this browser's cached session says. For display only; never an access decision. */
export function currentUser(): { id: string | null; email: string | null } | null {
  const s = readSession();
  if (!s) return null;
  const c = claimsOf(s.access_token);
  return { id: userIdOf(s.access_token), email: typeof c?.email === "string" ? c.email : null };
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

let sessionRequest: Promise<Session | null> | null = null;

/**
 * Asks the server for this learner's access token. Same origin, GET only, never cached. The server answers
 * only for a valid session from the company domain (it refreshes an expired one itself), so a 401/403 means
 * signed out. Concurrent callers share one request. Returns null on any failure.
 */
export function fetchServerSession(): Promise<Session | null> {
  sessionRequest ??= (async () => {
    try {
      const res = await fetch("/auth/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "x-mogi-session": "1", accept: "application/json" },
      });
      if (!res.ok) return null;
      const b = await res.json();
      if (typeof b?.access_token !== "string" || !b.access_token) return null;
      const next = { access_token: b.access_token as string };
      writeSession(next);
      return next;
    } catch {
      return null;
    }
  })().finally(() => {
    sessionRequest = null;
  });
  return sessionRequest;
}

/** One authenticated REST call; on 401 (or an expired token) asks the server for a fresh token once and retries. Returns null on any failure. */
async function rest(path: string, init: { method: string; body?: string; prefer?: string }): Promise<Response | null> {
  let session = readSession();
  if (!session || !env("PUBLIC_SUPABASE_URL") || !env("PUBLIC_SUPABASE_ANON_KEY")) return null;
  if (expiresSoon(session.access_token)) session = (await fetchServerSession()) ?? session;
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
      session = await fetchServerSession();
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

/** Sends everything queued now. Never throws; resolves when the request has finished. */
function flush(): Promise<void> {
  if (timer !== null) clearTimeout(timer);
  timer = null;
  const batch = [...pending];
  pending.clear();
  const times = readTimes();
  return upsert(batch.map(([key, value]) => ({ key, value, at: times[key] ?? Date.now() }))).catch(() => {});
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
    if (timer === null) timer = setTimeout(() => void flush(), DEBOUNCE_MS);
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
    if (pending.size && timer === null) timer = setTimeout(() => void flush(), DEBOUNCE_MS);
    return true;
  } catch {
    return false;
  }
}

// ---- lifecycle --------------------------------------------------------------------------------

function clearKeys(keep: (key: string) => boolean): void {
  const ls = store();
  if (!ls) return;
  try {
    const doomed: string[] = [];
    for (let i = 0; i < ls.length; i++) {
      const full = ls.key(i);
      if (full?.startsWith(PREFIX) && !keep(full.slice(PREFIX.length))) doomed.push(full);
    }
    for (const full of doomed) ls.removeItem(full);
  } catch {
    /* ignore */
  }
}

/**
 * Two people can sign in on one browser, one after the other. This mirror holds one person's answers: it is
 * tagged with the owner's id, and when a different person signs in, the previous owner's answers (which are on
 * the server under their own id) are removed before anything is pulled or pushed. A mirror with no tag yet
 * (made before this existed) is claimed by the first person who signs in; it cannot be attributed any better.
 */
function claimMirror(uid: string): void {
  const ls = store();
  if (!ls) return;
  try {
    const owner = ls.getItem(PREFIX + OWNER_KEY);
    if (owner && owner !== uid) {
      clearKeys((k) => k === SESSION_KEY);
      pending.clear();
      if (timer !== null) clearTimeout(timer);
      timer = null;
    }
    if (owner !== uid) ls.setItem(PREFIX + OWNER_KEY, uid);
  } catch {
    /* ignore */
  }
}

let started: Promise<boolean> | null = null;
let hiddenListener = false;

/**
 * Starts progress sync for this page (and, in a client-side navigated site, for the whole visit): gets the
 * session (cached, else from the server), makes sure the mirror belongs to this person, pulls, and pushes
 * what the server lacks. Safe to call on every page; it runs once. Resolves to true when the server answered.
 */
export function startSync(): Promise<boolean> {
  started ??= (async () => {
    if (!env("PUBLIC_SUPABASE_URL") || !env("PUBLIC_SUPABASE_ANON_KEY") || !store()) return false;
    if (!hiddenListener && typeof document !== "undefined") {
      hiddenListener = true;
      // Saves are debounced; a tab that is being left must not lose the last ones.
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && pending.size) void flush();
      });
    }
    let session = readSession();
    if (!session || expiresSoon(session.access_token)) session = (await fetchServerSession()) ?? session;
    const uid = session && userIdOf(session.access_token);
    if (!session || !uid) return false;
    claimMirror(uid);
    const ok = await pullProgress();
    if (ok && typeof document !== "undefined") document.dispatchEvent(new Event("mogi:progress-pulled"));
    return ok;
  })().catch(() => false);
  return started;
}

/**
 * Signing out: sends what is still queued while the token is valid (never waiting longer than `ms`), then
 * removes everything this course keeps in the browser: the session, the mirror of the answers and its owner tag.
 * The next person to sign in starts from their own rows on the server. The caller then goes to /auth/logout.
 */
export async function endSession(ms = 2500): Promise<void> {
  try {
    if (pending.size && readSession()) await Promise.race([flush(), new Promise<void>((r) => setTimeout(r, ms))]);
  } catch {
    /* sign out anyway */
  }
  pending.clear();
  if (timer !== null) clearTimeout(timer);
  timer = null;
  started = null;
  clearKeys(() => false);
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
  started = null;
  sessionRequest = null;
  hiddenListener = false;
}
