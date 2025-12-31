import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { userEvent } from "@vitest/browser/context";
import Page from "./+page.svelte";

describe("+page.svelte URL change reactivity (Browser Mode)", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should render page component without errors", async () => {
		render(Page);
		await new Promise((resolve) => setTimeout(resolve, 100));

		const heading = screen.getByRole("heading", { name: /ハートオブクラウンランダマイザー/i });
		expect(heading).toBeDefined();
	});

	it("should show randomize button", async () => {
		render(Page);
		await new Promise((resolve) => setTimeout(resolve, 100));

		const button = screen.getByRole("button", { name: /一般カードを引く/i });
		expect(button).toBeDefined();
	});

	it("should be able to click randomize button", async () => {
		render(Page);
		await new Promise((resolve) => setTimeout(resolve, 100));

		const button = screen.getByRole("button", { name: /一般カードを引く/i });
		await userEvent.click(button);
		await new Promise((resolve) => setTimeout(resolve, 200));

		const cards = screen.queryAllByRole("article");
		expect(cards.length).toBeGreaterThan(0);
	});
});
