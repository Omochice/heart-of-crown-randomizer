# Technology Stack

## Architecture

Monorepo structure using Turborepo for coordinated builds across packages. Separates card data library from web presentation layer.

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Frontend Framework**: SvelteKit 5 with Svelte 5
- **Styling**: Tailwind CSS 4
- **Runtime**: Node.js 22.18.0+
- **Package Manager**: pnpm 10.26.0
- **Build System**: Turborepo for orchestration

## Key Libraries

- **Build Tools**: unbuild (library), Vite (frontend)
- **Testing**: Vitest for unit tests
- **Component Development**: Storybook for UI component library
- **Code Quality**: Biome for linting/formatting (TypeScript), Prettier for Svelte

## Development Standards

### Type Safety
- TypeScript strict mode enabled
- ESM module system throughout
- Explicit exports with type definitions
- No inferrable types enforced via Biome

### Code Quality
- Biome handles TypeScript linting and formatting
- Prettier handles Svelte file formatting
- Organized imports enforced
- Self-closing elements required
- Single var declarators enforced

### Testing
- Vitest for unit tests with jsdom
- Testing Library for Svelte component tests
- Jest DOM matchers for assertions

## Development Environment

### Required Tools
- Node.js 22.18.0+
- pnpm 10.26.0
- TypeScript 5.9.3

### Common Commands
```bash
# Dev: pnpm dev (from site package)
# Build: pnpm build (Turborepo orchestrated)
# Test: pnpm test
# Format: pnpm fmt
# Check: pnpm check (type-check + lint)
```

## Key Technical Decisions

- **Monorepo separation**: Card data as reusable library, site as consumer - enables potential reuse in other contexts
- **Dual formatting tools**: Biome for TypeScript (faster, stricter), Prettier for Svelte (ecosystem standard)
- **ESM-only**: Modern module system, no CommonJS fallbacks
- **Cloudflare deployment**: Adapter configured for edge deployment
- **Subpath exports**: Granular package exports allow importing specific card sets without loading all data

---
_Document standards and patterns, not every dependency_
