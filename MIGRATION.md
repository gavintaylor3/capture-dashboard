# MIGRATION.md — De-branding, Modularization & Supabase Backend

> **Status:** planning document. No application code is changed by this file.
> **Audited commit:** `a3dbec4` (Vite + React migration of EDGE v5.1).
> **Scope:** (1) extract Astrion branding + proprietary methodology into config,
> (2) split `src/App.jsx` into per-module component files, (3) add a Supabase
> data layer (schema + auth + RLS) behind the current persistence calls.
>
> **Resolved decisions (see §5):** single org per user; stand up empty with no
> data import; nested opp data stays `jsonb` and methodology/prompts stay static
> modules for now; PR 7 uses `supabase/migrations/0001_init.sql` as the
> authoritative schema.

---

## 0. Audit summary & corrections

The whole app is effectively one file: **`src/App.jsx`, 2,786 lines**, holding ~30
React components plus all brand tokens, helpers, methodology constants, export
utilities, and the LLM client. Only one component has been extracted so far:
`src/components/PWinerator.jsx` (a P-Win calculator), and it **re-declares the
brand palette inline** rather than importing it — the first sign that shared
tokens need a home.

Two corrections to the framing of the task:

1. **Persistence is `localStorage`, not IndexedDB.** There are no `indexedDB`,
   `openDB`, or `objectStore` calls anywhere. State is persisted by six
   `useEffect` hooks writing JSON to six `astrion_*` keys (App.jsx:2594–2599) and
   rehydrated by a `load()` helper (App.jsx:2580). This matters because **uploaded
   files are base64 data-URLs stored inside `localStorage`** (`FileUploader`,
   App.jsx:238) — the entire dataset shares the ~5 MB origin quota, so a handful
   of PDFs will silently break `setItem` (the writes are wrapped in empty
   `catch{}`, so failures are invisible). The Supabase plan below treats files as
   the priority migration, not an afterthought.

2. **`callClaude()` posts to `api.anthropic.com` directly from the browser with no
   API key and no auth** (App.jsx:132–138). It cannot work as written and leaks
   the call pattern client-side. The Supabase migration folds this into an Edge
   Function so the key lives server-side. Flagged here because the data layer and
   the AI proxy land naturally in the same backend PR.

There are also **stale duplicate files at the repo root** — `App.jsx` (2,785
lines, no PWinerator import), `main.jsx`, `index.css` — left over from before the
`src/` move. The live entry is `src/main.jsx → src/App.jsx`. `patch.py` is a
one-off codemod that wired PWinerator into App.jsx. **PR 0 deletes all of these.**

---

## 1. Branding & proprietary methodology → config

### 1a. What carries branding (and where)

| Category | Strings / values | Locations |
|---|---|---|
| **Company / product name** | `ASTRION`, `EDGE™ CAPTURE`, `Astrion EDGE™ Capture Tool`, `EDGE™ CAPTURE v5`, `v5.1` | Sidebar header App.jsx:2661; footer App.jsx:2725; `index.html` `<title>`:6; `package.json` `name`/`description` |
| **Brand color palette** | `B = {force:#442C81, sky:#29AAE1, refraction:#1ED872, supernova:#FFAF2E, twilight:#FC5442, silver:#9090B8, …}` | App.jsx:10–15 **and duplicated** in PWinerator.jsx:4–14; hardcoded hexes `#442C81`/`#29AAE1` also baked into `exportToPDF` (App.jsx:144) and HTML export/print templates (App.jsx:169, 1423) |
| **Export headers/footers** | `ASTRION EDGE™ CAPTURE TOOL`, `Astrion EDGE™ · <date> · Page n/m`, `Astrion EDGE™ Capture Tool`, `Astrion EDGE™ Capture v5.1` | `exportToPDF` App.jsx:145,164; `exportToDoc` App.jsx:169; `GateBriefing` print App.jsx:1423 |
| **Default legal entity** | `prime:'Astrion Group, LLC'` | Past-perf blank record App.jsx:1583; `'Astrion Role'` label :1655 |
| **UI copy referencing company** | `Astrion WS Est.`, `Astrion Growth Office`, `'Astrion EDGE™'` document subtitle fallbacks | App.jsx:1249, 1934, 1904–1905 |
| **Storage / file namespace** | `astrion_opps`, `astrion_pastperfs`, `astrion_proofpoints`, `astrion_files`, `astrion_gcompetitors`, `astrion_blackhats`; export filename `astrion-capture-*.json` | App.jsx:2580–2599, 2613 |

