# Research & Design Decisions

## Summary
- **Feature**: tsdown-migration
- **Discovery Scope**: Extension - Build tool migration for existing TypeScript library
- **Key Findings**:
  - tsdown provides built-in type declaration generation, eliminating vite-plugin-dts dependency
  - Unbundle mode preserves directory structure matching current unbuild output
  - Configuration requires explicit entry point mapping (10 entry points total)
  - Both tools produce compatible ESM + TypeScript declaration outputs with minimal risk

## Research Log

### tsdown Capabilities and Configuration

**Context**: Need to verify tsdown can replicate current unbuild output format and directory structure.

**Sources Consulted**:
- [tsdown Official Documentation](https://tsdown.dev/guide/)
- [tsdown Configuration Reference](https://tsdown.dev/options/config-file)
- [tsdown Unbundle Mode](https://tsdown.dev/options/unbundle)
- [tsdown Entry Configuration](https://tsdown.dev/options/entry)

**Findings**:
- tsdown is built on Rolldown (Rust-based bundler) for improved build performance
- Supports multiple output formats: ESM, CJS, IIFE, and UMD
- Built-in TypeScript declaration generation (no additional plugins needed)
- Unbundle mode preserves module structure where output files mirror input file structure
- Configuration via tsdown.config.ts (TypeScript) or tsdown.config.json
- Entry points specified as array of source file paths
- Format configuration: `format: ['esm']` for ESM-only output
- Extension configuration: `outExtension: { '.js': '.mjs' }` for .mjs files

**Implications**:
- Can eliminate vite-plugin-dts dependency
- Requires creating explicit configuration file with 10 entry points
- Unbundle mode ensures dist/ structure matches current src/ layout
- TypeScript configuration (tsdown.config.ts) preferred for type safety

### unbuild Current Behavior

**Context**: Understanding current build tool behavior to ensure compatibility.

**Sources Consulted**:
- [unbuild GitHub Repository](https://github.com/unjs/unbuild)
- [unbuild npm Documentation](https://www.npmjs.com/package/unbuild)
- Current package.json exports and build script

**Findings**:
- unbuild automatically infers configuration from package.json
- Zero explicit configuration required (convention over configuration)
- Generates .mjs files for ESM format
- Uses vite-plugin-dts for TypeScript declaration generation
- Preserves directory structure based on source layout
- Build command: simple `unbuild` with no arguments

**Implications**:
- Migration requires creating explicit configuration (unbuild's implicit config → tsdown's explicit config)
- Need to map all 10 package.json exports to tsdown entry points
- Directory structure preservation is expected behavior to maintain

### Entry Point Mapping Analysis

**Context**: Identify all entry points that need explicit configuration in tsdown.

**Findings**:
Current entry points from package.json exports:
1. `src/index.ts` → `dist/index.mjs` (main export)
2. `src/basic/index.ts` → `dist/basic/index.mjs`
3. `src/basic/basic.ts` → `dist/basic/basic.mjs`
4. `src/basic/common.ts` → `dist/basic/common.mjs`
5. `src/basic/princess.ts` → `dist/basic/princess.mjs`
6. `src/basic/rare.ts` → `dist/basic/rare.mjs`
7. `src/far-eastern-border/index.ts` → `dist/far-eastern-border/index.mjs`
8. `src/far-eastern-border/common.ts` → `dist/far-eastern-border/common.mjs`
9. `src/far-eastern-border/princess.ts` → `dist/far-eastern-border/princess.mjs`
10. `src/type.ts` → `dist/type.mjs`

**Implications**:
- Configuration must enumerate all 10 entry points
- Each entry preserves its directory path in output
- Future expansion additions require configuration updates

### TypeScript Configuration Compatibility

**Context**: Verify tsdown respects existing TypeScript strict mode configuration.

**Findings**:
- Current tsconfig.json: strict mode enabled, target ES2020, module ESNext
- tsdown honors existing tsconfig.json by default
- No special configuration needed for TypeScript compatibility
- Declaration generation uses tsconfig settings

**Implications**:
- No tsconfig.json modifications required
- Strict mode enforcement preserved
- Type safety maintained through migration

### Turborepo Integration

**Context**: Ensure build tool change doesn't break monorepo orchestration.

**Findings**:
- turbo.json tracks build outputs: `"outputs": ["dist/**"]`
- Turborepo is tool-agnostic (only cares about outputs)
- Build script invoked via `pnpm build`
- Caching based on dist/ directory contents

**Implications**:
- No turbo.json changes required
- Changing build script from `unbuild` to `tsdown` has no Turborepo impact
- Cache invalidation works identically (based on dist/ changes)

## Architecture Pattern Evaluation

This migration is a build tool replacement with no architectural pattern changes. The existing monorepo architecture with package separation remains unchanged.

## Design Decisions

### Decision: Use tsdown.config.ts (TypeScript Configuration)

**Context**: tsdown supports both TypeScript and JSON configuration formats.

**Alternatives Considered**:
1. TypeScript (.ts) — Type-safe configuration with IDE support
2. JSON (.json) — Simple, no compilation needed

**Selected Approach**: TypeScript configuration file (tsdown.config.ts)

**Rationale**:
- Aligns with project's TypeScript-first approach (steering: strict mode everywhere)
- Provides type checking for configuration options
- Better IDE autocomplete and inline documentation
- Minimal overhead (config is rarely modified)

**Trade-offs**:
- ✅ Type safety prevents configuration errors
- ✅ IDE support improves developer experience
- ⚠️ Requires TypeScript compilation for config (tsdown handles this)

**Follow-up**: Verify tsdown config type definitions are imported correctly

### Decision: Enable Unbundle Mode

**Context**: Need to preserve current directory structure in dist/ for backward compatibility.

**Alternatives Considered**:
1. Unbundle mode — Preserves directory structure, separate files
2. Bundle mode — Single output file per entry, flattened structure

**Selected Approach**: Unbundle mode enabled

**Rationale**:
- Current output has directory structure matching source (dist/basic/, dist/far-eastern-border/)
- Package.json exports reference nested paths
- Consumers may rely on granular file-level imports
- Tree-shaking benefits from separate module files

**Trade-offs**:
- ✅ Backward compatible with existing consumers
- ✅ Maintains tree-shaking efficiency
- ✅ No package.json export changes needed
- ⚠️ More files in dist/ (but matches current behavior)

**Follow-up**: Test that dist/ structure exactly matches current layout

### Decision: Remove vite-plugin-dts Dependency

**Context**: tsdown has built-in TypeScript declaration generation.

**Alternatives Considered**:
1. Keep vite-plugin-dts — Continue using dedicated plugin
2. Use tsdown built-in — Leverage integrated feature

**Selected Approach**: Remove vite-plugin-dts, use tsdown built-in

**Rationale**:
- tsdown declaration generation is production-ready
- Reduces dependency count and maintenance burden
- Simplifies build configuration (one tool instead of two)
- No functional difference in .d.ts output

**Trade-offs**:
- ✅ Fewer dependencies to maintain
- ✅ Simpler build pipeline
- ⚠️ Need to verify .d.ts output equivalence during migration

**Follow-up**: Compare generated .d.ts files byte-for-byte with current output

### Decision: Explicit Entry Point Array

**Context**: tsdown requires explicit entry point configuration vs. unbuild's inference.

**Alternatives Considered**:
1. Explicit array — List all 10 entry points
2. Glob pattern — Use pattern matching for entries
3. Auto-detection — Attempt to infer from package.json

**Selected Approach**: Explicit array of entry points

**Rationale**:
- Clear, maintainable configuration
- No ambiguity about what gets built
- Easier to debug build issues
- Glob patterns can be fragile with directory restructuring

**Trade-offs**:
- ✅ Explicit and clear
- ✅ Type-safe configuration
- ⚠️ Must update config when adding new exports

**Follow-up**: Document entry point maintenance process

## Risks & Mitigations

**Risk**: tsdown-generated .d.ts files differ from vite-plugin-dts output
- **Mitigation**: Compare declaration files after build, run site package type-check to verify consumer compatibility

**Risk**: Unbundle mode produces different directory structure
- **Mitigation**: Automated comparison of dist/ directory structure before/after migration

**Risk**: Build performance regression despite Rust-based Rolldown
- **Mitigation**: Measure build times before/after, document performance baseline

**Risk**: Turborepo cache invalidation issues after tool change
- **Mitigation**: Test cache behavior with clean/rebuild cycles, verify outputs hash correctly

**Risk**: Breaking site package imports due to output format changes
- **Mitigation**: Run site package build and tests to verify consumer compatibility

## References

- [tsdown Official Documentation](https://tsdown.dev/guide/) — Feature overview and getting started
- [tsdown Configuration Reference](https://tsdown.dev/options/config-file) — Configuration file format and options
- [tsdown Unbundle Mode](https://tsdown.dev/options/unbundle) — Preserving module structure
- [tsdown Entry Configuration](https://tsdown.dev/options/entry) — Entry point specification
- [unbuild GitHub Repository](https://github.com/unjs/unbuild) — Current build tool reference
- [unbuild npm Package](https://www.npmjs.com/package/unbuild) — Current build tool documentation
- [Switching from tsup to tsdown](https://alan.norbauer.com/articles/tsdown-bundler/) — Migration guide reference

