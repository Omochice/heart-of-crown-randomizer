# Technology Stack

## Architecture

Monorepo with three distinct packages: core randomizer logic (pure functions), card definitions (static data), and web interface (SvelteKit). Emphasizes testability through deterministic seeding and separation of concerns.

## Core Technologies

- **Language**: TypeScript 5.9+ (strict mode)
- **Build**: Turbo for monorepo orchestration, tsdown for library bundling
- **Runtime**: Node.js 22.18.0+ (specified in engines)
- **Frontend**: SvelteKit 2.x + Vite 7.x + Tailwind CSS 4.x
- **Testing**: Vitest with property-based testing via fast-check

## Key Libraries

- **seedrandom**: Deterministic PRNG for reproducible randomization
- **Storybook**: Component development and documentation
- **Biome**: Code formatting and linting (replaces ESLint/Prettier)

## Development Standards

### Type Safety
- TypeScript strict mode enforced across all packages
- Discriminated unions for card types (`type: "basic" | "common" | "rare" | "princess"`)
- No `any` usage; explicit typing for constraint predicates and filters

### Code Quality
- Biome for formatting and linting (configured via `biome.json`)
- Sort-package-json for consistent package.json ordering
- Test coverage via Vitest (with coverage reports available)

### Testing
- Vitest for all test suites (unit, integration, property-based)
- Property-based testing with `@fast-check/vitest` for randomizer invariants
- Separate test files per concern (e.g., `page.accessibility.test.ts`, `page.reactivity.test.ts`)
- Tests live alongside source in `src/` directories

## Development Environment

### Required Tools
- pnpm 10.26.2+ (package manager, specified in packageManager)
- Node.js 22.18.0+
- Turbo (monorepo orchestration)

### Package Structure
```
packages/
  card/           # Card type definitions and data
  randomizer/     # Core randomization logic
  site/           # SvelteKit web interface
```

### Common Commands
```bash
# Dev: pnpm dev (from site package)
# Build: pnpm build (turbo runs all package builds)
# Test: pnpm test (turbo runs all test suites)
# Check: pnpm check (type-check + linting)
# Format: pnpm fmt (biome + sort-package-json)
```

## Key Technical Decisions

### Monorepo with Workspace Dependencies
- `@heart-of-crown-randomizer/*` namespace for internal packages
- Workspace protocol (`workspace:*`) for cross-package references
- Catalog for shared dev dependencies (biome, vitest, typescript versions)

### Functional Core with Typed Edges
- Pure functions in randomizer package (no side effects)
- Card definitions as static typed data (exported const objects)
- Svelte components handle all UI state and side effects

### ESM-Only
- `"type": "module"` in all packages
- `.mjs` output for libraries
- Import/export syntax throughout

### Build Outputs
- Libraries export both types (`.d.mts`) and runtime (`.mjs`)
- Multi-entry exports for granular imports (e.g., `@heart-of-crown-randomizer/card/basic`)
- Cloudflare adapter for SvelteKit deployment

---
_Document standards and patterns, not every dependency_