**Proprietary *methodology* content** (the part that is real IP, not just a logo):

| Category | Content | Locations |
|---|---|---|
| **Capture gate model** | `makeGates()` — Gate A, Blue Team, Gate B, Black Hat, PTW Initial, Gate B Update, RFP Expected, Gate C, Proposal Due | App.jsx:108–118 |
| **Stages / lifecycle** | `STAGES = ['ID/Qualify','Gate A','Gate B','Gate C','Proposal','Won','Lost','No Bid']` | App.jsx:91 |
| **P-Win scoring rubric** | Weighted yes/no questions referencing "Astrion Team", incumbency, branded solutions, teaming agreements, CPARS thresholds | PWinerator.jsx:60–140 |
| **Shipley methodology prompts** | Every `callClaude` system prompt — "Senior capture manager at Astrion. Shipley methodology…", discriminators, gate-review structure, past-performance narrative format | App.jsx:1295, 1353, 1417, 1590, 1718, 1831 |
| **Domain taxonomies** | `INTEL_TAGS`, `ALL_TAGS` (incl. SIGINT/ISR/C2/Cyber), `DOC_TYPES`, `PP_CATEGORIES`, `OPP_DOC_CATEGORIES`, `CPARS`, `COMP_SIZES`, `CONTRACT_TYPES` | App.jsx:92–106, 176 |
| **PTW / pricing defaults** | overhead 30%, G&A 8%, fee 10%, fringe 35% | `blankOpp` App.jsx:126–128 |

### 1b. Target: a single config/theme layer

Introduce two seams — one for *identity/look*, one for *methodology* — so a new
tenant can be re-skinned without touching component code.

```
src/config/
  brand.js          # name, productName, version, legalEntity, logo glyph, tagline,
                    #   storage namespace, export header/footer templates
  theme.js          # the B palette + S style primitives (single source of truth)
  methodology.js    # gates, stages, taxonomies, PTW defaults, P-Win questions/weights
  prompts.js        # callClaude system prompts as templates (no hardcoded company)
```

- `theme.js` exports `B` and `S`; **App.jsx and PWinerator.jsx both import it** and
  the inline copy in PWinerator is deleted. The PDF/DOC/print templates take colors
  from `B` instead of literal `#442C81`/`#29AAE1`.
- `brand.js` drives every visible string. Example shape:
  ```js
  export const BRAND = {
    company: 'Astrion', productName: 'EDGE™ Capture', version: '5.7',
    legalEntity: 'Astrion Group, LLC', logoGlyph: 'A', tagline: 'Capture Tool',
    ns: 'astrion',                              // storage + export-file prefix
    exportHeader: 'ASTRION EDGE™ CAPTURE TOOL',
    exportFooter: (d) => `Astrion EDGE™ · ${d}`,
  };
  ```
  Storage keys become `` `${BRAND.ns}_opps` `` etc. (a tiny `keys.js` helper),
  preserving the existing key names so **no data migration is needed for current
  localStorage users** during the de-brand step.
- `methodology.js` / `prompts.js` hold the IP. Per decision §5.3 they stay **static
  modules for now** (not per-tenant DB config). Prompts still become templates —
  `capturePrompt({ company })` instead of a literal `"…at Astrion…"` — so the
  company name flows from `brand.js`.
- Keep the actual values byte-for-byte during extraction (pure move, no rewrite) so
  the de-brand PR is reviewable as "no behavior change."

---

## 2. Split `src/App.jsx` into per-module files

### 2a. Inventory (everything currently in App.jsx)

