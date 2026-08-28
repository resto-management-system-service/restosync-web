# Menu CRUD section, backed by MSW

**Date:** 2026-08-28
**Status:** Approved design, pre-implementation

## Problem

The `menu` feature has an API layer (`src/features/menu/api/`) wired to the generated
openapi-ts client, but no working UI: `/dashboard/menu` renders a standalone demo form
(`menu-item-form.tsx`) that only `console.log`s and toasts. The form's schema
(`price` as a float, `category` as a label string) does not match the RestoSync API
contract (`priceCents`, `categoryId`, `currency`, `imageUrl`, `available`).

The RestoSync API is not deployed yet, so there is nothing to build the UI against and
no way to test the data layer.

## Goal

Build the full menu CRUD UI — menu items and categories — against the RestoSync API
contract, using MSW as the mock backend so the UI works end to end in development and
the data layer is covered by tests. When the real API ships, removing the mock is a
small, documented change.

## Contract (from `src/api-client/openapi.json`)

Two resources under `/menu`:

**Categories**
- `GET  /menu/categories`
- `POST /menu/categories` — `CreateCategoryDto { name*, sortOrder?, active? }`
- `GET    /menu/categories/{id}`
- `PATCH  /menu/categories/{id}` — `UpdateCategoryDto` (all optional)
- `DELETE /menu/categories/{id}`

**Items**
- `GET  /menu/items?categoryId&available`
- `POST /menu/items` — `CreateMenuItemDto { name*, description?, priceCents*, currency?, imageUrl?, available?, categoryId* }`
- `GET    /menu/items/{id}`
- `PATCH  /menu/items/{id}` — `UpdateMenuItemDto` (all optional)
- `DELETE /menu/items/{id}`

All response bodies are typed `unknown` in the spec. `GET /menu/items` returns a bare
array (no server pagination). The generated client (`@hey-api/client-fetch`) uses global
`fetch`, so MSW intercepts it in Node and the browser alike. `baseUrl` comes from
`NEXT_PUBLIC_API_URL`; handlers match on `*/menu/...` so the host is irrelevant.

## Decisions taken during brainstorming

- **Scope:** full CRUD for both items and categories, each with its own list table,
  routes, and form.
- **Testing:** full setup — Vitest + React Testing Library + jsdom + MSW, with a CI job.
- **MSW in dev:** always on when `NODE_ENV === 'development'` (no env flag).
- **Mock architecture:** a dedicated `src/mocks/` directory (MSW convention), separate
  from `src/constants/mock-api.ts` (which is demo data for the products showcase).

## Section 1 — Mock layer (`src/mocks/`)

```
src/mocks/
  db.ts              in-memory arrays for categories + items; faker-seeded; reset()
  seed.ts            deterministic seed (~4 categories, ~12 items)
  handlers/
    menu-categories.ts
    menu-items.ts
    index.ts         export const handlers = [...]
  server.ts          setupServer(...handlers)  — Node (RSC prefetch + Vitest)
  browser.ts         setupWorker(...handlers)  — browser dev
  README.md          removal instructions for when the real API is live
```

### `db.ts`

- Module-level `let categories: Category[]` and `let items: MenuItem[]`, seeded from
  `seed.ts` on first load.
- `reset()` re-seeds both arrays (called between tests).
- Small helpers: `nextSortOrder()`, `findCategory(id)`, `findItem(id)`,
  `itemsInCategory(id)`.
- Domain types imported from `src/features/menu/api/types.ts` — one source of truth for
  response shapes.

### Handlers (MSW v2 — `http` / `HttpResponse`)

Behaviour, contract-faithful:

- Request bodies validated with the **generated zod schemas**
  (`schemas.zCreateMenuItemDto`, `zUpdateMenuItemDto`, `zCreateCategoryDto`,
  `zUpdateCategoryDto`). Invalid body → `422` with a NestJS-style error body
  `{ statusCode: 422, message: string[], error: 'Unprocessable Entity' }`.
