import { test, expect } from '@playwright/test';

test.describe('User Profile Navigation and Guard Flow', () => {
  test('unauthenticated user visiting /profile sees sign-in prompt and tabs', async ({ page }) => {
    await page.goto('/profile/personal');

    // Should display sign-in required prompt
    await expect(page.locator('text=Sign In Required')).toBeVisible();
    await expect(page.locator('text=Sign In to Your Account')).toBeVisible();

    // Clicking button opens the global AuthModal
    await page.click('text=Sign In to Your Account');
    await expect(page.locator('#auth-email')).toBeVisible();
  });
});