**Primitives / shared UI** (used everywhere): `TCVInput`, `TagEditor`, `Toast` +
`useToast`, `ConfirmModal`, `FileUploader`, `FileList`, `PWinGauge`, `HealthBar`,
`Avatar`, `PWinSlider`, `ProofPointPicker`, `PastPerfPicker`, `CompetitorPicker`,
plus helpers (`badge`, the `*Color` functions, `fmtBytes`, TCV parse/format,
`fileIcon`).

**Per-opportunity modules** (driven by `OPP_NAV`/`OPP_MODS`, App.jsx:2563–2576,
2624–2639): `OppDashboard`, `OppSetup`, `CompetitiveIntel`, `CustomerMap`,
`Teaming`, `Solutioning`, `WinThemes`, `PriceToWin`, `GateBriefing`, `OppPastPerf`,
`OppDocuments`, `Risks` (+`ActionRow`), `ActionItems`, and the already-extracted
`PWinerator`.

**Global / library modules** (`GLOBAL_MODS`, App.jsx:2641–2649): `PastPerfLibrary`,
`ProofPointLibrary`, `DocumentGenerator`, `CompetitorLibrary`, `BlackHatCenter`,
`AnalyticsDashboard`, `GlobalSearch`, plus `Portfolio` and `NewOppModal`.

**Utilities:** `callClaude`, `exportToPDF`, `exportToDoc`.

### 2b. Proposed file structure

```
src/
  main.jsx
  App.jsx                      # shell only: state, persistence wiring, sidebar, routing (~250 lines)
  config/                      # §1b
    brand.js  theme.js  methodology.js  prompts.js  keys.js
  lib/
    ai.js                      # callClaude (→ later: Supabase Edge Function)
    export.js                  # exportToPDF, exportToDoc (templated from brand/theme)
    format.js                  # TCV parse/format, fmtBytes, fileIcon, color helpers
  data/                        # §3 — the data layer seam
    store.js                   # adapter interface (localStorage today, Supabase later)
    useCollection.js           # hook wrapping the adapter
  components/
    ui/                        # primitives: Toast, ConfirmModal, FileUploader, FileList,
                               #   PWinGauge, HealthBar, Avatar, PWinSlider, TagEditor,
                               #   TCVInput, badge, *Picker components
    opp/                       # OppDashboard, OppSetup, CompetitiveIntel, CustomerMap,
                               #   Teaming, Solutioning, WinThemes, PriceToWin,
                               #   GateBriefing, OppPastPerf, OppDocuments, Risks,
                               #   ActionItems, PWinerator (moved from components/)
    global/                    # Portfolio, NewOppModal, PastPerfLibrary, ProofPointLibrary,
                               #   DocumentGenerator, CompetitorLibrary, BlackHatCenter,
                               #   AnalyticsDashboard, GlobalSearch
  nav.js                       # OPP_NAV, the sidebar nav arrays, DOC_TYPES
```

Each module is a default-exported component importing `B`/`S` from `config/theme`
and helpers from `lib/*`. `OPP_MODS`/`GLOBAL_MODS` in `App.jsx` become a thin map
of imported components.

### 2c. How to do the split safely

- **Extract leaf-up.** Pull `config/theme.js` + `lib/format.js` first (no React),
  then `components/ui/*` (depend only on theme/format), then opp/global modules
  (depend on ui), then thin out `App.jsx` last. This keeps every step compiling.
- **Watch the shared-closure assumption.** Today every component reads `B`, `S`,
  `badge`, the color helpers, and `window.jspdf` from module scope. After the split
  those must be explicit imports — grep each extracted component for free
  identifiers before moving it.
- **`window.jspdf` shim** (App.jsx:5) should move into `lib/export.js` so jsPDF is a
  normal import, not a global.
- No prop-contract changes during the split — it is a mechanical move. Behavior
  parity is the acceptance criterion (the app renders and saves identically).
- This split is a **prerequisite for the data-layer PR**: persistence currently
  lives in `App.jsx`, so isolating it (§3) is cleaner once the shell is small.

---

## 3. Supabase data layer (schema + auth + RLS)

