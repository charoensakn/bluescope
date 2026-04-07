# BlueScope

A lightweight, open-source intelligence toolkit built for investigative work. BlueScope transforms raw case data into clear, dependable AI-driven insights, streamlining investigative analysis and supporting precise, evidence-based decision-making.

## Overview

BlueScope is a local-first, cross-platform Electron desktop application that assists investigators in processing criminal case narratives. Users input raw case text, and a pipeline of specialized LLM agents refines the description, extracts structured entities, builds relationship graphs, classifies the case against a Thai criminal law taxonomy, and generates domain-specific advisory reports — all stored locally.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron + Electron Forge |
| Frontend | React 19 + TypeScript + Vite |
| UI components | Material UI v9 |
| Routing | React Router v7 |
| State management | Zustand |
| Database | SQLite (`better-sqlite3`) + Drizzle ORM |
| AI / LLM | Vercel AI SDK |
| Build orchestration | Turborepo |
| Linting / formatting | Biome |
| i18n | Paraglide.js — English & Thai |
| Schema validation | Zod |

### Supported LLM Providers

OpenAI, Anthropic, Google Gemini, Azure OpenAI, Groq, Mistral, Cohere, DeepSeek, Cerebras, xAI (Grok), Perplexity, TogetherAI, Fireworks, DeepInfra, and any OpenAI-compatible endpoint. API keys are encrypted using Electron's native safe storage.

## Monorepo Structure

```
apps/
  main/       — Electron main process (IPC handlers, SQLite, migrations, window management)
  renderer/   — React SPA (UI, routing, AI streaming display)
packages/
  agents/     — AI agent classes built on the Vercel AI SDK
  modules/    — Electron IPC bridge modules
  repos/      — Drizzle ORM database repositories
  skills/     — Thai criminal law skill taxonomy (58 Markdown skill files)
```

### Apps

**`apps/main`** — Electron main process. Initialises the SQLite database, runs Drizzle migrations, exposes all IPC module handlers, manages a borderless window with custom titlebar controls, and uses `safeStorage` for encrypted API key persistence.

**`apps/renderer`** — Vite-powered React frontend loaded inside the Electron window. Communicates with the main process exclusively via IPC bridges exposed by `preload.ts`.

### Packages

**`@repo/agents`** — Structured LLM agents. Each agent extends `BaseAgent` with bilingual (EN/TH) system/user prompts.

| Agent | Purpose |
|---|---|
| `TitleAgent` | Generates a concise case title |
| `SummaryAgent` | Produces a one-paragraph case summary |
| `DescriptionRefinementAgent` | Rewrites the case narrative for clarity |
| `EntityRefinementAgent` | Refines structured entity lists |
| `StructureExtractionAgent` | Extracts persons, organizations, locations, assets, damages, evidence, and events |
| `LinkAnalysisAgent` | Infers relationships between extracted entities |
| `ClassificationAgent` | Multi-label classification against the skill taxonomy |
| `AdvisoryAgent` | Generates skill-specific investigative recommendations |
| `SynthesisAgent` | Aggregates multiple advisory outputs into one report |

**`@repo/modules`** — IPC modules: `caseModule`, `configModule`, `providerModule`, `llmModule`, `descriptionModule`, `refinementModule`, `structureModule`, `classificationModule`, `advisorModule`, `dashboardModule`, `presetModule`, `searchModule`, `logModule`, `browserModule`, `devModule`.

**`@repo/repos`** — Drizzle ORM repositories for every database table: `cases`, `case_persons`, `case_organizations`, `case_locations`, `case_assets`, `case_damages`, `case_evidence`, `case_events`, `case_links`, `case_types`, `case_suggestions`, `case_description_logs`, `case_entity_logs`, `presets`, `usage_logs`.

**`@repo/skills`** — 58 Markdown skill files covering Thai criminal law categories (homicide, arson, sexual offences, property crimes, narcotics, cybercrime, financial crime, wildlife/environmental offences, and more). Each skill provides classification metadata and a system prompt for the `AdvisoryAgent`.

### Renderer Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Case statistics, priority charts, classification breakdown, LLM token usage, recent cases |
| Case List | `/cases` | Browse, create, and manage cases |
| Description | `/description` | Markdown editor (Tiptap), AI title/summary generation, case metadata |
| Refine | `/refine` | Dual-pane AI refinement for description and entity text, with history |
| Knowledge | `/knowledge` | Entity tables and interactive relationship network graph (Neo4j NVL) |
| Classification | `/classification` | AI multi-label case classification against the skill taxonomy |
| Suggestion | `/suggestion` | Per-skill advisory generation and AI synthesis report |
| Settings | `/setting` | Theme, language, reasoning toggle, LLM provider management |

## Getting Started

### Prerequisites

- Node.js 24+
- npm

### Install dependencies

```sh
npm install
```

### Development

```sh
npm run dev
```

Starts the Vite dev server for the renderer and the Electron main process concurrently via Turborepo.

### Build

```sh
npm run build
```

Compiles all packages and apps.

### Package for distribution

```sh
npm run dist
npm run package
```

Produces a packaged Electron application in `release/`. Outputs ZIP archives for Windows, macOS, and Linux.

### Create installers

```sh
npm run make
```

Runs `electron-forge make` to generate platform-specific installers.

## Scripts Reference

| Script | Description |
|---|---|
| `npm run dev` | Start development (main + renderer) |
| `npm run build` | Build all packages and apps |
| `npm run dist` | Build and copy all artifacts for packaging |
| `npm run start` | Start the packaged Electron app |
| `npm run make` | Create platform installers via Electron Forge |
| `npm run package` | Package the Electron app |
| `npm run clean` | Remove all build artifacts |
| `npm run lint` | Biome lint across all workspaces |
| `npm run format` | Biome format across all workspaces |
| `npm run check` | Biome check across all workspaces |
| `npm run rebuild` | Rebuild native modules (`better-sqlite3`) for Electron |
| `npm run test` | Run Vitest test suites (`@repo/repos`, `@repo/skills`) |
| `npm run make-version` | Generate `version.json` |
