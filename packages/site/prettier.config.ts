import type { Config } from "prettier";

const config = {
	useTabs: true,
	singleQuote: false,
	singleAttributePerLine: true,
	bracketSpacing: true,
	endOfLine: "lf",
	semi: true,
	trailingComma: "all",
	printWidth: 100,
	plugins: ["prettier-plugin-svelte"],
	overrides: [
		{
			files: "*.svelte",
			options: {
				parser: "svelte",
			},
		},
	],
} as const satisfies Config;

export default config;
