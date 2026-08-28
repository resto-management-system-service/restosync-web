'use client';

import { useUser } from '@clerk/nextjs';
import { AUTH_DISABLED, DEV_USER } from '@/lib/auth';

/**
 * Wrapper around Clerk's `useUser()` that returns a mock dev user when
 * `NEXT_PUBLIC_DISABLE_AUTH=true`, so identity-driven UI still renders while the
 * login stage is skipped. Use this for display only, never for authorization.
 */
export function useCurrentUser() {
  const { user } = useUser();
  return AUTH_DISABLED ? (DEV_USER as unknown as NonNullable<typeof user>) : user;
}
