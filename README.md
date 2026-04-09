# BlueScope

> 🇹🇭 [ภาษาไทย](README.th.md)

A lightweight, open-source intelligence toolkit built for investigative work. BlueScope transforms raw case data into clear, dependable AI-driven insights, streamlining investigative analysis and supporting precise, evidence-based decision-making.

## Overview

BlueScope is a **local-first, cross-platform desktop application** built on Electron, designed to assist investigators in processing criminal case narratives — particularly tailored for **Thai law enforcement**. Users input raw case text, and a pipeline of specialized LLM agents:

1. Refines the narrative for clarity
2. Extracts structured entities (persons, organizations, locations, assets, evidence, and events)
3. Infers relationships between entities and builds a visual network graph
4. Classifies the case against a 58-skill Thai criminal law taxonomy
5. Generates domain-specific investigative advisory reports

All data is stored locally on-device; nothing leaves the machine except API calls to the chosen LLM provider.

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

OpenAI, Anthropic, Google Gemini, Azure OpenAI, Groq, Mistral, Cohere, DeepSeek, Cerebras, xAI (Grok), Perplexity, TogetherAI, Fireworks, DeepInfra, and any OpenAI-compatible endpoint. API keys are encrypted at rest using Electron's native `safeStorage`.

## Monorepo Structure

This repository is a **Turborepo monorepo** with two apps and four packages:

```
bluescope/
├── apps/
│   ├── main/       — Electron main process (IPC handlers, SQLite, migrations, window management)
│   └── renderer/   — React SPA (UI, routing, AI streaming display)
└── packages/
    ├── agents/     — AI agent classes built on the Vercel AI SDK
    ├── modules/    — Electron IPC bridge modules
    ├── repos/      — Drizzle ORM database repositories
    └── skills/     — Thai criminal law skill taxonomy (58 Markdown skill files)
```

### Apps

**`apps/main`** — Electron main process. Initialises the SQLite database, runs Drizzle migrations on startup, exposes all IPC module handlers, manages a borderless window with custom titlebar controls, and uses `safeStorage` for encrypted API key persistence.

**`apps/renderer`** — Vite-powered React frontend loaded inside the Electron window. Communicates with the main process **exclusively via IPC bridges** exposed by `preload.ts`. Never calls the database or the filesystem directly.

### Packages

#### `@repo/agents` — AI Agent Pipeline

All agents extend an abstract `BaseAgent` class, which wraps the Vercel AI SDK. Each agent defines bilingual (EN/TH) `systemPrompt()` and `userPrompt()` methods, and optionally a structured Zod output schema. Agents support both streaming (`runStream`) and batch (`run`) execution modes.

| Step | Agent | Purpose |
|---|---|---|
| 1 | `TitleAgent` | Generates a concise case title |
| 2 | `SummaryAgent` | Produces a one-paragraph case summary |
| 3 | `DescriptionRefinementAgent` | Rewrites the case narrative for clarity |
| 4 | `EntityRefinementAgent` | Refines structured entity lists |
| 5 | `StructureExtractionAgent` | Extracts persons, organizations, locations, assets, damages, evidence, and events as structured JSON |
| 6 | `LinkAnalysisAgent` | Infers relationships between extracted entities |
| 7 | `ClassificationAgent` | Multi-label classification against the 58-skill taxonomy |
| 8 | `AdvisoryAgent` | Generates skill-specific investigative recommendations |
| 9 | `SynthesisAgent` | Aggregates multiple advisory outputs into one unified report |

#### `@repo/modules` — IPC Bridge Modules

These modules act as the bridge between the renderer (UI) and the main process (Electron). Each module registers IPC handlers that invoke database repositories or run AI agents, streaming results back to the frontend.

Modules: `caseModule`, `configModule`, `providerModule`, `llmModule`, `descriptionModule`, `refinementModule`, `structureModule`, `classificationModule`, `advisorModule`, `dashboardModule`, `presetModule`, `searchModule`, `logModule`, `browserModule`, `devModule`.

#### `@repo/repos` — Database Repositories

Drizzle ORM repositories for every database table. All schemas are defined in `schema.ts`.

