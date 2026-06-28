import { defineConfig } from '@hey-api/openapi-ts';

// Generates the typed API client from the committed OpenAPI snapshot.
// Run with `pnpm generate:api`. Output is committed and kept in sync by CI.
export default defineConfig({
  input: './src/api-client/openapi.json',
  output: {
    path: './src/api-client/generated',
    // No formatter/linter post-processing: oxfmt owns formatting and we keep generated
    // bytes stable so the CI sync-check (regenerate + git diff) is deterministic.
    postProcess: []
  },
  plugins: ['@hey-api/client-fetch', '@hey-api/typescript', '@hey-api/sdk', 'zod']
});
