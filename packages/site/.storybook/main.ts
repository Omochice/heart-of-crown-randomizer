import type { StorybookConfig } from "@storybook/sveltekit";

const config = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],
	addons: ["@storybook/addon-svelte-csf", "@storybook/addon-interactions"],
	framework: {
		name: "@storybook/sveltekit",
		options: {},
	},
} as const satisfies StorybookConfig;
export default config;
