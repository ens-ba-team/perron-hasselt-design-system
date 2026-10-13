# Perron Hasselt Figma ↔ repo sync

Figma account: design2@enosta.com

> [!IMPORTANT]
> **Status lives here and nowhere else in this file.** Everything below the first `---` is a dated log:
> append to it, never rewrite it, and never read a status claim out of it. Entries older than the line
> below are superseded by definition.
>
> | | |
> |---|---|
> | **Last checked** | 2026-10-12 |
> | **Synced to code** | Button · Sidebar · Sheet · Drawer (**4** of 36) |
> | **Left to audit** | **32** — their `component-directory.md` / `meta.json` node IDs still point at the Agentic file |
> | **Dark mode** | ⏸ Out of scope. Do not audit, sync or design for it |
> | **Token build** | 🔴 Broken upstream; `tokens.css` is patched by hand |
>
> The component numbers are derived from `project-state.json` (`components.total` minus
> `components.syncedToPerronFigma`). Change them there, not here — `drift-check.mjs` enforces it.

**Perron Figma file:** `7Gn5GiMiQh1SAaTp9FiwNQ` — [Perron Hasselt] Design System
**Upstream Agentic file (still referenced everywhere in this repo):** `YWfTOUTpFZ0BNxHobfUqme`

The Perron file is a **duplicate of the Agentic file**, re-themed. Node IDs are preserved (Button component set is `12:2893` in both), so `figmaNodeId` values in `meta.json` stay valid **only for components that exist in the Perron file**.

---

## What the Perron file contains

| Page | ID | Content |
|---|---|---|
| Cover | `0:1` | Document structure, Start session, Quickguide, Thumbnail |
| -->Icon | `15:741` | Icon set (not inspected yet) |
| -->Buttons | `12:35` | Section `Button` (`410:4045`) → component set `12:2893` + `_best-practice` (`410:3780`) |

~~Only Button exists as a component.~~ **Update 2026-10-08:** all component pages now exist in the Perron file (Display, Actions, Feedback, Navigation, Layout, Forms, Overlay). ~~Synced and verified against code: **Button, Sidebar**. The rest are not audited yet…~~ **Superseded — see the status block at the top of this file.**

### Button — structure matches repo ✅
- Type: Default, Secondary, Destructive, Outline, Ghost, Link
- State: Enabled, Hover, Focus, Disabled, Active. The label column on canvas lists 6 rows (Default/Hover/Focus/**Loading**/Disabled/Pressed) but the **Loading row has no variants**, same as repo (no Loading state)
- Size: Default 40, Small 36, Large 44, Icon Default/Small/Large
- `Link` has no Icon sizes (same as repo). `Secondary / Disabled / Icon *` were added later (`170:4091–4095`).

---

## ⏸ Dark mode — OUT OF SCOPE (decision 2026-10-08)
Perron does **not** ship Dark mode for now. Do **not** audit or sync Dark values; only Light is checked against Figma. The existing `.dark {}` block in `tokens.css` and the Figma Dark mode are left as they are (unmaintained). Start Dark mode only when the team explicitly asks for it.

## Token sync — done 2026-10-08

Figma values pulled via Plugin API (Primitives 212 vars · Semantics Light/Dark 111 · Components 45).

### Primitive ramps added (`Tokens/primitives.tokens.json`)
**Same names in Figma and repo** (Figma primitives renamed 2026-10-08 from `color/brand/primary|secondary/*` so they no longer collide with the semantic `color/brand/*` path):

| Name (Figma = repo) | Base | Values 50 → 950 |
|---|---|---|
| `color/navy/*` | **500** `#235e89` (Rule 1) | e6ebf0 · bfcdda · 96adc1 · 6e8da8 · 4c7597 · **235e89** · 1b5681 · 104c75 · 0b4369 · 0c3150 · 082135 |
| `color/gold/*` | **900** `#b37f26` — **exception to Rule 1** | fffce8 · fff6c5 · fff09e · ffea78 · ffe45a · ffde3a · ffd13b · edbb35 · d7a530 · **b37f26** · 93681f |

`color/brand/secondary` (button fill) = `gold/900` base, changed by the designer in Figma 2026-10-08. `secondary-active` also resolves to `gold/900`, so rest and active look identical.

