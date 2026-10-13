# Changelog

All breaking changes, additions, and removals to the Agentic Design System.

Format: newest first. Each entry includes what changed, the migration path, and the reason.

> **Rule:** Every breaking change must be recorded here before it ships. A breaking change is any rename, removal, or token alias update that would cause a consumer (code, Figma instance, design spec) to break silently.

> **For AI agents:** read the newest entry before changing tokens or the Perron prototype. **Every change also updates `README.md` §1 Current status if it moves a row** (CHANGELOG = history, README §1 = current state). Each Perron entry lists *Files*, *Decisions* (do not re-open without the designer) and *Open* items. If code and this file disagree, check Figma (`7Gn5GiMiQh1SAaTp9FiwNQ`) first, then ask; never "fix" a recorded decision silently.

---

## 2026-10-13 (Perron) — repo is the single source; drift checks now read prose

A review found **nine documentation drifts that every existing check passed**, because all five checks read
structured data (paths, counts, hexes, story ownership) and none read prose. Seven more surfaced while fixing
those. This entry covers the fixes and the guard that now prevents the class.

### Decisions (do not re-open without the designer)
- **The repo is the single source of truth.** Product docs are canonical in `docs/product/`; edit them here.
- **The Obsidian vault is the learning space only.** It holds `product-knowledge.md` and `session-log.md`,
  neither of which is an input to anything in this repo. Its four product-doc copies were replaced with stubs
  pointing here. There is no mirror and no sync script — hand-copying is dropped, not deferred.
- **`product-knowledge.md` is training material.** Nothing is carried over from it. Its §8 argument that the
  `Available until` reopen condition has been met is set aside; no fact is lost, because `Others` and its
  free-text length are already canonical in BR09.
- **Open maintenance column stays** on the Rooms list, and **zero shows as "—", not "0"**. The client brief
  does not ask for this column; it was added by the designer and confirmed wanted. Non-blocking per BR25.
- **Sheet 380px keeps the code's rounding** — only the exposed edges, not all four corners as in Figma.

### Documentation drift fixed
- **Lists are read-only** (decided 2026-10-12) was still contradicted in **five** places: `README.md` ×4
  (including one cell that said "Lists are read-only" and "Inline edit stays on list cells" together, and a
  row claiming `Dialog`/`Sheet`/`Drawer` are "not for editing data") and `agentic-ui/CLAUDE.md`.
- **Pagination default 10** was written as 50 in **two** places in the prototype README.
- **Component count:** `33` / `34` → **32**, now written as "32 (36 − 4)" so the arithmetic is visible.
- **Canonical direction** was stated backwards in `README.md` §1, `docs/product/README.md`, the BRD metadata
  row, and a `handoff` section whose heading still read "The vault is the original" after its body was fixed.
- **Doc versions:** `docs/product/README.md` said v0.1; the Functional Spec and SOP cross-referenced
  "BRD v0.1 / SOP v0.1". All now v0.2.
- **`codex plan/`** — the old name of `Machine Readable/` — appeared in **six** places in
  `generation-rules.md`, including a `node` command pointing at a path that does not exist.
- **Q27** (confirmed in scope 2026-10-12) was still an open-questions row in the BRD, and risk RK4 still
  named it. **Q29 and Q30 were missing from the BRD entirely**, while the BRD promises both features in
  FR-R1, FR-B1, FR-B5 and section 10.
- **BRD `Available until`** listed its reopen condition as "Development confirms the overlap check (Q27)".
  Q27 is confirmed, so the condition read as already met. Restated to the real reason: the gap cannot be let
  under 6- or 12-month contracts; revisit when Perron starts letting short term.

### Open questions
- **Q27 closed** 2026-10-12 — confirmed in scope, needs ACF PHP filters.
- **Q29 closed** 2026-10-13 — the developer can supply the contract total as a disabled field. **One detail
  open:** does that field *store* the value? BR10 and section 10 say it is not stored. If it is, both need
  updating and a `save_post`-style hook must recalculate on `monthly_rent`, `contract_start`, `contract_end`
  changes — otherwise a stored total goes stale and silently disagrees with rent × months.
