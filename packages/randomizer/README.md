# @heart-of-crown-randomizer/randomizer

Testable card randomization library with deterministic seeding for the Heart of Crown card game.

## Overview

This package provides pure, testable randomization functions with support for:

- Deterministic randomization with seed values for reproducible results
- Constraint-based card selection (exclude cards by properties, require specific cards)
- Fisher-Yates algorithm for unbiased, O(n) shuffling
- Zero-dependency implementation (only seedrandom for seeded RNG)
- 100% type-safe with full TypeScript support

Perfect for Test-Driven Development workflows where you need predictable randomization for testing.

## Installation

```bash
pnpm add @heart-of-crown-randomizer/randomizer
```

## Quick Start

### Basic Shuffling

```typescript
import { shuffle } from "@heart-of-crown-randomizer/randomizer";

const cards = [1, 2, 3, 4, 5];

// Non-deterministic shuffle (uses Math.random)
const randomShuffled = shuffle(cards);

// Deterministic shuffle (same seed = same result)
const deterministicShuffled = shuffle(cards, 42);
```

### Card Selection

```typescript
import { select } from "@heart-of-crown-randomizer/randomizer";

const allCards = [
    { id: 1, name: "Card A", cost: 3 },
    { id: 2, name: "Card B", cost: 5 },
    { id: 3, name: "Card C", cost: 7 },
];

// Select 2 random cards
const selected = select(allCards, 2);

// Select with seed for deterministic results
const deterministicSelection = select(allCards, 2, { seed: 42 });
```

### Filtering Cards

```typescript
import { filter, filterByIds } from "@heart-of-crown-randomizer/randomizer";

const cards = [
    { id: 1, name: "Card A", cost: 3 },
    { id: 2, name: "Card B", cost: 5 },
    { id: 3, name: "Card C", cost: 7 },
];

// Filter by predicate
const lowCostCards = filter(cards, (card) => card.cost < 5);

// Filter by excluded IDs
const filteredCards = filterByIds(cards, [1, 3]); // Excludes cards with id 1 and 3
```

## API Reference

### `shuffle<T>(items: T[], seed?: number): T[]`

Shuffles array using Fisher-Yates algorithm with optional seed for deterministic results.

Parameters:

- `items` - Array to shuffle (not mutated)
- `seed` - Optional seed for deterministic randomization

Returns: New shuffled array

Throws: `Error` if seed is NaN or Infinity

Example:

```typescript
const cards = [1, 2, 3, 4, 5];
const shuffled = shuffle(cards, 42); // deterministic
const random = shuffle(cards); // non-deterministic
```

### `select<T>(items: T[], count: number, options?: SelectOptions<T>): T[]`

Selects N cards from items with optional constraints.

Parameters:

- `items` - Array of cards to select from
- `count` - Number of cards to select
- `options` - Selection options (seed, constraints)

Returns: Selected cards array

Throws:

- `Error` if seed is invalid (NaN, Infinity)
- `ConstraintConflictError` if required cards are excluded by predicates

Example:

```typescript
const cards = [...allCards];
const selected = select(cards, 10, {
    seed: 42,
    constraints: {
        exclude: [(card) => card.mainType.includes("attack")],
        require: [specificCard],
    },
});
```

### `filter<T>(items: T[], predicate: (item: T) => boolean): T[]`

Filters items by predicate (keeps items where predicate returns true).

Parameters:

- `items` - Array to filter
- `predicate` - Filter function (true = keep)

Returns: New filtered array

Example:

```typescript
const nonAttackCards = filter(
    cards,
    (card) => !card.mainType.includes("attack"),
);
```

### `filterByIds<T extends { id: number }>(items: T[], excludedIds: number[]): T[]`

Filters out items with specified IDs.

Parameters:

- `items` - Array with id property
- `excludedIds` - IDs to exclude

Returns: New filtered array

Example:

```typescript
const filtered = filterByIds(cards, [1, 5, 10]); // excludes cards with id 1, 5, 10
```

### `validateConstraints<T>(constraint: Constraint<T>): void`

Validates constraints for conflicts.

Parameters:

- `constraint` - Constraint to validate

Throws: `ConstraintConflictError` if required cards are excluded by predicates

Example:

```typescript
validateConstraints({
    exclude: [(card) => card.mainType.includes("attack")],
    require: [attackCard], // throws error: required card excluded
});
```

### Types

```typescript
/**
 * Generic predicate type for filtering
 */
type Predicate<T> = (item: T) => boolean;

/**
 * Constraint for select function
 */
type Constraint<T> = {
  exclude?: Predicate<T>[];
  require?: T[];
};

/**
 * Options for select function
 */
type SelectOptions<T> = {
  seed?: number;
  constraints?: Constraint<T>;
};

/**
 * Item with id property (for filterByIds)
 */
type Identifiable = {
  id: number;
};

/**
 * Custom error for constraint conflicts
 */
class ConstraintConflictError<T = unknown> extends Error {
  constructor(message: string, public readonly conflictingItems: T[]);
}
```

## Advanced Usage

### Constraint-Based Selection

Exclude cards by properties:

