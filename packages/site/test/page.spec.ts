import { test, expect } from "@playwright/test";

test.describe("Page URL reactivity", () => {
	test("should render page with heading", async ({ page }) => {
		await page.goto("/");

		await expect(
			page.getByRole("heading", { name: /ハートオブクラウンランダマイザー/i }),
		).toBeVisible();
	});

	test("should show randomize button", async ({ page }) => {
		await page.goto("/");

		await expect(page.getByRole("button", { name: /一般カードを引く/i })).toBeVisible();
	});

	test("should display cards after clicking randomize button", async ({ page }) => {
		await page.goto("/");

		await page.getByRole("button", { name: /一般カードを引く/i }).click();

		const cardLocator = page.getByRole("button", { name: /^カード / });
		await expect(cardLocator.first()).toBeVisible();

		await expect(page).toHaveURL(/card=/);
	});

	test("should restore cards from URL parameters", async ({ page }) => {
		await page.goto("/?card=17&card=18&card=19");

		const cardLocator = page.getByRole("button", { name: /^カード / });
		await expect(cardLocator).toHaveCount(3);
	});

	test("should update displayed cards on browser back/forward", async ({ page }) => {
		await page.goto("/");

		const cardLocator = page.getByRole("button", { name: /^カード / });

		await page.getByRole("button", { name: /一般カードを引く/i }).click();
		await expect(cardLocator.first()).toBeVisible();
		const firstUrl = page.url();

		await page.getByRole("button", { name: /一般カードを引く/i }).click();
		await expect(cardLocator.first()).toBeVisible();

		await page.goBack();
		await expect(page).toHaveURL(firstUrl);
	});

	test("should generate share URL when cards are selected", async ({ page }) => {
		await page.goto("/");

		await page.getByRole("button", { name: /一般カードを引く/i }).click();
		const cardLocator = page.getByRole("button", { name: /^カード / });
		await expect(cardLocator.first()).toBeVisible();

		await expect(page.getByText(/共有URL:/)).toBeVisible();
	});
});