- **Q28, Q30 still open** for the developer.

### New files
- **`Machine Readable/project-state.json`** — the single home for mutable facts: component total and synced
  list (remaining is *derived*, never typed), doc versions, open-question status, pagination default, row
  height, frozen `TODAY`, canonical-source map, and a forbidden-phrase list.
- **`docs/product/rule-number-map.md`** — maps `R0`–`R26` (the discovery numbering, vault-only) to
  `BR01`–`BR29`. The two sets were written independently: 21 are 1:1, R7 splits into BR12 + BR13, BR15 is fed
  by R6 + R11 + R23, BR10 by R17 + R24, R22 is a design rule (FR-G4) and not a BR, **R19 has no BR** and
  **BR22 has no R**.
- **`docs/discovery/`** — the Vietnamese rule digest (`onboarding-vi.md`, trimmed from 197 to 117 lines by
  dropping the DS, status and file-index sections that duplicate other owners) plus `archive/` holding the
  client's original brief and three dated snapshots.

### `drift-check.mjs`
- **Fixed: a skipped check counted as a pass.** It printed `✅ No drift detected` while the Figma dark-mode
  check was skipped. It now reports `(1 check skipped — not verified)`.
- **New check 6** — prose against `project-state.json`: components left to audit, doc versions and
  cross-references, pagination default in **both** prose and `DEFAULT_PAGE_SIZE`, and resolved questions that
  are still rows in an open-questions table.
- **New check 7** — every path inside a ```sh``` block resolves.
- **New check 8** — 16 superseded phrases appear nowhere.
- Checks 6 and 8 ignore phrases wrapped in `code`, "quotes" or ~~strikethrough~~. Without that they fire on
  the handoff section that lists stale phrases to grep for, and on lines already struck through — a check
  that cries wolf gets ignored, which is how the first five checks ended up missing nine real drifts.
- Verified by mutating each stored value and confirming the check fires.

---

## 2026-10-12 (Perron) — product docs back in sync

Full pass over the client-facing documents, so they describe the prototype as it is now. Vault first, then copied to `docs/product/`.

### BRD v0.2
- Scope: 41 units "of today", **not fixed** — admins add rooms and buildings.
- C3 / BR20 / BR29: inspection photos are **uploaded**; contracts and ID papers stay on Drive. The GDPR rule covers papers, not room photos.
- FR-B2: tabs are now **My task** and **This week**.
- FR-G1b added: ID column first, Actions column last, pagination 10 / 20 / 50 (default 10).
- FR-G2 / FR-R5 struck through: no inline editing, flagged for client confirmation.
- My task table and Q28: "7 days before check-out" → "the week the check-out is due".
- Room entity: Building is extendable.

### SOP v0.2
- New intro paragraph: how to open a record (ID or Edit icon → side panel); lists are read-only.
- P1: "Add booking", dates first so the room list can mark booked rooms.
- P3 / P4: photos are **uploaded to the booking**, not pasted as a Drive link. P4 trigger is "the week the check-out is due".
- **New P10b**: adding a room, and adding a new building from the room form.
- P11 weekly check: "Check-outs this month" → **This week**; the deposit row now reads the Ended tab's Deposit status column (the Deposits held tab is gone).

### Functional Spec v0.2
Already updated earlier today; no further change in this pass.

### Vault
- `product-knowledge.md`: scale, GDPR split, Building, photo fields, R15, UI principles, Bookings columns and tabs. New **§16** listing every 2026-10-12 decision.
- `README.md`: §9 open items rewritten (Q27 closed, no Q31, client confirmation needed for inline editing), doc versions bumped.

### Status
- `README.md` §1 Product docs row: 🟡 → ✅.

---

## 2026-10-12 (Perron) — no inline editing, sticky ID elevation

### Removed — inline editing
- Lists are now **read-only**. Every field is edited in the record drawer, opened from the ID link or the **Edit** row action. Deleted `_shared/components/inline-cell.tsx` (`InlineCell`, `SingleEditProvider`); `TableFrame` no longer provides an edit context.
- The cancel-booking confirmation on the Bookings list went with it — it was triggered by the inline status cell. The same dialog still runs inside the booking drawer.
- Reverses "one cell at a time" from the entry below, decided earlier the same day.
- ⚠️ **Conflicts with the client brief**, which asks for inline editing (client spec §5; BRD FR-G2 and FR-R5). Recorded as a deviation in the Spec §3 and marked in the BRD. **Needs client confirmation before build.**

