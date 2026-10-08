# Changelog

All breaking changes, additions, and removals to the Agentic Design System.

Format: newest first. Each entry includes what changed, the migration path, and the reason.

> **Rule:** Every breaking change must be recorded here before it ships. A breaking change is any rename, removal, or token alias update that would cause a consumer (code, Figma instance, design spec) to break silently.

> **For AI agents:** read the newest entry before changing tokens or the Perron prototype. Each Perron entry lists *Files*, *Decisions* (do not re-open without the designer) and *Open* items. If code and this file disagree, check Figma (`7Gn5GiMiQh1SAaTp9FiwNQ`) first, then ask; never "fix" a recorded decision silently.

---

## 2026-10-08 (Perron) — sidebar watermark 20%

### Changed

**`SidebarWatermark` opacity** — 10% → **20%** (Figma Perron `95:18202`: all three Expanded variants; Collapsed variants have no watermark).
- Files: `agentic-ui/src/components/ui/sidebar.tsx` (`opacity-20`), `Machine Readable/artifacts/components/sidebar.meta.json` (`tokens.watermark.opacity`), comments in `prototype/perron/_shared/components/brand.tsx` and `prototype/perron/layout.tsx`.
- Supersedes "opacity 10%" in the entry below.

### Fixed — font

- **Storybook still loaded Inter**: `agentic-ui/.storybook/preview-head.html` hard-coded Google Fonts Inter and `body { font-family: var(--font-inter) }`. Now Poppins 400/500/600/700 + `--font-poppins`.
- **Prototype rendered in Times** after the Poppins switch: stale Next/Tailwind build cache (`agentic-ui/.next`) still served `html { font-family: var(--font-inter) }`, a variable that no longer exists. Source was correct. Fix: delete `.next` and restart the dev server. Verified in browser: every element Poppins, IDs Roboto Mono.
- Agents: after changing fonts or `globals.css`, or switching git branches, clear `agentic-ui/.next` before judging the result. Check `getComputedStyle(document.body).fontFamily`, not only the CSS variable.

---

## 2026-10-08 (Perron) — font, sidebar v2, form fields

### Changed — tokens (Figma → repo)

**`font-family/sans`** — `Inter` → **`Poppins`** ⚠️ visual change everywhere
- Files: `Tokens/primitives.tokens.json`, `Tokens/tokens.tokens.json`, `agentic-ui/src/app/tokens.css`, `Tokens/output/css/variables.css`, `Tokens/output/css/tailwind-v4.css`, `agentic-ui/src/app/layout.tsx` (next/font Poppins 400/500/600/700), `agentic-ui/src/app/globals.css` (`--font-sans`, `--font-heading` → `--font-poppins`), `agentic-theme.md`.
- Text style sizes, weights, line heights unchanged (checked all 17 styles).

