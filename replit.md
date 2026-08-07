# Zana

Zana is a focused project-management workspace for organizing projects, moving tasks across a three-column board, and inviting lightweight collaborators.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/zana/src/App.tsx` — dashboard, project board, task, member, and invite flows
- `artifacts/zana/src/index.css` — monochrome visual system and responsive layout
- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `artifacts/api-server/src/routes/zana.ts` — project, task, member, invite, overview, and seed routes
- `lib/db/src/schema/zana.ts` — PostgreSQL schema for Zana data

## Architecture decisions

- The frontend uses generated React Query hooks from the OpenAPI contract rather than hand-written request types.
- Zana uses a monochrome palette with warm paper tones to honor the requested premium black-and-white direction.
- The first workspace is seeded with useful example content so the board is immediately understandable.
- Task movement is optimistic in feel through direct board interactions and query invalidation after server updates.

## Product

- Dashboard with project totals, open/completed task counts, collaborators, activity, and quick actions.
- Project creation and deletion.
- Three-column task board with drag-and-drop movement between Not started, In progress, and Complete.
- Task creation, editing, assignment, deletion, and status controls.
- Project member list and email invitation flow.

## User preferences

- Keep the interface premium, minimal, and black-and-white only.
- Favor simplicity, zero bloat, and fast collaboration.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- Run `pnpm --filter @workspace/db run push` after schema changes.
- The API seed initializer must remain concurrency-safe because the dashboard loads several queries in parallel on first visit.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
