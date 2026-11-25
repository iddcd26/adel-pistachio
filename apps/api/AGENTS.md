# API

Hono API running on Bun. Part of the Bun workspace monorepo (`apps/*`).

## Commands

- `bun dev` (from repo root) or `bun --watch src/index.ts` (here) — dev server on port 3000
- `bun run typecheck` (from repo root) — runs `tsc --noEmit` in all workspaces

## Structure

- `src/app.ts` — the Hono app: routes, middleware, error handling. No server concerns.
- `src/index.ts` — entry point only; wires `app.fetch` into Bun's default-export server shape.

## Conventions

- **Chain route registration** (`new Hono().get(...).post(...)`) — required for Hono
  RPC client type inference; separate `app.get()` statements leave `AppType` blank.
- Keep `export type AppType = typeof app` in `app.ts` in sync — clients use it via
  `hc<AppType>()`.
- Import app-internal modules with the `@/*` alias (`@/app`), which maps to `src/*`.
