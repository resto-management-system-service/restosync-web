// Base URL the handlers match against. Must mirror `src/api-client/index.ts` so
// the handlers intercept the generated client's requests — and ONLY those, not
// same-origin Next.js route/RSC requests (which a bare `*/menu/...` pattern would
// also catch, breaking client-side navigation).
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