### Changed — sticky ID column
- The ID column and its header now cast `shadow/md` **sideways** (`4px 0 …`), so the pinned column reads as sitting above the columns sliding under it.
- The **Actions header is no longer pinned sideways**: the label scrolls with the other headers, while the action buttons in each row stay docked right.

### Decisions (designer, 2026-10-12)
17. No inline editing anywhere. One editing surface: the record drawer. Supersedes decision 12.
18. Sticky ID column gets elevation; the Actions header does not stay pinned.

### Docs
- Functional Spec: §3 rewritten (no inline editing + the deviation note), column tables now say "Editable (panel)".
- BRD: FR-G2 and FR-R5 struck through with the change and a confirmation flag. Vault `README.md` principle updated. Both copied to `docs/product/`.

---

## 2026-10-12 (Perron) — table: 64px rows, sticky header, elevated actions

### Changed — DS component `Table` (`agentic-ui/src/components/ui/table.tsx`)
- New **`wrapperClassName`** prop for the scroll container around the table. Sticky headers and sticky columns position against that element, so it has to be the one with a bounded height. Without it, a consumer could not make a sticky header work: the wrapper always grew to content height. No visual change by default. `table.meta.json` updated.

### Changed — prototype lists
- **Row height 64px** (was 48). Supersedes the 48px in the entry below.
- **Header row is sticky** while the rows scroll, and the ID / Actions headers stay pinned sideways over their sticky columns (`HEAD`, `HEAD_ID`, `HEAD_ACTIONS`).
- **Actions column now has a visible "Actions" header** (was a screen-reader-only label).
- **Row actions sit in an elevated pill**: own surface, border and `shadow/md`, so the buttons read as floating above the row instead of blending into it.
- A list page now fills the viewport and the table scrolls inside its frame; filters, tabs and pagination stay put. `main` became a flex column in `layout.tsx`.

---

## 2026-10-12 (Perron) — list tables, tabs, photos, buildings

### Changed — prototype lists
- **Rows 48px** (was 49: the DS `TableCell` p-4 was fighting the cell class). Alternating row background (`color/background/subtle`), values in `color/text/secondary`, ID and record name keep the strong colour.
- **ID column sticky** on the left in all four lists.
- **Actions column** last, no header label: Edit + View icons, revealed on row hover or keyboard focus, sticky right so it floats over the row. Ended / Cancelled bookings get **View** only.
- **Inline editing: one cell at a time.** `SingleEditProvider` lives in `TableFrame`, so opening a second cell closes the first. Editing inside a drawer is unchanged.
- **Rows per page default 10** (was 50). Options unchanged: 10 / 20 / 50.
- New in `list-parts.tsx`: `ROW`, `CELL_STRONG`, `CELL_ID`, `CELL_ACTIONS`, `RowActions`.

### Changed — Bookings tabs
| Was | Now |
|---|---|
| Check-ins this week · Check-outs this month · My task · Deposits held | **My task** (due this week, assigned to me) · **This week** (due this week, anyone) |
- `myTask()` now takes the end of the week instead of a 7-day window, and splits into `taskDue()` (what is due) + `myTask()` (my share of it). One definition of "this week" instead of two horizons.
- Deposits held removed (designer: not needed).

### Changed — forms
- **Helper text is now an info icon** next to the label, shown on hover or focus. Only `hintBelow` keeps text under a field; the only one left is the overlap instruction on the Room field. Validation errors are unchanged, still under the field.
- **Check-in / Check-out photos are image uploads** (`ImageField`), two separate fields, with thumbnails and remove. Check-out photos only appear once `Check-out done` = Yes, per the Spec. Contracts and IDs stay a Drive link in "Other" (client spec §6 privacy rule covers ID cards and contracts, not room photos).
- **Building can be created from the room form** (`CreatableSelect`): pick an existing building or "Add a new building". The list also picks up buildings already used by other rooms. WordPress: ACF Taxonomy field with *Create Terms* — no custom code.
- Q27 marker removed from the Room field (confirmed in scope).

