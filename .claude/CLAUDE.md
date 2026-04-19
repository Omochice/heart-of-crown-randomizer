# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A card randomizer for the Heart of Crown deck-building game.
Monorepo with modular packages separating card data, randomization logic, constraint rules, ID encoding, and the web frontend.

## Commands

All commands are run from the repository root unless noted otherwise.

```bash
pnpm build          # Build all packages (turbo, respects dependency order)
pnpm test           # Run all test suites
pnpm check          # Type-check + lint (all packages)
pnpm fmt            # Format (biome + sort-package-json + Prettier for *.svelte)
pnpm dev            # Start SvelteKit dev server (builds library dependencies first)
```

Per-package commands (run from `packages/{name}/`):

```bash
pnpm test                        # Run tests for this package
pnpm vitest run src/foo.test.ts  # Run a single test file
pnpm vitest run -t "test name"   # Run a single test by name
pnpm check:type                  # Type-check only (tsgo for libraries, svelte-check for site)
pnpm check:biome                 # Lint only
```

## Architecture

```text
packages/
  card/           # Pure data + types. Card definitions grouped by edition (basic/, far-eastern-border/).
  constraint/     # Preset constraint rules for balanced card selection. Each rule in rules/{name}/.
  id-codec/       # Bitfield encode/decode for compact URL state. No dependencies on other packages.
  randomizer/     # Pure functions for seeded selection/shuffling. Depends on seedrandom.
  rolldown-plugin-dedent/  # Build-time plugin for dedent tagged templates.
  site/           # SvelteKit web app consuming all above packages.
```

Dependency flow: `site` depends on `card`, `constraint`, `id-codec`, `randomizer`. `constraint` depends on `card`. `card` uses `rolldown-plugin-dedent` at build time. `id-codec` and `randomizer` have no internal dependencies.

### Key Patterns

- **Functional core**: randomizer and constraint packages are pure functions with no side effects. All UI state and effects live in site.
- **Discriminated unions**: Card types use a `type` field (`"basic" | "common" | "rare" | "princess"`) as discriminator, with `MainType`/`SubType` for game-domain classification.
- **ESM-only**: All packages use `"type": "module"` with `.mjs`/`.d.mts` outputs.
- **No path aliases**: Imports use workspace namespace (`@heart-of-crown-randomizer/*`) or relative paths.

### Test Patterns

- Tests co-located with source: `{feature}.test.ts` next to `{feature}.ts`.
- Site splits tests by concern: `page.accessibility.test.ts`, `page.reactivity.test.ts`.
- Constraint rules include property-based tests (`index.property.test.ts`) using `@fast-check/vitest`.

## Steering

Project-wide context is maintained in `doc/steering/` (`product.md`, `tech.md`, `structure.md`). Use `/steering` to sync these with the codebase.

## Code Style

- TypeScript strict mode, no `any`.
- Biome for formatting and linting.
- Files use kebab-case. Types and interfaces use PascalCase.
- Code and comments in English.
