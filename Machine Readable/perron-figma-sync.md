# Perron Hasselt Figma ↔ repo sync

Last checked: 2026-10-08 · Figma account: design2@enosta.com

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

~~Only Button exists as a component.~~ **Update 2026-10-08:** all component pages now exist in the Perron file (Display, Actions, Feedback, Navigation, Layout, Forms, Overlay). Synced and verified against code: **Button, Sidebar**. The rest are not audited yet, so `component-directory.md` / `meta.json` node IDs still point to the Agentic file.

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

### Full audit 2026-10-08 (every Figma variable vs `tokens.css`, Light + Dark)
Fixed in CSS: `color/border/focus` + `button/outline/border/focus` (Light navy/500, Dark navy/400; were stale blue), `opacity/overlay` Dark = 20 (was missing), navy/gold primitives added as CSS vars.
Remaining, all expected:
- `tooltip/bg|fg`: Figma aliases `color/background/inverted` and `color/background/inverted/foreground`; repo uses `var(--color-background-inverted)` and `var(--color-background-inverted-foreground)`. Same aliases ✅
- `breadcrumb/breadcrumb` is a **Figma-only variable**, not a missing component. Breadcrumb exists in code (`breadcrumb.tsx`, meta.json). The variable aliases `spacing/component/xs` (4px) as a designer reference for the item↔separator gap; code uses `--spacing-component-xs` directly. Intentionally not exported (see `breadcrumb.meta.json`)
- Repo-only: font-family (string vars), shadows (Figma effect styles), motion easing, not Figma variables
- `output/js/tokens.mjs` not updated (build broken)

### Still open
- File key swap: replace `YWfTOUTpFZ0BNxHobfUqme` once the other 35 components exist in the Perron file.
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