### Semantic mapping (Light) — matches Figma
| Token | → |
|---|---|
| `color/brand/primary` · `color/ring` | `navy/500` |
| `color/brand/primary-hover` = `-active` | `navy/700` |
| `color/brand/secondary` | `gold/900` (base) |
| `color/brand/secondary/foreground` | `gold/50` |
| `color/brand/secondary-hover` / `-active` | `gold/800` / `gold/900` |
| `color/text/link` / `-hover` / `-active` | **`color/brand/primary` / `-hover` / `-active`** (decision 2026-10-08, changed in Figma too) |

Dark mode (Figma): brand primary and link resolve to the **blue** ramp, secondary to `blue/900`, ring to `navy/400`. `tokens.css .dark` now overrides primary back to blue accordingly.

### Decisions
- **Secondary is final.** Fill/active `#b37f26` on `#fffce8` is 3.4:1, hover `#d7a530` is 2.2:1. Known, accepted, **do not change**.
- Radius unchanged: `radius/base` = 8, `radius/xl` = 12 (Button Large). Earlier note saying base was 12 was wrong.

### ⚠️ Build is broken upstream
`node Tokens/sd.build.mjs` failed **before** this sync too: 7 references to `*.foreground` tokens can't resolve, because `foreground` is nested inside a token that already has `$value`, and Style Dictionary ignores it. So `output/css/*.css` and `agentic-ui/src/app/tokens.css` were **patched directly** with the Figma values. Fix the JSON structure before relying on the build again.

**Root cause found 2026-10-13 (not yet fixed — needs Figma).** The build runs with `usesDtcg: true`. Under
strict DTCG a node carrying `$value` *is* a token, so Style Dictionary does not walk into its children.
`semantics.tokens.json` has **24 nodes that are both a token and a group** — `color.background.default`,
`color.brand.primary`, every `color.status.*`, etc. — each with a nested `foreground` child. Those 24
children are unreachable, and **7 references point at them**, which is exactly the "7 references could not
be found" error:

| Reference from | Points at |
|---|---|
| `color.icon.default` | `{color.background.default.foreground}` |
| `color.sidebar.active.foreground` | `{color.sidebar.accent.foreground}` |
| `button.primary.fg.fg` | `{color.brand.primary.foreground}` |
| `button.secondary.fg.fg` | `{color.brand.secondary.foreground}` |
| `button.destructive.fg.fg` | `{color.brand.destructive.foreground}` |
| `button.outline.fg.fg` · `button.ghost.fg.fg` | `{color.background.default.foreground}` |

**The fix** is to make the structure DTCG-legal: move each nested `foreground` out of its parent token into a
sibling key, `default` + `default-foreground`. That keeps the emitted CSS variable name identical
(`--color-background-default-foreground`), so no consumer changes. It touches 24 nodes, the 7 references and
the `$description` lines that spell the old path.

**Why it is not done yet:** renaming token structure changes the token *path*, and Figma variable names use
those paths (`color/background/default/foreground`). The project rule is that Figma is the source of truth for
token names, so this must be checked against Figma first — `figma-cli` is not connected. Do not guess.

**Not urgent:** nothing consumes `Tokens/output/`. The prototype reads `agentic-ui/src/app/tokens.css`, which
is patched by hand and correct; `tsc` and `next build` pass. This blocks a clean token pipeline, not any
product work.

### Full audit 2026-10-08 (every Figma variable vs `tokens.css`, Light + Dark)
Fixed in CSS: `color/border/focus` + `button/outline/border/focus` (Light navy/500, Dark navy/400; were stale blue), `opacity/overlay` Dark = 20 (was missing), navy/gold primitives added as CSS vars.
Remaining, all expected:
- `tooltip/bg|fg`: Figma aliases `color/background/inverted` and `color/background/inverted/foreground`; repo uses `var(--color-background-inverted)` and `var(--color-background-inverted-foreground)`. Same aliases ✅
- `breadcrumb/breadcrumb` is a **Figma-only variable**, not a missing component. Breadcrumb exists in code (`breadcrumb.tsx`, meta.json). The variable aliases `spacing/component/xs` (4px) as a designer reference for the item↔separator gap; code uses `--spacing-component-xs` directly. Intentionally not exported (see `breadcrumb.meta.json`)
- Repo-only: font-family (string vars), shadows (Figma effect styles), motion easing, not Figma variables
- `output/js/tokens.mjs` not updated (build broken)

