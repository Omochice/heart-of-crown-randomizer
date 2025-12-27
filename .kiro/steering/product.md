# Product Overview

A card randomizer tool for the Heart of Crown deck-building game. Provides deterministic, testable card selection with configurable constraints to support balanced game setup.

## Core Capabilities

- **Deterministic Randomization**: Seeded random generation for reproducible card draws
- **Constraint Validation**: Enforce rules like max/min selections, required/forbidden combinations
- **Card Pool Management**: Support for multiple game editions (Basic, Far Eastern Border) with typed card definitions
- **Web Interface**: Interactive SvelteKit site for card selection and sharing
- **Package Reusability**: Separate randomizer and card definition packages for flexible integration

## Target Use Cases

- **Game Setup**: Players randomize market cards for physical Heart of Crown games
- **Testing**: Developers validate randomization logic with consistent, repeatable seeds
- **Extension**: Community adds new card editions by extending typed card definitions
- **Sharing**: URL-based state allows sharing specific randomization configurations

## Value Proposition

Transforms manual card shuffling into deterministic, shareable, and testable process. Separation of randomizer logic from card data enables independent evolution of game mechanics and card pool content.

---
_Focus on patterns and purpose, not exhaustive feature lists_
