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
  +layout.svelte             # Root layout (Tailwind CSS import, children render)
  +page.svelte               # Route component
  page.{concern}.test.ts     # Tests split by concern
                             # (accessibility, reactivity, url-reactivity, etc.)
  page.{concern}.e2e.test.ts # e2e concern tests (run via Vitest browser mode)
```

### Site Components and State (`packages/site/src/lib/`)

**Location**: `packages/site/src/lib/`
**Purpose**: Reusable UI components, shared reactive state, and utility functions
**Pattern**:

```text
lib/
  {Component}.svelte          # UI component
  {Component}.stories.svelte  # Storybook story
  {Component}.svelte.test.ts  # Component tests
  {feature}/                  # Sub-feature directory (e.g., app-menu/)
    {Feature}.svelte
    {Feature}.svelte.test.ts
  stores/                     # Svelte 5 reactive state modules
    {name}.svelte.ts          # Shared state using $state() runes
    {name}.svelte.test.ts
  utils/                      # Pure helper functions
    {name}.ts
    {name}.test.ts
```

### E2E Tests (`packages/site/test/`)

**Location**: `packages/site/test/`
**Purpose**: Playwright end-to-end tests against the built/previewed site
**Pattern**: Single `page.spec.ts` (or more files) run via `playwright.config.ts`; distinct from Vitest unit tests in `src/`

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

- **Files**: kebab-case (`constraint.ts`, `page.reactivity.test.ts`)
- **Svelte Components**: PascalCase (`Card.svelte`, `CardDetail.svelte`)
- **Svelte Rune Files**: `.svelte.ts` suffix for non-component files that use Svelte 5 runes (`card-state.svelte.ts`)
- **Test Files**: `{feature}.test.ts` for pure TS; `{name}.svelte.test.ts` for Svelte/rune files; `{page}.{concern}.test.ts` for split route concerns
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
