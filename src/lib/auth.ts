/**
 * Development auth bypass.
 *
 * Set `NEXT_PUBLIC_DISABLE_AUTH=true` in `.env.local` to take Clerk out of the
 * loop entirely during local development:
 *   - the middleware stops protecting `/dashboard`
 *   - the landing / redirect pages go straight to the dashboard
 *   - `<ClerkProvider>` is not mounted (`components/layout/providers.tsx`), so no
 *     keyless-mode UI / network calls
 *   - `useCurrentUser` / `useCurrentOrg` return mock values instead of calling
 *     Clerk hooks; `<SignOutButton>` renders an inert label
 *   - Clerk-only screens (workspaces, billing, exclusive, profile, auth) render
 *     an `<AuthDisabledNotice>` placeholder
 *
 * It never affects a build unless the flag is explicitly set to the string
 * "true". `AUTH_DISABLED` is a module-load constant, so the `? :` swaps in the
 * hook wrappers stay stable across renders (rules-of-hooks safe).
 */
export const AUTH_DISABLED = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

/**
 * Minimal stand-in matching the shape the display components consume from
 * Clerk's `useUser()` (`UserAvatarProfile`, `UserNav`, `useFilteredNavItems`).
 */
export const DEV_USER = {
  id: 'dev_user',
  fullName: 'Dev User',
  firstName: 'Dev',
  lastName: 'User',
  imageUrl: '',
  emailAddresses: [{ emailAddress: 'dev@localhost' }],
  primaryEmailAddress: { emailAddress: 'dev@localhost' }
} as const;
