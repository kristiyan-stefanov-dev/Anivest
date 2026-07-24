# AGENTS — src/libs/

## OVERVIEW
`src/libs/` — one wrapper/config file per external concern; `Anivest.ts` is the sole data-access layer.

## FILE MAP
| File | Role |
|------|------|
| `Anivest.ts` | Sole data-access layer. ~25 exported query fns. All DB reads/writes live here. Co-located `Anivest.test.ts`. |
| `DB.ts` | Drizzle connection singleton. PGlite (`local.db/`) local, Neon (`DATABASE_URL`) prod. |
| `Env.ts` | T3 Env + Zod. Validates every env var. Only place `process.env` is read. |
| `I18n.ts` | next-intl `getRequestConfig`. Dynamically imports `../locales/{locale}.json`. |
| `I18nRouting.ts` | Locale config: `['en','cs']`, prefix strategy from `AppConfig`. |
| `I18nNavigation.ts` | Locale-aware `Link`/`useRouter`/`usePathname`. Use these, not `next/link`. |
| `Arcjet.ts` | Arcjet client: bot detection + Shield WAF. Called from `src/proxy.ts`. |
| `Logger.ts` | LogTape setup (Better Stack in prod). Replaces `console.*`. |

## CONVENTIONS
- One wrapper file per 3rd-party service. Add a new service, add one file here.
- All DB queries go in `Anivest.ts`. Pages and `/api/*` route handlers call these fns; they never run Drizzle queries directly.
- New env var? Add it to `Env.ts` with a Zod schema. Nothing else reads `process.env`.
- Internal navigation uses `I18nNavigation` (`Link`, `useRouter`, `usePathname`), not `next/link` or `next/navigation`.
- Logging goes through `Logger.ts`. No `console.*` anywhere in `libs/` or the app.
- Query fns consume Zod-validated input types from `src/validations/AnivestValidation.ts`. Don't re-validate inside `Anivest.ts`.
- Schema changes happen in `src/models/Schema.ts` followed by the Drizzle migration workflow. Never inline schema in `libs/`.

## ANTI-PATTERNS
- No `process.env` reads in this directory or anywhere except `Env.ts` (justified exceptions: `instrumentation*.ts`, `next.config.ts`, `Arcjet.ts`).
- No Drizzle queries in pages, components, or `/api/*` routes that bypass `Anivest.ts`.
- No service/repository layer beside `Anivest.ts`. Don't split it into per-resource files.
- No re-exporting or re-wrapping a lib already covered here; extend the existing file.