### Decisions (designer, 2026-10-12)
12. Inline editing stays, but only one cell at a time. Records also stay editable inside the drawer.
13. Tabs: My task = assigned to me, This week = team view. Deposits held dropped.
14. Inspection photos are uploads, two fields. The client's "do not upload" rule applies to ID cards and contracts only.
15. No Buildings module: a new building is typed into the Building field on a room.
16. Record IDs in the prototype are mock values. Dev maps them to WordPress post IDs (no Q31).

### Docs
- **Functional Spec v0.2** (vault, copied to `docs/product/`): rooms not fixed, Building as a taxonomy with Create Terms, photos as Gallery fields + privacy note, list rules (one-cell inline edit, ID column, Actions column, 48px rows, pagination), new §4.3 "My task and This week", Q27 marked in scope, D6 on mock IDs.
- Vault `README.md` and `product-knowledge.md` updated for the room count and the saved views.
- Still behind: BRD and SOP (old tabs, fixed room count).

### Open
- BRD + SOP need the same update as the Spec.
- `RecordDrawer` is still named "drawer" although it renders a Sheet. Rename when convenient.

---

## 2026-10-12 (Perron) — Sheet: Direction renamed to Size

Designer renamed the Sheet variant property (Perron `98:57748`): **`Direction=560px` → `Size=560px`**. Size options: `380px` (default) · `560px` · `1200px`. Combinations in Figma: `Side=Horizontal` + `Size=380px` / `560px`, `Side=Vertical` + `Size=1200px`. Re-scanned: tokens and values inside the variants are unchanged (fill, title 14 Medium, close 24, horizontal footer, header gap 4).
- Code: `SheetContent size="default" | "wide"` unchanged. Mapping `380px → default`, `560px → wide`, `1200px → side top/bottom` is documented in `sheet.meta.json` (`variants.Size`). Comments in `sheet.tsx`, `Sheet.stories.tsx`, `record-drawer.tsx` and README §7 now say `Size=560px`.
- Resolves the "separate `Size` property" item under Open in the entry below. Still open there: the 8px radius question.

---

## 2026-10-12 (Perron) — 560px moved from Drawer to Sheet, Sheet gap 4px

Designer, same day: removed the 560px variant from Drawer, added it to Sheet, and reduced the title-description gap in Sheet. Re-scanned Figma `98:59427` (Sheet) and `74:691` (Drawer), synced both.

### Changed — DS component `Sheet` (`agentic-ui/src/components/ui/sheet.tsx`), Figma `98:57748`

| Part | Was | Now |
|---|---|---|
| `SheetHeader` gap (title → description) | `spacing/component/sm` 8px | **`spacing/component/xs` 4px** ⚠️ affects every Sheet |
| `SheetContent` | one size (380px) | `size`: `default` (380) · **`wide` (560px, Figma `Side=Horizontal, Direction=560px`, 2070:6175)** |
| wide: fill | — | `color/surface/default` (default size stays `surface/overlay`) |
| wide: title / description | 16 SemiBold / `text/secondary` | **14 Medium** / `background/default/foreground`; description `background/muted/foreground` |
| wide: close button | 16px icon, text/secondary | **24×24**, 12px icon, `background/default/foreground` |
| wide: `SheetFooter` | vertical | **horizontal**, two equal-width buttons (Cancel, then primary) |
- Implemented with `data-size` on the content and `group-data-[size=wide]/sheet:` variants, so Title / Description / Footer need no extra props.
- `sheet.meta.json` updated; new story `Sheet › Wide560`.
- Migration: all Sheets get a tighter header (4px). Wide Sheet titles are smaller (14px).

