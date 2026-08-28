'use client';

import { useOrganization } from '@clerk/nextjs';
import { AUTH_DISABLED } from '@/lib/auth';

type ClerkOrg = ReturnType<typeof useOrganization>;

export type CurrentOrg = {
  organization: ClerkOrg['organization'] | null;
  membership: ClerkOrg['membership'] | null;
  isLoaded: boolean;
};

function useClerkCurrentOrg(): CurrentOrg {
  const { organization, membership, isLoaded } = useOrganization();
  return { organization, membership, isLoaded };
}

/**
 * Wrapper around Clerk's `useOrganization()`. When `NEXT_PUBLIC_DISABLE_AUTH=true`
 * there is no `<ClerkProvider>` mounted, so this returns an empty org state
 * instead of calling the Clerk hook. Display / nav-visibility only.
 */
export const useCurrentOrg: () => CurrentOrg = AUTH_DISABLED
  ? () => ({ organization: null, membership: null, isLoaded: true })
  : useClerkCurrentOrg;
