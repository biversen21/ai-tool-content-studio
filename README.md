# AI Tool Content Studio

A local-first app for generating affiliate-style content about AI software tools. Add a tool, run AI research, generate content pages, review and approve, then export to JSON or Markdown.

**Workflow:** Add Tool → Run Research → Generate Content → Edit & Approve → Export

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + TypeScript + Express 4 |
| Database | SQLite via Prisma ORM |
| Validation | Zod (shared between frontend and backend) |
| LLM | OpenAI API (`gpt-4o-mini` by default) |

## Project layout

```
ai-tool-content-studio/
└── ai-tool-content/          # npm workspaces root — all source lives here
    ├── prisma/                   # Schema + migrations (dev.db is gitignored)
    ├── shared/                   # Zod schemas + status constants (consumed by FE + BE)
    │   └── src/
    │       ├── constants/        # Status enums — single source of truth
    │       └── schemas/          # Tool, asset, publish, research Zod schemas
    ├── backend/
    │   └── src/
    │       ├── routes/           # Thin HTTP handlers (validation → service → response)
    │       ├── services/         # Business logic (tool, research, generation, publish)
    │       ├── prompts/          # Versioned LLM prompt modules (never inline)
    │       ├── adapters/         # publisher.interface.ts + localExport.adapter.ts
    │       ├── exporters/        # JSON and Markdown serializers
    │       ├── schemas/          # Backend-only Zod schemas (OpenAI output shapes)
    │       └── db/               # Prisma client singleton
    ├── frontend/
    │   └── src/
    │       ├── lib/api.ts        # Typed fetch wrappers for every API endpoint
    │       ├── App.tsx           # Dashboard — tool list + add tool form
    │       ├── ToolDetail.tsx    # Tabbed tool detail (Overview / Research / Content / Publish)
    │       └── ui.tsx            # Shared UI primitives (StatusBadge, Field, inputCls)
    └── exports/
        ├── json/                 # Exported JSON files (asset_type/slug.json)
        └── markdown/             # Exported Markdown files (asset_type/slug.md)
```

## Setup

Requires Node.js >= 20.

```bash
# 1. Enter the project directory
cd ai-tool-content

# 2. Install all workspaces
npm install

# 3. Copy the env template
cp .env.example .env

# 4. Add your OpenAI API key — paste this line with your real key substituted
sed -i.bak 's/OPENAI_API_KEY=/OPENAI_API_KEY=sk-your-key-here/' .env && rm .env.bak

# 5. Create the local SQLite database and generate the Prisma client
npm run prisma:migrate -- --name init

# 6. Start backend (http://localhost:4000) + frontend (http://localhost:5173)
npm run dev
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Backend listen port |
| `DATABASE_URL` | `file:./dev.db` | SQLite path (relative to `prisma/`) |
| `OPENAI_API_KEY` | — | **Required.** OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model used for research and generation |
| `EXPORT_DIR` | `exports` | Root dir for local exports (relative to repo root) |
| `VITE_API_BASE_URL` | `http://localhost:4000` | Backend URL used by the frontend |

## API reference

### Tools — `/api/tools`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tools` | List all tools |
| `POST` | `/api/tools` | Create a tool (`name`, optional `affiliateUrl`, `notes`) |
| `GET` | `/api/tools/:id` | Get a single tool |
| `PATCH` | `/api/tools/:id` | Update tool fields |
| `POST` | `/api/tools/:id/research` | Run AI research (optional `notes`) |
| `GET` | `/api/tools/:id/research` | Get the latest research run + facts |
| `GET` | `/api/tools/:id/assets` | List generated assets for a tool |
| `POST` | `/api/tools/:id/generate/tool-page` | Generate a tool review page |
| `POST` | `/api/tools/:id/generate/category-page` | Generate a category roundup page |
| `POST` | `/api/tools/:id/generate/comparison-page` | Generate a vs-competitor page |
| `POST` | `/api/tools/:id/generate/all` | Generate all three asset types |

### Assets — `/api/assets`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/assets` | List assets (filter with `?toolId=`) |
| `GET` | `/api/assets/:id` | Get a single asset |
| `PATCH` | `/api/assets/:id` | Edit title, slug, markdown, or status |
| `POST` | `/api/assets/:id/approve` | Approve asset (also promotes tool status) |
| `POST` | `/api/assets/:id/publish-preview` | Preview serialized output without writing |
| `POST` | `/api/assets/:id/export-json` | Write JSON export to `exports/json/` |
| `POST` | `/api/assets/:id/export-markdown` | Write Markdown export to `exports/markdown/` |
| `GET` | `/api/assets/:id/payloads` | List previous exports for an asset |

### Other

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/research` | List research runs (filter with `?toolId=`) |
| `GET` | `/api/research/:id` | Get a research run by ID |

## Status lifecycles

**Tool:** `draft` → `researched` → `generated` → `approved` → `archived`

**Asset:** `draft` → `generated` → `approved` → `archived`

**Research run:** `pending` → `running` → `completed` / `failed`

**Export:** `draft` → `exported` → `published` / `failed`

## Export output

Exports land in `exports/{format}/{asset_type}/{slug}.{ext}`:

```
exports/
├── json/
│   ├── tool_page/my-tool-review.json
│   └── category_page/best-ai-writing-tools.json
└── markdown/
    ├── tool_page/my-tool-review.md
    └── comparison_page/my-tool-vs-competitor.md
```

Markdown files include YAML frontmatter with `title`, `seoTitle`, `metaDescription`, `type`, `slug`, `status`, and `createdAt`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Backend + frontend concurrently |
| `npm run dev:backend` | Backend only (tsx watch) |
| `npm run dev:frontend` | Frontend only (Vite HMR) |
| `npm run build` | Type-check and build all workspaces |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:migrate` | Apply or create a new migration |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run db:reset` | Drop and recreate the local database |

## Conventions

- **Routes are thin.** Validate with Zod, call a service, return JSON. No business logic in routes.
- **Prompts are modules.** All LLM prompts live in `backend/src/prompts/` — never inline.
- **Status fields are strings in the DB**, validated by Zod enums in `shared/src/constants/status.ts`. One source of truth for both frontend and backend.
- **Publishing is adapter-based.** `publisher.interface.ts` is the contract; swap out `localExport.adapter.ts` for a CMS or S3 adapter without touching business logic.
- **`prisma/dev.db` is never committed.** See `.gitignore`.