Goal: replace the six `localStorage` stores with Postgres + Supabase Storage +
Auth, **behind a stable adapter** so components keep calling the same interface.
Per decision §5.2 the deployment **stands up empty** — there is no localStorage
import and no id remapping of legacy data.

### 3a. The seam (do this before touching Supabase)

Today persistence is implicit: `useState(()=>load(key))` + a `useEffect` that
`setItem`s on every change. Replace with an adapter so the backend is swappable:

```js
// data/store.js — interface both backends implement
export interface Store {
  list(collection)            // → rows
  upsert(collection, row)     // insert or update by id
  remove(collection, id)
  subscribe(collection, cb)   // realtime; localStorage impl is a no-op
}
```

`useCollection('opportunities')` returns `[rows, { upsert, remove }]`. The
**localStorage adapter ships first** (pure refactor, identical behavior), then a
**Supabase adapter** is dropped in with a feature flag (`VITE_DATA_BACKEND`). This
makes the cutover a one-line change and keeps a fallback.

### 3b. Schema

> **Authoritative source:** the schema and RLS for PR 7 live in
> **`supabase/migrations/0001_init.sql`** — it already includes the DELETE policy
> and the UPDATE/DELETE owner/editor gating. **Do not regenerate SQL from this
> section.** The shapes below are descriptive context only; the migration file is
> the source of truth. *(That file is not yet committed — adding it is the first
> task of PR 7.)*

Map the six stores → tables. **Tenancy is single org per user** (decision §5.1):
each `profiles` row carries one `org_id`; there is no multi-org membership and no
join table. Per decision §5.3, deeply-nested opp sub-objects (`gates`,
`competitors`, `customers`, `partners`, `solutioning`, `winThemes`, `risks`,
`actions`, `ptw`, `team`) stay as **`jsonb` columns** — a faithful port of the
current shape — and are normalized into child tables only if querying later demands
it.

Descriptive shapes (authoritative version in the migration file):

```
orgs              (id, name, branding jsonb, created_at)
profiles          (id → auth.users, org_id → orgs, full_name, role: owner|editor|viewer)
opportunities     (id, org_id, owner, name, govwin, tcv, agency, naics, stage,
                   p_win_score, rfp_date, award_date, start_date, incumbent,
                   team jsonb, gates jsonb, competitors jsonb, customers jsonb,
                   partners jsonb, solutioning jsonb, win_themes jsonb, risks jsonb,
                   actions jsonb, ptw jsonb, linked_past_perf_ids uuid[],
                   black_hat_session_ids uuid[], tags text[], created_at, updated_at)
past_performances (id, org_id, owner, name, agency, prime, value, role,
                   cpars_rating, categories text[], proof_point_ids uuid[], data jsonb, …)
proof_points      (id, org_id, owner, title, metric, category, data jsonb, …)
competitors       (id, org_id, owner, name, data jsonb, …)
black_hat_sessions(id, org_id, owner, data jsonb, …)
files             (id, org_id, owner, name, mime, size, storage_path, category,
                   notes, uploaded_at)      -- bytes in Storage, NOT base64 in a row
```

- **New `id`s are `uuid`** (today the app mints `Date.now()` numbers). Because the
  deployment starts empty, there is **no id remapping** — records created after
  cutover are uuids from the start, and the `*_ids` link arrays reference those.
- **Files move to a Storage bucket** (`opp-files/<org_id>/<file_id>`). `FileUploader`
  stops producing base64 data-URLs and uploads to Storage; `FileList` fetches signed
  URLs. This is the single biggest correctness win (kills the localStorage quota
  failure) and is its own PR.
- `updated_at` trigger enables last-write-wins / optimistic concurrency (the app has
  no conflict handling today).

### 3c. Auth

- **Supabase Auth** (email magic-link or SSO). On first sign-in, a trigger creates a
  `profiles` row and assigns its single `org_id` (decision §5.1).
- A lightweight `<AuthGate>` wraps `App`; unauthenticated users see a sign-in screen.
  The current app has no concept of a user, so this is additive.
- `callClaude` moves to a **Supabase Edge Function** (`/functions/ai-generate`) that
  holds the Anthropic key server-side and is callable only by authenticated users —
  fixing the broken/insecure direct browser call. Use a current model id
  (the code pins `claude-sonnet-4-20250514`; bump to the latest Sonnet/Opus).

