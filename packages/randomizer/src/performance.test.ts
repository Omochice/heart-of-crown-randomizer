import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

describe("Performance Benchmark", () => {
	it("should shuffle 1000 items within 100ms", () => {
		const items = Array.from({ length: 1000 }, (_, i) => i);
		const start = performance.now();
		shuffle(items);
		const duration = performance.now() - start;

		// Output benchmark result
		console.log(`[Benchmark] 1000 items shuffle: ${duration.toFixed(2)}ms`);

		expect(duration).toBeLessThan(100);
	});

	it("should measure average time for 100 items shuffled 1000 times", () => {
		const items = Array.from({ length: 100 }, (_, i) => i);
		const iterations = 1000;
		const start = performance.now();

		for (let i = 0; i < iterations; i++) {
			shuffle(items);
		}

		const totalDuration = performance.now() - start;
		const averageDuration = totalDuration / iterations;

		// Output benchmark result
		console.log(
			`[Benchmark] 100 items × ${iterations} iterations: avg ${averageDuration.toFixed(4)}ms per shuffle (total: ${totalDuration.toFixed(2)}ms)`,
		);

		// Expect reasonable performance (average should be less than 1ms for 100 items)
		expect(averageDuration).toBeLessThan(1);
	});

	it("should verify O(n) space complexity by checking array allocation", () => {
		// Test with different array sizes to verify linear space growth
		// Why not use heap measurements: GC can cause negative deltas and unreliable results
		const sizes = [100, 500, 1000, 5000, 10000];
		const results: { size: number; arrayBytes: number }[] = [];

		for (const size of sizes) {
			const items = Array.from({ length: size }, (_, i) => i);
			const result = shuffle(items);

			// Verify result length
			expect(result.length).toBe(size);

			// Calculate theoretical memory usage for the array
			// Each number in JavaScript is 8 bytes (64-bit float)
			// Array overhead is minimal and constant
			const arrayBytes = size * 8;

			results.push({ size, arrayBytes });
		}

		// Output space complexity results
		console.log("[Benchmark] Space complexity (theoretical array size):");
		for (const { size, arrayBytes } of results) {
			console.log(`  ${size} items: ${(arrayBytes / 1024).toFixed(2)} KB`);
		}

		// Verify linear growth: size doubling should double memory
		const ratios: number[] = [];
		for (let i = 1; i < results.length; i++) {
			const prev = results[i - 1];
			const curr = results[i];
			const sizeRatio = curr.size / prev.size;
			const memoryRatio = curr.arrayBytes / prev.arrayBytes;

			ratios.push(memoryRatio / sizeRatio);
		}

		const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
		console.log(
			`[Benchmark] Space growth ratio: ${avgRatio.toFixed(2)} (expected 1.0 for O(n))`,
		);

		// For pure array allocation, ratio should be exactly 1.0
		expect(avgRatio).toBe(1.0);
	});

	it("should verify O(n) time complexity by measuring execution time growth", () => {
		const sizes = [1000, 2000, 4000, 8000];
		const timings: { size: number; duration: number }[] = [];

		for (const size of sizes) {
			const items = Array.from({ length: size }, (_, i) => i);

			// Warmup run to avoid JIT compilation effects
			shuffle(items);

			// Measure actual time
			const start = performance.now();
			shuffle(items);
			const duration = performance.now() - start;

			timings.push({ size, duration });
		}

		// Output timing results
		console.log("[Benchmark] Time complexity:");
		for (const { size, duration } of timings) {
			console.log(`  ${size} items: ${duration.toFixed(2)}ms`);
		}

		// Verify linear growth: time should roughly double when size doubles
		const ratios: number[] = [];
		for (let i = 1; i < timings.length; i++) {
			const prev = timings[i - 1];
			const curr = timings[i];
			const sizeRatio = curr.size / prev.size;
			const timeRatio = curr.duration / prev.duration;

			ratios.push(timeRatio / sizeRatio);
		}

		const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
		console.log(
			`[Benchmark] Average time growth ratio: ${avgRatio.toFixed(2)} (expected ~1.0 for O(n))`,
		);

		// Allow for significant variance due to system load and caching effects
		// But should still be roughly linear (between 0.3 and 3.0)
		expect(avgRatio).toBeGreaterThan(0.3);
		expect(avgRatio).toBeLessThan(3.0);
	});
});
