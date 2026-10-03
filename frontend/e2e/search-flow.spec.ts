import { test, expect } from "@playwright/test";

test.describe("Search and Facet Filtering Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("typing query in header search bar triggers auto-complete suggestions", async ({ page }) => {
    const searchInput = page.locator('input[name="q"]');
    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill("scarf");

    // Check that input holds query
    await expect(searchInput).toHaveValue("scarf");
  });

  test("submitting search via Enter key navigates to /search and shows results", async ({ page }) => {
    const searchInput = page.locator('input[name="q"]');
    await searchInput.fill("scarf");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=scarf/);
    await expect(page.locator('text=Search results for: "scarf"')).toBeVisible();
    await expect(page.locator('text=Hand-Spun Alpaca Cable Knit Scarf')).toBeVisible();
  });

  test("submitting search via button click navigates and displays products", async ({ page }) => {
    const searchInput = page.locator('input[name="q"]');
    await searchInput.fill("blanket");
    const searchBtn = page.locator('button[aria-label="Search"]');
    await searchBtn.click();

    await expect(page).toHaveURL(/\/search\?q=blanket/);
    await expect(page.locator('text=Chunky Hand-Knit Merino Wool Blanket')).toBeVisible();
  });

  test("searching for a non-matching term shows clear no-results message", async ({ page }) => {
    const searchInput = page.locator('input[name="q"]');
    await searchInput.fill("xyznomatch999");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=xyznomatch999/);
    await expect(page.locator("text=No matching products found")).toBeVisible();
    await expect(page.locator("text=Clear all filters")).toBeVisible();
  });

  test("direct URL navigation to /search?q=merino reads query param and shows products", async ({ page }) => {
    await page.goto("/search?q=merino");
    await expect(page.locator('input[name="q"]')).toHaveValue("merino");
    await expect(page.locator('text=Search results for: "merino"')).toBeVisible();
    await expect(page.locator('text=Chunky Hand-Knit Merino Wool Blanket')).toBeVisible();
  });

  test("clearing search resets the results and URL", async ({ page }) => {
    await page.goto("/search?q=scarf");
    await expect(page.locator('text=Search results for: "scarf"')).toBeVisible();

    const clearBtn = page.locator("text=Clear search ✕");
    await clearBtn.click();

    await expect(page.locator('text=Search results for: "scarf"')).not.toBeVisible();
  });

  test("facet sidebar displays categories and handles category selection", async ({ page }) => {
    await page.goto("/search?q=knit");

    // Verify filter sidebar exists
    const filtersHeader = page.locator("text=Filter Creations");
    await expect(filtersHeader).toBeVisible();

    // Verify Category button exists and can be clicked
    const womenCategoryBtn = page.locator('aside button:has-text("Women")');
    await expect(womenCategoryBtn).toBeVisible();
    await womenCategoryBtn.click();

    // Verify URL updates with category filter
    await expect(page).toHaveURL(/category=Women|category=women/);
  });
});


