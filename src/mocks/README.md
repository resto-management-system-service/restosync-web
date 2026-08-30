# MSW mock backend

Mocks the RestoSync `/menu` API. Serves:

- the browser during `next dev` — **only when `NEXT_PUBLIC_ENABLE_MSW=true`** —
  `browser.ts` → `setupWorker`, started by `src/components/mock-gate.tsx` (which
  blocks the first render until the worker is ready). Default is off: the app
  calls the real API at `NEXT_PUBLIC_API_URL`.
- the Vitest suite — `server.ts` → `setupServer`, started from `vitest.setup.ts`
  (always, independent of the flag)

The menu feature fetches **only on the client** (`useQuery`, no server prefetch): the
mock DB lives in the browser tab's memory, so client-only fetching keeps
create/update/delete consistent with what the list shows. The DB re-seeds on every
full page load.

## Layout

| File                          | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `api-url.ts`                  | base URL the handlers match — mirrors `@/api-client` |
| `seed.ts`                     | deterministic faker seed (`makeSeedData`)            |
| `db.ts`                       | in-memory store + `resetDb()` + finders              |
| `handlers/menu-items.ts`      | `${API_URL}/menu/items` handlers                     |
| `handlers/menu-categories.ts` | `${API_URL}/menu/categories` handlers                |
| `handlers/index.ts`           | `export const handlers`                              |
| `server.ts`                   | `setupServer` (Vitest)                               |
| `browser.ts`                  | `setupWorker` (browser dev)                          |

Handlers are keyed to the **exact API base URL** (`api-url.ts`), not a bare
`*/menu/...` glob — a glob also matches same-origin Next.js route/RSC requests
(e.g. `/dashboard/menu/items/new`), which made the service worker answer navigation
requests with `404` and forced full page reloads.

Request bodies are validated with the generated zod schemas (`schemas.zCreateMenuItemDto`
etc.), so contract drift surfaces as a `422` (and a failing test).

## Contract assumptions (not yet in the OpenAPI spec)

- Response bodies match `src/features/menu/api/types.ts` (`MenuItem`, `Category`) — the
  spec types responses as `unknown`.
- `DELETE /menu/categories/:id` returns `409` when menu items still reference it.
- `POST`/`PATCH /menu/items` returns `400` when `categoryId` does not exist.

## Retiring it fully

The browser layer is already opt-in (`NEXT_PUBLIC_ENABLE_MSW`), so it stays out
of the way once the real `/menu` endpoints exist. To remove it entirely:

1. Delete `src/components/mock-gate.tsx` and drop `<MockGate>` from
   `src/components/layout/providers.tsx`.
2. Delete `src/mocks/browser.ts` and `public/mockServiceWorker.js` (and the `msw`
   key in `package.json`).
3. Optionally restore server-side prefetch + `HydrationBoundary` in the menu route
   pages for faster first paint (see the products feature for the pattern).
4. Keep `api-url.ts`, `seed.ts`, `db.ts`, `handlers/`, `server.ts` — the Vitest
   suite still uses them.
