# RestoSync UI — build conventions

A shadcn/ui (new-york) component set on Tailwind v4 with OKLCH design tokens.
Every component is on `window.RestoSyncUI.*`. Import parts as flat named exports —
`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` (never `Card.Header`).
The same holds for `Table*`, `Dialog*`, `Select*`, `Sidebar*`, `Field*`, etc.

## Setup & wrapping

Tokens ship on `:root` in the bound stylesheet, so most components need **no
provider** — render them directly. Four need a context wrapper:

- `Tooltip` → wrap in `TooltipProvider` (once, near the app root).
- `Sidebar` and every `Sidebar*` part → wrap in `SidebarProvider`.
- `Infobar` / `InfoButton` → wrap in `InfobarProvider`.
- Toasts: mount `<Toaster />` once at the root; trigger toasts imperatively via
  sonner's `toast(...)`.

Overlay components (`Dialog`, `Sheet`, `Drawer`, `AlertDialog`, `Popover`,
`DropdownMenu`, `Select`, `HoverCard`, `ContextMenu`, `Menubar`) portal to
`document.body` and manage their own open state — compose them
trigger + content as in `<Name>.prompt.md`.

## Styling idiom — Tailwind v4 utilities with token classes

Style with Tailwind utility classes. Use the **semantic token utilities**, never
raw colors, so the design stays theme-correct:

| Purpose | Classes |
|---|---|
| Surfaces | `bg-background`, `bg-card`, `bg-muted`, `bg-popover`, `bg-sidebar` |
| Accents | `bg-primary` / `text-primary-foreground`, `bg-secondary` / `text-secondary-foreground`, `bg-accent`, `bg-destructive` / `text-white` |
| Text | `text-foreground`, `text-muted-foreground`, `text-primary`, `text-destructive` |
| Borders / ring | `border`, `border-input`, `border-border`, `ring-ring`, `outline-ring` |
| Radius (from `--radius`) | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` |
| Elevation | `shadow-xs`, `shadow-sm`, `shadow-md` |
| Charts | fills via `var(--chart-1)`…`var(--chart-5)` (see `ChartContainer`) |

Component variants are **props, not classes**: `variant` (`default` |
`secondary` | `outline` | `ghost` | `destructive` | `link` on `Button`;
`default` | `secondary` | `destructive` | `outline` on `Badge`) and `size`
(`sm` | `default` | `lg` | `icon`). `className` is passed through and merged.

## Where the truth lives

- Tokens + compiled utilities: `_ds/<folder>/styles.css` (and its `@import`s,
  incl. `_ds_bundle.css` which defines every `--*` token on `:root`).
- Per-component API and usage: `components/general/<Name>/<Name>.d.ts` and
  `<Name>.prompt.md`. Read these before composing a component.

## Idiomatic example

```tsx
const { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } = window.RestoSyncUI;

<Card className="max-w-sm">
  <CardHeader>
    <CardTitle>Truffle Arancini</CardTitle>
    <CardDescription>Appetizers · $12.50</CardDescription>
  </CardHeader>
  <CardContent className="flex items-center justify-between">
    <Badge variant="secondary">Available</Badge>
    <Button size="sm" variant="outline">Edit</Button>
  </CardContent>
</Card>
```
