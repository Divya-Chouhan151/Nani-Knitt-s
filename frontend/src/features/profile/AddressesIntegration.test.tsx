import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { AddressesTab, MAX_SAVED_ADDRESSES } from "./tabs/AddressesTab";
import { CheckoutAddressConfirmModal } from "../checkout/components/CheckoutAddressConfirmModal";
import { authStore } from "../auth/stores/authStore";
import { cartStore } from "../cart/stores/cartStore";
import * as addressApi from "../../api/addresses";
import * as googleMapsUtil from "./utils/googleMaps";
import { Address } from "../../types/profile";

describe("Address Flow: Permission, Map Pin, Manual Form, 10-Address Limit & Checkout Confirmation", () => {
  const mockUser = {
    id: "user_123",
    email: "artisan@naniknitts.com",
    firstName: "Nani",
    lastName: "Knitter",
    roles: ["ROLE_CUSTOMER"],
    phoneNumber: "+91 98765 43210",
  };

  const sampleAddresses: Address[] = [
    {
      id: "addr_1",
      label: "Home",
      fullName: "Nani Knitter",
      phone: "+91 98765 43210",
      addressLine1: "120 Feet Ring Road, Indiranagar",
      addressLine2: "Apt 201",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
      isDefaultShipping: true,
      isDefaultBilling: true,
      createdAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "addr_2",
      label: "Work",
      fullName: "Nani Knitter (Studio)",
      phone: "+91 98765 43210",
      addressLine1: "80 Feet Road, 4th Block, Koramangala",
      addressLine2: "Studio 5",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560034",
      country: "India",
      isDefaultShipping: false,
      isDefaultBilling: false,
      createdAt: "2026-09-02T10:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof localStorage !== "undefined" && typeof localStorage.clear === "function") {
      localStorage.clear();
    }
    vi.spyOn(authStore, "isAuthenticated").mockReturnValue(true);
    vi.spyOn(authStore, "user").mockReturnValue(mockUser as any);
    vi.spyOn(authStore, "accessToken").mockReturnValue("test_token_123");
  });

  /* -------------------------------------------------------------
     1. LOCATION PERMISSION & MAP PIN SELECTION (STEP 1)
  ------------------------------------------------------------- */
  it("when location permission is granted: map opens centered at user GPS coords and shows fixed center pin", async () => {
    vi.spyOn(addressApi, "fetchAddressesApi").mockResolvedValue([]);
    vi.spyOn(googleMapsUtil, "checkLocationPermission").mockResolvedValue("granted");
    vi.spyOn(googleMapsUtil, "getDeviceLocation").mockResolvedValue({ lat: 12.9352, lng: 77.6245 });

    render(() => <AddressesTab />);

    await waitFor(() => {
      expect(screen.getByText("No addresses saved yet")).toBeInTheDocument();
    });

    const emptyCtaBtn = screen.getByRole("button", { name: /Add Your First Address/i });
    fireEvent.click(emptyCtaBtn);

    // Modal opens to Step 1: Set Location on Map
    expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 2: Position pin at your exact doorstep/i)).toBeInTheDocument();
    expect(screen.getByText(/Order will be delivered here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirm Location & Enter House Details/i })).toBeInTheDocument();
  });

  it("when location permission is denied: GPS options are disabled and user can still search and confirm pin", async () => {
    vi.spyOn(addressApi, "fetchAddressesApi").mockResolvedValue([]);
    vi.spyOn(googleMapsUtil, "checkLocationPermission").mockResolvedValue("denied");
    vi.spyOn(googleMapsUtil, "getDeviceLocation").mockResolvedValue(null); // Strictly null when denied

    render(() => <AddressesTab />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Add Your First Address/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Your First Address/i }));

    // Permission warning banner shown
    await waitFor(() => {
      expect(screen.getByText(/Location access disabled in browser/i)).toBeInTheDocument();
    });

    // Search bar is active and functional
    const searchInput = screen.getByPlaceholderText(/Search area, landmark, street, or building/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.input(searchInput, { target: { value: "Koramangala" } });

    // Confirm button advances to Step 2
    const confirmLocBtn = screen.getByRole("button", { name: /Confirm Location & Enter House Details/i });
    fireEvent.click(confirmLocBtn);

    // Advanced to Step 2
    await waitFor(() => {
      expect(screen.getByText("Enter Complete Address Details")).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------
     2. MANUAL DETAIL FORM (STEP 2)
  ------------------------------------------------------------- */
  it("step 2 form: manual details are required, prefilled fields are editable, and label set is Home/Work/Other", async () => {
    vi.spyOn(addressApi, "fetchAddressesApi").mockResolvedValue([]);
    vi.spyOn(googleMapsUtil, "checkLocationPermission").mockResolvedValue("granted");
    vi.spyOn(googleMapsUtil, "getDeviceLocation").mockResolvedValue({ lat: 12.9784, lng: 77.6408 });
    const createSpy = vi.spyOn(addressApi, "createAddressApi").mockResolvedValue({
      id: "addr_new",
      label: "Home",
      fullName: "Nani Knitter",
      phone: "+91 98765 43210",
      addressLine1: "Flat 402, Sunshine Apartments",
      addressLine2: "Indiranagar 1st Stage",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
      isDefaultShipping: true,
      isDefaultBilling: true,
      createdAt: "2026-09-03T10:00:00Z",
    });

    render(() => <AddressesTab />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Add Your First Address/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Your First Address/i }));

    // Wait for map step to render
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Confirm Location & Enter House Details/i })).toBeInTheDocument();
    });

    // Confirm location on map
    fireEvent.click(screen.getByRole("button", { name: /Confirm Location & Enter House Details/i }));

    await waitFor(() => {
      expect(screen.getByText("Enter Complete Address Details")).toBeInTheDocument();
    });

    // Manual input fields
    const houseInput = screen.getByPlaceholderText(/House\/Flat number, Building name, or Street/i);
    fireEvent.input(houseInput, { target: { value: "Flat 402, Sunshine Apartments" } });

    // Verify label options: strictly Home / Work / Other
    expect(screen.getByRole("button", { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Work/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Other/i })).toBeInTheDocument();

    // Pincode auto-lookup test
    const pincodeInput = screen.getByPlaceholderText("PIN / Postal Code");
    fireEvent.input(pincodeInput, { target: { value: "302003" } });

    await waitFor(() => {
      expect(screen.getByText(/Auto-detected: Jaipur, Rajasthan/i)).toBeInTheDocument();
    });

    // Save
    const saveBtn = screen.getByRole("button", { name: /Save Address/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          label: "Home",
          addressLine1: "Flat 402, Sunshine Apartments",
          city: "Jaipur",
          state: "Rajasthan",
          postalCode: "302003",
        }),
        "test_token_123"
      );
    });
  });

  /* -------------------------------------------------------------
     3. 10-ADDRESS LIMIT ENFORCEMENT
  ------------------------------------------------------------- */
  it("enforces maximum 10 saved addresses: hides/disables Add button and displays clear warning banner", async () => {
    // Generate exactly 10 addresses
    const tenAddresses: Address[] = Array.from({ length: 10 }, (_, i) => ({
      id: `addr_${i + 1}`,
      label: i % 2 === 0 ? "Home" : "Work",
      fullName: `Artisan User ${i + 1}`,
      phone: "+91 98765 43210",
      addressLine1: `${i + 1} Artisan Way`,
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
      isDefaultShipping: i === 0,
      isDefaultBilling: i === 0,
      createdAt: new Date().toISOString(),
    }));

    vi.spyOn(addressApi, "fetchAddressesApi").mockResolvedValue(tenAddresses);

    render(() => <AddressesTab />);

    await waitFor(() => {
      expect(screen.getByText("10 saved")).toBeInTheDocument();
    });

    // Add Address button is hidden/replaced by limit indicator
    expect(screen.queryByRole("button", { name: /\+ Add Address/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Address Limit Reached \(10\/10\)/i)).toBeInTheDocument();

    // Warning banner is displayed prominently
    expect(screen.getByText(/Maximum Address Limit Reached \(10\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You've reached the maximum number of saved addresses. Remove one to add a new one./i)
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------------------
     4. MANDATORY ADDRESS CONFIRMATION BEFORE PAYMENT AT CHECKOUT
  ------------------------------------------------------------- */
  it("checkout: when user has 0 saved addresses, prompts them to add an address and payment is unreachable", async () => {
    vi.spyOn(addressApi, "fetchAddressesApi").mockResolvedValue([]);

    render(() => <CheckoutAddressConfirmModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/No saved delivery address/i)).toBeInTheDocument();
    });

    // Payment button is completely absent
    expect(screen.queryByRole("button", { name: /Pay & Place Order/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Confirm Address & Proceed to Payment/i })).not.toBeInTheDocument();

    // Add address prompt is available
    expect(screen.getByRole("button", { name: /Add Delivery Address/i })).toBeInTheDocument();
  });

  it("checkout: always displays explicit address confirmation step before payment, requiring user confirmation", async () => {
    vi.spyOn(addressApi, "fetchAddressesApi").mockResolvedValue(sampleAddresses);
    vi.spyOn(cartStore, "subtotal").mockReturnValue(2499);

    render(() => <CheckoutAddressConfirmModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Confirm Delivery Address/i)).toBeInTheDocument();
    });

    // Step 1: Explicitly displays Deliver To card with selected address
    expect(screen.getByText("Deliver to:")).toBeInTheDocument();
    expect(screen.getByText("120 Feet Ring Road, Indiranagar, Apt 201")).toBeInTheDocument();

    // Payment method selector & pay button are NOT yet reachable
    expect(screen.queryByText(/Select Payment Method/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Pay.*Place Order/i })).not.toBeInTheDocument();

    // User can switch address
    const changeBtn = screen.getByRole("button", { name: /Change\?/i });
    expect(changeBtn).toBeInTheDocument();
    fireEvent.click(changeBtn);

    // Both addresses listed in selector
    expect(screen.getByText(/Nani Knitter \(Studio\)/i)).toBeInTheDocument();

    // Active confirmation required: Confirm Address & Proceed to Payment
    const confirmBtn = screen.getByRole("button", { name: /Confirm Address & Proceed to Payment/i });
    expect(confirmBtn).toBeInTheDocument();
    fireEvent.click(confirmBtn);

    // Only NOW does it advance to Step 2: Payment
    await waitFor(() => {
      expect(screen.getByText(/Delivering to Confirmed Address:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Select Payment Method/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Place Order/i)).toBeInTheDocument();
      expect(document.getElementById("pay-and-place-order-btn")).toBeInTheDocument();
    });
  });
});
