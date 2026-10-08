import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_DISABLED } from '@/lib/auth';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

// clerkMiddleware throws without a publishable key, so when auth is disabled
// (no Clerk keys configured) skip it entirely instead of wrapping a no-op.
export default AUTH_DISABLED
  ? () => NextResponse.next()
  : clerkMiddleware(async (auth, req: NextRequest) => {
      if (isProtectedRoute(req)) await auth.protect();
    });
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