- Responses shaped to `MenuItem` / `Category`.
- Server fills defaults: `id` (`crypto.randomUUID()`), `createdAt`/`updatedAt`
  (ISO now), category `sortOrder` = `nextSortOrder()`, item `currency` = `'USD'`,
  item `available` = `true`.
- `GET /menu/items` applies `categoryId` and `available` query filters.
- `POST` / `PATCH /menu/items` with a `categoryId` that does not exist → `400`
  `{ statusCode: 400, message: 'category not found', error: 'Bad Request' }`.
- `DELETE /menu/categories/:id` while items reference it → `409`
  `{ statusCode: 409, message: 'category has menu items', error: 'Conflict' }`.
  *(Assumption about real-API behaviour — see Section 4.)*
- Any unknown id → `404`.
- `POST` returns `201`; `GET` / `PATCH` / `DELETE` return `200`; `DELETE` body is the
  deleted resource.

### Wiring

- `src/instrumentation.ts` `register()`:
  ```ts
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_RUNTIME === 'nodejs') {
    const { server } = await import('@/mocks/server');
    server.listen({ onUnhandledRequest: 'bypass' });
  }
  ```
- `src/instrumentation-client.ts`: dev-only, start the worker. Top-level `await` is not
  guaranteed in this file, so use a promise chain:
  ```ts
  if (process.env.NODE_ENV === 'development') {
    import('@/mocks/browser').then(({ worker }) =>
      worker.start({ onUnhandledRequest: 'bypass' })
    );
  }
  ```
  The initial menu list is prefetched server-side (the Node `server` is already
  listening), so first paint has data even if the browser worker is milliseconds
  behind; client refetches/mutations pick up the worker once ready.
- `npx msw init public/ --save` adds `public/mockServiceWorker.js`.
- `onUnhandledRequest: 'bypass'` lets Clerk, Sentry, and Next HMR traffic through.

### Removal path (documented in `src/mocks/README.md`)

1. Delete the `register()` block in `instrumentation.ts`.
2. Delete the worker-start block in `instrumentation-client.ts`.
3. Delete `src/mocks/browser.ts` and `public/mockServiceWorker.js`.
4. Keep `src/mocks/db.ts`, `seed.ts`, `handlers/`, `server.ts` — they remain the
   fixtures for Vitest.

## Section 2 — Menu feature UI

Mirrors `src/features/products/`.

```
src/features/menu/
  api/
    types.ts       unchanged (already contract-aligned)
    service.ts     + getCategoryById, createCategory, updateCategory, deleteCategory;
                   getMenuItemById switched from list-and-find to
                   menuItemsControllerFindOne({ path: { id } })
    queries.ts     + categoryByIdOptions(id)
    mutations.ts   + createCategoryMutation, updateCategoryMutation, deleteCategoryMutation
  schemas/
    menu-item.ts   rewritten (see below)
    category.ts     new
  constants/
    menu-options.ts   replace hardcoded category list with currencyOptions
  components/
    menu-item-listing.tsx           RSC: prefetch menuItemsQueryOptions + HydrationBoundary
    menu-item-tables/
      index.tsx                     client: useSuspenseQuery + useDataTable + nuqs
      columns.tsx                   name, category (resolved name), price (formatted),
                                    available (badge), actions
      cell-action.tsx               edit link + delete via AlertModal + useMutation
      options.tsx                   category + availability filter options
    menu-item-view-page.tsx         'new' | id → MenuItemForm
    menu-item-form.tsx              rewritten, wired to mutations
    category-listing.tsx            RSC: prefetch categoriesQueryOptions
    category-tables/
      index.tsx
      columns.tsx                   name, sortOrder, active (badge), actions
      cell-action.tsx
    category-view-page.tsx          'new' | id → CategoryForm
    category-form.tsx               name, sortOrder, active
```

### `schemas/menu-item.ts` (rewrite)

