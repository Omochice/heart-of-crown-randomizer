import seedrandom from "seedrandom";

/**
 * Creates RNG function (seeded or non-seeded).
 *
 * @param seed - Optional seed value for deterministic randomization
 * @returns Random number generator function (returns values in range [0, 1))
 *
 * @example
 * const rng = createRNG(42);   // deterministic
 * const random = createRNG();  // non-deterministic (Math.random)
 */
export function createRNG(seed?: number): () => number {
	if (seed === undefined) {
		return Math.random;
	}

	return seedrandom(String(seed));
}
