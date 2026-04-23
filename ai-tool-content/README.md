# ai-tool-content

Local-first content generation app for affiliate-style AI tool content.

This repository is a **scaffold only**. It boots, exposes a health endpoint, and locks in the architecture (services, prompts, adapters, exporters). Feature work happens in subsequent passes.

## Stack

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** Node.js + TypeScript + Express
- **Database:** SQLite via Prisma
- **Validation:** Zod (shared between FE and BE)
- **LLM:** OpenAI API only

## Project layout

```
ai-tool-content/
├── prisma/                 # Prisma schema (dev.db is local, gitignored)
├── shared/                 # Zod schemas + status constants (FE + BE consume)
├── backend/                # Express API
│   └── src/
│       ├── routes/         # thin HTTP handlers
│       ├── services/       # business logic
│       ├── prompts/        # versioned prompt modules
│       ├── adapters/       # publisher.interface + implementations
│       ├── exporters/      # markdown/json serialization
│       ├── db/             # Prisma client singleton
│       └── schemas/        # backend-only request/response Zod schemas
├── frontend/               # Vite + React + Tailwind
└── exports/
    ├── json/
    └── markdown/
```

## Setup

Requires Node.js >= 20.

```bash
# 1. Install (uses npm workspaces — single install at the root)
npm install

# 2. Copy env and fill in OPENAI_API_KEY when you're ready to wire LLM calls
cp .env.example .env

# 3. Generate the Prisma client and create the local SQLite database
npm run prisma:migrate -- --name init

# 4. Start backend (http://localhost:4000) and frontend (http://localhost:5173) together
npm run dev
```

The frontend placeholder calls `GET /api/health` on the backend on mount and prints the result.

## Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Run backend + frontend concurrently |
| `npm run dev:backend` | Backend only |
| `npm run dev:frontend` | Frontend only |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Apply / create migrations against `prisma/dev.db` |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run db:reset` | Drop and recreate the local DB |

## Conventions

- **Routes are thin.** They validate input with Zod, call a service, and shape the response. No business logic.
- **Prompts are modules.** All LLM prompts live in `backend/src/prompts/` and are versioned there. Never inline.
- **Status fields are strings in the DB**, validated by Zod enums in `shared/src/constants/status.ts`. One source of truth.
- **Publishing is adapter-based.** `publisher.interface.ts` is the contract; `localExport.adapter.ts` is the first implementation.
- **`prisma/dev.db` is never committed.** See `.gitignore`.