```ts
export const menuItemFormSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters.'),
  description: z.string().max(500).optional(),
  priceDollars: z.number({ message: 'Price is required.' }).positive('Price must be greater than 0.'),
  currency: z.string().min(1),                 // defaults to 'USD'
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  available: z.boolean(),
  categoryId: z.string().min(1, 'Please select a category.')
});
export type MenuItemFormValues = z.input<typeof menuItemFormSchema>;
```

Helpers in the same file:
- `toCreateDto(values): CreateMenuItemDto` — `priceCents = Math.round(priceDollars * 100)`,
  drops empty `imageUrl`/`description`.
- `toUpdateDto(values): UpdateMenuItemDto` — same mapping.
- `fromMenuItem(item): MenuItemFormValues` — `priceDollars = item.priceCents / 100`.

Cents/dollars conversion helpers live in `src/lib/format.ts` (already the formatting
home): `centsToDollars`, `dollarsToCents`, `formatPriceCents`.

### `schemas/category.ts` (new)

```ts
export const categoryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  sortOrder: z.number().int().min(0),
  active: z.boolean()
});
```

### `menu-item-form.tsx` (rewrite)

- `useAppForm` + `useFormFields<MenuItemFormValues>()` (unchanged pattern).
- Fields: `FormTextField` name; `FormSelectField` categoryId — options from
  `useSuspenseQuery(categoriesQueryOptions())` mapped to `{ value: id, label: name }`;
  `FormTextField` priceDollars (`type='number'`, `step={0.01}`, `min={0}`);
  `FormSelectField` currency (from `currencyOptions`, default `USD`);
  `FormTextField` imageUrl (optional); `FormTextareaField` description (optional);
  `FormSwitchField` available.
- `onSubmit` runs `useMutation(createMenuItemMutation)` or
  `updateMenuItemMutation` depending on `initialData`, toasts, and
  `router.push('/dashboard/menu')` on success.
- Accepts `menuItemId?: string`; when set, loads via `useSuspenseQuery(menuItemByIdOptions(id))`
  and prefills with `fromMenuItem`.

### Routes

```
src/app/dashboard/menu/page.tsx                        items list (parses searchParams)
src/app/dashboard/menu/[itemId]/page.tsx               'new' | id → menu-item-view-page
src/app/dashboard/menu/categories/page.tsx             categories list
src/app/dashboard/menu/categories/[categoryId]/page.tsx 'new' | id → category-view-page
```

`categories` is a static segment and resolves before the dynamic `[itemId]`, so there is
no route conflict.

Each list page: `export const metadata`, `PageContainer` with `pageTitle` /
`pageDescription` / `pageHeaderAction` (an "Add" `Link`), renders the RSC listing
component. Each `[id]` page: server component that prefetches the detail query (skipped
when the param is `'new'`) and wraps the view page in `HydrationBoundary`.

### Nav (`src/config/nav-config.ts`)

The current single `Menu` item (`/dashboard/menu`) becomes a collapsible group:

```
Menu
  Items       /dashboard/menu
  Categories  /dashboard/menu/categories
```

### Table model

- nuqs params: `page`, `perPage`, `name`, `categoryId`, `available`, `sort`
  (`getSortingStateParser`, same as `useDataTable`).
- `categoryId` and `available` are passed into `menuItemsQueryOptions` → part of the
  query key → MSW filters server-side.
- `name` search, `sort`, and pagination are handled client-side by TanStack Table over
  the returned array (`useDataTable` with the full list; `pageCount` derived from
  `data.length / perPage`).
- Category table has no server filters — plain client-side table over
  `categoriesQueryOptions()`.

## Section 3 — Testing (Vitest + RTL + MSW)

### Dependencies (dev)

`vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `jsdom`,
`@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`,
`@testing-library/jest-dom`, `msw`.

### Config

- `vitest.config.ts` — `react()` + `tsconfigPaths()` plugins; `test.environment = 'jsdom'`;
  `test.globals = true`; `test.setupFiles = ['./vitest.setup.ts']`;
  `test.env = { NEXT_PUBLIC_API_URL: 'http://localhost:3000/api' }`;
  `test.include = ['src/**/*.{test,spec}.{ts,tsx}']`.
- `vitest.setup.ts`:
  - `import '@testing-library/jest-dom/vitest'`
  - `import { server } from '@/mocks/server'` +
    `import { reset } from '@/mocks/db'`
  - `beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))`
  - `afterEach(() => { server.resetHandlers(); reset(); cleanup(); })`
  - `afterAll(() => server.close())`
  - `vi.mock('next/navigation', ...)` returning stub `useRouter`
    (`push`/`replace`/`back` as `vi.fn()`), `useSearchParams`, `usePathname`,
    `useParams`.
- `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
- `tsconfig.json` — add `vitest/globals` to `types`; make sure test files are included.
- `.oxlintrc.json` — ensure `*.test.tsx` is linted (or explicitly ignored if noisy);
  add `vitest` env if oxlint needs it.
- `.github/workflows/ci.yml` — add `pnpm test` as a step in the existing job, after the
  lint/format steps and before `pnpm build` (fail fast on logic before the slower build).
- `oxfmt` already formats `.ts`/`.tsx`; new config files (`vitest.config.ts`,
  `vitest.setup.ts`) are covered.

### Tests written in this change

1. `src/features/menu/api/service.test.ts`
   - list items; filter by `categoryId`; filter by `available`
   - `getMenuItemById` happy + `404`
   - `createMenuItem` happy; `createMenuItem` with unknown `categoryId` → throws
   - `updateMenuItem`; `deleteMenuItem`; delete unknown → throws
   - category: list, create, update, delete; `deleteCategory` with referencing items → throws (409)
2. `src/features/menu/components/menu-item-form.test.tsx`
   - renders category options from the mock
   - submitting empty shows validation messages
   - entering `12.50` submits `priceCents: 1250` (assert on the mutation / request)
   - edit mode prefills from an existing item
3. `src/features/menu/components/menu-item-tables/cell-action.test.tsx`
   - opening the row menu and confirming delete calls the mutation and toasts
4. `src/features/menu/components/category-form.test.tsx`
   - validation + successful submit
5. `src/mocks/handlers/menu-items.test.ts`
   - `POST /menu/items` with a malformed body → `422` and error shape

Component tests render inside a `QueryClientProvider` (a `renderWithProviders` helper in
`src/test/utils.tsx`) and `NuqsTestingAdapter` where nuqs is used.

## Section 4 — Deliberate divergences / assumptions

| # | Decision | Reason |
|---|----------|--------|
| 1 | `src/features/menu/api/types.ts` is the contract for response shapes | spec types responses as `unknown`; revisit the casts in `service.ts` when the API publishes response schemas |
| 2 | Menu-item table paginates client-side | `GET /menu/items` returns a bare array, no server pagination |
| 3 | `DELETE /menu/categories/:id` returns `409` when items reference it | plausible real-API behaviour and gives the UI an error path to handle and test |
| 4 | `currency` field defaults to `'USD'` and is rarely changed | single-currency assumption for now; field kept so the payload stays contract-complete |
| 5 | `imageUrl` is an optional free-text URL, no upload | image upload is out of scope |
| 6 | MSW runs whenever `NODE_ENV === 'development'` | chosen over an env flag for simplicity; removal steps in `src/mocks/README.md` |
| 7 | `src/mocks/` is separate from `src/constants/mock-api.ts` | the latter is demo data for the products showcase; menu is contract-driven |

## Suggested implementation phasing

The plan can land in three reviewable phases:

1. **Mock + test infrastructure** — `src/mocks/`, instrumentation wiring, Vitest/RTL
   config, CI step, `renderWithProviders` helper, `src/lib/format.ts` cents helpers.
2. **Menu items CRUD** — `api/` additions, schema rewrite, form, listing, table,
   routes, nav change, item tests.
3. **Categories CRUD** — schema, form, listing, table, routes, category tests.

## Out of scope

- Real API integration (this is the mock; swap is documented)
- Image upload / media handling
- Multi-currency pricing UX
- Orders and payments features (separate contract areas)
- Bulk actions, CSV import/export
- E2E (Playwright) tests
