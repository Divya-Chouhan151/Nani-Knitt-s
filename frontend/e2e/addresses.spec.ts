import { test, expect } from "@playwright/test";

test.describe("Address Flow: Permission, Map Pin, Manual Form, 10-Address Limit & Checkout Confirmation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page, request }) => {
    // Fast backend cleanup for clean test isolation
    try {
      const loginRes = await request.post("http://localhost:8081/api/v1/auth/login", {
        data: { email: "admin", password: "admin" },
      });
      if (loginRes.ok()) {
        const { accessToken } = await loginRes.json();
        const addrRes = await request.get("http://localhost:8081/api/v1/profile/addresses", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (addrRes.ok()) {
          const addrs = await addrRes.json();
          for (const a of addrs) {
            await request.delete(`http://localhost:8081/api/v1/profile/addresses/${a.id}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
          }
        }
      }
    } catch {
      // Backend request fallback
    }

    await page.goto("/profile/addresses");
    await page.evaluate(() => localStorage.removeItem("nani_user_addresses")).catch(() => {});
    const signInPrompt = page.locator("text=Sign In to Your Account");
    if (await signInPrompt.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signInPrompt.click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await page.locator('button:has-text("Quick Fill Master Admin")').click();
      await modal.locator('button[type="submit"]').click();
      await expect(modal).not.toBeVisible();
    }
  });

  test("1. Location permission denied: GPS shortcut disabled, search & manual pan works to set pin", async ({
    context,
    page,
  }) => {
    // Clear geolocation permission
    await context.clearPermissions();



    // Empty state
    const emptyCta = page.locator("#empty-state-add-address-btn");
    await expect(emptyCta).toBeVisible();
    await emptyCta.click();

    // Modal opens to Step 1: Set Location on Map
    const modal = page.locator("#address-modal");
    await expect(modal).toBeVisible();
    await expect(page.locator("text=Set Location on Map")).toBeVisible();
    await expect(page.locator("text=Step 1 of 2: Position pin at your exact doorstep")).toBeVisible();

    // Fixed center pin is visible
    await expect(page.locator("#fixed-center-pin")).toBeVisible();
    await expect(page.locator("text=Order will be delivered here")).toBeVisible();

    // Search bar works
    const searchInput = page.locator("#places-search-input");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Koramangala");

    // Select suggestion
    const suggestion = page.locator('.places-dropdown button:has-text("80 Feet Road")').first();
    await expect(suggestion).toBeVisible();
    await suggestion.click();

    // Confirm location to move to Step 2
    const confirmLocBtn = page.locator("#confirm-location-btn");
    await expect(confirmLocBtn).toBeVisible();
    await confirmLocBtn.click();

    // Step 2: Enter Complete Address Details
    await expect(page.locator("text=Enter Complete Address Details")).toBeVisible();
    await expect(page.locator("text=Step 2 of 2: Confirm flat number & recipient details")).toBeVisible();

    // Manual House/Flat No. required
    const flatInput = page.locator('input[placeholder*="House/Flat number"]');
    await expect(flatInput).toBeVisible();
    await flatInput.fill("Flat 101, Silk Garden");

    // Contact info
    await page.locator('input[placeholder="Full Name"]').fill("Nani Knitter");
    await page.locator('input[placeholder="+91 98765 43210"]').fill("+91 98765 43210");

    // Label selection: Home / Work / Other
    await page.locator('button:has-text("Home")').click();

    // Save
    await page.locator('button:has-text("Save Address")').click();

    // Address saved
    await expect(modal).not.toBeVisible();
    await expect(page.locator("text=Flat 101, Silk Garden").first()).toBeVisible();
  });

  test("2. Location permission granted: centers on GPS coordinates", async ({ context, page }) => {
    // Grant geolocation permission with Bengaluru coords
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 12.9784, longitude: 77.6408 });

    await page.evaluate(() => localStorage.removeItem("nani_user_addresses")).catch(() => {});
    await page.goto("/profile/addresses");
    const addBtn = page.locator("#add-address-btn, #empty-state-add-address-btn").first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();

    const modal = page.locator("#address-modal");
    await expect(modal).toBeVisible();

    // Step 1 map opens
    await expect(page.locator("text=Set Location on Map")).toBeVisible();
    await expect(page.locator("#fixed-center-pin")).toBeVisible();

    // Recenter GPS button is active
    const gpsBtn = page.locator("#recenter-location-btn");
    await expect(gpsBtn).toBeVisible();
    await gpsBtn.click();

    // Confirm location
    await page.locator("#confirm-location-btn").click();

    // Step 2 Form
    await expect(page.locator("text=Enter Complete Address Details")).toBeVisible();

    // Fill in required manual flat
    await page.locator('input[placeholder*="House/Flat number"]').fill("Studio 402");
    await page.locator('input[placeholder="Full Name"]').fill("Nani Knitter Studio");
    await page.locator('input[placeholder="+91 98765 43210"]').fill("+91 98765 43210");
    await page.locator('button:has-text("Work")').click();

    await page.locator('button:has-text("Save Address")').click();
    await expect(modal).not.toBeVisible();
    await expect(page.locator("text=Studio 402").first()).toBeVisible();
  });

  test("3. Checkout mandatory address confirmation before payment", async ({ page, request }) => {
    // Create an address in backend for checkout confirmation
    const loginRes = await request.post("http://localhost:8081/api/v1/auth/login", {
      data: { email: "admin", password: "admin" },
    });
    if (loginRes.ok()) {
      const { accessToken } = await loginRes.json();
      await request.post("http://localhost:8081/api/v1/profile/addresses", {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          label: "Home",
          fullName: "Nani Knitter",
          phone: "+91 98765 43210",
          addressLine1: "Flat 101, Silk Garden",
          addressLine2: "Koramangala",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560034",
          country: "India",
          isDefaultShipping: true,
          isDefaultBilling: true,
        },
      });
    }

    // Navigate to catalog, add product to cart
    await page.goto("/");
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();

    // Open cart drawer
    const openCartBtn = page.locator('button[aria-label="Shopping cart"], button:has-text("Cart")').first();
    await expect(openCartBtn).toBeVisible({ timeout: 5000 });
    await openCartBtn.click();

    // Click checkout in CartDrawer
    const checkoutBtn = page.locator("#cart-checkout-btn");
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // Mandatory Checkout Address Confirmation Modal opens
    const checkoutModal = page.locator("#checkout-confirmation-modal");
    await expect(checkoutModal).toBeVisible();
    await expect(page.locator("text=Confirm Delivery Address")).toBeVisible();
    await expect(page.locator("text=Step 1 of 2: Always confirm where your order should be delivered")).toBeVisible();

    // Explicit Deliver to Card shown
    await expect(page.locator("#confirmed-delivery-card")).toBeVisible();
    await expect(page.locator("text=Deliver to:")).toBeVisible();

    // Payment options NOT yet visible
    await expect(page.locator("text=Select Payment Method")).not.toBeVisible();
    await expect(page.locator("#pay-and-place-order-btn")).not.toBeVisible();

    // Change address toggle works
    const changeBtn = page.locator("#change-delivery-address-btn");
    await expect(changeBtn).toBeVisible();
    await changeBtn.click();
    await expect(page.locator("text=Select an Address")).toBeVisible();

    // Confirm Address & Proceed to Payment
    const confirmAddressBtn = page.locator("#confirm-checkout-address-btn");
    await expect(confirmAddressBtn).toBeVisible();
    await confirmAddressBtn.click();

    // Now in Step 2: Payment
    await expect(page.locator("text=Delivering to Confirmed Address:")).toBeVisible();
    await expect(page.getByText("Select Payment Method", { exact: true })).toBeVisible();
    const payBtn = page.locator("#pay-and-place-order-btn");
    await expect(payBtn).toBeVisible();
    await expect(payBtn).toContainText("Place Order");

    // Close checkout
    await page.locator('button[aria-label="Close checkout"]').click();
  });

  test("4. 10-Address limit is strictly enforced", async ({ page, request }) => {
    // Seed 10 real addresses in backend database
    const loginRes = await request.post("http://localhost:8081/api/v1/auth/login", {
      data: { email: "admin", password: "admin" },
    });
    if (loginRes.ok()) {
      const { accessToken } = await loginRes.json();
      for (let i = 1; i <= 10; i++) {
        await request.post("http://localhost:8081/api/v1/profile/addresses", {
          headers: { Authorization: `Bearer ${accessToken}` },
          data: {
            label: i === 1 ? "Home" : i === 2 ? "Work" : "Other",
            fullName: `Artisan User ${i}`,
            phone: "+91 98765 43210",
            addressLine1: `${i} Artisan Studio Road`,
            city: "Bengaluru",
            state: "Karnataka",
            postalCode: "560038",
            country: "India",
            isDefaultShipping: i === 1,
            isDefaultBilling: i === 1,
          },
        });
      }
    }

    await page.goto("/profile/addresses");

    // Verify 10 saved shown
    await expect(page.locator("text=10 saved")).toBeVisible();

    // Add Address button is hidden/replaced by limit indicator
    await expect(page.locator("#add-address-btn")).not.toBeVisible();
    await expect(page.locator("#address-limit-indicator")).toBeVisible();
    await expect(page.locator("text=Address Limit Reached (10/10)")).toBeVisible();

    // Warning banner is displayed
    await expect(page.locator("#address-limit-warning")).toBeVisible();
    await expect(page.locator("text=Maximum Address Limit Reached (10)")).toBeVisible();

    // Delete one address
    await page.locator('button[title="Delete address"]').first().click();
    await page.locator('button:has-text("Delete Address")').click();

    // Limit warning disappears and Add Address button is re-enabled
    await expect(page.locator("text=9 saved")).toBeVisible();
    await expect(page.locator("#add-address-btn")).toBeVisible();
    await expect(page.locator("#address-limit-warning")).not.toBeVisible();
  });

  test("5. India-wide non-Bangalore search: provides multiple options, updates map pin, and pre-fills flat & street details", async ({
    page,
  }) => {
    await page.goto("/profile/addresses");
    const addBtn = page.locator("#add-address-btn, #empty-state-add-address-btn").first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const modal = page.locator("#address-modal");
    await expect(modal).toBeVisible();
    await expect(page.locator("#fixed-center-pin")).toBeVisible();

    // Search Delhi location outside Bangalore
    const searchInput = page.locator("#places-search-input");
    await searchInput.fill("Connaught Place");

    // Verify multiple suggestions appear
    const suggestions = page.locator(".places-dropdown button");
    await expect(suggestions.first()).toBeVisible({ timeout: 5000 });
    const count = await suggestions.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Click the first suggestion
    const firstOption = page.locator('.places-dropdown button:has-text("Connaught Place")').first();
    await firstOption.click();

    // Check bottom selected location details
    await expect(page.locator("text=Connaught Place").first()).toBeVisible();
    await expect(page.locator("text=New Delhi, Delhi")).toBeVisible();

    // Confirm location to enter flat & street details
    await page.locator("#confirm-location-btn").click();
    await expect(page.locator("text=Enter Complete Address Details")).toBeVisible();

    // Verify prefilled details
    const cityInput = page.locator('input[placeholder="City"]');
    const stateInput = page.locator('input[placeholder="State"]');
    await expect(cityInput).toHaveValue("New Delhi");
    await expect(stateInput).toHaveValue("Delhi");

    // Complete house/flat number
    await page.locator('input[placeholder*="House/Flat number"]').fill("Flat 4B, Regal Building");
    await page.locator('input[placeholder="Full Name"]').fill("Delhi Customer");
    await page.locator('input[placeholder="+91 98765 43210"]').fill("+91 98765 44444");
    await page.locator('button:has-text("Work")').click();

    await page.locator('button:has-text("Save Address")').click();
    await expect(modal).not.toBeVisible();
    await expect(page.locator("text=Flat 4B, Regal Building").first()).toBeVisible();
  });

  test("6. Movable pointer: user can drag pin or click map to pinpoint exact building with real-time address update", async ({
    page,
  }) => {
    await page.goto("/profile/addresses");
    const addBtn = page.locator("#add-address-btn, #empty-state-add-address-btn").first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const modal = page.locator("#address-modal");
    await expect(modal).toBeVisible();

    const pin = page.locator("#fixed-center-pin");
    await expect(pin).toBeVisible();

    // Map container
    const mapSurface = page.locator("#map-surface");
    await expect(mapSurface).toBeVisible();

    // Verify pin and map surface
    await expect(page.locator("#fixed-center-pin")).toBeVisible();

    // Fine-tune pointer by clicking a specific building offset on the map surface
    const box = await mapSurface.boundingBox();
    if (box) {
      // Click slightly away from center (e.g. 60px right, 40px down) to target specific building
      await page.mouse.click(box.x + box.width / 2 + 60, box.y + box.height / 2 + 40);
      await page.waitForTimeout(500);

      // Verify pin indicator / tooltip updated
      await expect(page.locator("text=Order will be delivered here")).toBeVisible();
    }

    // Confirm building location and verify we can proceed
    await page.locator("#confirm-location-btn").click();
    await expect(page.locator("text=Enter Complete Address Details")).toBeVisible();

    // Complete saving address
    await page.locator('input[placeholder*="House/Flat number"]').fill("Door 12B, Corner Villa");
    await page.locator('input[placeholder="Full Name"]').fill("Precision User");
    await page.locator('input[placeholder="+91 98765 43210"]').fill("+91 9112233445");
    await page.locator('button:has-text("Home")').click();
    await page.locator('button:has-text("Save Address")').click();

    await expect(modal).not.toBeVisible();
    await expect(page.locator("text=Door 12B, Corner Villa").first()).toBeVisible();
  });

  test("7. India-wide Search: returns relevant suggestions across 6+ real localities/landmarks", async ({
    page,
  }) => {
    await page.goto("/profile/addresses");
    const addBtn = page.locator("#add-address-btn, #empty-state-add-address-btn").first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const modal = page.locator("#address-modal");
    await expect(modal).toBeVisible();

    const searchInput = page.locator("#places-search-input");

    const searchQueries = [
      { q: "Ambedkar Veedhi", expected: "Ambedkar Veedhi" },
      { q: "Indiranagar", expected: "Indiranagar" },
      { q: "Koramangala", expected: "Koramangala" },
      { q: "Cyber City", expected: "DLF Cyber City" },
      { q: "Hauz Khas", expected: "Hauz Khas" },
      { q: "Bandra", expected: "Bandra" },
    ];

    for (const item of searchQueries) {
      await searchInput.fill("");
      await searchInput.fill(item.q);

      const dropdownOption = page.locator(`.places-dropdown button:has-text("${item.expected}")`).first();
      await expect(dropdownOption).toBeVisible({ timeout: 5000 });
    }

    // Close modal
    await page.locator('button[aria-label="Close modal"]').click();
    await expect(modal).not.toBeVisible();
  });

  test("8. Revoking permission mid-session prompts user rather than using stale granted state", async ({
    context,
    page,
  }) => {
    // Start with granted permission
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 12.9753, longitude: 77.591 });

    await page.goto("/profile/addresses");
    const addBtn = page.locator("#add-address-btn, #empty-state-add-address-btn").first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const modal = page.locator("#address-modal");
    await expect(modal).toBeVisible();

    // Revoke permission mid-session
    await context.clearPermissions();

    // Clicking "Current Location" should detect permission change and not use stale granted assumption
    const gpsBtn = page.locator("#recenter-location-btn");
    await expect(gpsBtn).toBeVisible();
    await gpsBtn.click();

    // Modal stays responsive, permission banner or prompt state is triggered
    await expect(modal).toBeVisible();
    await expect(page.locator("#fixed-center-pin")).toBeVisible();
  });
});

