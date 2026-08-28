# MSW mock backend

Mocks the RestoSync `/menu` API while the real backend is not deployed.
Serves three consumers:

- the browser during `next dev` (`browser.ts` → `setupWorker`)
- RSC prefetch in the Node runtime (`server.ts` → `setupServer`, started from `instrumentation.ts`)
- the Vitest suite (`server.ts`, started from `vitest.setup.ts`)

## Layout

| File                          | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| `seed.ts`                     | deterministic faker seed (`makeSeedData`) |
| `db.ts`                       | in-memory store + `resetDb()` + finders   |
| `handlers/menu-items.ts`      | `/menu/items` handlers                    |
| `handlers/menu-categories.ts` | `/menu/categories` handlers               |
| `handlers/index.ts`           | `export const handlers`                   |
| `server.ts`                   | `setupServer` (Node + tests)              |
| `browser.ts`                  | `setupWorker` (browser dev)               |

Request bodies are validated with the generated zod schemas (`schemas.zCreateMenuItemDto`
etc.) from `@/api-client`, so a contract drift surfaces as a `422` (and a failing test).

## Contract assumptions (not yet in the OpenAPI spec)

- Response bodies match `src/features/menu/api/types.ts` (`MenuItem`, `Category`) — the
  spec types responses as `unknown`.
- `DELETE /menu/categories/:id` returns `409` when menu items still reference it.
- `POST`/`PATCH /menu/items` returns `400` when `categoryId` does not exist.

## Removing it when the real API ships

1. Delete the `NODE_ENV === 'development'` block in `src/instrumentation.ts`.
2. Delete the `NODE_ENV === 'development'` block in `src/instrumentation-client.ts`.
3. Delete `src/mocks/browser.ts` and `public/mockServiceWorker.js` (and the `msw` key in `package.json`).
4. Keep `seed.ts`, `db.ts`, `handlers/`, `server.ts` — the Vitest suite still uses them.
