# Perron Hasselt Design System

> **Read this first.** For designers and developers alike, before opening Figma or writing any UI code.
> Updated: 2026-10-08 · Owner: Enosta Product Design

The design system for **Perron Hasselt Room Management**, a back office for managing student rental rooms. It is forked from [Agentic Design System](https://github.com/afineavocado/agentic-design-system) (shadcn/ui + Tailwind v4) and re-themed for the Perron brand.

| | |
|---|---|
| **Figma** | [Perron Hasselt Design System](https://www.figma.com/design/7Gn5GiMiQh1SAaTp9FiwNQ) · key `7Gn5GiMiQh1SAaTp9FiwNQ` |
| **Code** | `agentic-ui/`: Next.js + Tailwind v4 + shadcn/ui + Storybook |
| **Tokens** | `Tokens/`: DTCG format, 3 tiers |
| **Index for AI agents** | [`llms.txt`](llms.txt) |

---

## 1. Current status

| Area | Status |
|---|---|
| Brand theme (color) | ✅ Synced Figma ↔ code (Light) |
| Components in the Perron Figma file | 🟡 Only **Button** so far. The other 35 still live in the original Agentic file |
| Components in code | ✅ All 36 components (inherited from Agentic) |
| **Dark mode** | ⏸ **Out of scope for now.** Don't audit, sync, or design for Dark |
| Token build (`sd.build.mjs`) | 🔴 Broken upstream. CSS is being patched by hand, see [section 7](#7-technical-notes) |

The full Figma ↔ repo comparison lives in [`Machine Readable/perron-figma-sync.md`](Machine%20Readable/perron-figma-sync.md).

---

## 2. Core principles

1. **Figma is the source of truth for values.** To change a color, size, or radius, change it in Figma first, then sync it to code. Never change code to match a known Figma error.
2. **Tokens only, no hardcoding.** Never type hex or px values directly. Designers bind variables; developers use `var(--...)`.
3. **If a component exists, use it.** Don't build a frame or div that looks like a Button, Input, or Badge. If no suitable component exists, building one by hand is allowed, but document why.
4. **Same names on both sides.** A token name must read the same in Figma and in code: `color/navy/500` ↔ `--color-navy-500`.
5. **Every breaking change (rename, removal, alias change) must be recorded in [`CHANGELOG.md`](CHANGELOG.md) before it ships.**

---

## 3. Perron brand

| | Ramp | Base | Used for |
|---|---|---|---|
| **Navy** | `color/navy/50 → 950` | **`/500` `#235e89`** | Primary button, link, focus ring, brand icon |
| **Gold** | `color/gold/50 → 950` | **`/900` `#b37f26`**, *exception* | Secondary button |
| Zinc | `color/zinc/*` | — | Neutrals: text, backgrounds, borders |
| Red / Green / Yellow / Blue | — | — | Status: danger, success, warning, info |

- **Rule:** a brand color always anchors its base at `/500`. **Gold is the only exception** and anchors at `/900`.
- **Links** share the primary tokens: `color/text/link` → `color/brand/primary` (navy).
- 🔒 **The secondary (gold) colors are final. Do not change them**, even though contrast falls short (fill 3.4:1, hover 2.2:1). Don't reopen this unless the design lead asks.
- Font: **Inter**. Spacing on a **4px** grid. Base radius **8px**; Large buttons use 12px.

---

## 4. Token structure (3 tiers)

```
Primitives   →  raw values        color/navy/500 = #235e89        (NEVER used directly in components)
Semantics    →  intent            color/brand/primary → navy/500  (the only tier components use)
Components   →  per component     button/primary/bg/bg → color/brand/primary
```

Rules for choosing tokens:
- Every fill comes with its own text color: `X` + `X/foreground`. Always use the matching pair.
- `brand/destructive` (delete button) is **not** `status/danger` (error indicator). Don't swap them.
- A standalone icon uses `color/icon/*`. An icon next to a label (inside a button, tab, or menu) **follows the label's color**. Never use `color/text/*` for icons.
- Spacing inside components uses `spacing/component/*`. Data cards use **16px** padding.

More detail: [`agentic-design-system.md`](agentic-design-system.md).

---

## 5. Getting started

### Designers
1. Open the Perron Figma file and use its components and variables.
2. Bind variables for every fill, stroke, and spacing value. No layer should carry a free value.
3. Before building a screen, skim [`component-quick-reference.md`](Machine%20Readable/component-quick-reference.md) to see which component is for what.
4. Write UI copy per [`content-guidelines.md`](content-guidelines.md): sentence case, buttons start with a verb, no em dashes.
5. Design **Light mode** only.

### Developers
```bash
cd agentic-ui
```
```bash
npm install
```
```bash
npm run storybook
```
Storybook runs at `http://localhost:6006`.

- Components live in `agentic-ui/src/components/ui/`; tokens in `agentic-ui/src/app/tokens.css`.
- Before working on a component, read its `Machine Readable/artifacts/components/[name].meta.json` (variants, tokens, behavior, known issues).
- For screen prototypes, follow [`Prototype-build/prototype-build-skill.md`](Prototype-build/prototype-build-skill.md).
- Checks to run before pushing:
```bash
node "Machine Readable/drift-check.mjs"
```
```bash
node "Machine Readable/validate-artifacts.mjs"
```

---

## 6. Applying it to Room Management

The design system is a general toolkit. The product has its own constraints, and **when the two conflict, the product rule wins**:

| Component | How to use it in Perron |
|---|---|
| `Table` | The main screen. Prefer editing directly in the table (inline edit) |
| `Tabs`, `Accordion` | Don't use them to hide fields or data columns |
| `Dialog`, `Sheet` | Don't use them for editing data. Use `AlertDialog` only for heavy confirmations (e.g. cancelling a booking) |
| `Badge` | A status label only. **Don't use color to signal urgency** |
| `Toast` | Only to confirm an action the user just took. Not for deadline reminders or automatic notifications |
| Date range picker | Only when creating a booking, to check for overlapping dates |

⚠️ The real product runs on **WordPress + Admin Columns Pro**. The design system is for wireframes, prototypes, and specs. Before putting any component into WP admin, check with a developer whether it can be built there.

---

## 7. Technical notes

- **Token build is broken:** `node Tokens/sd.build.mjs` reports 7 unresolved `*.foreground` references. This comes from upstream: `foreground` tokens are nested inside tokens that already have a `$value`. Until it's fixed:
  - The JSON files (`Tokens/*.tokens.json`) match Figma.
  - `tokens.css`, `output/css/variables.css`, and `tailwind-v4.css` are **patched by hand**.
  - `output/js/tokens.mjs` is **not updated**.
- **Old Figma key:** `component-directory.md` and the `meta.json` files still point to the Agentic file (`YWfTOUTpFZ0BNxHobfUqme`). Only switch a component to the Perron key once that component has been built in the Perron file.
- `agentic-ui/CLAUDE.md` still points to a vault outside this repo. Ignore that path and use `llms.txt` in this repo instead.

---

## 8. Documentation map

| File | Read when |
|---|---|
| `README.md` | Always, first |
| `Machine Readable/perron-figma-sync.md` | Re-theming, syncing Figma ↔ code |
| `agentic-design-system.md` | Choosing tokens, spacing, layout |
| `agentic-theme.md` | Changing color, radius, font |
| `content-guidelines.md` | Writing UI copy |
| `Machine Readable/component-quick-reference.md` | Choosing a component |
| `Machine Readable/component-directory.md` | Looking up Figma node ↔ Storybook ↔ code file |
| `Machine Readable/artifacts/components/*.meta.json` | Working on a specific component |
| `Prototype-build/` | Building screens and user flows |
| `CHANGELOG.md` | Recording breaking changes |
| `llms.txt` | Index for AI agents |
