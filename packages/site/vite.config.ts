/// <reference types="vitest/config" />

import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig, esmExternalRequirePlugin } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		svelteTesting(),
		esmExternalRequirePlugin({
			external: [/^node:/, "crypto"],
			skipDuplicateCheck: true,
		}),
	],
	test: {
		// Default: jsdom for fast unit tests
		environment: "jsdom",
		clearMocks: true,
		include: ["src/**/*.{test,spec}.{js,ts}"],
		exclude: ["**/node_modules/**", "**/dist/**", "**/*.browser.{test,spec}.{js,ts}"],
	},
});
