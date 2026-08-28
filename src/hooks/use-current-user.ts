'use client';

import { useUser } from '@clerk/nextjs';
import { AUTH_DISABLED, DEV_USER } from '@/lib/auth';

type ClerkUser = ReturnType<typeof useUser>['user'];

function useClerkCurrentUser(): ClerkUser {
  const { user } = useUser();
  return user;
}

/**
 * Wrapper around Clerk's `useUser()` that returns a mock dev user when
 * `NEXT_PUBLIC_DISABLE_AUTH=true` (no `<ClerkProvider>` is mounted then), so
 * identity-driven UI still renders while the login stage is skipped. Display
 * only, never for authorization.
 */
export const useCurrentUser: () => ClerkUser = AUTH_DISABLED
  ? () => DEV_USER as unknown as ClerkUser
  : useClerkCurrentUser;
