/**
 * Development auth bypass.
 *
 * Set `NEXT_PUBLIC_DISABLE_AUTH=true` in `.env.local` to skip the Clerk login
 * stage entirely during local development: the middleware stops protecting
 * `/dashboard`, the landing/redirect pages send you straight to the dashboard,
 * and the UI is fed a mock user so the sidebar/profile render.
 *
 * This only removes the *client-facing* gate. It never affects production
 * builds unless the flag is explicitly set, and server-side `has()` / API
 * authorization still behave as configured.
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