```typescript
import { select } from "@heart-of-crown-randomizer/randomizer";

const cards = [
    { id: 1, name: "Attack Card", mainType: ["attack"] },
    { id: 2, name: "Defense Card", mainType: ["defense"] },
    { id: 3, name: "Support Card", mainType: ["support"] },
];

// Exclude attack cards
const selected = select(cards, 2, {
    constraints: {
        exclude: [(card) => card.mainType.includes("attack")],
    },
});
// Result: Only defense and support cards
```

Require specific cards:

```typescript
const mustInclude = cards[0]; // Must include this card

const selected = select(cards, 3, {
    constraints: {
        require: [mustInclude],
    },
});
// Result: Always includes mustInclude, plus 2 random cards
```

Combine multiple exclusions (OR logic):

```typescript
const selected = select(cards, 5, {
    constraints: {
        exclude: [
            (card) => card.mainType.includes("attack"),
            (card) => card.cost > 10,
            (card) => card.rarity === "legendary",
        ],
    },
});
// Result: Excludes cards matching ANY exclusion predicate
```

Constraint conflict detection:

```typescript
import {
    select,
    ConstraintConflictError,
} from "@heart-of-crown-randomizer/randomizer";

try {
    const selected = select(cards, 5, {
        constraints: {
            exclude: [(card) => card.mainType.includes("attack")],
            require: [attackCard], // This is an attack card!
        },
    });
} catch (error) {
    if (error instanceof ConstraintConflictError) {
        console.error("Constraint conflict:", error.message);
        console.error("Conflicting items:", error.conflictingItems);
    }
}
```

### Deterministic Testing

Use seeds for reproducible test results:

```typescript
import { describe, it, expect } from "vitest";
import { shuffle, select } from "@heart-of-crown-randomizer/randomizer";

describe("Card Selection", () => {
    it("shuffle with seed is deterministic", () => {
        const cards = [1, 2, 3, 4, 5];
        const result1 = shuffle(cards, 42);
        const result2 = shuffle(cards, 42);
        expect(result1).toEqual(result2); // Always passes
    });

    it("select with seed is deterministic", () => {
        const cards = [1, 2, 3, 4, 5];
        const result1 = select(cards, 3, { seed: 42 });
        const result2 = select(cards, 3, { seed: 42 });
        expect(result1).toEqual(result2); // Always passes
    });

    it("different seeds produce different results", () => {
        const cards = [1, 2, 3, 4, 5];
        const result1 = shuffle(cards, 42);
        const result2 = shuffle(cards, 43);
        expect(result1).not.toEqual(result2); // Different seeds
    });
});
```

### Integration with Card Types

```typescript
import { select } from "@heart-of-crown-randomizer/randomizer";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";

// Combine cards from multiple expansions
const allCommons: CommonCard[] = [
    ...Basic.commons,
    ...FarEasternBorder.commons,
];

// Select 10 random common cards, excluding user's blacklist
const userExcludedIds = [1, 5, 10];
const selected = select(
    allCommons.filter((card) => !userExcludedIds.includes(card.id)),
    10,
    { seed: 42 }, // For deterministic testing
);
```

## TypeScript Support

Full TypeScript support with generics:

```typescript
import { shuffle, select, filter } from "@heart-of-crown-randomizer/randomizer";

type Card = {
    id: number;
    name: string;
    cost: number;
    mainType: string[];
};

const cards: Card[] = [
    { id: 1, name: "Card A", cost: 3, mainType: ["attack"] },
    { id: 2, name: "Card B", cost: 5, mainType: ["defense"] },
];

// Type inference works automatically
const shuffled = shuffle(cards, 42); // shuffled: Card[]
const selected = select(cards, 1); // selected: Card[]
const filtered = filter(cards, (card) => card.cost < 5); // filtered: Card[]
```

Generic constraints:

```typescript
import { filterByIds } from "@heart-of-crown-randomizer/randomizer";
import type { Identifiable } from "@heart-of-crown-randomizer/randomizer";

// filterByIds requires items with id property
type MyItem = Identifiable & {
    name: string;
};

const items: MyItem[] = [
    { id: 1, name: "Item A" },
    { id: 2, name: "Item B" },
];

const filtered = filterByIds(items, [1]); // OK
```

Custom predicates:

```typescript
import type { Predicate } from "@heart-of-crown-randomizer/randomizer";

const isExpensive: Predicate<Card> = (card) => card.cost > 10;
const isAttack: Predicate<Card> = (card) => card.mainType.includes("attack");

const selected = select(cards, 5, {
    constraints: {
        exclude: [isExpensive, isAttack],
    },
});
```

## Performance

Performance benchmarks on a typical development machine:

- 1000 items shuffle: < 100ms (typically ~1-2ms)
- 10,000 items shuffle: < 1s (typically ~10-20ms)
- Time complexity: O(n) for all operations
- Space complexity: O(n) (creates new arrays, does not mutate inputs)

Benchmark results from test suite:

```txt
Performance Benchmark
  ✓ shuffles 1000 items within 100ms (2ms)
  ✓ shuffles 100 items 1000 times (average: 0.015ms per shuffle)
```

All operations are memory-efficient with no unnecessary array allocations.

## License

Zlib

---

Built with ❤️ for the Heart of Crown community.
