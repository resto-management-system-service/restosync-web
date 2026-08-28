'use client';

import { useEffect, useState } from 'react';

const MOCKING = process.env.NODE_ENV === 'development';

/**
 * Starts the MSW browser worker before rendering the app in development, so the
 * first data fetch is already intercepted (no hang against the real API URL).
 * In production this is a pass-through. Remove with the rest of the mock layer
 * once the real API is live — see src/mocks/README.md.
 */
export function MockGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!MOCKING);

  useEffect(() => {
    if (!MOCKING) return;
    let active = true;
    import('@/mocks/browser')
      .then(({ worker }) => worker.start({ onUnhandledRequest: 'bypass', quiet: true }))
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
