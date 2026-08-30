# design-sync notes — restosync-web

Repo-specific gotchas for future syncs. Shape: **package** (synth-entry, no lib build).

## Setup / build

- This is a **Next.js app**, not a component-library package. There is no `dist/`.
  `cfg.entry` is a deliberately non-existent path (`./dist/index.js`) whose parent
  walk-up lands `package-build` on the repo root as `PKG_DIR`; the converter then
  prints `[NO_DIST]` and **synthesizes an entry from `src/components/ui/`**
  (`cfg.srcDir`). This is expected — not an error to fix.
- `buildCmd`: none. `pnpm install --frozen-lockfile` is enough. Node 22 (`.nvmrc`).
  Set `COREPACK_ENABLE_STRICT=0` for pnpm.
- Re-sync command needs `--entry ./dist/index.js` OR rely on `cfg.entry` (package-build
  reads it; `resync.mjs` does not forward it, but `cfg.entry` covers that).
- **CSS is generated**, not copied from the repo. `.design-sync/assets/build-css.mjs`
  compiles `.design-sync/assets/ds.css` from the repo's Tailwind v4 setup:
  - promotes the `vercel` theme (repo `DEFAULT_THEME`) from `[data-theme='vercel']`
    to `:root` — the repo has **no `:root` color tokens**, every theme is
    attribute-scoped, so without this promotion every preview renders unstyled.
  - `@source inline(...)` safelist covers layout utilities previews use that the
    `ui/` source doesn't exercise (grid-cols, w-64, max-w-sm, …).
  - Geist / Geist Mono load via a remote `@import` (Google Fonts) → `[FONT_REMOTE]`,
    non-blocking. The repo loads them through `next/font/google`; there are no
    woff2s to ship.
  - **Run `build-css.mjs` before every `package-build.mjs`** (and after authoring
    previews, so new utility classes are picked up).
- `cfg.tsconfig` = `tsconfig.design-sync.json` (repo root). It stubs `next/image`,
  `next/link`, `next/navigation` → `.design-sync/stubs/*` so the Next runtime
  isn't bundled (`process is not defined` at module eval otherwise, which crashes
  the whole IIFE → every component missing from the global).
  - Do NOT put a `"//"` comment key in that tsconfig — the paths-plugin's comment
    stripper corrupts it and silently returns null (→ `@/*`/`next/*` unresolved).
  - Do NOT alias `@/*` in `tsconfig.design-sync.json`: the plugin resolves `''`
    ext first and `@/components/ui/table` hits the `table/` **directory** before
    `table.tsx`. Leave `@/*` to esbuild's auto-discovery of the real `tsconfig.json`.

## Component scope

- `cfg.componentSrcMap` pins the ~57 primitives in `src/components/ui/` (one root
  export per file). `form-context.tsx` and `tanstack-form.tsx` are excluded
  (hooks/HOCs, not components).
- The synth entry re-exports ALL of `src/components/ui/`, so sub-part exports
  (`CardHeader`, `TableRow`, `SidebarProvider`, …) are on `window.RestoSyncUI`
  too — 322 exports total. Only the 57 roots get component folders / cards.
- Everything lands in the `general` group (no per-component docs). Regroup later
  via `cfg.docsMap` stubs if wanted.

## Previews

- All 57 primitives have an authored preview in `.design-sync/previews/`, every
  cell graded `good`. First full sync completed 2026-08-30.
- Authored previews import from `'restosync-web'` (shimmed to `window.RestoSyncUI`).
- Overlay components render their OPEN state via `defaultOpen`/`open` (Radix) plus
  `cfg.overrides.<Name>: {cardMode:"single", viewport:"WxH"}` (see config). Menubar
  and NavigationMenu need `defaultValue` on the root + `value` on the first
  item/menu to open statically. ContextMenu has no open prop — its preview fires a
  synthetic `contextmenu` MouseEvent on mount to show the menu.
- `Table` → `cardMode:"column"` (wide).
- `InfoButton`/`Infobar` previews wrap in `<InfobarProvider>`; `Sidebar` in
  `<SidebarProvider>`; `Tooltip` in `<TooltipProvider>`.
- `ChartContainer` preview imports `recharts` directly (bundled into the preview,
  not a DS export). `FilePreview` relies on the `next/image` stub.
- Preview utility classes must be in the `@source inline(...)` safelist in
  `build-css.mjs` — a class used only in a preview and not in `src/components/ui`
  renders unstyled otherwise. Add to the safelist + rerun `build-css.mjs`.

## Conventions header

`.design-sync/conventions.md` → `cfg.readmeHeader`. Human-editable. On re-sync,
re-validate its class/token/prop names against the fresh build and report drift;
do not rewrite it.

## Known render warns (triaged, not new)

- `[FONT_REMOTE]` Geist / Geist Mono — by design (see CSS section).
- Floor-card `[RENDER_BLANK]` / `[RENDER_THIN]` on tiny components before their
  preview is authored (Badge, Input, Checkbox, Switch, Progress, Spinner,
  Skeleton, Kbd, Toggle, AspectRatio, Frame, Menubar, InputGroup) — expected;
  resolved by authoring.

## Re-sync risks

- **CSS drift:** `build-css.mjs` hard-codes the `vercel` theme. If `DEFAULT_THEME`
  changes in `src/components/themes/theme.config.ts`, or the theme file's token
  set changes, regenerate and re-review. The safelist is hand-maintained — a new
  preview using an un-safelisted utility renders unstyled in that cell only.
- **next stubs:** if `ui/` components start importing other `next/*` modules
  (`next/headers`, `next/font`, …) the bundle breaks again — add a stub + path.
- `.d.ts` contracts are stubs (`[key: string]: unknown`) — synth-entry has no real
  types. `cfg.dtsPropsFor` can hand-write the important ones (Button/Badge/Alert
  variant props) if the design agent needs them.
- Playwright: chromium build 1234 is in `~/Library/Caches/ms-playwright`; the
  render check needs `playwright@1.62.x` (staged in `.ds-sync`).
- **Previews with external images** (AspectRatio, Avatar, FilePreview) load from
  images.unsplash.com / i.pravatar.cc / picsum at capture time — offline capture
  shows broken images (harmless; the DS bundle itself ships nothing external).
- **`overrides` viewports** for overlays were hand-tuned; a bundle change that
  resizes overlay content could clip a card — re-eyeball `.review.html` on re-sync.
- Grades in `.design-sync/.cache/review/*.grade.json` are gitignored working
  state; cross-machine carry-forward is the uploaded `_ds_sync.json` (already
  pinned via `cfg.projectId`).
