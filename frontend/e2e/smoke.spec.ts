import { test, expect } from '@playwright/test';

test.describe('Storefront UI Validation', () => {
  test('has title or root container check', async ({ page }) => {
    // Basic connectivity / smoke check template
    await page.goto('/');
    await expect(page).toHaveTitle(/.*(e-commerce|Nani's Knitts).*/i);
  });
});
