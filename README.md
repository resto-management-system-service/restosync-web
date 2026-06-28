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

- **Node 22** (`.nvmrc` pins `22`)
- **pnpm 9** — enable via Corepack: `corepack enable`

## Getting started

```bash
pnpm install
cp env.example.txt .env.local   # already present in this repo
pnpm dev                        # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable                                                 | Purpose                                                                                                                                                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk keys. **Leave empty to use Clerk keyless mode** — the app boots immediately and a popup lets you claim it later. For real keys, create an app at [dashboard.clerk.com](https://dashboard.clerk.com). |
| `NEXT_PUBLIC_CLERK_*_URL`                                | Sign-in / sign-up / post-auth redirect routes.                                                                                                                                                             |
| `NEXT_PUBLIC_SENTRY_DISABLED`                            | Any non-empty value disables Sentry. Kept `true` locally. To enable Sentry, clear it and set `NEXT_PUBLIC_SENTRY_DSN` / `_ORG` / `_PROJECT`.                                                               |

## Scripts

```bash
pnpm dev          # dev server (Turbopack)
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # oxlint
pnpm lint:fix     # oxlint --fix + format
pnpm format       # oxfmt --write .
```

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
