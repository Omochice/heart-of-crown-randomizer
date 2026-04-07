import { encodeIds } from "@heart-of-crown-randomizer/id-codec";
import { expect, test } from "@playwright/test";

test.describe("Page URL reactivity", () => {
  test("should render page with heading", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("ハートオブクラウン")).toBeVisible();
    await expect(page.getByText("ランダマイザー")).toBeVisible();
  });

  test("should show randomize button", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: /引き直す/i })).toBeVisible();
  });

  test("should display cards after clicking randomize button", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /引き直す/i }).click();

    const cardLocator = page.getByRole("button", { name: /^カード / });
    await expect(cardLocator.first()).toBeVisible();

    await expect(page).toHaveURL(/[?&]s=/);
  });

  test("should restore cards from URL parameters", async ({ page }) => {
    await page.goto(`/?s=${encodeIds([17, 18, 19])}`);

    const cardLocator = page.getByRole("button", { name: /^カード / });
    await expect(cardLocator).toHaveCount(3);
  });

  test("should update displayed cards on browser back/forward", async ({
    page,
  }) => {
    await page.goto("/");

    const cardLocator = page.getByRole("button", { name: /^カード / });

    await page.getByRole("button", { name: /引き直す/i }).click();
    await expect(cardLocator.first()).toBeVisible();
    const firstUrl = page.url();

    await page.getByRole("button", { name: /引き直す/i }).click();
    await expect(cardLocator.first()).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(firstUrl);
  });

  test("should generate share URL when cards are selected", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /引き直す/i }).click();
    const cardLocator = page.getByRole("button", { name: /^カード / });
    await expect(cardLocator.first()).toBeVisible();

    await expect(page.getByRole("button", { name: /共有/i })).toBeVisible();
  });

  test("should use compressed share URL that restores cards when visited", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /引き直す/i }).click();

    const cardLocator = page.getByRole("button", { name: /^カード / });
    await expect(cardLocator.first()).toBeVisible();
    const cardCount = await cardLocator.count();

    const currentUrl = new URL(page.url());
    const sParam = currentUrl.searchParams.get("s");
    expect(sParam).toBeTruthy();
    expect(sParam?.length).toBeLessThan(30);

    await page.goto(`/?s=${sParam}`);
    await expect(cardLocator).toHaveCount(cardCount);
  });
});
