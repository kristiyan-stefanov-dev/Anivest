# Anivest — Kickstarter for Anime Studios (Mock Build)

## Goal
Turn the boilerplate into a crowdfunding platform where anime **studios** create project pages with
**tiers** (reward levels) and **ledgers** (fund usage), and **backers** pledge to tiers via a mocked
payment flow. Public browse uses category carousels (inspired by startovac.cz). Payment is a stub.

## Stack constraints (from existing code)
- Drizzle ORM + PGlite dev DB (`src/models/Schema.ts`, `drizzle.config.ts`). Dev DB runs via
  `npm run dev` (`db-server:file` on `local.db`) and migrates automatically.
- Auth: Clerk (`@clerk/nextjs`), `currentUser()` for server identity.
- i18n: next-intl, locales `en`/`cs`, namespaces in `src/locales/*.json`. User strings go in JSON only.
- Styling: Tailwind v4; reuse `BaseTemplate`. No default exports except Next pages. Named exports.
- TS everywhere, no `any`, no comments unless asked. Routes under `src/app/[locale]/`.

## Decisions (confirmed with user)
1. **DB**: Real schema + seed data (not static).
2. **Studio role**: `studios` table keyed by Clerk `userId`. Any signed-in user opts in (one-click
   "Become a studio") → row exists ⇒ studio. No Clerk metadata roles.
3. **Studio dashboard**: Full CRUD for projects, tiers, ledgers via forms + DB writes.
4. **Payment mock**: Client "Back this" form → create `pledges` row → success state. No real gateway,
   no `pay` API route.

## Data model (`src/models/Schema.ts`) — already written
Tables: `counter` (keep), `categories`, `studios`, `projects`, `tiers`, `pledges`,
`project_categories` (join), `ledgers`, `projectBlocks`.
Key relations:
- `studios.clerk_user_id` unique (Clerk id).
- `projects.studio_id → studios.id` (cascade).
- `tiers.project_id → projects.id` (cascade); fields: price, limitedQuantity, claimedQuantity, reward.
- `pledges.tier_id, project_id → ...` (cascade); amount, status, `payment_ref` (mock uuid).
- `ledgers.project_id → projects.id` (cascade).
- `category_slug` pgEnum: popular, isekai, drama, action, fantasy, slice-of-life, mecha, romance.
- `projects.status`: draft|live|funded|closed. `featured` bool for home carousel.
Exported types: `Studio, Project, Tier, Pledge, Ledger, ProjectBlock, ProjectWithStudio, TierWithStats`.

## Validations (`src/validations/AnivestValidation.ts`) — already written
`StudioValidation, ProjectValidation, TierValidation, LedgerValidation, PledgeValidation` (Zod).

## Repositories / query helpers (`src/libs/Anivest.ts` — new)
Server-only functions using `db` from `@/libs/DB`:
- `getStudioByClerkId(clerkUserId?)`
- `getOrCreateStudio(...)` not needed; opt-in is explicit.
- `listProjectsByCategory(category, { limit })` and `getFeaturedProjects(limit)`
  → returns `ProjectWithStudio` with `backersCount`/`raisedAmount` via subquery/aggregate.
- `getProjectBySlug(slug)` (with studio, tiers + remaining, ledgers, blocks).
- `getProjectsByStudio(studioId)` (studio dashboard).
- `createProject/UpdateProject(studioId, data)`, `createTier/UpdateTier`, `createLedger/UpdateLedger`,
  `deleteTier/deleteLedger/deleteProject`.
- `createPledge({ tierId, backerClerkUserId, backerName })`: loads tier+project, inserts pledge,
  increments `tiers.claimed_quantity` and returns pledge with mock `payment_ref`
  (`crypto.randomUUID()`). Authorization: backer must be signed in; a studio cannot pledge to own project (optional guard).

## Routes / pages
Public (under `(marketing)` group, reuse `BaseTemplate` + existing nav):
- `src/app/[locale]/(marketing)/page.tsx` — **Home**: hero + category carousels (popular, isekai,
  drama, …) each rendering `ProjectCarousel`. Replace boilerplate content.
