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
		// TODO: Remove when @sveltejs/adapter-cloudflare integrates esmExternalRequirePlugin internally.
		// Rolldown generates `createRequire(import.meta.url)` for CJS require() calls in SSR builds,
		// but Cloudflare Workers does not provide `import.meta.url`.
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
