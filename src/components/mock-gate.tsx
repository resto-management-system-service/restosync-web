'use client';

import { useEffect, useState } from 'react';

// Opt-in. Set NEXT_PUBLIC_ENABLE_MSW=true to run against the in-browser MSW
// mock API instead of NEXT_PUBLIC_API_URL — offline work, deterministic demos.
// Unset/false (the default) → the app calls the real API.
const MOCKING = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';

/**
 * When mocking is enabled, starts the MSW browser worker before rendering the
 * app so the first data fetch is already intercepted. Otherwise a pass-through.
 * See src/mocks/README.md.
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
