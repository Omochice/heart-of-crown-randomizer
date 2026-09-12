# Project Structure

## Organization Philosophy

Package-first monorepo separating concerns by responsibility: data (card definitions), logic (randomizer), and presentation (site). Each package is independently buildable and testable. Tests live alongside source for locality.

## Directory Patterns

### Packages (`/packages/*`)

**Purpose**: Independent npm packages with isolated responsibilities
**Convention**: Each package has own `package.json`, `tsconfig.json`, build config
**Example**:

```text
packages/
  card/                     # Type definitions + card data exports
  constraint/               # Preset constraint rules for card selection
  id-codec/                 # Bitfield-based encode/decode for ID sets
  randomizer/               # Pure functions for selection/shuffling
  rolldown-plugin-dedent/   # Build plugin for dedent tagged templates
  site/                     # SvelteKit app consuming all packages
```

### Package Internal Structure

**Location**: `packages/{package}/src/`
**Purpose**: Source files with co-located tests
**Pattern**:

```text
src/
  index.ts            # Main export barrel
  {feature}.ts        # Implementation
  {feature}.test.ts   # Tests for feature
```

### SvelteKit Routes (`packages/site/src/routes/`)

**Location**: `packages/site/src/routes/`
**Purpose**: File-based routing with split test concerns
**Pattern**:

```text
routes/
  +page.svelte               # Route component
  page.{concern}.test.ts     # Tests split by concern
                             # (accessibility, reactivity, url-reactivity,
                             # debug-mode.e2e, full-flow.e2e, etc.)
```

### Site Components (`packages/site/src/lib/`)

**Location**: `packages/site/src/lib/` (flat, with subfolders for multi-file components)
**Purpose**: Reusable Svelte components, Storybook stories, and tests co-located by component
**Pattern**:

```text
lib/
  Card.svelte                # Component
  Card.stories.svelte        # Storybook story
  Card.svelte.test.ts        # Component test (@testing-library/svelte)
  app-menu/                  # Subfolder when a component has helpers
    AppMenu.svelte
    AppMenu.stories.svelte
    github-issue.ts          # Non-component helper, plain kebab-case
  stores/                    # Svelte 5 runes-based state modules
  utils/                     # Framework-agnostic helper functions
```

### Constraint Rules (`packages/constraint/src/rules/`)

**Location**: `packages/constraint/src/rules/{rule-name}/`
**Purpose**: Each constraint rule is a self-contained module with its own tests
**Pattern**:

```text
rules/
  shared/                    # Common helpers (card-properties, test-helpers)
  {rule-name}/
    index.ts                 # Rule implementation
    index.test.ts            # Unit tests
    index.property.test.ts   # Property-based tests
```

### Card Data Organization (`packages/card/src/`)

**Location**: Organized by edition/rarity
**Purpose**: Typed card definitions grouped by game expansion
**Pattern**:

```text
card/src/
  type.ts                     # Shared type definitions
  basic/
    index.ts                  # Re-exports
    princess.ts               # Princess cards
    common.ts                 # Common cards
    basic.ts / rare.ts        # Basic/rare cards
  far-eastern-border/
    [same structure]
```

## Naming Conventions

- **Files**: kebab-case (`constraint.ts`, `page.reactivity.svelte.test.ts`); Svelte components use PascalCase (`Card.svelte`)
- **Runes State Modules**: `.svelte.ts` suffix for TypeScript files that use Svelte 5 runes outside a component (e.g., `card-state.svelte.ts`) — required by the Svelte compiler, not just convention
- **Test Files**: `{feature}.test.ts`, or `{page}.{concern}.test.ts` for split concerns. Suffix chains signal intent: `.svelte.test.ts` (tests a runes/component module), `.ssr.test.ts` (server-render safety), `.e2e.test.ts` (Vitest full-flow integration, not a browser test)
- **Browser E2E Specs**: Real Playwright specs live outside `src/`, in `packages/site/test/*.spec.ts`, run against a built preview server
- **Packages**: `@heart-of-crown-randomizer/{name}` scoped namespace
- **TypeScript**: Interfaces/types use PascalCase, discriminated unions with lowercase string literals

## Import Organization

### Workspace Imports

```typescript
// Cross-package imports via workspace namespace
import { select } from "@heart-of-crown-randomizer/randomizer";
import { Princess } from "@heart-of-crown-randomizer/card/type";
```

### Relative Imports

```typescript
// Within package, relative paths
import { createRNG } from "./rng";
import type { Identifiable } from "./types";
```

**No Path Aliases**: Project uses explicit relative/absolute imports without `@/` aliases

## Code Organization Principles

### Separation of Concerns

- **card**: Pure data + types (no logic)
- **constraint**: Preset constraint rules depending on card types (no DOM, no state)
- **id-codec**: Bitfield encoding/decoding for ID sets (no dependencies on other packages)
- **randomizer**: Pure functions (no DOM, no state)
- **rolldown-plugin-dedent**: Build-time plugin (dev tooling, not runtime)
- **site**: All UI state, effects, and rendering

### Test Collocation

- Tests live next to implementation (`feature.ts` + `feature.test.ts`)
- Site splits tests by concern to avoid massive test files

### Barrel Exports

- Each package/directory uses `index.ts` to re-export public API
- Fine-grained exports allow tree-shaking (e.g., `/basic/princess` subpath)

### Type-Driven Development

- Types defined before implementation
- Discriminated unions for card categories (`type` field as discriminator)
- Generic functions constrained by `Identifiable` interface

---

_Document patterns, not file trees. New files following patterns shouldn't require updates_