### Changed — DS component `Drawer` (`agentic-ui/src/components/ui/drawer.tsx`), Figma `74:691`
- Back to the three Figma variants: Bottom, Right (400px), Responsive. **Removed** `variant="wide"`, `showClose`, `DrawerFooter layout`, and the `Wide560` story (all added earlier today, now in Sheet).
- Kept: `variant` prop (`bottom` | `right`) so Right no longer needs class overrides; title 14 Medium (still Medium 14 on all three Figma variants).
- Rule of thumb, from Figma best practice: **Sheet = side panel on desktop; Drawer = mobile panel from the bottom** (vaul: swipe to dismiss, scaled background).

### Changed — Perron prototype
- `RecordDrawer` uses DS **Sheet** `size="wide"` again (was Drawer `wide`). Footer and title now come from the DS component.
- Removed the extra `border-b` under the drawer header that the prototype had added: Figma's sheet header has no stroke.

### Decisions (designer, 2026-10-12)
10. (updated) Record drawers use **Sheet `Direction=560px`**, not Drawer. Supersedes "Drawer 560" below.

### Open
- ~~Figma names the size as a `Direction` value~~ Done: now `Size` (see entry above).
- Figma Sheet default (`Side=Horizontal`) has radius 8 on all four corners; code rounds only the exposed edge (left). Not changed, check which is intended.

---

## 2026-10-12 (Perron) — Drawer 560 from Figma, collapsible related records

### Changed — DS component `Drawer` (`agentic-ui/src/components/ui/drawer.tsx`), synced with Perron Figma `74:691`

| Part | Was | Now |
|---|---|---|
| `DrawerContent` | Bottom only (`bottom-0` hard-coded); Right story faked it with class overrides | `variant`: `bottom` (74:689) · `right` 400px (74:690) · **`wide` 560px (`Direction=560px`, 2068:93)** |
| Close button | none | `showClose`, on by default for `wide` (24px, top-right) |
| `DrawerFooter` | vertical only | `layout`: `vertical` · **`horizontal`** (equal-width buttons, used by 560px) |
| `DrawerTitle` | 18px SemiBold ("heading/md") | **14px Medium** (Figma label/md on all four variants; code had drifted) |
- `drawer.meta.json` changelog/exports/notes updated. Stories: `Right` uses `variant="right"`; new `Wide560`.
- Migration: titles in existing drawers get smaller (14px).

### Changed — Perron prototype
- `RecordDrawer` now uses DS **Drawer** `variant="wide"` (was `Sheet` + width override). Removes the `DRAWER_WIDTH` override: the 560px lives in the DS component. Props: `direction="right"`, `handleOnly` (dragging inside a form must not close it), `shouldScaleBackground={false}`.
- Footer = Figma: two equal buttons, Cancel + primary. Room drawer: "Add booking for this room" moved from the footer into the Bookings section.
- **New `_shared/components/record-accordion.tsx`** (DS `Accordion`, `type="multiple"`): related records as rows (ID link · title · one meta line · chevron), expand for the rest in two columns. Used for the Room drawer's bookings and maintenance and the Tenant drawer's booking history. Replaces 6-column tables that scrolled sideways at 560px. Section titles show the count.

### Decisions (designer, 2026-10-12)
10. Record drawers use the Figma Drawer `Direction=560px` variant. Supersedes "Sheet + 560px override" from the entry below.
11. Related records inside a drawer are collapsible rows (designer request). Note: product README says "don't hide behind accordion"; this applies to the record's own fields, which stay fully visible. Only related records (bookings, maintenance, history) collapse.

### Open
- Figma names the size as a `Direction` value ("560px"). Consider a separate `Size` property (Default 400 / Wide 560) so Direction stays Bottom / Right / Responsive.

---

## 2026-10-12 (Perron) — drawer width 560px

### Changed — prototype
- Record drawer width: **560px for every drawer** (was 640px, Room 880px). File: `prototype/perron/_shared/components/record-drawer.tsx` (`DRAWER_WIDTH`); `size` prop removed.
- Supersedes "Room drawer 880px, others 640px" in the 2026-10-08 entry. Those values were chosen by the agent without a design source (see Decisions).

### Decisions (designer, 2026-10-12)
8. Keep the drawer (Sheet) for CRUD. A separate edit page per record (closer to the WordPress edit screen) was considered and **parked**, not rejected.
9. Drawer width 560px. DS Sheet default stays 380px.

