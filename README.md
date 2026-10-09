# Perron Hasselt Design System

> **Read this first.** For designers and developers alike, before opening Figma or writing any UI code.
> Updated: 2026-10-08 · Owner: Enosta Product Design

The design system for **Perron Hasselt Room Management**, a back office for managing student rental rooms. It is forked from [Agentic Design System](https://github.com/afineavocado/agentic-design-system) (shadcn/ui + Tailwind v4) and re-themed for the Perron brand.

| | |
|---|---|
| **Figma** | [Perron Hasselt Design System](https://www.figma.com/design/7Gn5GiMiQh1SAaTp9FiwNQ) · key `7Gn5GiMiQh1SAaTp9FiwNQ` |
| **Code** | `agentic-ui/`: Next.js + Tailwind v4 + shadcn/ui + Storybook |
| **Tokens** | `Tokens/`: DTCG format, 3 tiers |
| **Product docs** | [`docs/product/`](docs/product/): BRD, Functional Spec, SOP |
| **Product FigJam** | [Business rules, sitemap, data model, lifecycle](https://www.figma.com/board/RnN40RUrCANewi4MBP60yU): source of truth for product rules |
| **Index for AI agents** | [`llms.txt`](llms.txt) |

---

## 1. Current status

> **Last checked: 2026-10-09.** This table is the single place that says where things stand. Any change that moves a row must update it in the same commit (see `CHANGELOG.md` for the history).

| Area | Status |
|---|---|
| Brand theme (color) | ✅ Synced Figma ↔ code (Light), incl. sidebar tokens (background `navy/50`, accent `zinc/50`) |
| Typography | ✅ `font-family/sans` = **Poppins** (Figma ↔ code ↔ Storybook). Mono = Roboto Mono |
| Components in the Perron Figma file | 🟡 All component pages are in the Perron file. **Synced to code: Button, Sidebar.** The other 34 are not audited yet; their `meta.json` node IDs still point to the Agentic file |
| Components in code | ✅ All 36 components (inherited from Agentic) |
| **Dark mode** | ⏸ **Out of scope for now.** Don't audit, sync, or design for Dark |
| Token build (`sd.build.mjs`) | 🔴 Broken upstream. CSS is being patched by hand, see [section 8](#8-technical-notes) |
| Install | 🟡 Works with `npm ci --legacy-peer-deps` (upstream lockfile conflict) |
| `next build` | ✅ Passes (fixed 2026-10-08) |
| Product docs | ✅ BRD, Functional Spec, SOP v0.1 (2026-10-08) in `docs/product/` |
| Perron prototype | ✅ v1 built: Rooms, Bookings, Tenants, Maintenance + record drawers + pagination on every list. `agentic-ui/src/app/prototype/perron/` (structure and rules in its `README.md`). Merged to `main` |
| Open questions for dev | 🟡 Q27–Q30 (Functional Spec §9) + **Q31** candidate: public ID prefixes `RM-`/`TN-`/`PH-`/`MT-` need a custom field |

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
- Font: **Poppins** (mono: Roboto Mono). Spacing on a **4px** grid. Base radius **8px**; Large buttons use 12px.

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
npm ci --legacy-peer-deps
```
`--legacy-peer-deps` is needed: the upstream lockfile pins `@storybook/addon-themes@10.4.6` against `storybook@10.4.1`, which fails npm's peer check.
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

## 6. The product in one page

Read this before designing or building any Room Management screen. Details: [`docs/product/`](docs/product/).

**What it is.** A WordPress back office (ACF Pro + Admin Columns Pro) for **41 units**: Perron 19 (29 rooms) and Perron 17 (12 studios). **3 admin accounts** with equal rights. Tenants have **no account**. No payment tracking, no online booking.

**The one question it answers:** *"Which rooms can be offered to a new tenant, starting from date X?"* Everything else supports this question.

### Two rules that override everything

1. **No automation.** The system never changes what an admin typed: no automatic status changes, no reminders, no emails, no cron. Read-only computed columns are allowed. The client calls it *"an extended version of Excel"*. The operators are older and lose trust in anything that changes on its own.
2. **Money follows the contract, not the move-out.** A tenant who leaves early still pays the full contract. *Available from* is based on **Contract end**, never on the check-out date.

### Key definitions

| Term | Definition |
|---|---|
| **Available from** | The first day after the **last booking** of the room ends. If the room is *Partially occupied*, it is **today**. Entered by the admin, never computed |
| **Room status** | Available · Reserved · Partially occupied · Occupied. *Partially occupied* (called *Còn chỗ* in Vietnamese docs) is only for 2-person rooms with one tenant |
| **Booking status** | Upcoming → Active → Ended, or Upcoming → Cancelled (only before signing). Bookings are never deleted |
| **Maintenance status** | Open · In progress · Done. Never changes the room status |
| **Three date layers** | Contract start/end (legal) · Check-in/out date (planned) · Check-in/out done (actual). Never merge them |

### UI rules for Perron screens

- **Lists are the product.** Main screens are tables. No dashboard.
- **Inline editing** in the table. No editing in modals.
- **Nothing hidden behind tabs or accordions** inside a record. Horizontal scroll is better.
- **Column order is a design tool:** *Room status* sits next to *Available from*; *Contract end* sits next to *Check-out date*.
- **Rooms list sorts by Available from by default.** Do not default to a status filter.
- **Tabs on lists** (saved views): status links with counts, plus *Check-ins this week · Check-outs this month · My task* on Bookings.
- **No urgency colours.** Status labels are neutral.
- **Warn, don't hide.** For example, rooms that overlap a new booking are marked and moved down, never removed from the list.

### How the design system applies

When a design-system default conflicts with a product rule, **the product rule wins**:

| Component | How to use it in Perron |
|---|---|
| `Table` | The main screen. Prefer inline edit |
| `Tabs`, `Accordion` | Only for list tabs (saved views). Never to hide fields or columns |
| `Dialog`, `Sheet`, `Drawer` | Not for editing data. Use `AlertDialog` only for heavy confirmations (cancelling a booking) |
| `Badge` | A neutral status label. **Don't use success/warning/danger colours to rank urgency** |
| `Toast` | Only to confirm an action the user just took. Never for reminders |
| Date range picker | Only when creating a booking, to check for overlapping dates. Not on the Rooms list |
| Dashboard card grid (`layout-patterns.md`) | Not used. Lists are the main screens |
| `Skeleton`, `ChatBubble`, `InputOTP` | Out of scope |

⚠️ The real product runs on **WordPress + Admin Columns Pro**. Not every component can be rebuilt in WP admin without code. Check with a developer before promising anything new.

---

## 7. Building the Perron prototype

**Handoff model:** the team builds the prototype here in React. The **WordPress developer inspects it** and builds the real screens. So the prototype must look and behave like something WordPress can do.

| Rule | Detail |
|---|---|
| Location | `agentic-ui/src/app/prototype/perron/` |
| Read first | `docs/product/Functional Spec …md` (fields, columns, tabs), then [`Prototype-build/prototype-build-skill.md`](Prototype-build/prototype-build-skill.md) |
| Plan before code | Screen list, component map per screen, mock data in the module's `data.ts`. Then shell → screens → self-audit |
| Structure | One folder per module (`page.tsx`, `copy.ts`, `data.ts`, `store.ts`, `_components/`) + `_shared/`. See the prototype's `README.md` |
| CRUD | Record drawer (right `Sheet`) opened by `?record=<ID>`. Inline edit stays on list cells. The record ID (`RM-`, `TN-`, `PH-`, `MT-`) in the first column is the only link to a record |
| Look | WordPress list table: status links with counts above the table, filters above the table, inline edit in cells |
| ⚙️ marker | Mark anything that may need custom code in WordPress: **Q27** overlap marker when creating a booking · **Q28** *My task* column on Bookings · **Q29** contract total · **Q30** open maintenance count on Rooms |
| Nothing automatic | Never animate or simulate a status changing on its own |
| Mock data | Must include the hard cases: 2-person room with one tenant, back-to-back bookings on a 1-person room, early move-out, overstay, cancelled booking, renewal |
| Language | **English** UI copy. Dutch will follow later, so never hard-code display strings inside components |
| Logo | Sidebar = Figma `95:15648`: round `brand/primary` logo with the white Perron mark (`PerronMark` in `prototype/perron/_shared/components/brand.tsx`), plus `SidebarWatermark` (mark, `navy/200`, 20%). Full wordmark for dark backgrounds: `public/brand/perron-hasselt-logo-on-dark.svg` |
| Off-token colours | Avoid. If unavoidable, document the decision at the top of the file |
| Copy | Follow [`content-guidelines.md`](content-guidelines.md): sentence case, buttons start with a verb, no em dashes, "select" not "click" |

---

## 8. Technical notes

- **Token build is broken:** `node Tokens/sd.build.mjs` reports 7 unresolved `*.foreground` references. This comes from upstream: `foreground` tokens are nested inside tokens that already have a `$value`. Until it's fixed:
  - The JSON files (`Tokens/*.tokens.json`) match Figma.
  - `tokens.css`, `output/css/variables.css`, and `tailwind-v4.css` are **patched by hand**.
  - `output/js/tokens.mjs` is **not updated**.
- **Old Figma key:** `component-directory.md` and the `meta.json` files still point to the Agentic file (`YWfTOUTpFZ0BNxHobfUqme`). Only switch a component to the Perron key once that component has been built in the Perron file.
- **Upstream demos removed (2026-10-08):** `src/app/prototype/elevenlabs` and `grabfood` were deleted (still in git history, commit `22fc0b0`). `simon` was kept as a structural reference; the Perron prototype now has its own structure, so `simon` can be removed when convenient.
- **Icons migrated to Untitled UI (2026-10-08):** the Figma Icon page uses Untitled UI, but the code mixed `lucide-react` and `@untitledui/icons` (14 imports used Untitled names from lucide and broke). All 39 files now import from **`@untitledui/icons` only**. 30 lucide-only names were mapped to their Untitled equivalent (e.g. `Search` → `SearchLg`, `TriangleAlert` → `AlertTriangle`, `Trash2` → `Trash01`, `Info` → `InfoCircle`). `lucide-react` is still in `package.json` but unused; `components.json` still says `"iconLibrary": "lucide"` for the shadcn CLI, so swap icons by hand after adding a shadcn component.
- **Type errors fixed (2026-10-08):** `next build` now passes. Fixes were call-site only, no component changed: `Avatar` callers (`item.tsx`, Card and Table stories) use the new `src` / `name` / `fallback` props; old Badge names updated (`danger` → `error`, `shape="dashed"` → `variant="dashed"`); render-only stories in Accordion, Combobox and InputOTP use an untyped `StoryObj`; `Toast.stories.tsx` uses `globalThis.Promise` because a story named `Promise` shadowed the global.
- Logo for dark backgrounds: `agentic-ui/public/brand/perron-hasselt-logo-on-dark.svg`.
- **Stale CSS after font or branch changes:** Next keeps compiled CSS in `agentic-ui/.next`. After changing fonts, `globals.css`, or switching git branches, delete `.next` and restart the dev server. Check fonts with `getComputedStyle(document.body).fontFamily`.

---

## 9. Documentation map

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
| `docs/product/Functional Spec - …md` | Building any Room Management screen |
| `docs/product/BRD - …md`, `SOP - …md` | Business rules, admin procedures |
| `llms.txt` | Index for AI agents |
