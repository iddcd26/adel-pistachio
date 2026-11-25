# API

Hono API running on Bun. Part of the Bun workspace monorepo (`apps/*`).

## Commands

- `bun dev` (from repo root) or `bun --watch src/index.ts` (here) — dev server on port 3000
- `bun run typecheck` (from repo root) — runs `tsc --noEmit` in all workspaces

## Structure

- `src/app.ts` — the Hono app: routes, middleware, error handling. No server concerns.
- `src/routes/` — Hono sub-apps mounted via `.route()` (e.g. `/auth`). Sub-apps must
  also use chained registration so their routes appear in `AppType`.
- `src/index.ts` — entry point only; wires `app.fetch` into Bun's default-export server shape.
- `src/lib/logger.ts` — shared pino logger (JSON). Level via `LOG_LEVEL`.
- `src/middleware/` — Hono middleware built with `createMiddleware`. `requireAdmin`
  (`@/middleware/auth`) verifies the admin session cookie and exposes `adminPhone`.
- `src/routes/auth.ts` — admin login (`POST /admin/login`). Verifies `phone`/`password`
  with exact match against env, issues a signed JWT as an HttpOnly cookie.

## Environment

- `LOG_LEVEL` — pino logger level (default `info`).
- `ADMIN_PHONE`, `ADMIN_PASSWORD` — admin login credentials (exact string match).
- `AUTH_SECRET` — HS256 signing key for the admin session JWT (`hono/jwt`).
- All three admin vars must be set or every login is rejected (`401`, same message as a
  credential mismatch) with the missing names logged — by design, no config state leaks.

## Conventions

- **Chain route registration** (`new Hono().get(...).post(...)`) — required for Hono
  RPC client type inference; separate `app.get()` statements leave `AppType` blank.
- Keep `export type AppType = typeof app` in `app.ts` in sync — clients use it via
  `hc<AppType>()`.
- Import app-internal modules with the `@/*` alias (`@/app`), which maps to `src/*`.
- Log with the shared `logger` from `@/lib/logger` (pino, JSON). Request lines come
  from the middleware — don't log requests manually in handlers. Set level via `LOG_LEVEL`.
- Client-facing error messages are in Persian (e.g. `"شماره موبایل یا رمز عبور نادرست
است."`); internal errors like `onError` are in English (`"Internal server error"`).
- The admin session JWT is verified statelessly; sessions carry `{ sub: phone, role: "admin", exp }`.
