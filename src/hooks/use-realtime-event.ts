'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { getRealtimeSocket } from '@/lib/realtime/socket';

/**
 * Subscribe to a named socket.io event for the lifetime of the calling
 * component. Subscriptions share the single authenticated socket from
 * `getRealtimeSocket()`, and unsubscribe (via `socket.off`) on unmount so no
 * handler fires — or leaks — after the component goes away.
 *
 * The latest `handler` is always called (tracked via ref), so callers don't
 * need to memoize it; resubscribing only happens when `eventName` changes.
 */
export function useRealtimeEvent<T = unknown>(
  eventName: string,
  handler: (payload: T) => void
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    let active = true;
    let socket: Socket | null = null;
    const listener = (payload: T) => handlerRef.current(payload);

    void getRealtimeSocket().then((s) => {
      if (!active || !s) return;
      socket = s;
      s.on(eventName, listener);
    });

    return () => {
      active = false;
      socket?.off(eventName, listener);
    };
  }, [eventName]);
}
