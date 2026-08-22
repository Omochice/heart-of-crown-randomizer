# Technology Stack

## Architecture

Monorepo with multiple packages: core randomizer logic (pure functions), card definitions (static data), constraint rules, ID codec, and web interface (SvelteKit). Emphasizes testability through deterministic seeding and separation of concerns.

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Build**: Turbo for monorepo orchestration, tsdown for library bundling
- **Type Checker**: `tsgo` (`@typescript/native-preview`) for library packages, `svelte-check` for site
- **Runtime**: Node.js (version specified in engines field)
- **Frontend**: SvelteKit + Vite + Tailwind CSS
- **Testing**: Vitest with property-based testing via fast-check; Playwright for end-to-end tests

## Key Libraries

- **seedrandom**: Deterministic PRNG for reproducible randomization
- **Storybook**: Component development and documentation
- **Biome**: Code formatting and linting (replaces ESLint/Prettier)
- **Playwright**: Browser-driven end-to-end tests for the site package
- **knip**: Detects unused files, exports, and dependencies across the monorepo
- **textlint**: Prose linting (AI-writing preset) for documentation and written content

## Development Standards

### Type Safety

- TypeScript strict mode enforced across all packages
- Discriminated unions for card types (`type: "basic" | "common" | "rare" | "princess"`) with `MainType`/`SubType` for game-domain classification
- No `any` usage; explicit typing for constraint predicates and filters

### Code Quality

- Biome for formatting and linting (configured via `biome.json`)
- Sort-package-json for consistent package.json ordering
- Test coverage via Vitest (with coverage reports available)
- knip (`pnpm check:knip`, config in `knip.json`) flags unused files, exports, and dependencies
- textlint with the AI-writing preset (`.textlintrc.json`) checks prose quality

### Testing

- Vitest for all test suites (unit, integration, property-based)
- Property-based testing with `@fast-check/vitest` for randomizer invariants
- Playwright for end-to-end tests in the site package (`packages/site/playwright.config.ts`, `pnpm test:e2e`)
- Separate test files per concern (e.g., `page.accessibility.test.ts`, `page.reactivity.test.ts`)
- Test filename suffixes signal what a test needs to run: plain `.test.ts` for pure logic, `.svelte.test.ts` when Svelte runtime/component context is required, `.e2e.test.ts` for Playwright-driven browser tests
- Tests live alongside source in `src/` directories

## Development Environment

### Package Structure

```text
packages/
  card/                     # Card type definitions and data
  constraint/               # Preset constraint rules for card selection
  id-codec/                 # Bitfield-based encode/decode for ID sets
  randomizer/               # Core randomization logic
  rolldown-plugin-dedent/   # Build plugin for dedent tagged templates
  site/                     # SvelteKit web interface
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
