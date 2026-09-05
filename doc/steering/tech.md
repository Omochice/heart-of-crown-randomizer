# Technology Stack

## Architecture

Monorepo with multiple packages: core randomizer logic (pure functions), card definitions (static data), constraint rules, ID codec, and web interface (SvelteKit). Emphasizes testability through deterministic seeding and separation of concerns.

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Build**: Turbo for monorepo orchestration, tsdown for library bundling
- **Type Checker**: `tsgo` (`@typescript/native-preview`) for library packages, `svelte-check` for site
- **Runtime**: Node.js (version specified in engines field)
- **Frontend**: SvelteKit + Vite + Tailwind CSS
- **Testing**: Vitest with property-based testing via fast-check; Playwright for site end-to-end tests

## Key Libraries

- **seedrandom**: Deterministic PRNG for reproducible randomization
- **Storybook**: Component development and documentation
- **Biome**: Code formatting and linting for TS/JS/JSON. Prettier handles `*.svelte` formatting instead, since Biome does not support Svelte files
- **knip**: Detects unused dependencies, exports, and files across the monorepo
- **textlint**: Prose linting for Markdown/docs (AI-writing preset) to keep human-authored tone in documentation

## Development Standards

### Type Safety

- TypeScript strict mode enforced across all packages
- Discriminated unions for card types (`type: "basic" | "common" | "rare" | "princess"`) with `MainType`/`SubType` for game-domain classification
- No `any` usage; explicit typing for constraint predicates and filters

### Code Quality

- Biome for formatting and linting (configured via `biome.json`); Prettier formats `*.svelte` files
- knip for unused dependency/export detection (`pnpm check:knip`)
- Sort-package-json for consistent package.json ordering
- Test coverage via Vitest (with coverage reports available)
- Non-JS tooling (Markdown, Nix, TOML, YAML formatting; GitHub Actions linting; Renovate config validation) is handled by the Nix flake, not pnpm scripts — see Development Environment

### Testing

- Vitest for unit, integration, and property-based test suites
- Property-based testing with `@fast-check/vitest` for randomizer invariants
- Playwright for site end-to-end tests (`packages/site/src/routes/page.*.e2e.test.ts`), run via `pnpm --filter ./packages/site run test:e2e`
- Separate test files per concern (e.g., `page.accessibility.test.ts`, `page.reactivity.test.ts`)
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

### Nix Flake for Non-JS Tooling

- `flake.nix` provides a reproducible dev shell (`nix develop`) and CI checks (`nix flake check`) outside the pnpm/Turbo pipeline
- `treefmt` formats Markdown, Nix, TOML, and YAML (`nix fmt`); JS/TS formatting still goes through Biome/Prettier
- `actionlint`, `ghalint`, and `zizmor` lint GitHub Actions workflows for correctness and security
- Renovate config (`renovate.json5`) is validated as part of the flake checks
- Rationale: keeps repo-wide/infra tooling reproducible and decoupled from the Node toolchain

### Automated Dependency Updates

- Renovate manages dependency bumps across pnpm, GitHub Actions, and Nix inputs, extending a shared personal config
- Custom managers keep the Node version in `engines.node` and CI matrix in sync

---

_Document standards and patterns, not every dependency_
