# RestoSync — Web

Restaurant management dashboard built on the latest Next.js stack.

Bootstrapped from the [`next-shadcn-dashboard-starter`](https://github.com/Kiranism/next-shadcn-dashboard-starter) template.

## Stack

| Area      | Tech                                             |
| --------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router) · React 19 · TypeScript  |
| Styling   | Tailwind CSS v4 · shadcn/ui (Radix)              |
| Auth      | Clerk (`@clerk/nextjs`) — orgs, RBAC, billing    |
| Forms     | TanStack Form (`@tanstack/react-form`) + Zod     |
| Data      | TanStack Query · TanStack Table · Zustand · nuqs |
| Charts    | Recharts                                         |
| Canvas    | react-konva (floor plan editor — see below)      |
| Realtime  | socket.io-client (table status — see below)      |
| Tooling   | pnpm · oxlint · oxfmt · husky                    |

## Prerequisites

- **Node 22** — `.nvmrc` pins `22`. If you use **asdf**, run `ASDF_NODEJS_VERSION=22 pnpm dev` or set it in your shell before running any commands.
- **pnpm 9** — enable via Corepack: `corepack enable`
- **restosync-api running** — the API must be up on `http://localhost:3000/api`. See the [API repo](https://github.com/resto-management-system-service/restosync-api/blob/main/README.md) to start it.

## Getting started

```bash
pnpm install
cp env.example.txt .env.local   # fill in Clerk keys or leave empty for keyless mode
PORT=3001 pnpm dev              # http://localhost:3001
```

> **Port note:** the API runs on `localhost:3000`, so the web dev server must use a different port (e.g. `3001`). `NEXT_PUBLIC_API_URL` in `.env.local` already points to `http://localhost:3000/api`.

### Environment variables (`.env.local`)

| Variable                                                 | Purpose                                                                                                                                                                                                  |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk keys. **Leave empty to use Clerk keyless mode** — the app boots immediately and a popup lets you claim it later. For real keys, create an app at [dashboard.clerk.com](https://dashboard.clerk.com). |
| `NEXT_PUBLIC_CLERK_*_URL`                                | Sign-in / sign-up / post-auth redirect routes.                                                                                                                                                           |
| `NEXT_PUBLIC_DISABLE_AUTH`                               | `true` → skip the Clerk login gate entirely; the app renders with a mock user. Local only.                                                                                                               |
| `NEXT_PUBLIC_SENTRY_DISABLED`                            | Any non-empty value disables Sentry. Kept `true` locally. To enable Sentry, clear it and set `NEXT_PUBLIC_SENTRY_DSN` / `_ORG` / `_PROJECT`.                                                             |
| `NEXT_PUBLIC_API_URL`                                    | Base URL the generated API client targets. Defaults to `http://localhost:3000/api`. Also used to derive the real-time WebSocket connection (same origin, `/api` prefix stripped). See [API client](#api-client-generated). |
| `NEXT_PUBLIC_ENABLE_MSW`                                 | `true` → serve the in-browser MSW mock API instead of `NEXT_PUBLIC_API_URL`. Default off.                                                                                                                 |
| `NEXT_PUBLIC_DEV_API_LOGIN`                              | `true` → auto-login to the API with seeded creds (`admin@restosync.local` / `Admin123!`) and attach a bearer token to every REST **and WebSocket** request (needed for writes and for the real-time table-status connection). **Dev only.** |

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
  features/       # Feature modules (tables, products, menu, kanban, chat, …)
  hooks/          # Shared hooks — includes use-realtime-event.ts (see below)
  lib/            # Shared utilities — includes lib/realtime/socket.ts (see below)
  config/         # nav-config.ts (sidebar + Cmd+K)
  types/ styles/
```

### Example feature: Menu item form

`src/features/menu/` is a reference CRUD form built with **TanStack Form + Zod**:

- `schemas/menu-item.ts` — Zod schema + form value types
- `components/menu-item-form.tsx` — form using the shared `useAppForm` / `useFormFields` helpers (`@/components/ui/tanstack-form`)
- Route: `/dashboard/menu` (sidebar → **Menu**)

Submit currently logs the validated payload and shows a toast — wire it to a mutation
(see `src/features/products/api/`) when the backend is ready.

## Floor plan editor (Tables)

`src/features/tables/` (route: `/dashboard/tables`, sidebar → **Mesas**) is a visual,
zone-based floor plan editor built with **react-konva**. It lets a manager lay out their
restaurant's tables the way they'd draw them on paper, then lets any staff member glance
at the map to see which tables are free at a glance.

### Zones

A **Zone** is a physical area of the restaurant — "Piso 1", "Piso 2", "Terraza 1", "VIP 1".
Each table belongs to exactly one zone, shown as a tab above the floor plan canvas.

- **Name**: free text, typed by the user (e.g. "Terraza"). The floor plan editor
  auto-combines it with the next available number **for that same category** — typing
  "Piso" when "Piso 1" and "Piso 2" already exist previews "Piso 3"; typing "Terraza" for
  the first time previews "Terraza 1", independent of how many Piso zones exist. If a zone
  with that exact number gets deleted later (e.g. "Piso 2"), the NEXT zone created with
  that name reuses the freed number rather than always incrementing past the highest ever
  used.
- **Code** (internal, never shown in the UI): computed server-side from the zone's name,
  used purely as the prefix for that zone's table names. `Piso` zones get a bare sequential
  number ("1", "2", "3", scoped only among other Piso zones). Any other category gets a
  short letter prefix — the word in full if 3 characters or fewer ("VIP" → `VIP`), or its
  first 3 characters if longer ("Terraza" → `TER`) — plus a sequential number scoped to
  that prefix (`TER1`, `TER2`).

### Tables

Tables are created via **"+ Agregar mesa"**, which opens a form where:

- **Nombre is auto-assigned and read-only** — never typed by staff. It's computed as
  `{zone's code}{2-digit sequential number}` (e.g. zone code `1` → `101`, `102`; zone code
  `TER` → `TER101`, `TER102`), reusing gaps left by deleted tables — mirroring a real
  hospitality-industry convention (hundreds-block numbering per floor) so staff can tell a
  table's area from its number alone.
- **Capacidad** and **Forma** (Círculo / Cuadrada) are the only fields staff choose. Chairs
  render around the table matching the chosen capacity exactly.

### Editing a table (Word/PowerPoint-style selection)

In edit mode ("Editar mapa"), clicking a table's body selects **only that one table**.
A dashed selection box appears with 4 corner-only, always-proportional resize handles, plus
a settings tab (hover to open — no click needed) with **Editar mesa** / **Eliminar mesa**,
both disabled unless the table's status is `AVAILABLE`.

### Deleting a zone

Deleting a zone whose tables are **all** `AVAILABLE` deletes the zone **and** those tables
together. If **any** table is `RESERVED` or `OCCUPIED`, the whole delete is rejected (400)
— no partial deletion.

## Table status: Libre → Reservada / Ocupada, and what's needed to see it live

The three states on the legend above the canvas — 🟢 **Libre** (`AVAILABLE`),
🟡 **Reservada** (`RESERVED`), 🔴 **Ocupada** (`OCCUPIED`) — are **never set from this
screen**. They're driven entirely by `restosync-api`'s Orders / Payments / Reservations
modules:

```
AVAILABLE → OCCUPIED   a DINE_IN order is created against the table
                        (POST /orders with tableId)

OCCUPIED  → AVAILABLE  that order's payment is confirmed
                        (POST /payments/checkout)

AVAILABLE → RESERVED   a reservation's deposit is confirmed

RESERVED  → OCCUPIED   that reservation is seated

RESERVED  → AVAILABLE  the reservation is marked as a no-show
```

**restosync-api has a complete Orders/Payments/Reservations module** implementing all of
the above (order state machine, Stripe checkout, reservation lifecycle — see its own
README). Every one of these 5 transitions also emits a `table.status_changed` WebSocket
event, and `restosync-web`'s Tables feature already listens for it
(`src/lib/realtime/socket.ts` + `src/features/tables/api/realtime.ts`) and updates the
floor plan's colors instantly, without a refetch, for any connected client — this part is
wired and working end-to-end.

**What's actually missing for the full flow to be exercised from this app**:
`restosync-web` does not yet have an **Órdenes** (Orders) screen — no UI exists here to
create a dine-in order, take a payment, or manage a reservation. The backend endpoints and
real-time events are ready and tested; only the frontend screens that would call them
(mirroring `src/features/menu/`'s pattern, or `src/features/tables/`'s) haven't been built
yet. Until that exists, the 5 transitions above can only be triggered directly against the
API (e.g. via Swagger at `restosync-api`'s `/docs`, or `curl`) — the floor plan will still
reflect the change live once that happens, since the real-time listener doesn't care where
the change came from.
