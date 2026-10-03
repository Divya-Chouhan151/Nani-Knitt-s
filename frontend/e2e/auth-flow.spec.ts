import { test, expect } from '@playwright/test';

test.describe('End-to-End Authentication and Gated Actions Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Guest user is prompted to sign in when clicking Add to Cart on product card', async ({ page }) => {
    // Locate the first Add to Cart button on the catalog grid
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible();

    // Click Add to Cart as an unauthenticated guest
    await addToCartButton.click();

    // Verify Auth Modal appears with authentication requirement message
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(page.locator('text=Authentication Required')).toBeVisible();
    await expect(page.locator('text=Sign in to add')).toBeVisible();
  });

  test('Header Sign In button opens auth modal and allows Master Admin login', async ({ page }) => {
    // Header should show Sign In button
    const headerSignInBtn = page.locator('#header-signin-btn');
    await expect(headerSignInBtn).toBeVisible();
    await headerSignInBtn.click();

    // Modal opens
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click "Quick Fill Master Admin"
    const quickFillBtn = page.locator('button:has-text("Quick Fill Master Admin")');
    await expect(quickFillBtn).toBeVisible();
    await quickFillBtn.click();

    // Submit the form
    const submitBtn = modal.locator('button[type="submit"]');
    await submitBtn.click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Header should now display user menu button with Master Admin profile
    const userMenuBtn = page.locator('#header-user-menu-btn');
    await expect(userMenuBtn).toBeVisible();
    await expect(userMenuBtn.locator('text=Master')).toBeVisible();
    await expect(userMenuBtn.locator('text=ADMIN')).toBeVisible();

    // Click user menu and Sign Out
    await userMenuBtn.click();
    const signOutBtn = page.locator('button:has-text("Sign Out")');
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // User is logged out, header shows Sign In again
    await expect(page.locator('#header-signin-btn')).toBeVisible();
  });

  test('Registration and live DB authentication creates real customer account', async ({ page }) => {
    const headerSignInBtn = page.locator('#header-signin-btn');
    await headerSignInBtn.click();

    // Switch to Create Account tab
    await page.click('button:has-text("Create Account")');

    // Fill registration form with unique email
    const uniqueEmail = `playwright_${Date.now()}@aura.com`;
    await page.fill('#auth-first-name', 'Playwright');
    await page.fill('#auth-last-name', 'Tester');
    await page.fill('#auth-email', uniqueEmail);
    await page.fill('#auth-password', 'Password123!');
    await page.fill('#auth-confirm-password', 'Password123!');

    // Submit registration
    await page.click('button:has-text("Create Account & Continue")');

    // Modal closes and user is logged in
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    const userMenuBtn = page.locator('#header-user-menu-btn');
    await expect(userMenuBtn).toBeVisible();
    await expect(userMenuBtn.locator('text=Playwright')).toBeVisible();
    await expect(userMenuBtn.locator('text=CUSTOMER')).toBeVisible();
  });
});
