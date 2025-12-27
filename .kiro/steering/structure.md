# Project Structure

## Organization Philosophy

Package-first monorepo separating concerns by responsibility: data (card definitions), logic (randomizer), and presentation (site). Each package is independently buildable and testable. Tests live alongside source for locality.

## Directory Patterns

### Packages (`/packages/*`)
**Purpose**: Independent npm packages with isolated responsibilities
**Convention**: Each package has own `package.json`, `tsconfig.json`, build config
**Example**:
```
packages/
  card/         # Type definitions + card data exports
  randomizer/   # Pure functions for selection/shuffling
  site/         # SvelteKit app consuming card + randomizer
```

### Package Internal Structure
**Location**: `packages/{package}/src/`
**Purpose**: Source files with co-located tests
**Pattern**:
```
src/
  index.ts            # Main export barrel
  {feature}.ts        # Implementation
  {feature}.test.ts   # Tests for feature
```

### SvelteKit Routes (`packages/site/src/routes/`)
**Location**: `packages/site/src/routes/`
**Purpose**: File-based routing with split test concerns
**Pattern**:
```
routes/
  +page.svelte               # Route component
  page.{concern}.test.ts     # Tests split by concern
                             # (accessibility, reactivity, url-reactivity, etc.)
```

### Card Data Organization (`packages/card/src/`)
**Location**: Organized by edition/rarity
**Purpose**: Typed card definitions grouped by game expansion
**Pattern**:
```
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
- **Test Files**: `{feature}.test.ts` or `{page}.{concern}.test.ts` for split concerns
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
- **randomizer**: Pure functions (no DOM, no state)
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
