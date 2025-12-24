# Requirements Document

## Project Description (Input)
use tsdown instead for building card library.

## Introduction

This specification defines the requirements for migrating the `@heart-of-crown-randomizer/card` package build system from unbuild to tsdown. The card library is a TypeScript-based data package with zero runtime dependencies that provides card definitions for the Heart of Crown game randomizer. It uses subpath exports for tree-shaking and produces ESM modules with TypeScript definitions.

The migration aims to maintain build output compatibility while leveraging tsdown's capabilities for TypeScript library bundling.

## Requirements

### Requirement 1: Build Tool Replacement
**Objective:** As a developer, I want to replace unbuild with tsdown as the build tool, so that the card library uses tsdown for compilation.

#### Acceptance Criteria
1. The card package shall use tsdown as the build tool instead of unbuild
2. When executing the build script, the build system shall invoke tsdown
3. The package.json devDependencies shall include tsdown and exclude unbuild
4. The package.json devDependencies shall exclude vite-plugin-dts if tsdown provides equivalent functionality

### Requirement 2: Output Format Compatibility
**Objective:** As a package consumer, I want the build output format to remain compatible, so that existing imports continue to work without changes.

#### Acceptance Criteria
1. The build system shall generate ESM format output files with .mjs extension
2. The build system shall generate TypeScript declaration files with .d.ts extension
3. The build output shall be placed in the dist/ directory
4. When building the package, the build system shall preserve the current directory structure within dist/
5. The build system shall generate output files matching all package.json export paths

### Requirement 3: Subpath Exports Support
**Objective:** As a package consumer, I want all subpath exports to continue working, so that tree-shaking and granular imports remain functional.

#### Acceptance Criteria
1. When importing from the main export path, the build system shall provide dist/index.mjs and dist/index.d.ts
2. When importing from subpath exports, the build system shall provide corresponding .mjs and .d.ts files for each export path
3. The build system shall support the following subpath exports:
   - ./basic (expansion bundle)
   - ./basic/basic, ./basic/common, ./basic/princess, ./basic/rare (individual categories)
   - ./far-eastern-border (expansion bundle)
   - ./far-eastern-border/common, ./far-eastern-border/princess (individual categories)
   - ./type (type definitions)
4. When importing a subpath export, the build system shall not bundle dependencies from other subpaths

### Requirement 4: TypeScript Compatibility
**Objective:** As a developer, I want TypeScript compilation to maintain strict mode compliance, so that type safety is preserved.

#### Acceptance Criteria
1. The build system shall compile TypeScript code with strict mode enabled
2. The build system shall generate type declaration files that accurately reflect source types
3. When TypeScript compilation encounters errors, the build system shall fail with clear error messages
4. The build system shall respect the TypeScript configuration from tsconfig.json or equivalent

### Requirement 5: Monorepo Integration
**Objective:** As a monorepo maintainer, I want the build to integrate with Turborepo orchestration, so that the monorepo build pipeline continues to function.

#### Acceptance Criteria
1. When Turborepo executes the card package build, the build system shall complete successfully
2. The build system shall support incremental builds if Turborepo caching is enabled
3. When the build completes, the build system shall exit with status code 0 on success
4. If the build fails, the build system shall exit with a non-zero status code

### Requirement 6: Build Script Interface
**Objective:** As a developer, I want to execute builds using the existing npm script interface, so that build commands remain unchanged.

#### Acceptance Criteria
1. When executing `pnpm build` from the card package, the build system shall run successfully
2. When executing `pnpm build` from the monorepo root, Turborepo shall invoke the card package build
3. The build script shall not require additional command-line arguments for standard builds
4. When the clean script is executed, the build system shall allow dist/ removal without errors

### Requirement 7: Build Configuration
**Objective:** As a developer, I want tsdown configuration to be maintainable, so that build customization is possible.

#### Acceptance Criteria
1. If tsdown requires configuration, the configuration file shall be placed in the card package root
2. The configuration format shall use TypeScript or JSON format
3. The configuration shall explicitly define entry points for all subpath exports
4. The configuration shall specify ESM output format

### Requirement 8: Development Workflow Compatibility
**Objective:** As a developer, I want development workflow commands to remain functional, so that existing development practices are preserved.

#### Acceptance Criteria
1. When executing type-check script, the build system shall not interfere with tsc --noEmit
2. When executing the check script suite, all validation commands shall complete successfully
3. The build system shall not modify source files in src/ directory
4. When package.json is updated, the build system shall not require reconfiguration unless entry points change

