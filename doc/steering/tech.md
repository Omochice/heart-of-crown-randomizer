# Technology Stack

## Architecture

Monorepo with multiple packages: core randomizer logic (pure functions), card definitions (static data), constraint rules, ID codec, and web interface (SvelteKit). Emphasizes testability through deterministic seeding and separation of concerns.

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Build**: Turbo for monorepo orchestration, tsdown for library bundling
- **Type Checker**: `tsgo` (`@typescript/native-preview`) for library packages, `svelte-check` for site
- **Runtime**: Node.js (version specified in engines field)
- **Frontend**: SvelteKit + Vite + Tailwind CSS
- **Testing**: Vitest with property-based testing via fast-check

## Key Libraries

- **seedrandom**: Deterministic PRNG for reproducible randomization
- **Storybook**: Component development and documentation
- **Biome**: Code formatting and linting (replaces ESLint/Prettier)
- **@testing-library/svelte**: Component-level testing for Svelte components (site package)
- **Playwright**: Browser-based end-to-end tests against a built preview server (site package)
- **knip**: Detects unused files, exports, and dependencies across the monorepo

## Development Standards

### Type Safety

- TypeScript strict mode enforced across all packages
- Discriminated unions for card types (`type: "basic" | "common" | "rare" | "princess"`) with `MainType`/`SubType` for game-domain classification
- No `any` usage; explicit typing for constraint predicates and filters

### Code Quality

- Biome for formatting and linting (configured via `biome.json`)
- Sort-package-json for consistent package.json ordering
- Knip for unused exports/dependencies (`pnpm check` runs it alongside type-check and lint)
- Test coverage via Vitest (with coverage reports available)

### Testing

- Vitest for all test suites (unit, integration, property-based) across every package
- Property-based testing with `@fast-check/vitest` for randomizer and constraint invariants
- Site adds `@testing-library/svelte` (via `svelteTesting()` Vite plugin) for component-level tests, and Playwright for true browser end-to-end specs (`packages/site/test/*.spec.ts`, run against a built preview server)
- Separate test files per concern (e.g., `page.accessibility.test.ts`, `page.reactivity.svelte.test.ts`); suffixes signal intent: `.svelte.test.ts` for runes/component-dependent tests, `.ssr.test.ts` for server-render safety, `.e2e.test.ts` for full-flow integration tests run under Vitest (distinct from Playwright's browser specs)
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