### 3d. Row-Level Security

The DELETE policy and UPDATE/DELETE owner/editor gating already live in
`supabase/migrations/0001_init.sql` (see §3b note). The intended posture: RLS
enabled on every table, default-deny, then scoped by the caller's single
`profiles.org_id`:

- **read** — any member of the row's org (`org_id = current_org()`)
- **insert / update / delete** — `owner`/`editor` roles only; `viewer` is read-only
- **Storage** policies mirror it: access only when the object's first path segment
  equals the caller's `org_id`.
- A `current_org()` SQL helper (or a custom JWT claim populated at login) keeps the
  policies short and fast.

Refer to the migration file for the exact, authoritative policy SQL.

---

## 4. Proposed PR-by-PR sequence

Each PR is independently shippable and (through §1–§2) behavior-preserving until
the backend cutover.

| PR | Title | Contents | Risk |
|----|-------|----------|------|
| **0** | Repo cleanup | Delete root `App.jsx`/`main.jsx`/`index.css` duplicates and `patch.py`; clean README; confirm `src/` is the only entry | trivial |
| **1** | Theme + format extraction | `config/theme.js` (`B`,`S`), `lib/format.js`; import in App.jsx **and** PWinerator (delete its inline palette) | low — pure move |
| **2** | Config & de-brand | `config/brand.js`, `methodology.js`, `prompts.js`, `keys.js`; route all Astrion strings, gate/stage/taxonomy constants, PTW defaults, and prompts through config; storage keys via `BRAND.ns` (same literal keys → no data loss) | low |
| **3** | Extract UI primitives | `components/ui/*` (Toast, ConfirmModal, File*, gauges, pickers, TCVInput, badge) | low |
| **4** | Extract opp + global modules | `components/opp/*`, `components/global/*`, `nav.js`, `lib/export.js`, `lib/ai.js`; `App.jsx` becomes the thin shell | medium — most files touched |
| **5** | Data-layer seam | `data/store.js` + `useCollection`; localStorage adapter; move the six `useEffect` persisters behind it (no behavior change) | medium |
| **6** | Supabase project + auth | Supabase project, `profiles`/`orgs`, `<AuthGate>`, Edge Function for AI; key off the UI | medium |
| **7** | Schema + RLS + Supabase adapter | Add `supabase/migrations/0001_init.sql` (authoritative — tables, RLS incl. DELETE + owner/editor gating, Storage bucket); Supabase `Store` adapter behind `VITE_DATA_BACKEND` flag | high — core cutover |
| **8** | Files → Storage | `FileUploader`/`FileList` upload to bucket + signed URLs; stop base64-in-row | high |
| **9** | Flip default to Supabase | Default backend to Supabase; retire the localStorage adapter. **No data import** — new orgs start with zero records (decision §5.2) | medium |

**Dependency order:** 0 → 1 → 2 → 3 → 4 (modularization) must precede 5 → 6 → 7 →
8 → 9 (backend). PRs 1–4 are safe to land quickly; the backend PRs (6–9) should go
behind the feature flag and ship to a staging org first.

---

## 5. Resolved decisions

1. **Tenancy — single org per user.** Each `profiles` row carries one `org_id`. No
   multi-org membership, no user↔org join table.
2. **Stand up empty — no data import.** New orgs start with zero records; there is
   no localStorage→Supabase importer and no id remapping of legacy data. (PR 9 is
   "flip default," not "import + flip.")
3. **Nested data & methodology stay as-is for now.** Opp sub-objects remain `jsonb`
   (no child-table normalization yet); `methodology.js`/`prompts.js` stay static
   modules (not per-org DB config) for now.
4. **Authoritative schema.** PR 7 uses `supabase/migrations/0001_init.sql` as the
   single source of truth — it already includes the DELETE policy and the
   UPDATE/DELETE owner/editor gating. Do not regenerate SQL from §3b/§3d. *(The
   file is not yet committed; creating it is the first step of PR 7.)*
