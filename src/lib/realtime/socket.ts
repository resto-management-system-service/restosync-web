// Shared, authenticated socket.io connection for RestoSync's real-time events
// (e.g. `table.status_changed`). One connection per browser session, shared by
// every feature via the hooks that wrap it — never one socket per component.
//
// Auth: the backend gateway authenticates sockets with the SAME JWT the REST
// client uses (see src/lib/api-session.ts). It reads that token from
// `socket.handshake.auth.token`, so we pass `auth: { token }` at connect time.
import { io, type Socket } from 'socket.io-client';
import { ensureApiSession } from '@/lib/api-session';

/**
 * Derive the socket server URL from the REST API base URL.
 *
 * `NEXT_PUBLIC_API_URL` includes the API's `/api` global prefix (e.g.
 * `http://localhost:3000/api`), but the backend's `@WebSocketGateway()` is
 * mounted at the default `/socket.io` path on the SAME origin/port — the
 * global prefix applies to REST routes only, not the socket namespace. So we
 * connect at the origin (scheme://host:port) with socket.io's default path.
 */
export function resolveSocketUrl(
  apiUrl: string = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
): string {
  try {
    return new URL(apiUrl).origin;
  } catch {
    // Not an absolute URL (e.g. a same-origin `/api` proxy) — strip the prefix.
    return apiUrl.replace(/\/api\/?$/, '');
  }
}

let socket: Socket | null = null;
let connectPromise: Promise<Socket | null> | null = null;

/**
 * Returns the shared socket, creating it lazily on first use. Returns `null`
 * when there is no API session to authenticate with (dev API login disabled,
 * or a not-yet-established session) — the caller should treat `null` as "not
 * connected", never throw.
 *
 * The access token is captured at connect time. socket.io's default
 * reconnection is left enabled (it re-sends the same handshake auth), which is
 * acceptable for the dev-login flow that this wires up today.
 */
export async function getRealtimeSocket(): Promise<Socket | null> {
  if (socket) return socket;
  if (!connectPromise) {
    connectPromise = (async () => {
      const session = await ensureApiSession();
      if (!session) return null;
      if (socket) return socket;
      socket = io(resolveSocketUrl(), {
        auth: { token: session.accessToken }
      });
      return socket;
    })().finally(() => {
      connectPromise = null;
    });
  }
  return connectPromise;
}
