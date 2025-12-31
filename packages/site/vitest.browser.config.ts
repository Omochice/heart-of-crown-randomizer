/// <reference types="vitest/config" />

import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), svelteTesting()],
	test: {
		browser: {
			enabled: true,
			name: "chromium",
			headless: true,
		},
		include: ["src/**/*.browser.{test,spec}.{js,ts}"],
	},
});
