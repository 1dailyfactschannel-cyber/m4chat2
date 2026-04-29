# AGENTS.md — m4chat2-replit-agent

## Stack

- pnpm workspace monorepo, TypeScript 5.9, Node 20/22
- Express 5 API, PostgreSQL 15 + Drizzle ORM, Zod v4
- React 19 + Vite 7 + Tailwind 4 frontend
- Electron desktop app (optional)
- Orval for API codegen from OpenAPI spec

## Workspace packages

| Package | Path | Purpose |
|---------|------|---------|
| `@workspace/api-server` | `artifacts/api-server` | Express 5 backend |
| `@workspace/frontend` | `artifacts/mockup-sandbox` | React SPA (Vite) |
| `@workspace/electron-app` | `artifacts/electron-app` | Desktop wrapper |
| `@workspace/db` | `lib/db` | Drizzle schema + migrations |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI spec + Orval config |
| `@workspace/api-zod` | `lib/api-zod` | Shared Zod schemas |
| `@workspace/api-client-react` | `lib/api-client-react` | React API hooks |
| `scripts` | `scripts` | DB setup/check scripts |

## Commands

```bash
pnpm run typecheck              # full workspace typecheck
pnpm run build                  # typecheck + build all packages
pnpm --filter @workspace/api-server run dev    # API server on :8080
pnpm --filter @workspace/frontend run dev      # frontend on :8081
pnpm --filter @workspace/api-spec run codegen  # regenerate API hooks from OpenAPI
pnpm --filter @workspace/db run push           # push DB schema (dev only, DANGEROUS in prod)
```

## Architecture notes

- API server bundles with esbuild to CJS (`artifacts/api-server/build.mjs`)
- Frontend output goes to `artifacts/mockup-sandbox/dist/`
- `pnpm-workspace.yaml` has `minimumReleaseAge: 1440` — do not disable
- esbuild overrides pin to `linux-x64` only; other platforms excluded via overrides
- Dockerfile builds `api` and `web` targets; runs `drizzle-kit push` before API start
- Multiple `docker-compose.*.yml` variants exist; `docker-compose.yml` is primary for Portainer deploy
- Admin API at `/admin/*` requires `X-Admin-Token` header (see `ADMIN_API.md`)

## Gotchas

- No test framework configured — verify manually via running services
- `tsconfig.json` at root uses project references to `lib/db`, `lib/api-client-react`, `lib/api-zod`
- `lib/api-server/` does NOT exist — the API server lives under `artifacts/api-server/`
- `.npmrc` enforces pnpm only; npm/yarn will fail at install
- Replit-specific config in `.replit` (ports 8080→8080, 8081→80, 8082→3001)
