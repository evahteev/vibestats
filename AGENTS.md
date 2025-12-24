# Repository Guidelines

## Project Structure & Module Organization
- Next.js App Router lives in `app/` (`page.tsx` entry, API routes in `app/api`, upload flow in `app/upload`, profile views under `app/u`). Shared UI sits in `components/`. Reusable helpers and data access live in `lib/` (SQLite access in `lib/db.ts`, CSV parsing utilities in `lib/csv-parser.ts`). Persistent assets and the SQLite file stay in `data/` (`leaderboard.db` is created on first run). Global styles and Tailwind tokens are in `app/globals.css` and `tailwind.config.ts`.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start the Next dev server (defaults to http://localhost:3000) and auto-rebuilds Tailwind.
- `npm run lint` — run ESLint via `next lint`; fix issues before opening a PR.
- `npm run build` / `npm run start` — produce and serve the production build.
- `docker build -t vibe-coders .` — build the container image defined in `Dockerfile` if you need a reproducible runtime.

## Coding Style & Naming Conventions
- TypeScript is strict; keep types non-`any` and use `@/*` aliases from `tsconfig.json`.
- Prefer functional React components with PascalCase filenames (`LeaderboardTable.tsx`), camelCase for functions/variables, and UPPER_SNAKE_CASE for constants. Keep indentation at 2 spaces.
- Favor Tailwind utility classes; add shared tokens via CSS variables in `globals.css` rather than inline hex values. Keep JSX concise; extract helpers to `lib/utils.ts` when reused.
- Run `npm run lint` before commits; follow existing ESLint/Next defaults.

## Testing Guidelines
- No automated test suite is present yet. When adding one, place component tests alongside features (`components/__tests__/Component.test.tsx` or `*.spec.tsx`) and cover API handlers with request-level tests. Aim to cover new branches/edge cases and mock SQLite (`lib/db.ts`) writes where possible.
- For now, rely on `npm run lint` plus manual checks: verify main flows (uploading CSV, leaderboard filters, model list) in dev mode before shipping.

## Commit & Pull Request Guidelines
- Git history is not available here; use clear imperative summaries (e.g., `Add upload validation`) or Conventional Commit prefixes if you prefer (`feat:`, `fix:`). Keep the subject under ~72 chars and group related changes per commit.
- Pull Requests should include: a short summary of the change, screenshots/GIFs for UI updates, notes on data shape changes (`lib/db.ts` migrations, `data/` contents), and any manual verification performed. Link related issues or tickets when applicable.

## Data & Security Notes
- The app writes to `data/leaderboard.db`; avoid committing generated DBs or sensitive CSVs. If sharing example data, sanitize it and keep files small. Uploaded files are deduplicated by hash—log errors locally, not to the client.
