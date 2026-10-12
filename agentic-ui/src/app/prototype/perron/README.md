# Perron Hasselt prototype

Route: `/prototype/perron`. Dev server: `npm run dev -- --port 3100`.

## Structure

```
perron/
  layout.tsx, page.tsx        App shell (Sidebar + prototype bar), redirect to Rooms
  _shared/                    Used by more than one module
    types.ts                  Data model (Room, Booking, Tenant, Maintenance…) = Functional Spec §2
    format.ts                 TODAY, STAFF, formatDate/Money, addDays, weekRange, withoutId
    copy.ts                   Shared strings: app, nav, common, dev notes, field labels (COPY.labels.*)
    scenarios.ts              Cross-module seed + hard cases, maps seed keys to RM-/TN-/PH-/MT- IDs
    store.tsx                 One Provider composed from module slices
    components/
      record-drawer.tsx       Shared CRUD pattern: DS Sheet size="wide" (560px, Figma 2070:6175), opened by ?record=<id>|new
      record-accordion.tsx    Related records inside a drawer: ID + title + one meta line, expand for details
      list-parts.tsx          IdLink, ViewLinks, SortHead, PageHeader, TableFrame, DevNote
      inline-cell.tsx         Inline edit in list cells
      list-pagination.tsx     ListPagination + usePaged: Total · pages · rows per page (10 / 20 / 50, default 50)
      form-fields.tsx         Field, ChoiceSelect, DateField, asOptions, staffOptions, NONE
      brand.tsx               PerronMark (logo + watermark, from Figma)
  <module>/                   rooms | bookings | tenants | maintenance
    page.tsx                  List screen
    copy.ts                   Screen strings for this module only (ROOMS_COPY, …)
    data.ts                   Choices, ID format, seed builder, module-only helpers
    store.ts                  State slice: list + update/add
    _components/              Drawer and module-only components
```

## Where to change what

| To change… | Open |
|---|---|
| Text on one screen | `<module>/copy.ts` |
| A field name (e.g. "Available from"), everywhere | `_shared/copy.ts` → `labels` |
| Dropdown choices (e.g. Room status) | `<module>/data.ts` |
| A hard case in the mock data | `_shared/scenarios.ts` |
| A new field | `_shared/types.ts` → `_shared/copy.ts` `labels` → the module's list and drawer |
| A form control used by several drawers | `_shared/components/form-fields.tsx` |
| Sidebar look | Figma first, then `src/components/ui/sidebar.tsx` (DS component) |

## Lists

Every list ends with `<ListPagination {...usePaged(visible, resetKey)} />`. `resetKey` must include every tab, filter, search and sort value so the list goes back to page 1 when they change. Rows per page 10 / 20 / 50, default 50, so the 41 rooms fit on one page.

## Rules

- A module only imports from `_shared/` or its own folder. If two modules need the same thing, move it to `_shared/`.
- Reading another module's data at runtime goes through `usePerron()` (the shared store), never by importing that module.
- Only two files in `_shared/` may import modules: `store.tsx` and `scenarios.ts` (composition roots).
- Entity types live in `_shared/types.ts`, field labels in `COPY.labels`: they are the shared data-model vocabulary.
- A hard case that touches several modules (booking + the room status typed for it) stays in `_shared/scenarios.ts`, both halves together.
- Use absolute imports (`@/app/prototype/perron/...`), never `../`.
- `_` folders are private to Next.js routing: they never become URLs.
- Every record has one ID (`RM-`, `PH-`, `TN-`, `MT-`) in the first column. The ID is the only link that opens a record.
- Dates: always `DateField` (DS DatePicker), stored as ISO `YYYY-MM-DD`, shown as `MMM d, yyyy`. Never `<Input type="date">`.
- Mark anything that may need WordPress code with `<DevNote q="Q27" …>` (⚙️).

## Changelog

Every change to this prototype or to tokens goes in the repo root `CHANGELOG.md`, newest first, under a dated `(Perron)` entry with *Files*, *Decisions* and *Open*. Update it in the same change, not afterwards.
