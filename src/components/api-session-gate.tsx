'use client';

import { useEffect, useState } from 'react';
import { ensureApiSession, installApiSession } from '@/lib/api-session';

const ENABLED = process.env.NEXT_PUBLIC_DEV_API_LOGIN === 'true';

/**
 * When NEXT_PUBLIC_DEV_API_LOGIN is on, installs the bearer-token interceptor
 * and gets a session before the first data fetch, so authenticated endpoints
 * work without a full 401 → retry round-trip. Pass-through otherwise.
 */
export function ApiSessionGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!ENABLED);

  useEffect(() => {
    if (!ENABLED) return;
    let active = true;
    installApiSession();
    ensureApiSession()
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
