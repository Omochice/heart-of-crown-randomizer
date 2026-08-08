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
- **Storybook**: Component development and documentation; stories are co-located with components (`Component.stories.svelte`) and deployed via CI
- **Biome**: Code formatting and linting (replaces ESLint/Prettier)
- **Playwright**: Browser-based end-to-end testing for the site (separate from Vitest unit/component tests)
- **Knip**: Unused file/export/dependency detection, run per package via `check:knip`

## Development Standards

### Type Safety

- TypeScript strict mode enforced across all packages
- Discriminated unions for card types (`type: "basic" | "common" | "rare" | "princess"`) with `MainType`/`SubType` for game-domain classification
- No `any` usage; explicit typing for constraint predicates and filters

### Code Quality

- Biome for formatting and linting (configured via `biome.json`)
- Knip for detecting unused files, exports, and dependencies (`check:knip` in every package)
- Sort-package-json for consistent package.json ordering
- Test coverage via Vitest (with coverage reports available)

### Testing

- Vitest for all test suites (unit, integration, property-based)
- Property-based testing with `@fast-check/vitest` for randomizer invariants
- Separate test files per concern (e.g., `page.accessibility.test.ts`, `page.reactivity.test.ts`)
- Tests live alongside source in `src/` directories
- Vitest-based integration tests named `*.e2e.test.ts` live under `routes/` and exercise full flows (e.g. pin → randomize → result) against jsdom, not a real browser
- Real browser E2E tests use Playwright, live under `packages/site/test/`, and run via `pnpm test:e2e` (separately from `pnpm test` in CI)

## Development Environment

### Reproducible Dev Environment

- Nix flake (`flake.nix`) provides pinned dev shells per tool; CI validates it via `nix flake check`
- `treefmt-nix` formats non-JS/TS files (e.g. Markdown via `rumdl`); Biome remains the formatter for TS/JS/JSON

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
