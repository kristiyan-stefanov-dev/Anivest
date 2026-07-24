# AGENTS

## OVERVIEW
Anivest — reward-based crowdfunding platform for independent anime studios. Next.js 16 App Router, React 19, strict TypeScript, Tailwind v4, Drizzle ORM (PGlite local / Neon prod), Clerk auth, next-intl (en/cs).

## STRUCTURE
```
src/
├── app/[locale]/(marketing)/   # Public pages (projects, studios, about)
├── app/[locale]/(auth)/        # Clerk-protected: (center)/ sign-in-up, dashboard/, studio/
├── app/api/                    # API routes — OUTSIDE [locale], no i18n prefix
├── components/                 # Flat, 17 components, 5 domains → components/AGENTS.md
├── libs/                       # 3rd-party configs + Anivest.ts query layer → libs/AGENTS.md
├── models/Schema.ts            # Single-file Drizzle schema (all tables)
├── locales/                    # en.json = source of truth; cs.json via Crowdin
├── validations/                # Zod schemas (AnivestValidation.ts)
├── templates/                  # BaseTemplate / WideTemplate page shells
├── utils/                      # AppConfig, DBConnection, format, Helpers
└── proxy.ts                    # Middleware (Clerk + next-intl) — NOT middleware.ts
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add public page | `src/app/[locale]/(marketing)/` | Meta once in layout |
| Add auth page | `src/app/[locale]/(auth)/dashboard|studio/` | Behind Clerk |
| Add API endpoint | `src/app/api/<resource>/route.ts` | Zod-validate, `currentUser()` |
| DB query | `src/libs/Anivest.ts` | Sole data-access layer, ~25 fns |
| Schema change | `src/models/Schema.ts` | Then `db:generate` + `db:migrate` |
| User-visible string | `src/locales/en.json` only | Crowdin syncs the rest |
| Input validation | `src/validations/AnivestValidation.ts` | Zod |
| 3rd-party integration | `src/libs/` | One wrapper file per service |

## CODE MAP
No LSP/codegraph in this environment — refs estimated from import graph.

| Symbol | Type | Location | Refs (est) | Role |
|--------|------|----------|-----------|------|
| Anivest query fns | ~25 functions | `src/libs/Anivest.ts` | all API routes + auth pages | Data-access layer |
| Schema | Drizzle tables | `src/models/Schema.ts` | Anivest.ts, migrations | DB schema |
| Env | T3 Env object | `src/libs/Env.ts` | app-wide | Validated env vars |
| proxy | middleware | `src/proxy.ts` | Next pipeline | Clerk + next-intl chain |
| AnivestValidation | Zod schemas | `src/validations/` | API routes, forms | Input validation |

## CONVENTIONS
### Principles
- Clarity and consistency over cleverness. Minimal changes. Match existing patterns.
- Keep components/functions short; break down when it improves structure.
- TypeScript everywhere; no `any` unless isolated and necessary.
- No unnecessary `try/catch`. Avoid casting; use narrowing.
- Named exports only (no default exports, except Next.js pages).
- Absolute imports via `@/` unless same directory. No barrel files (`index.ts`).
- Follow existing lint setup; don't reformat unrelated code.
- Zod type-only: `import type * as z from 'zod';`.
- Let compiler infer return types unless annotation adds clarity.
- Options object for 3+ params, optional flags, or ambiguous args.
- Hypothesis-driven debugging: 1-3 causes, validate most likely first.

### React
- No `useMemo`/`useCallback` (React Compiler handles it). Avoid `useEffect`.
- Single `props` param with inline type; access as `props.foo` (no destructuring).
- Use `React.ReactNode`, not `ReactNode`.
- Inline short event handlers; extract only when complex.

### Pages
- Default export name ends with `Page`. Props alias (if reused) ends with `PageProps`.
- Locale pages: `props: { params: Promise<{ locale: string }> }` → `await props.params` → `setRequestLocale(locale)`.
- Escape glob chars in shell commands for Next.js paths.
- Dashboard/studio pages sit behind auth; define meta once in layout, not in each page.

### i18n (next-intl)
- Never hard-code user-visible strings. Page namespaces end with `Page`.
- Server: `getTranslations`; Client: `useTranslations`.
- Context-specific keys (`card_title`, `meta_description`). Use `t.rich(...)` for markup.
- Sentence case. Error messages: short, no "try again" variants.

### JSDoc
- Start each block with `/**` directly above the symbol.
- Short, sentence-case, present-tense description of intent.
- Order: description → `@param` → `@returns` → `@throws` (only if it can throw). Enforced by oxlint.

### Tests
- `*.test.ts` unit, `*.integ.ts` integration, `*.e2e.ts` Playwright, `*.check.e2e.ts` Checkly monitoring.
- `*.test.ts(x)` co-located with implementation; `*.integ.ts`/`*.e2e.ts` in `tests/`.
- No React Testing Library — UI tests (`*.test.tsx`) run in Vitest browser mode (headless Chromium).
- Top `describe` = subject; nested `describe` groups scenarios. `it` titles: short, third-person present, verb + object + context. Omit "should/works/handles".
- Avoid mocking unless necessary.

## ANTI-PATTERNS (THIS PROJECT)
- No `any`, no `@ts-ignore`/`@ts-expect-error`, no empty `catch`.
- No `process.env` outside `src/libs/Env.ts` (justified exceptions: `instrumentation*.ts`, `next.config.ts`, `src/libs/Arcjet.ts`).
- `type` over `interface` (oxlint-enforced; sole exception: `src/types/I18n.ts` module augmentation).
- No server actions — all mutations go through `/api/*` route handlers.
- No default exports except Next.js pages/layouts.
- `<img>` with `no-img-element` suppression is an accepted exception in `ImageCarousel`, `TierCard`, `ProjectCard`, `projects/[slug]/page.tsx` — do not "fix" to `<Image>`.
- No `console.*` — use LogTape (`src/libs/Logger.ts`).
- Unused vars/params are compile errors (`noUnusedLocals`); indexed access returns `T | undefined` (`noUncheckedIndexedAccess`).

## COMMANDS
Use `npm run` (not bun) for all scripts:
- `npm run dev` — PGlite file server + migrations + Next dev in parallel
- `npm run build-local` — Build with in-memory PGlite database
- `npm run lint` — Ultracite linter with type checking (`--type-aware --type-check`)
- `npm run check:types` / `check:deps` / `check:i18n` — tsc / Knip / translations
- `npm run test` — Vitest unit tests; `npm run test:e2e` — Playwright
- `npm run db:generate` / `db:migrate` / `db:studio` — Drizzle workflow

## GIT COMMITS
Conventional Commits: `type: summary` without scope. Short, specific sentence explaining what changed and where/why. Types: `feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`. `BREAKING CHANGE:` footer when needed. Commitlint enforced via Lefthook.

## NOTES
- Middleware lives at `src/proxy.ts`, wired by the next-intl plugin — there is no `middleware.ts`.
- API routes bypass locale routing intentionally (`/api/*` short-circuits in proxy).
- `local.db/` is PGlite data — delete the folder to reset the local DB; never edit or commit-analysis it. `.kilo/worktrees/` holds worktree copies — ignore.
- Empty placeholder dirs from scaffolding: `app/api/counter/`, `(marketing)/counter/`, `(marketing)/portfolio/[slug]/`.
- Locales: `en` (default, no prefix), `cs` (`/cs` prefix); strategy `as-needed` in `src/utils/AppConfig.ts`.
- React Compiler enabled in production only. Node 24+ required.
- Pre-commit (Lefthook): `ultracite fix` + `knip`; auto-fixed files are re-staged.
- Playwright E2E auto-starts PGlite + dev server on port 3008.
