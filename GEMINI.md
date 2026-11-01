# GEMINI.md — Kitchen Workflow App Architecture & Engineering Constitution

> **Single Source of Truth** for autonomous agents working within `C:\Users\paw2fajardo\orca\workspaces\kitchensidekick\burbot`.  
> Derived from [`PRODUCT_BRIEF.md`](file:///C:/Users/paw2fajardo/orca/workspaces/kitchensidekick/burbot/PRODUCT_BRIEF.md), [`DESIGN.md`](file:///C:/Users/paw2fajardo/orca/workspaces/kitchensidekick/burbot/DESIGN.md), [`BUILD_LEDGER.md`](file:///C:/Users/paw2fajardo/orca/workspaces/kitchensidekick/burbot/BUILD_LEDGER.md), and [`ORCHESTRATION.md`](file:///C:/Users/paw2fajardo/orca/workspaces/kitchensidekick/burbot/ORCHESTRATION.md).

---

## 1. Project Purpose & Core Philosophy

The **Kitchen Workflow App** is a kitchen-first cooking orchestration system designed for 10–13 inch landscape tablets and mobile devices on real kitchen countertops. It bridges recipe management and real-time physical execution.

### Non-Negotiable Operational Principles
1. **Never Mutate Mealie Core Data**: Mealie is the read-only upstream source of truth for recipes, imagery, and ingredients. Internal ASTs, workflow generation, and cooking sessions preserve original instruction and ingredient IDs.
2. **Deterministic Execution**: Given identical recipe inputs, workflow heuristic generators MUST output deterministic phases and task dependency graphs.
3. **Anti-Slop Design Philosophy**:
   - **Zero Nested Cards**: Cards never contain sub-cards, inner gray boxes, or nested borders. Maximum depth is 1 level.
   - **Zero Continuous Motion**: Absolutely no `animate-pulse`, `animate-ping`, or infinite spinners on active cooking indicators. Use steady-state icon + label badges.
   - **Kitchen Touch Targets**: Strictly $\ge 48\text{px} \times 48\text{px}$ for all touch elements ($\ge 56\text{px}$ height for primary completion CTAs) with minimum 8px gutter separation.
   - **Arm's-Length Legibility**: Font sizes scaled for 3–4 feet viewing (Instructions 20–24px, Titles 18–22px, Body 16–18px).
   - **Framed-Sheet Layout**: Warm canvas (`#F5F5F0`), crisp white surface (`#FFFFFF`), 1px stone border (`#D9DDD4`), and 0px drop shadow.

---

## 2. Agreed Tech Stack & Project Topology

### Monorepo Structure
```text
kitchensidekick/burbot/
├── backend/                       # Backend service (Node 22+, Hono, Drizzle ORM)
│   ├── src/
│   │   ├── api/                   # Hono REST endpoints (/api/workflows, /api/sessions)
│   │   ├── db/                    # Drizzle schema & Postgres connection
│   │   ├── mealie/                # Mealie REST API v1 client & error fallbacks
│   │   ├── normalizer/            # Ingestion pipeline to standardized recipe AST
│   │   ├── repository/            # Storage interface & in-memory test repository
│   │   ├── session/               # Graph dependency engine & offline event reconciliation
│   │   └── workflow/              # Deterministic heuristic generator & fixtures
│   └── tests/                     # Vitest unit & integration test suites
├── src/                           # Frontend application (React 19 + Vite)
│   ├── components/                # Touch-first UI primitives & layouts
│   │   ├── TaskCard.tsx           # De-nested 4px left-border task card
│   │   ├── StatusBadge.tsx        # Steady-state status indicators (5 lifecycle states)
│   │   ├── TouchPrimitives.tsx    # >=48px TouchButton and TouchChip
│   │   ├── WorkflowBoardLayout.tsx# 1024px responsive collapse engine
│   │   └── AppShell.tsx           # Framed-sheet app container with navigation
│   ├── stores/                    # Zustand stores (sessionStore, timerStore)
│   └── types/                     # Shared TypeScript data models
├── public/                        # Static assets & verification test fixtures
│   └── taskcard-verify.html       # Automated taste-linting test harness
├── theme.css                      # Tailwind CSS v4 @theme design tokens
├── tailwind.config.ts             # Backward-compatible Tailwind config & token exports
├── vite.config.ts                 # Vite bundler configuration
└── vitest.config.ts               # Frontend testing configuration
```

### Technology Matrix
- **Runtime**: Node.js 22+ & TypeScript
- **Backend**: Hono, Drizzle ORM, PostgreSQL (with in-memory repository for isolated unit testing)
- **Frontend**: React 19, Vite, Tailwind CSS v4, Radix UI primitives, Lucide React icons
- **State Management**: TanStack Query v5 (server cache) + Zustand (active sessions, local persistence)
- **Audio & Hardware APIs**: Web Audio API (synthetic 00:00 chime alert, zero asset dependencies), Screen WakeLock API (`navigator.wakeLock`)

---

## 3. Canonical Design Tokens

```css
@theme {
  --color-canvas: #F5F5F0;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F0F2EB;
  --color-border: #D9DDD4;
  --color-border-subtle: #E6E8E2;
  --color-primary: #245C43;
  --color-primary-hover: #1B4532;
  --color-text-primary: #20251F;
  --color-text-secondary: #5F675F;
  --color-text-muted: #848D84;

  /* Phase Accents (Cards left-border only, NEVER button backgrounds) */
  --color-phase-prep: #537B60;
  --color-phase-sauce: #B17A3D;
  --color-phase-sauce-text: #8A5A22;
  --color-phase-cooking: #A65B45;

  /* Status Badges */
  --color-status-pending: #5F675F;
  --color-status-ready: #245C43;
  --color-status-progress: #356B8C;
  --color-status-blocked: #8A4E0B;
  --color-status-completed: #287A4B;
}
```

---

## 4. Agent Roster & Delegation Rules

When operating as an autonomous specialist in this workspace:
- **Lead Orchestrator**: Coordinates workflows, defines file boundaries, reviews outputs, and advances phases.
- **Backend Developer** (`orcaTabId: 7edbcaac-d989-4425-b78c-5fb5bfc013fe`): Owns `backend/`. Adheres to strict file boundaries and runs `npm test` before declaring completion.
- **Frontend Developer** (`orcaTabId: 675e4a18-58f2-481c-bdce-f7c7fe41df0d`): Owns `src/`. Uses shared contracts, implements Screens 1–6, and validates build with `tsc && vite build`.
- **UX/UI Developer** (`orcaTabId: c8a3ad7d-6355-4e0c-abdc-60bf7decb576`): Owns design system, `theme.css`, touch ergonomics, and verifies compliance via `inspect.mjs --app`.
- **QA Engineer** (`orcaTabId: 8e3ec3c8-8156-4fd9-ab88-6fee489c7e3b`): Runs automated quality audits, verifies Sukiyaki canonical proposal, executes test suites, and validates viewport behavior.

---

## 5. Verification & Quality Gates

Before declaring any feature complete:
1. **Unit & Integration Tests**:
   - `cd backend && npm test` must pass 100% of tests.
   - `npm test` (root frontend) must pass 100% of tests.
2. **Build Validation**:
   - `npm run build` must compile cleanly with 0 TypeScript or bundler errors.
3. **Taste & Design Linter Gate**:
   - Run `node skills/design-taste-frontend/scripts/inspect.mjs <file> --app`.
   - Criteria: **0 FAIL, 0 `nested-cards`, 0 `pulsing-dot`**.
4. **Touch & Ergonomics Standards**:
   - Minimum $48\text{px} \times 48\text{px}$ interactive bounding box.
   - Minimum $56\text{px}$ height for completion buttons.
   - Zero horizontal clipping at 1024px iPad landscape width.
