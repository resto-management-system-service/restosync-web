'use client';

import { SignOutButton as ClerkSignOutButton } from '@clerk/nextjs';
import { AUTH_DISABLED } from '@/lib/auth';

/**
 * Thin wrapper over Clerk's `<SignOutButton>`. With `NEXT_PUBLIC_DISABLE_AUTH=true`
 * there is no Clerk context, so render an inert label instead.
 */
export function SignOutButton({ redirectUrl }: { redirectUrl?: string }) {
  if (AUTH_DISABLED) {
    return <span className='text-muted-foreground'>Sign out (disabled in dev)</span>;
  }
  return <ClerkSignOutButton redirectUrl={redirectUrl} />;
}