### Open
- ~~Figma: add a Sheet "Wide 560" size~~ Done 2026-10-12 as Drawer `Direction=560px` (see entry above).
- ~~Room drawer table scrolls horizontally~~ Fixed 2026-10-12 with `RecordAccordion`.

---

## 2026-10-09 (Perron) — date fields, page sizes, add room

### Fixed — date fields (prototype)
- All 12 date inputs used the browser's native `<input type="date">` ("mm/dd/yyyy", browser calendar icon), which does not match the DS. Replaced by `DateField` (`_shared/components/form-fields.tsx`) = DS `DatePicker` type "input", value stored as ISO. Covers booking, room and maintenance drawers and inline edit in list cells.
- `formatDate` now shows `MMM d, yyyy` (e.g. "Oct 8, 2026"), same as the DatePicker trigger, so lists and fields read alike. Was "8 Oct 2026".

### Fixed — DS components
- `Calendar` (single month) ignored `defaultMonth` and always opened on today's month. Now `month ?? defaultMonth ?? today`. File: `agentic-ui/src/components/ui/calendar.tsx`.
- `DatePicker` passes the selected date (or range start) as `defaultMonth`, so a 2027 contract date opens on 2027. File: `agentic-ui/src/components/ui/date-picker.tsx`.
- `calendar.meta.json`, `date-picker.meta.json` changelog updated. (Two pre-existing `no-explicit-any` lint errors in `date-picker.tsx` left as they were.)

### Changed — prototype
- Rows per page: 20 / 50 / 100 → **10 / 20 / 50**. Default stays 50 (41 rooms on one page).
- **Rooms: "Add room" button** + create mode in the room drawer (Room name field, required; new room starts Available, Available from today; next ID `RM-1042`). Store: `addRoom` in `rooms/store.ts`.

### Decisions (designer, 2026-10-09)
7. Rooms can be created. **Not a new decision:** "Create a new room" is in the FigJam Sitemap (`RnN40RUrCANewi4MBP60yU`, node `113:3758`, source of truth). Reason (designer): the client may add a new building later, so the room count is not fixed. The Functional Spec wrongly says "Room: 41 (fixed)" because the 41-unit count was copied without checking the Sitemap. **Open:** fix the Spec (vault first, then `docs/product/`). Building choices (`Perron 19`, `Perron 17`) are also a fixed list today and will need a new value when a building is added.

---

## 2026-10-09 (Perron) — pagination on every list

### Added — prototype
- `_shared/components/list-pagination.tsx`: `ListPagination` (DS `Pagination`, pattern With Total + With Changer: Total N items · Prev · pages with ellipsis · Next · rows per page) and `usePaged(items, resetKey)`.
- Applied to Rooms, Bookings, Tenants, Maintenance. Back to page 1 when tab, filter, search, sort or rows per page change.
- **Default 50 rows per page** (options 20 / 50 / 100) so the 41 rooms stay on one page ("the list is the product"). WordPress equivalent: Screen Options per-page value.
- Removed the "N items" count above each table (now in the pagination bar).

### Fixed — DS component `Pagination`
- `PaginationPrevious` / `PaginationNext` disabled styles used `[aria-disabled=true]:` (invalid Tailwind variant, never applied). Now `aria-disabled:`. File: `agentic-ui/src/components/ui/pagination.tsx`; `pagination.meta.json` changelog updated.

### Status
- `README.md` §1 Perron prototype row updated, Last checked 2026-10-09.

---

## 2026-10-08 (Perron) — docs status sync

### Fixed — stale documentation
- `README.md` §1 Current status still said the prototype was "Not started" and the Perron Figma file had "Only Button". Updated: prototype v1 built and merged; all component pages in the Perron Figma file, Button + Sidebar synced; typography row (Poppins); Q31 row.
- `README.md` §3 font Inter → Poppins; §7 adds Structure and CRUD rows, Logo row matches Figma sidebar; §8 `.next` cache note, `simon` note.
- `llms.txt`: Perron Figma status, new "Perron prototype" section.
- `Machine Readable/perron-figma-sync.md`: component status, watermark 20%.
- Rule added: changes that move a status row update `README.md` §1 in the same commit.

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