**`color/sidebar/accent`** — `color/navy/100` → **`color/zinc/50` (#fafafa)** ⚠️ alias update. `color/sidebar/active` follows (alias of accent). Supersedes the navy/100 entry below.

### Changed — DS component `Sidebar` (`agentic-ui/src/components/ui/sidebar.tsx`), to match Figma `95:15648`

| Part | Was | Now |
|---|---|---|
| `SidebarBrand` | title SemiBold 14, caption 12 @70% | title **Medium 16**, caption **Medium 12**, full opacity |
| `SidebarGroupLabel` | 12 uppercase, tracking, @60% | **Medium 12**, sentence case, h-6 (24px) |
| `SidebarMenuItem` | h-9 (36px), Medium | **h-8 (32px), Regular** |
| `Sidebar` | — | `relative overflow-hidden` (clips the watermark) |
| `SidebarWatermark` | — | **new**: absolute bottom-left (-16px), opacity 10%, aria-hidden, hidden when collapsed |
- Migration: group labels no longer uppercase themselves; write them in sentence case.
- Also updated: `sidebar.meta.json` (exports, tokens, changelog, Perron node note) and a new `Perron` story in `Sidebar.stories.tsx`. `validate-artifacts.mjs` and `drift-check.mjs` pass.

### Changed — Perron prototype

- Sidebar header: round `brand/primary` logo with white Perron mark + "Perron Hasselt" / "Admin System" (`COPY.app.caption`). Replaces the full wordmark (decision 4 superseded by Figma).
- Watermark: Perron mark, `color/navy/200`, via `SidebarWatermark`.
- New `_shared/components/brand.tsx` (`PerronMark`, SVG from Figma, `currentColor`).
- New `_shared/components/form-fields.tsx`: `Field`, `ChoiceSelect`, `asOptions`, `staffOptions`, `NONE`. Removed the copies in `bookings/page.tsx`, `bookings/_components/booking-drawer.tsx`, `maintenance/page.tsx`, `maintenance/_components/maintenance-drawer.tsx`, `_shared/components/inline-cell.tsx`.

### Decisions

4. (updated) Sidebar branding = Figma Perron DS 95:15648: round logo mark + title/caption + watermark. Not the full wordmark.

---

## 2026-10-08 (Perron) — module split

### Changed — prototype data, copy and store split per module

| Was | Now |
|---|---|
| `_shared/mock-data.ts` (one file) | `_shared/types.ts` (entity types), `_shared/format.ts` (TODAY, STAFF, display helpers), `_shared/scenarios.ts` (cross-module seed + hard cases + public IDs), `<module>/data.ts` (choices, ID format, seed builder, module helpers) |
| `_shared/copy.ts` (all strings) | `_shared/copy.ts` (app, nav, common, dev, `labels.*`) + `<module>/copy.ts` (`ROOMS_COPY`, `BOOKINGS_COPY` incl. `form`, `TENANTS_COPY`, `MAINTENANCE_COPY`) |
| `_shared/store.tsx` (all state) | `<module>/store.ts` slices (`useRoomsSlice`, `useBookingsSlice`, `useTenantsSlice`, `useMaintenanceSlice`) composed in `_shared/store.tsx` (one Provider, same `usePerron()` API) |

- Moved: booking helpers `contractMonths`, `contractTotal`, `myTask`, `overlapping`, `bookingId` → `bookings/data.ts`. `roomId` → `rooms/data.ts`, `tenantId` → `tenants/data.ts`, `maintenanceId` + seed → `maintenance/data.ts`.
- Copy keys renamed: `COPY.<module>.columns` → `COPY.labels.<room|booking|tenant|maintenance>`; `COPY.bookingForm.*` → `BOOKINGS_COPY.form.*`; `bookingForm.errors.required` → `COPY.common.required`; `bookingForm.placeholders.room` → `COPY.common.selectRoom`; `bookingForm.fields.notes` → `COPY.common.notes`.
- Seed output unchanged (verified: 41 rooms, 51 bookings, same view counts, same IDs).
- Fix: `useRecordParam` opens a drawer only after client mount (`useSyncExternalStore`). A drawer rendered open on the server did not match the client.

### Decisions (designer, 2026-10-08)

6. Prototype split per module for data, copy, store and components. Exceptions kept in `_shared/`: entity types and field labels (shared vocabulary), cross-module hard cases (`scenarios.ts`), one composed Provider.

### Notes for agents

- Direct `?record=` links can look broken in a hidden browser pane: React 19.2 reveals streamed content with `requestAnimationFrame`, which is paused while hidden. Bring the pane to front before judging.

---

## 2026-10-08 (Perron)

### Changed — tokens (Figma → repo sync)

**`color/sidebar/background`** — alias `color/zinc/50` (#fafafa) → **`color/navy/50` (#e6ebf0)** ⚠️ alias update
**`color/sidebar/accent`** — alias `color/zinc/100` (#f4f4f5) → **`color/navy/100` (#bfcdda)** ⚠️ alias update
**`color/sidebar/active`** — unchanged alias (`→ color/sidebar/accent`), so it now resolves to #bfcdda
- Source: Figma Perron file, collection Semantics, mode Light. Changed by the designer.
- Other sidebar tokens checked and unchanged: foreground, primary, primary/foreground, accent/foreground, border, ring, active/foreground.
- Files: `Tokens/semantics.tokens.json`, `Tokens/tokens.tokens.json`, `agentic-ui/src/app/tokens.css`, `Tokens/output/css/variables.css`, `Tokens/output/css/tailwind-v4.css` (CSS hand-patched: Style Dictionary build still broken). Log in `Machine Readable/perron-figma-sync.md`.
- Dark mode not touched (out of scope).
- Migration: none for code using `var(--color-sidebar-*)`. Anything hardcoding #fafafa / #f4f4f5 for the sidebar must switch to the token.
- Contrast: accent vs background 1.35:1 (selected item visible), text on accent 10.9:1.

### Added — Perron prototype (`agentic-ui/src/app/prototype/perron/`)

Route `/prototype/perron`, dev server port 3100. Structure and conventions: `prototype/perron/README.md`.

**Screens:** Rooms, Bookings, Tenants, Maintenance (Functional Spec §3). Each list: WordPress-style view links with counts, filters/search, sortable columns, inline edit in cells.
**Shared CRUD pattern — record drawer** (`_shared/components/record-drawer.tsx`): right-side `Sheet`, opened by URL `?record=<ID>` (view/edit) or `?record=new` (create). Room drawer 880px, others 640px. Sections never collapse.
**Record IDs** — one public ID per record, first column, the **only** link that opens a record:

| Module | Prefix | Mock range |
|---|---|---|
| Room | `RM-` | 1001–1041 (sorted by room name) |
| Tenant | `TN-` | from 2001 |
| Booking | `PH-` | from 463502 |
| Maintenance | `MT-` | from 3001 |

Names (room, tenant, issue) are plain text, no cross-links.
**Overlap check on booking create** (⚙️ Q27): contract dates above Room; overlapping rooms marked and listed last, never hidden; 2-person room with one booking shows "1 of 2 booked".
**Cancel confirmation** (⚙️ JS): status → Cancelled asks for confirmation and reminds to update Available from. Room is never changed automatically (BR01).
**Dev markers** `<DevNote q="Q27|Q28|Q29|Q30|Title|JS">` on everything that may need WordPress code.
**Mock data** with hard cases (`HARD_CASES` in `_shared/mock-data.ts`); "today" frozen at 2026-10-08.
**Prototype bar** above content: "Signed in as" switcher (Mina / Jef / An) and frozen date. Prototype-only.

### Changed — Perron prototype structure

- Split by module: `rooms/`, `bookings/`, `tenants/`, `maintenance/`, each `page.tsx` + `_components/`. Shared code in `_shared/` (`copy.ts`, `mock-data.ts`, `store.tsx`, `components/`).
- All imports absolute (`@/app/prototype/perron/...`). No `../`.
- Removed routes: `rooms/[id]`, `bookings/[id]`, `bookings/new`, `tenants/[id]`, `tenants/new`, `maintenance/new` → replaced by `?record=`.
- Sidebar aligned with DS story: `SidebarGroupLabel` added, form controls removed from `SidebarFooter`.
- Logo: full Perron wordmark on `brand/primary` instead of the 28×28 logo slot.

### Decisions (designer, 2026-10-08) — do not re-open without asking

1. CRUD uses the record drawer. README says "edit in place, no modals": inline edit stays on lists, full records use the drawer.
2. Booking ID format `PH-` + number, starting 463502. Same pattern for `RM-`, `TN-`, `MT-`.
3. ID is the only link to a record's detail.
4. Sidebar uses the full Perron wordmark.
5. Prototype is organised by module folders with `_shared/`.

### Known issues

- **`ComboboxField` (DS component) shows `value` instead of `label` in the input.** Prototype workaround in `bookings/_components/booking-drawer.tsx` (uses tenant name as value). Fix belongs in `agentic-ui/src/components/ui/combobox.tsx`, not yet done.
- **`AlertDialogAction` has no `variant` prop** although its comment says to pass one. Prototype uses `asChild` + `<Button variant="destructive">`.

### Open

- ID prefixes (`RM-`, `TN-`, `MT-`, `PH-`) are not WordPress post IDs; showing them needs a custom field/column → candidate **Q31** for the Functional Spec.
- Functional Spec and product README do not yet mention: record drawer, ID column on every list.
- Committed on branch `perron/prototype-v1` (2026-10-08).

---

## 2026-06-03

### Added

**`AlertDialog.md` + `alert-dialog.meta.json`** — documentation separated from Alert
- AlertDialog now has its own dedicated markdown doc and meta.json (v3 schema)
- Previously shared with `Alert.md` and `alert.meta.json`
- No Figma or code changes — documentation split only

**`Textarea.md` + `textarea.meta.json`** — documentation separated from Input
- Textarea now has its own dedicated markdown doc and meta.json (v3 schema)
- Previously shared with `Input.md` and `input.meta.json`
- No Figma or code changes — documentation split only

**`Type=Tag Input` on Combobox** — new variant
- Free-form chip creation — user types and presses Enter or comma to create chips
- No predefined options list required (optional suggestions dropdown available)
- Backspace removes last chip when input is empty; duplicates silently ignored
- Figma: variant not yet built — Storybook and docs complete

**meta.json v3 schema** — all 35 components migrated
- New fields: `meta.storyFile`, `meta.knownIssues`, `meta.changelog`, `meta.darkMode`, `implementation`, `storybook`
- `tokens.states.invalid` added for all 7 form field components — documents red ring spec
- `behavior.typeGuide` added for components with Type variants
- `examples` field removed — examples.tsx files deleted, examples now live in Storybook stories

**Calendar `Type=Month-Year Selector`** — 3-view navigation
- Header now shows separate `Month ∨` and `Year ∨` buttons — each toggles independently
- Three views: `days | months | years`
- Months view: 4×3 pill grid. Years view: 4×3 pill grid (12-year range)
- Prev/next arrows navigate month / year / 12-year range depending on active view

**Calendar `Type=Date-Time Picker`** — custom time picker
- Replaced native OS `<input type="time">` with a custom Radix Popover
- Two interaction modes: type `HH:MM` directly OR click Clock icon to open HH/MM scrollable columns
- Bidirectional sync: typing updates columns; selecting from columns updates the input
- Minutes in 5-minute increments (00, 05, 10 … 55)
- Clock icon moved to trailing position

### Changed

**SelectItem — checkmark removed** — visual change, no API change
- Before: shadcn default — absolute positioned checkmark indicator (`pl-8` left padding)
- After: no checkmark — selected state uses `color/brand/primary` text color only (transparent bg)
- Spec: `State=Selected` → container fill transparent, label fill `color/brand/primary`
- Migration: no prop changes needed

**SelectContent — dropdown sizing updated**
- Container radius: `radius/md` → `radius/lg`
- Viewport padding: `p-1` (4px) → `p-0.5` (2px) — matches `spacing/component/xxs`
- Gap between items: none → `gap-0.5` (2px)
- Item height: auto → `h-8` (32px fixed)
- Item horizontal padding: `pl-8 pr-2` → `px-2` (8px)
- Item radius: `radius/sm` → `radius/md`
- Same changes applied to Combobox popup and Tag Input suggestions dropdown

**Invalid focus ring — all form fields** — visual fix, no API change
- Before: blue `color/ring` glow appeared on focused invalid fields (wrong)
- After: red `color/border/error` glow appears — blue ring suppressed
- Components fixed: Select, Input, Textarea, Combobox, Checkbox, RadioGroup, InputOTP
- Implementation: `[&[aria-invalid]]` compound CSS selector to beat `data-[state=open]` and `focus-visible` specificity

**DatePicker trigger icon — moved to trailing position**
- Before: leading icon (left of placeholder text)
- After: trailing icon (right of placeholder text) — matches standard date input convention
- No API change

**InputOTP active slot — ring-2 pattern (shadcn)**
- Before: inset shadow on slot + overflow-hidden on group → radius mismatch at corners
- After: `ring-2 ring-offset-0 z-10` on active slot + per-slot borders, no overflow-hidden on group
- Active slot ring: `color/border/focus` (default) or `color/border/error` (invalid group)
- Visual result: seamless ring matching slot corner radius — no mismatch

**NavigationMenu panel link — foreground token corrected**
- Before: `color/surface/default/foreground` (resolves same in light mode but wrong in dark)
- After: `color/surface/overlay/foreground` (correct paired token — panel fills with `color/surface/overlay`)

**Tooltip `delayDuration`** — system default changed
- Before: Radix UI default 700ms
- After: system default 300ms — set `delayDuration={300}` on `TooltipProvider` at app root
- `skipDelayDuration` remains at 300ms

### Fixed

**Calendar row spacing** — 2px gap between week rows
- `[&_tbody_tr+tr]:mt-0.5` on table — `mt-*` on `<tr>` doesn't work in table layout without `display:flex`

**Calendar outside day selected foreground**
- Outside days that are also selected (range-start/end) now show correct foreground
- `aria-selected:opacity-100 aria-selected:text-[color/brand/primary/foreground]` on `day_outside`

**AlertDialog footer gap** — `FullWidthFooter` story
- Gap between stacked buttons: `spacing/component/xs` (4px) → `spacing/component/sm` (8px)

**Drawer Responsive story** — rewritten with `useIsDesktop()` hook
- Before: CSS class overrides on Vaul drawer (ineffective — Vaul uses internal fixed styles)
- After: `useIsDesktop()` hook — renders `Dialog` on desktop, `Drawer` on mobile

### Removed

**`examples.tsx` files** — all 33 deleted
- Examples now live in `src/stories/*.stories.tsx`
- `storybook.stories` field in each meta.json lists all named story exports
- Validator updated: checks `storybook.file` instead of `examples.source`

---

## 2026-06-02

### Fixed

**Button `variant="destructive"` focus ring** — visual correction, no API change
- Before: inherited base `focus-visible:ring-2 ring-[var(--color-ring)] ring-offset-2` (blue ring + gap)
- After: `focus-visible:ring-0 [box-shadow:0_0_0_3px_rgba(220,38,38,0.4)]` — red glow, 3px spread, no offset
- Matches `focus/destructive` Figma effect style (red @40%, spread 3px)
- Also removed `ring-offset-2` from base (all variants — no gap between element and ring per spec)
- No prop or class name changes — visual only

### Added

**`InputOTPGroup` `invalid` prop** — non-breaking
- New: `invalid?: boolean` on `InputOTPGroup`
- When true: group border switches to `color/border/error`; active slots switch inset shadow to `color/border/error`
- Before: invalid state required fragile `className` override (unreliable with tailwind-merge on arbitrary CSS var values)

---

## 2026-05-28

### Added

**`color/status/offline`** · **`color/status/offline/foreground`** — new Semantics tokens
- `color/status/offline` → `color/zinc/200` (light gray fill)
- `color/status/offline/foreground` → `color/zinc/900` (dark text/icon on offline fill)
- Use when: offline presence dot in `avatar-indicator`, `Offline` badge variant, any UI element communicating a user or entity is not currently available
- Does not follow the 4-variant pattern (no `offline-subtle`) — a subtle tint would be too low-contrast for presence communication

**`color/surface/muted`** — new Semantics token
- Fill for muted component surfaces (avatar fallback bg, skeleton bones, dimmed containers)
- Distinct from `color/background/muted` (page canvas) — use surface tokens inside components, background tokens on the page

**Badge `Offline` variant** — new component variant
- Shape: Pill only
- Structure: dot-slot + leading-icon (hidden by default) + label — same as Online
- Dot fill: `color/status/offline`
- Wrap in `aria-live="polite"` — presence state updates in real time

**Badge `Notification counters` variant** — new component variant
- Shape: Pill, Size: Small only
- Structure: number-only — no icon slots
- Fill: `color/brand/primary` — same as Default
- Always wrap in `role="status"` or `aria-live="polite"` — count updates in real time
- Cap display at "99+" to prevent layout overflow

**`Skeleton`** — new component (code-only)
- shadcn `Skeleton` — single div, `animate-pulse`, `bg-muted`
- No Figma component set — Figma page kept as reference layout documentation
- No component tokens — uses Tailwind `bg-muted` class directly

### Changed

**`avatar-badge` → `avatar-indicator`** ⚠️ Breaking
- Figma component renamed from `_avatar-badge` to `avatar-indicator`
- Redesigned from scratch — removed `Type=Dot` / `Type=Icon` variants and ring stroke
- New variant matrix: `type=online` / `type=offline` × `size=Default` / `size=large` (4 variants total)
- Token changes: `color/status/success` (online) · `color/status/offline` (offline) — no stroke, no ring
- Size change: `size=Default` is now 8×8px (was 12×12px) · `size=large` is 12×12px
- Size pairing: use `size=Default` with `Size=SM` avatars · `size=large` with `Size=Default` and `Size=LG` avatars
- Migration: update all Figma instances from `_avatar-badge` → `avatar-indicator`; update `type=` prop; remove any ring stroke overrides

### Removed

**Badge `Avatar` variant** — removed
- Replaced by `avatar-indicator` sub-component inside the `avatar` component
- Migration: use `avatar` component with `Badge=True` and `avatar-indicator` type set to `online` or `offline`

---

## Pre-2026-05-28 (backfill — exact dates not recorded)

### Changed

**Button `Size=Medium` → `Size=Default`** ⚠️ Breaking
- Figma variant prop value renamed
- Affects: all button instances with `Size=Medium`
- Migration: change `Size=Medium` → `Size=Default` on all instances
- Reason: align with shadcn naming convention (`size="default"`)

**Button `Size=Icon Medium` → `Size=Icon Default`** ⚠️ Breaking
- Same as above for icon-only buttons
- Migration: change `Size=Icon Medium` → `Size=Icon Default`
- Reason: align with shadcn naming convention

**`color/icon/success` alias** — alias target updated ⚠️ May affect rendering
- Old alias: `color/zinc/900` (near-black — failed WCAG AA on success-subtle backgrounds)
- New alias: `color/green/700` (dark green — passes WCAG AA)
- Migration: no prop changes — token rebinding only. Re-inspect any icon using `color/icon/success` to verify contrast in context.
- Reason: WCAG contrast audit — 22 pairs checked, 5 remaps applied

### Removed

**Button `Size=Default (32px)`** ⚠️ Breaking
- 32px height button size removed
- Migration: use `Size=Small` (36px) for compact contexts
- Reason: adopted shadcn height scale — 32px is not part of the standard scale

**Button `Size=Icon (32×32)`** ⚠️ Breaking
- 32px icon-only button size removed
- Migration: use `Size=Icon Small` (36px)
- Reason: same as above

---

## How to record a future breaking change

Add an entry under the current date before the change ships:

```markdown
## YYYY-MM-DD

### Changed / Removed / Added

**[Component] [what changed]** ⚠️ Breaking  (omit ⚠️ if non-breaking)
- What it was before
- What it is now
- Migration: exact steps to update consumers
- Reason: why the change was made
```

Categories:
- **Added** — new component, variant, or token (non-breaking unless it changes existing behavior)
- **Changed** — rename, restructure, token alias update
- **Removed** — variant, prop value, or token deleted
- **Fixed** — bug fix that doesn't change the API
