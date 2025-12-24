# Project Structure

## Organization Philosophy

Monorepo organized by concerns: reusable card data library separate from web application. Package-first structure with clear boundaries.

## Directory Patterns

### Monorepo Workspace (`/packages/`)
**Location**: `/packages/{card,site}/`
**Purpose**: Separate concerns into independently versioned packages
**Example**: `@heart-of-crown-randomizer/card` for data, `@heart-of-crown-randomizer/site` for UI

### Card Data Library (`/packages/card/`)
**Location**: `/packages/card/src/{expansion-name}/`
**Purpose**: Card definitions organized by game expansion
**Example**: `basic/`, `far-eastern-border/` - each contains `common.ts`, `princess.ts`, `rare.ts`

### SvelteKit Site (`/packages/site/`)
**Location**: `/packages/site/src/`
**Purpose**: Standard SvelteKit structure with routes and components
**Example**: `/routes/` for pages, `/lib/` for reusable components

## Naming Conventions

- **Files**: kebab-case for Svelte (`Card.svelte`), lowercase for TypeScript modules
- **Packages**: scoped with `@heart-of-crown-randomizer/` prefix
- **Exports**: expansion names in kebab-case (`far-eastern-border`), categories in lowercase (`basic`, `common`, `princess`)

## Import Organization

```typescript
// Workspace dependencies (card package)
import { Basic, FarEasternBorder } from '@heart-of-crown-randomizer/card'
import type { Card } from '@heart-of-crown-randomizer/card/type'

// Subpath exports for tree-shaking
import { cards } from '@heart-of-crown-randomizer/card/basic/common'
```

**Package Exports**:
- Main: Namespace exports for each expansion
- Subpaths: Granular access to specific card categories
- Types: Dedicated `/type` export for shared interfaces

## Code Organization Principles

- **Package independence**: Card library has zero dependencies, site depends on card
- **Expansion encapsulation**: Each game expansion is self-contained module
- **Category separation**: Cards split by gameplay category (common/rare/princess)
- **Type-first**: TypeScript interfaces defined before implementations
- **Build artifacts**: All compiled output goes to `dist/`, ignored from version control

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