### Still open
- ~~File key swap: replace `YWfTOUTpFZ0BNxHobfUqme` once the other 35 components exist in the Perron file.~~
  **Condition met 2026-10-08** — all component pages exist in the Perron file. The remaining blocker is the
  node IDs in `component-directory.md` / `meta.json`, which still point at the Agentic file for the 32
  components that have not been audited.
- Page `-->Icon` (`15:741`) not inspected yet.

## Sync 2026-10-08 — sidebar background

Figma (Semantics, Light): `color/sidebar/background` → alias `color/navy/50` (#e6ebf0), was `color/zinc/50` (#fafafa).
Synced to `Tokens/semantics.tokens.json`, `Tokens/tokens.tokens.json`, `agentic-ui/src/app/tokens.css`, `Tokens/output/css/variables.css`, `Tokens/output/css/tailwind-v4.css` (hand-patched, SD build still broken). Dark mode untouched (out of scope).
Other 9 sidebar tokens checked: unchanged, match repo.
Follow-up same day: `color/sidebar/accent` → `color/navy/100` (#bfcdda), was `zinc/100`. `color/sidebar/active` aliases accent, so it follows. Synced to the same five files.

## Sync 2026-10-08 — font + sidebar v2

- `font-family/sans`: Inter → **Poppins** (Primitives). All 17 text styles use Poppins; sizes, weights, line heights unchanged. Code: `next/font` Poppins 400/500/600/700 in `agentic-ui/src/app/layout.tsx`, `--font-sans` / `--font-heading` → `--font-poppins` in `globals.css`.
- `color/sidebar/accent` → **`color/zinc/50` (#fafafa)** (was navy/100 earlier the same day). `sidebar/active` follows.
- Sidebar component (Perron node `95:18202`, variant `95:15648`): round brand/primary logo + white mark, title Medium 16 / caption Medium 12, group label Medium 12 (no uppercase), nav item 32px Regular, watermark mark navy/200 @10% bottom-left (**now 20%**, see below). Code: `agentic-ui/src/components/ui/sidebar.tsx` aligned + new `SidebarWatermark`.

## Sync 2026-10-08 — watermark 20%

`SidebarWatermark` opacity 10% → **20%** (all three Expanded variants of `95:18202`; Collapsed variants have no watermark).

## Sync 2026-10-12 — Drawer

Perron `74:691` now has `Direction=560px` (`2068:93`): 560px, right-anchored, close button, horizontal footer. All variants: title Poppins Medium 14 (code had 18 SemiBold). Synced to `drawer.tsx` (`variant`, `showClose`, footer `layout`). ~~Synced components so far: Button, Sidebar, Drawer.~~ **Superseded — see the status block at the top.**

## Sync 2026-10-12 (2) — Sheet 560, Drawer back to 3 variants

Sheet `98:57748`: new `Side=Horizontal, Direction=560px` (2070:6175); text-block gap 8 -> 4 (`spacing/component/xs`). Drawer `74:691`: 560px variant removed, back to Bottom / Right / Responsive. Synced to `sheet.tsx` (`size="wide"`, header gap) and `drawer.tsx`.

## Sync 2026-10-12 (3) — Sheet property rename

Sheet `98:57748`: property `Direction` renamed to `Size` (380px | 560px | 1200px). Values unchanged. Variant names: `Side=Horizontal, Size=380px`, `Side=Horizontal, Size=560px` (2070:6175), `Side=Vertical, Size=1200px`.

## Decision 2026-10-13 — Sheet 380px corner radius

Figma rounds **all four corners** of the 380px Sheet; the code rounds **only the exposed edges**. **The code wins — keep two-edge rounding.** A panel anchored to the viewport edge has two corners flush against it, so rounding those draws a seam against the window. Not a Figma bug to fix in code: the Figma variant is drawn free-floating on canvas, which is why all four read as rounded there. No code change.
