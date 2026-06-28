// Public entry point for the typed API client generated from the OpenAPI spec.
// Import from '@/api-client' — never reach into './generated' directly.
//
// Regenerate with `pnpm generate:api` (input: ./openapi.json). The generated
// folder is committed and kept in sync with the backend contract by CI.

import { client } from './generated/client.gen';

// Resolve the base URL per environment. Importing this entry configures the
// client before any SDK call (consumers import the SDK from here).
client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
});

// SDK functions (e.g. `authControllerLogin`) + request/response types.
export * from './generated';

// Zod schemas to validate payloads/responses, e.g. `schemas.zLoginDto.parse(data)`.
export * as schemas from './generated/zod.gen';

// The configured fetch client (baseUrl from NEXT_PUBLIC_API_URL).
export { client } from './generated/client.gen';