| Repository | Table |
|---|---|
| `cases` | Master case records |
| `case_persons` | Extracted person entities |
| `case_organizations` | Extracted organization entities |
| `case_locations` | Extracted location entities |
| `case_assets` | Extracted asset entities |
| `case_damages` | Extracted damage records |
| `case_evidence` | Extracted evidence items |
| `case_events` | Extracted event records |
| `case_links` | Relationship graph edges between entities |
| `case_types` | Classification results (matched skill IDs) |
| `case_suggestions` | Advisory outputs per skill |
| `case_description_logs` | History of description refinements |
| `case_entity_logs` | History of entity refinements |
| `presets` | Saved LLM provider presets |
| `usage_logs` | LLM token usage tracking |

#### `@repo/skills` — Thai Criminal Law Taxonomy

58 Markdown skill files, each providing classification metadata and a domain-specific system prompt for the `AdvisoryAgent`. Skills are organized into 16 categories:

| # | Category | Skills |
|---|---|---|
| 1 | Homicide & Violent Crimes | Homicide, Premeditated murder, Death from boxing, Justifiable homicide, Abortion, Insanity cases |
| 2 | Arson | Arson (2 variants) |
| 3 | Sexual Offences | Rape (2 variants), Online sexual exploitation & human trafficking |
| 4 | Property Crimes | Extortion, Fraud, Embezzlement, Theft (3 variants), Religious artifact theft, Robbery, Receiving stolen property, Trespassing, Unlawful detention, Child kidnapping for ransom |
| 5 | Forgery | Counterfeit currency, Forged official documents |
| 6 | Weapons | Firearms offences (2 variants) |
| 7 | Immigration | Alien deportation, Illegal entry |
| 8 | Wildlife / Forestry / Antiquities | Killing wild elephants, Wildlife carcass possession, Hunting protected wildlife, National forest offences, Antiquities & museums |
| 9 | Economic & Financial Crimes | Bad checks, Credit card fraud (3 variants), Customs offences, Bribery of official |
| 10 | Occupational / Public Health | Illegal medical practice, Impersonating a monk, Impersonating police |
| 11 | Animal Slaughter Control | Animal slaughter control |
| 12 | Gambling | Gambling offences, Online gambling & transnational crime |
| 13 | Narcotics | Narcotics offences, Drug distribution |
| 14 | Illegal Solicitation | Illegal solicitation |
| 15 | Traffic | Reckless driving, Traffic accident |
| 16 | Cybercrime | Online fake news & computer crime, Online product fraud, Online gambling & transnational crime, Online sexual exploitation, Online financial fraud |

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

## Data Flow

The following end-to-end pipeline shows how a raw case narrative becomes structured intelligence:

```
User inputs raw case text
        │
        ▼
DescriptionRefinementAgent ──► refined narrative
        │
        ▼
EntityRefinementAgent ──► refined entity text
        │
        ▼
StructureExtractionAgent ──► structured JSON
        │                     (persons, orgs, locations,
        │                      assets, damages, evidence, events)
        ▼
LinkAnalysisAgent ──► relationship graph edges
        │
        ▼
ClassificationAgent ──► matched skill IDs (from 58-skill taxonomy)
        │
        ▼
AdvisoryAgent (per matched skill) ──► investigative recommendations
        │
        ▼
SynthesisAgent ──► unified advisory report
        │
        ▼
All results saved to local SQLite database
```

In parallel, `TitleAgent` and `SummaryAgent` run at the description stage to produce the case title and summary.

## Key Design Decisions

- **Local-first**: All case data is stored on-device in SQLite. No cloud sync. API keys are encrypted via Electron's `safeStorage`.
- **Multi-LLM**: Supports 15+ providers via the Vercel AI SDK abstraction, making it easy to swap models without code changes.
- **Bilingual**: All agents support both English and Thai prompts; the UI supports both languages via Paraglide.js i18n.
- **Streaming**: AI responses stream in real-time to the UI via Electron IPC, using the Vercel AI SDK's streaming API.
- **Domain-specific**: The 58 Thai criminal law skills make the tool deeply tailored to Thai law enforcement use cases, with classification and advisory prompts written for each specific offence category.
- **Modular monorepo**: Turborepo keeps `agents`, `modules`, `repos`, and `skills` as independently buildable and testable packages, while sharing types across the workspace.

## Getting Started

### Prerequisites

- Node.js 24+
- npm 11+

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
