# RestoSync — Web

Restaurant management dashboard built on the latest Next.js stack.

Bootstrapped from the [`next-shadcn-dashboard-starter`](https://github.com/Kiranism/next-shadcn-dashboard-starter) template.

## Stack

| Area      | Tech                                             |
| --------- | ------------------------------------------------ |
| Framework | Next.js 16 (App Router) · React 19 · TypeScript  |
| Styling   | Tailwind CSS v4 · shadcn/ui (Radix)              |
| Auth      | Clerk (`@clerk/nextjs`) — orgs, RBAC, billing    |
| Forms     | TanStack Form (`@tanstack/react-form`) + Zod     |
| Data      | TanStack Query · TanStack Table · Zustand · nuqs |
| Charts    | Recharts                                         |
| Tooling   | pnpm · oxlint · oxfmt · husky                    |

## Prerequisites

- **Node 22** — `.nvmrc` pins `22`. If you use **asdf**, run `ASDF_NODEJS_VERSION=22 pnpm dev` or set it in your shell before running any commands.
- **pnpm 9** — enable via Corepack: `corepack enable`
- **restosync-api running** — the API must be up on `http://localhost:3000/api`. See the [API repo](../restosync-api/README.md) to start it.

## Getting started

```bash
pnpm install
cp env.example.txt .env.local   # fill in Clerk keys or leave empty for keyless mode
PORT=3001 pnpm dev              # http://localhost:3001
```

> **Port note:** the API runs on `localhost:3000`, so the web dev server must use a different port (e.g. `3001`). `NEXT_PUBLIC_API_URL` in `.env.local` already points to `http://localhost:3000/api`.

### Environment variables (`.env.local`)

| Variable                                                 | Purpose                                                                                                                                                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk keys. **Leave empty to use Clerk keyless mode** — the app boots immediately and a popup lets you claim it later. For real keys, create an app at [dashboard.clerk.com](https://dashboard.clerk.com). |
| `NEXT_PUBLIC_CLERK_*_URL`                                | Sign-in / sign-up / post-auth redirect routes.                                                                                                                                                             |
| `NEXT_PUBLIC_SENTRY_DISABLED`                            | Any non-empty value disables Sentry. Kept `true` locally. To enable Sentry, clear it and set `NEXT_PUBLIC_SENTRY_DSN` / `_ORG` / `_PROJECT`.                                                               |
| `NEXT_PUBLIC_API_URL`                                    | Base URL the generated API client targets. Defaults to `http://localhost:3000/api`. See [API client](#api-client-generated).                                                                               |

## Scripts

```bash
pnpm dev          # dev server (Turbopack)
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # oxlint
pnpm lint:fix     # oxlint --fix + format
pnpm format       # oxfmt --write .
pnpm generate:api # regenerate the typed API client from the OpenAPI spec
```

## API client (generated)

The typed client for the **RestoSync API** lives in **`src/api-client/`** and is generated
from the backend's OpenAPI contract with [`@hey-api/openapi-ts`](https://heyapi.dev). Import
it from `@/api-client` — never reach into `generated/` directly.

```
src/api-client/
  openapi.json   # committed spec snapshot — the codegen input
  generated/     # hey-api output: SDK fetch fns + TS types + Zod schemas
  index.ts       # barrel: configures baseUrl (NEXT_PUBLIC_API_URL) + re-exports
```

```ts
import { authControllerLogin, schemas, type RegisterDto } from '@/api-client';

const { data } = await authControllerLogin({ body: { email, password } });
const parsed = schemas.zLoginDto.parse(input); // validate with the generated Zod schema
```

Regenerate locally with `pnpm generate:api` (reads `src/api-client/openapi.json`). The
generated folder is committed; **CI fails if it drifts from the spec** (the workflow
regenerates and diffs it).

### Auto-sync with the API (cross-repo)

The client stays in sync automatically — you don't hand-edit it:

1. On merge to `main` in **`restosync-api`**, its `Docs` workflow regenerates the OpenAPI
   spec and runs **`oasdiff`** against the currently published one.
2. **Only if the contract changed**, it deploys the docs and sends a `repository_dispatch`
   (`update-openapi-client`) to this repo.
3. The **Update OpenAPI Client** workflow (`.github/workflows/update-openapi-client.yml`)
   pulls the latest spec, runs `pnpm generate:api`, and opens/updates a single rolling
   **`chore/update-openapi`** PR. No change ⇒ no PR.

Review and merge that PR to adopt the new contract.

**Setup (one-time):** add a repo secret **`OPENAPI_SYNC_TOKEN`** — a fine-grained PAT with
**Contents** + **Pull requests** read/write — used by the workflow to open the PR (the same
token is also set in `restosync-api` to send the dispatch).

## Project layout

```
src/
  app/            # App Router routes (auth, dashboard, api)
  components/     # UI primitives, layout, shared forms
  features/       # Feature modules (products, menu, kanban, chat, …)
  config/         # nav-config.ts (sidebar + Cmd+K)
  hooks/ lib/ types/ styles/
```

### Example feature: Menu item form

`src/features/menu/` is a reference CRUD form built with **TanStack Form + Zod**:

- `schemas/menu-item.ts` — Zod schema + form value types
- `components/menu-item-form.tsx` — form using the shared `useAppForm` / `useFormFields` helpers (`@/components/ui/tanstack-form`)
- Route: `/dashboard/menu` (sidebar → **Menu**)

Submit currently logs the validated payload and shows a toast — wire it to a mutation
(see `src/features/products/api/`) when the backend is ready.
