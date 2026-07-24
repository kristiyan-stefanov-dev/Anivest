# AGENTS — src/components/

## OVERVIEW
Flat component dir, 17 components across 5 domains, no subfolders.

## DOMAIN CLUSTERS
| Domain | Components |
|--------|-----------|
| Projects | ProjectCard, ProjectCarousel, ProjectForm, ProjectBackersList, ImageCarousel, ProgressBar |
| Contributions/Tiers | ContributeForm, TierCard, TierList, TierManager, PledgeForm |
| Studio/Ledger | StudioRegisterForm, LedgerList, LedgerManager |
| Dashboard | BackedProjectsList |
| Shell/misc | LocaleSwitcher, Hello |

## WHERE TO LOOK
| Task | Location / Notes |
|------|------------------|
| Add component | Place flat here; prefix-group by domain (Project*, Tier*, Ledger*). Reuse an existing cluster before starting a new one. |
| Co-located test | `*.test.tsx` beside component — Vitest browser mode, no React Testing Library. |
| Story | `*.stories.tsx` beside component. |
| Form validation | Import Zod schemas from `@/validations/AnivestValidation`. |
| Mutation | POST/PATCH/DELETE to `/api/*` route handlers. |
| Locale-aware nav | `LocaleSwitcher` uses `@/libs/I18nNavigation`. Internal links never use raw `next/link`. |

## CONVENTIONS
- `'use client'` only when hooks/interactivity are needed; pages stay server components by default.
- Forms: React Hook Form + Zod schema from `@/validations/AnivestValidation`.
- Prefix new components by their domain (e.g. `Tier*`, `Ledger*`) so the flat dir stays scannable.
- Co-locate `*.test.tsx` and `*.stories.tsx` next to the component they cover.

## ANTI-PATTERNS
- `<img>` with `eslint-disable-next-line @next/next/no-img-element` is an ACCEPTED exception in `ImageCarousel`, `TierCard`, `ProjectCard` (CMS/external URLs). Do not convert to `next/image`.
- No raw `next/link` for internal navigation — go through `@/libs/I18nNavigation`.
- No subdirectories — keep the dir flat.