import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/svelte";
import type { Page } from "@sveltejs/kit";
import type { Writable } from "svelte/store";
import PageComponent from "./+page.svelte";

vi.mock("$app/stores", async () => {
	const { writable } = await import("svelte/store");
	const pageStore = writable({
		url: new URL("http://localhost"),
		params: {},
		route: { id: "/" },
		status: 200,
		error: null,
		data: {},
		form: null,
	});
	return {
		page: pageStore,
		navigating: writable(null),
		updated: writable(false),
	};
});

vi.mock("$app/navigation", () => ({
	goto: vi.fn(),
}));

describe("+page.svelte URL parameter card restoration", () => {
	beforeEach(() => {
		const localStorageMock = {
			getItem: vi.fn(() => null),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		};
		vi.stubGlobal("localStorage", localStorageMock);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should restore Basic cards from URL parameters", async () => {
		const stores = await import("$app/stores");
		const pageStore = stores.page as unknown as Writable<Page>;

		const testUrl = new URL("http://localhost?card=17&card=18&card=19");
		pageStore.set({
			url: testUrl as Page["url"],
			params: {},
			route: { id: "/" },
			status: 200,
			error: null,
			data: {},
			state: {},
			form: null,
		});

		await new Promise((resolve) => setTimeout(resolve, 0));

		const { container } = render(PageComponent);

		await new Promise((resolve) => setTimeout(resolve, 500));

		const cards = container.querySelectorAll(".card-swipeable");
		expect(cards.length).toBe(3);
	});

	it("should restore Far Eastern Border cards from URL parameters", async () => {
		const stores = await import("$app/stores");
		const pageStore = stores.page as unknown as Writable<Page>;

		const testUrl = new URL("http://localhost?card=49&card=50&card=51");
		pageStore.set({
			url: testUrl as Page["url"],
			params: {},
			route: { id: "/" },
			status: 200,
			error: null,
			data: {},
			state: {},
			form: null,
		});

		await new Promise((resolve) => setTimeout(resolve, 0));

		const { container } = render(PageComponent);

		await waitFor(() => {
			const cards = container.querySelectorAll(".card-swipeable");
			expect(cards.length).toBe(3);
		});
	});

	it("should restore mixed Basic and Far Eastern Border cards", async () => {
		const stores = await import("$app/stores");
		const pageStore = stores.page as unknown as Writable<Page>;

		const testUrl = new URL("http://localhost?card=17&card=18&card=49&card=50");
		pageStore.set({
			url: testUrl as Page["url"],
			params: {},
			route: { id: "/" },
			status: 200,
			error: null,
			data: {},
			state: {},
			form: null,
		});

		await new Promise((resolve) => setTimeout(resolve, 0));

		const { container } = render(PageComponent);

		await waitFor(() => {
			const cards = container.querySelectorAll(".card-swipeable");
			expect(cards.length).toBe(4);
		});
	});
});
