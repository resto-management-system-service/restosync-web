// Dev-only API session: logs into the RestoSync API with seeded credentials and
// attaches `Authorization: Bearer <accessToken>` to every request, refreshing
// (or re-logging-in) transparently before the 15-min access token lapses.
//
// This is scaffolding so full-stack local / cloud-dev work can exercise the
// authenticated endpoints (menu CRUD, orders, …). It is NOT the real auth
// story — that is Clerk (see src/lib/auth.ts), whose bridge to the API's own
// JWT is still to be designed. Guarded by NEXT_PUBLIC_DEV_API_LOGIN; never
// enable it in a deployed environment.
// Import from the barrel so its `client.setConfig({ baseUrl })` has run.
import { authControllerLogin, authControllerRefresh, client } from '@/api-client';

const ENABLED = process.env.NEXT_PUBLIC_DEV_API_LOGIN === 'true';
const EMAIL = process.env.NEXT_PUBLIC_DEV_API_EMAIL || 'admin@restosync.local';
const PASSWORD = process.env.NEXT_PUBLIC_DEV_API_PASSWORD || 'Admin123!';
const STORAGE_KEY = 'restosync.dev-api-session';
const REFRESH_SKEW_MS = 30_000;

type Tokens = { accessToken: string; refreshToken: string };

let tokens: Tokens | null = null;
let inflight: Promise<Tokens | null> | null = null;

function jwtExpiryMs(token: string): number {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)).exp * 1000;
  } catch {
    return 0;
  }
}

function read(): Tokens | null {
  if (tokens) return tokens;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) tokens = JSON.parse(raw) as Tokens;
  } catch {
    /* private mode / SSR */
  }
  return tokens;
}

function write(next: Tokens | null): Tokens | null {
  tokens = next;
  try {
    if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return next;
}

function asTokens(data: unknown): Tokens | null {
  const t = data as Partial<Tokens> | undefined;
  return t?.accessToken && t?.refreshToken
    ? { accessToken: t.accessToken, refreshToken: t.refreshToken }
    : null;
}

async function loginFresh(): Promise<Tokens | null> {
  const { data } = await authControllerLogin({ body: { email: EMAIL, password: PASSWORD } });
  return write(asTokens(data));
}

async function refreshWith(refreshToken: string): Promise<Tokens | null> {
  try {
    const { data } = await authControllerRefresh({ body: { refreshToken } });
    const next = asTokens(data);
    if (next) return write(next);
  } catch {
    /* fall through to a fresh login */
  }
  return null;
}

/** Returns a valid token set, logging in / refreshing as needed. Concurrent
 *  callers share one in-flight request. Returns null when disabled. */
export async function ensureApiSession(): Promise<Tokens | null> {
  if (!ENABLED) return null;
  if (inflight) return inflight;

  inflight = (async () => {
    const current = read();
    if (current && jwtExpiryMs(current.accessToken) > Date.now() + REFRESH_SKEW_MS) {
      return current;
    }
    if (current?.refreshToken) {
      const refreshed = await refreshWith(current.refreshToken);
      if (refreshed) return refreshed;
    }
    return loginFresh();
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

let installed = false;

/** Wires the bearer-token request interceptor onto the shared API client. */
export function installApiSession(): void {
  if (!ENABLED || installed) return;
  installed = true;

  client.interceptors.request.use(async (request) => {
    if (new URL(request.url).pathname.endsWith('/auth/login')) return request;
    if (new URL(request.url).pathname.endsWith('/auth/refresh')) return request;
    const session = await ensureApiSession();
    if (session) request.headers.set('Authorization', `Bearer ${session.accessToken}`);
    return request;
  });

  client.interceptors.response.use((response) => {
    // Backstop: a 401 means the token is no longer trusted — drop it so the
    // next call re-authenticates from scratch.
    if (response.status === 401) write(null);
    return response;
  });
}
