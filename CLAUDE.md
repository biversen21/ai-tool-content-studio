# CLAUDE.md

Project context and conventions for Claude Code sessions.

## Process — non-negotiable

- **Never commit directly to `main`.** All changes go on a feature branch and get a PR.
- Branch naming: `feature/<short-description>` or `fix/<short-description>`.
- Commit often with clear messages. Push the branch and open a PR when the work is done.

## Repo layout

```
ai-tool-content-studio/       ← git root
└── ai-tool-content/          ← npm workspaces root — all commands run from here
    ├── prisma/               ← schema + migrations (dev.db is gitignored)
    ├── shared/               ← Zod schemas + status constants shared by FE and BE
    ├── backend/              ← Express API
    ├── frontend/             ← Vite + React app
    └── exports/              ← local export output (json/ and markdown/)
```

All `npm run …` commands are run from `ai-tool-content/`, not the repo root.

## Dev setup

```bash
cd ai-tool-content
npm install
cp .env.example .env        # then fill in OPENAI_API_KEY and set PORT
npm run prisma:migrate -- --name init
npm run dev                 # backend on PORT, frontend on 5173
```

### Environment variables (`.env`)

| Var | Notes |
|---|---|
| `PORT` | Backend port. Vite proxy reads this directly from the `.env` file. |
| `DATABASE_URL` | `file:./dev.db` — relative to `prisma/` |
| `OPENAI_API_KEY` | Required for research and generation |
| `OPENAI_MODEL` | Defaults to `gpt-4o-mini` |
| `EXPORT_DIR` | Defaults to `exports` |

**Do not set `VITE_API_BASE_URL`.** The frontend always uses relative URLs (`BASE_URL = ""`), and the Vite proxy forwards `/api/*` to the backend. Setting a `VITE_`-prefixed URL causes the browser to bypass the proxy and hit the backend directly, triggering CORS preflight failures.

The Vite proxy reads `PORT` by parsing the `.env` file directly with `fs.readFileSync` — `loadEnv` is not used because it merges `process.env`, which can have a stale `PORT` value at the shell level.

## Architecture

### Shared package (`shared/`)
- `src/constants/status.ts` — **single source of truth** for all status enums (`TOOL_STATUS`, `ASSET_STATUS`, `RESEARCH_STATUS`, `PUBLISH_STATUS`, `ASSET_TYPE`, etc.). Import from here; never hardcode status strings elsewhere.
- `src/schemas/` — Zod schemas and TypeScript types for Tool, GeneratedAsset, PublishPayload, ResearchRun.

### Backend (`backend/src/`)
- **Routes are thin.** Validate with Zod → call a service → return JSON. No business logic in routes.
- **All async route handlers must be wrapped with `ar()`** from `lib/asyncRoute.ts`. Express 4 does not forward unhandled promise rejections to the error handler — `ar()` adds `.catch(next)` so errors reach the centralized 500 handler in `server.ts`.
- **Route ordering:** sub-resource routes (`/:id/research`, `/:id/generate/*`, `/:id/assets`) must be defined **before** the bare `/:id` GET/PATCH routes, or Express will swallow the sub-path as an ID param.
- **Prompts are modules.** All LLM prompts live in `src/prompts/` — never inline.
- **Publishing is adapter-based.** `adapters/publisher/publisher.interface.ts` is the contract. `localExport.adapter.ts` is the only implementation. Swap it without touching business logic.
- **Exporters** (`src/exporters/`) serialize a `GeneratedAsset` to `{ filename, body }`. Filename format: `{asset.type}/{asset.slug}.{ext}`. The adapter creates nested directories with `path.dirname`.
- The backend loads `.env` with `dotenv.config({ path: path.resolve(process.cwd(), "../.env") })` — `process.cwd()` is `backend/` when run via npm workspaces, so `../` resolves to `ai-tool-content/`.

### Frontend (`frontend/src/`)
- State-based navigation — no router. `App.tsx` holds a `view` state (`dashboard` | `detail`).
- `lib/api.ts` — all typed fetch wrappers. `BASE_URL` is always `""` (relative URLs through proxy).
- `ToolDetail.tsx` — tabbed detail view: Overview, Research, Generated Content, Publish Preview.
- `ui.tsx` — shared primitives: `StatusBadge`, `Field`, `inputCls`.

## Status lifecycles

**Tool:** `draft` → `researched` → `generated` → `approved` → `archived`

**Asset:** `draft` → `generated` → `approved` → `archived`

**Research run:** `pending` → `running` → `completed` / `failed`

**Export (PublishPayload):** `draft` → `exported` → `published` / `failed`

## Key gotchas learned the hard way

- **Vite `loadEnv("")` merges `process.env`.** If the shell has `PORT` set, it overrides the `.env` value. Use `fs.readFileSync` to parse `.env` directly in `vite.config.ts`.
- **`VITE_API_BASE_URL` in `.env` breaks the proxy.** Any `VITE_`-prefixed var is baked into the browser bundle. If it contains a full URL, `api.ts` bypasses the Vite proxy and makes cross-origin requests.
- **Express 4 + async = silent failures without `ar()`.** Unhandled promise rejections in route handlers do not reach the error handler. Always wrap with `ar()`.
- **Sub-resource routes before `/:id`.** Express matches routes in order; `/:id/research` defined after `/:id` will never be reached.
- **Prisma db path** is relative to `prisma/schema.prisma`, not `process.cwd()`. `file:./dev.db` always resolves to `prisma/dev.db`.