- `src/app/[locale]/(marketing)/projects/page.tsx` — browse all (grid of `ProjectCard`, optional filter by category via searchParams).
- `src/app/[locale]/(marketing)/projects/[slug]/page.tsx` — **Project detail**: cover, studio info,
  progress bar (raised/goal), description, `projectBlocks` rendered, `LedgerList`, `TierList` with
  `PledgeButton`/`PledgeForm` (client). `generateStaticParams` optional → omit (dynamic, DB-backed).
- Add `projects` and `projects/[slug]` nav links to `(marketing)/layout.tsx`.

Studio (under `(auth)` group, requires Clerk; add `(auth)/studio` section):
- `src/app/[locale]/(auth)/studio/page.tsx` — if no studio row: "Become a studio" form
  (`StudioRegisterForm`, client) posting to `POST /api/studio`. If studio: list of their projects +
  "New project" link.
- `src/app/[locale]/(auth)/studio/projects/new/page.tsx` — create project (`ProjectForm`).
- `src/app/[locale]/(auth)/studio/projects/[id]/edit/page.tsx` — edit project + manage tiers & ledgers
  (`TierManager`, `LedgerManager` client components posting to API).
API routes (`src/app/api/`):
- `api/studio/route.ts` — `POST` create studio (auth required).
- `api/projects/route.ts` — `POST` create (auth + studio ownership), `PATCH`/`DELETE` via id subroutes.
- `api/tiers/route.ts`, `api/ledgers/route.ts` — CRUD (auth + ownership via project→studio).
- `api/pledges/route.ts` — `POST` create pledge (auth required; mock payment; returns pledge).

## Components (`src/components/`) — new, reuse Tailwind
- `ProjectCard.tsx` (server-friendly, presentational) — cover, title, tagline, studio, progress bar, backers.
- `ProjectCarousel.tsx` (client, horizontal scroll snap) — takes projects, renders `ProjectCard`s; styled like startovac.cz rows.
- `ProgressBar.tsx` — raised vs goal.
- `TierCard.tsx` / `TierList.tsx` — reward, price, remaining, `PledgeButton`.
- `PledgeForm.tsx` (client) — name + confirm; `fetch('/api/pledges')`; success state.
- `LedgerList.tsx` — fund allocation rows.
- `StudioRegisterForm.tsx`, `ProjectForm.tsx`, `TierManager.tsx`, `LedgerManager.tsx` (client, RHF + Zod resolvers from `AnivestValidation`).

## Seed (`scripts/seed.ts` or `src/libs/seed.ts` + `npm run db:seed`)
Idempotent seed: insert categories (with display_order), 1-2 demo studios (fixed `clerk_user_id`
e.g. `seed_studio_1`), ~8-10 anime projects spread across categories with tiers + ledgers + blocks,
a few sample pledges. Wire as `db:seed` script using the same PGlite connection. Run after migrate.

## i18n (`src/locales/en.json` + `cs.json`)
Add namespaces: `Home`, `Projects` (browse), `ProjectDetail`, `Studio`, `ProjectForm`, `TierManager`,
`Ledger`, `Pledge`. All user-facing strings only. Keep `RootLayout` nav labels, add Projects link.

## Env / config
- No new env vars. Reuse `DATABASE_URL` (dev PGlite) and Clerk keys.
- Add `db:seed` script to `package.json`.

## Migration workflow
1. `npm run db:generate` → creates `migrations/0001_*.sql` from new schema.
2. `npm run dev` auto-migrates + boots PGlite (`local.db`).
3. `npm run db:seed` to populate demo data.

## Validation / verification
- `npm run check:types` and `npm run lint` must pass.
- `npm run dev`, visit `/` → carousels render seeded projects.
- Open a project → tiers/ledgers show; click "Back this" while signed in → pledge persists (check DB / backers count increments).
- Sign in → `/studio` → become studio → create project + tier → appears on home/browse.
- `npm run test` stays green (existing counter tests unaffected).

## Open / out of scope
- Real payment provider, emails, file uploads (cover/logo use URL strings only).
- projectBlocks UI editor is minimal (seed-driven); full block builder optional later.
- Soft-delete / archival not implemented; `DELETE` cascades.
