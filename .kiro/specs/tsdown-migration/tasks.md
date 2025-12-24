# Implementation Plan

## Task Overview

This plan implements the migration from unbuild to tsdown for the card package build system. Tasks are organized sequentially with validation checkpoints after each major phase.

## Tasks

- [ ] 1. Install tsdown and create configuration
- [x] 1.1 Add tsdown as development dependency
  - Install latest stable version of tsdown package
  - Update package.json devDependencies section
  - Run pnpm install to update lockfile
  - _Requirements: 1.3_

- [x] 1.2 Create tsdown configuration file with entry points
  - Create tsdown.config.ts in card package root (packages/card/)
  - Define all 10 entry points mapping source files to outputs
  - Configure ESM format with .mjs extension
  - Enable TypeScript declaration generation
  - Set output directory to dist/
  - Disable code splitting to preserve file-per-entry structure
  - Enable clean option to remove dist/ before build
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 3.3_

- [x] 1.3 Validate configuration syntax
  - Verify tsdown.config.ts has no TypeScript compilation errors
  - Confirm entry array contains exactly 10 entries
  - Check configuration matches design specification format
  - _Requirements: 7.1, 7.2_

- [x] 2. Update package.json build configuration
- [x] 2.1 Update build script to use tsdown
  - Change build script from "unbuild" to "tsdown"
  - Verify script requires no additional command-line arguments
  - Confirm clean script still functions (rimraf dist)
  - _Requirements: 1.2, 6.1, 6.3, 6.4_

- [x] 2.2 Remove obsolete dependencies
  - Remove unbuild from devDependencies
  - Remove vite-plugin-dts from devDependencies
  - Run pnpm install to update lockfile and prune packages
  - _Requirements: 1.3, 1.4_

- [ ] 3. Execute initial build and validate outputs
- [ ] 3.1 Run clean build with tsdown
  - Execute pnpm clean to remove existing dist/
  - Run pnpm build from card package directory
  - Verify build completes with exit code 0
  - Check for any build warnings or errors in output
  - _Requirements: 5.3, 6.1_

- [ ] 3.2 Verify output file structure and format
  - Confirm dist/ directory exists with correct structure
  - Verify all 10 .mjs files generated at correct paths
  - Verify all 10 .d.ts files generated at correct paths
  - Check .mjs file extension (not .js)
  - Confirm directory structure mirrors src/ layout
  - Validate no unexpected files in dist/
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2_

- [ ] 3.3 Compare outputs with baseline
  - Compare dist/ directory tree structure with unbuild baseline
  - Verify file count matches (20 files: 10 .mjs + 10 .d.ts)
  - Check that directory nesting depth is preserved
  - _Requirements: 2.4, 2.5_

- [ ] 4. Validate TypeScript declarations and type safety
- [ ] 4.1 Compare declaration file equivalence
  - Diff tsdown-generated .d.ts files with vite-plugin-dts baseline
  - Verify exported types match for all subpath exports
  - Check that type definitions accurately reflect source types
  - _Requirements: 4.2_

- [ ] 4.2 Test TypeScript strict mode compliance
  - Verify build respects tsconfig.json strict mode settings
  - Confirm TypeScript compilation errors fail the build
  - Test that build exits with non-zero code on type errors
  - _Requirements: 4.1, 4.3, 5.4_

- [ ] 4.3 Validate tsconfig.json integration
  - Verify tsdown honors existing TypeScript configuration
  - Check target (ES2020) and module (ESNext) settings respected
  - Confirm no changes needed to tsconfig.json
  - _Requirements: 4.4_

- [ ] 5. Test package consumer integration
- [ ] 5.1 Run site package type-check
  - Execute tsc --noEmit from site package
  - Verify no type errors from card package imports
  - Test namespace imports resolve correctly (Basic.commons)
  - Test type imports resolve correctly (CommonCard)
  - _Requirements: 3.2, 4.2_

- [ ] 5.2 Build and test site package
  - Run pnpm build from site package directory
  - Verify site package build succeeds
  - Execute site package test suite
  - Confirm all tests pass with migrated card package
  - _Requirements: 3.4_

- [ ] 6. Validate Turborepo integration
- [ ] 6.1 Test monorepo build orchestration
  - Run pnpm build from monorepo root
  - Verify Turborepo invokes card package build correctly
  - Confirm build completes successfully
  - Check that outputs are tracked in turbo.json (dist/**)
  - _Requirements: 5.1, 6.2_

- [ ] 6.2 Verify Turborepo caching behavior
  - Run pnpm clean and pnpm build from card package
  - Run pnpm build second time without changes
  - Verify second build uses cache (fast completion)
  - Test incremental build by modifying one source file
  - Confirm only affected outputs rebuild
  - _Requirements: 5.2_

- [ ] 7. Test development workflow compatibility
- [ ] 7.1 Validate check script suite
  - Run pnpm check from card package
  - Verify type-check (tsc --noEmit) succeeds independently
  - Confirm Biome linting succeeds
  - Verify Biome formatting succeeds
  - _Requirements: 8.1, 8.2_

- [ ] 7.2 Verify build non-interference
  - Confirm build does not modify source files in src/
  - Check that tsc --noEmit runs independently of build
  - Verify Biome check runs without build conflicts
  - _Requirements: 8.3_

- [ ] 7.3 Test clean script compatibility
  - Run pnpm clean from card package
  - Verify dist/ directory is removed successfully
  - Confirm no errors during clean operation
  - Check that clean allows subsequent builds
  - _Requirements: 6.4_

