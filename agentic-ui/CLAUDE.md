@AGENTS.md

---

## Perron Hasselt — read before any UI work

This app is the code side of the **Perron Hasselt Design System** (forked from Agentic, re-themed navy/gold). Everything you need is **inside this repo**. Paths below are relative to the repo root (one level up from `agentic-ui/`).

**Start here:**
1. `README.md` — Perron onboarding: status, brand, product rules that override the design system.
2. `llms.txt` — navigation index for tokens, component specs and prototype guides.
3. `docs/product/` — product documents (BRD, functional spec, SOP). **Read the functional spec before building any Room Management screen.**

Before writing or modifying any UI code:
1. Read the component's `Machine Readable/artifacts/components/[name].meta.json` for variants, tokens and behavior.
2. Use only `var(--...)` tokens already defined in `src/app/tokens.css`. Never hardcode hex or px values.
3. For prototypes, follow `Prototype-build/prototype-build-skill.md`. Perron prototypes live in `src/app/prototype/perron/`.

### Product rules that win over the design system
- **No automation in the real product (WordPress + Admin Columns Pro).** The prototype must not show anything changing on its own: no automatic status changes, reminders or notifications.
- **Lists are the product.** Main screens are **read-only** tables. No dashboard. Every record is created, viewed and edited in a `Sheet` (wide, 560px) over its list, never inline and never in a `Dialog` that hides the list. (Changed 2026-10-12; BRD FR-G2 / FR-R5 — needs client confirmation.)
- **No urgency colours.** Badges are neutral status labels.
- **Mark anything WordPress may not do without custom code** (overlap check, My task column, contract total, open maintenance count: Q27–Q30 in the functional spec) with a visible ⚙️ marker, so the WordPress developer who inspects the prototype knows.

### Assets
- Logo (for dark backgrounds): `public/brand/perron-hasselt-logo-on-dark.svg`
- `src/app/prototype/simon` is an upstream Agentic demo, kept only as a structural reference (routes + `mock-data.ts`). Not Perron.
- Icons: **`@untitledui/icons` only** (Untitled UI, same set as the Figma Icon page). Do not import from `lucide-react`. Check the export exists before importing, e.g. `SearchLg` not `Search`, `Trash01` not `Trash2`.
  - `lucide-react` was removed from `package.json` on 2026-10-13. **`components.json` still says `"iconLibrary": "lucide"`** because shadcn accepts only `lucide` or `radix` — there is no option for Untitled UI. So `npx shadcn add <component>` will still generate `lucide-react` imports: swap them for `@untitledui/icons` in the same commit. `drift-check.mjs` check 9 fails if any slip through.
