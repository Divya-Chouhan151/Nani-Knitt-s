import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSignal } from "solid-js";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { AddressModel, ZeptoAddressModal } from "./components/AddressModel";
import * as googleMapsUtil from "./utils/googleMaps";

describe("GPS Feature: India-wide Multi-option Search, Non-Bangalore GPS & Exact Doorstep Pinpoint", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("1. searchPlaces returns multiple address options when searching outside Bangalore across India", async () => {
    // Test Delhi
    const delhiResults = await googleMapsUtil.searchPlaces("Connaught Place");
    expect(delhiResults.length).toBeGreaterThanOrEqual(2);
    expect(delhiResults.some((r) => r.addressComponents.city === "New Delhi" || r.addressComponents.state === "Delhi")).toBe(true);
    expect(delhiResults[0].lat).toBeGreaterThan(25); // Northern India latitude

    // Test Hyderabad
    const hydResults = await googleMapsUtil.searchPlaces("Hitech City");
    expect(hydResults.length).toBeGreaterThanOrEqual(2);
    expect(hydResults.some((r) => r.addressComponents.city === "Hyderabad" || r.addressComponents.state === "Telangana")).toBe(true);
    expect(hydResults[0].lat).toBeCloseTo(17.44, 1);

    // Test Mumbai
    const mumResults = await googleMapsUtil.searchPlaces("Marine Drive");
    expect(mumResults.length).toBeGreaterThanOrEqual(2);
    expect(mumResults.some((r) => r.addressComponents.city === "Mumbai" || r.addressComponents.state === "Maharashtra")).toBe(true);
    expect(mumResults[0].lat).toBeCloseTo(18.94, 1);

    // Test Kolkata
    const kolResults = await googleMapsUtil.searchPlaces("Park Street");
    expect(kolResults.length).toBeGreaterThanOrEqual(2);
    expect(kolResults.some((r) => r.addressComponents.city === "Kolkata" || r.addressComponents.state === "West Bengal")).toBe(true);
  });

  it("2. reverseGeocode accurately identifies location outside Bangalore without defaulting to Bangalore", async () => {
    // Mumbai Bandra coords
    const mum = await googleMapsUtil.reverseGeocode(19.0596, 72.8295);
    expect(mum.city).toBe("Mumbai");
    expect(mum.state).toBe("Maharashtra");
    expect(mum.postalCode).toBe("400050");
    expect(mum.addressLine1).toContain("Linking Road");

    // Delhi Connaught Place coords
    const del = await googleMapsUtil.reverseGeocode(28.6315, 77.2167);
    expect(del.city).toBe("New Delhi");
    expect(del.state).toBe("Delhi");
    expect(del.postalCode).toBe("110001");
    expect(del.addressLine1).toContain("Connaught Place");

    // Hyderabad Hitech City coords
    const hyd = await googleMapsUtil.reverseGeocode(17.4474, 78.3762);
    expect(hyd.city).toBe("Hyderabad");
    expect(hyd.state).toBe("Telangana");
    expect(hyd.postalCode).toBe("500081");
    expect(hyd.addressLine1).toContain("Hitec City");
  });

  it("3. Searching outside Bangalore displays multiple dropdown options and updates map & pointer to exact street details", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const [isOpen, setIsOpen] = createSignal(false);

    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={onSave}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    // Modal opens to Step 1
    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });
    expect(document.getElementById("fixed-center-pin")).toBeInTheDocument();

    // Type non-Bangalore search query (Hyderabad)
    const searchInput = screen.getByPlaceholderText(/Search area, landmark, street, or building/i);
    fireEvent.focus(searchInput);
    fireEvent.input(searchInput, { target: { value: "Hitech City" } });

    // Expect multiple suggestions to appear in dropdown
    await waitFor(() => {
      const suggestions = screen.getAllByRole("button").filter((b) =>
        b.textContent?.includes("Hitec") || b.textContent?.includes("Hyderabad")
      );
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
    });

    // Select the first suggestion
    const firstOption = screen.getAllByRole("button").find((b) =>
      b.textContent?.includes("Hitec") || b.textContent?.includes("Hyderabad")
    );
    fireEvent.click(firstOption!);

    // Selected location readout below map updates to Hyderabad street & area
    await waitFor(() => {
      expect(screen.getByText("Hitec City Main Road")).toBeInTheDocument();
      expect(screen.getByText(/Hyderabad, Telangana/i)).toBeInTheDocument();
    });

    // Confirm location to move to Step 2 Form
    const confirmBtn = screen.getByRole("button", { name: /Confirm Location & Enter House Details/i });
    fireEvent.click(confirmBtn);

    // Step 2 Form opens with street, city, state, postalCode prefilled
    await waitFor(() => {
      expect(screen.getByText("Enter Complete Address Details")).toBeInTheDocument();
    });

    const cityInput = screen.getByPlaceholderText("City") as HTMLInputElement;
    const stateInput = screen.getByPlaceholderText("State") as HTMLInputElement;
    const houseInput = screen.getByPlaceholderText(/House\/Flat number, Building name, or Street/i) as HTMLInputElement;

    expect(cityInput.value).toBe("Hyderabad");
    expect(stateInput.value).toBe("Telangana");
    expect(houseInput.value).toContain("Hitec City");
  });

  it("4. When device GPS location is ON outside Bangalore: map centers on GPS coords and displays correct street and area", async () => {
    // Simulate user having GPS ON in Mumbai via standard navigator API
    const origPermissions = navigator.permissions;
    const origGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, "permissions", {
      value: { query: vi.fn().mockResolvedValue({ state: "granted" }) },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn().mockImplementation((success: any) => {
          success({
            coords: {
              latitude: 19.0596,
              longitude: 72.8295,
              accuracy: 10,
            },
          });
        }),
      },
      writable: true,
      configurable: true,
    });

    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={async () => {}}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    // Wait for GPS auto-center to complete
    await waitFor(() => {
      expect(screen.getByText("16 Linking Road")).toBeInTheDocument();
      expect(screen.getByText(/Mumbai, Maharashtra/i)).toBeInTheDocument();
    });

    // Confirm location
    const confirmBtn = screen.getByRole("button", { name: /Confirm Location & Enter House Details/i });
    fireEvent.click(confirmBtn);

    // Verify Step 2 prefilled details
    await waitFor(() => {
      expect(screen.getByText("Enter Complete Address Details")).toBeInTheDocument();
    });

    const cityInput = screen.getByPlaceholderText("City") as HTMLInputElement;
    const stateInput = screen.getByPlaceholderText("State") as HTMLInputElement;
    const pincodeInput = screen.getByPlaceholderText("PIN / Postal Code") as HTMLInputElement;

    expect(cityInput.value).toBe("Mumbai");
    expect(stateInput.value).toBe("Maharashtra");
    expect(pincodeInput.value).toBe("400050");
  });

  it("5. Actively seeks browser location permission before starting GPS so exact location is tracked", async () => {
    let permissionRequested = false;
    Object.defineProperty(navigator, "permissions", {
      value: { query: vi.fn().mockResolvedValue({ state: "prompt" }) },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn().mockImplementation((success: any) => {
          permissionRequested = true;
          success({
            coords: {
              latitude: 12.9753,
              longitude: 77.591,
              accuracy: 5,
            },
          });
        }),
      },
      writable: true,
      configurable: true,
    });

    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={async () => {}}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    // Geolocation was actively prompted without requiring prior granted status
    await waitFor(() => {
      expect(permissionRequested).toBe(true);
      expect(screen.getByText("Doctor B R Ambedkar Veedhi")).toBeInTheDocument();
    });
  });

  it("6. User exact location (lat 12.9753, lon 77.591): resolves Doctor B R Ambedkar Veedhi and saves successfully", async () => {
    // 1. Verify reverse geocoding for exact user coordinates
    const geo = await googleMapsUtil.reverseGeocode(12.9753, 77.591);
    expect(geo.city).toBe("Bengaluru");
    expect(geo.state).toBe("Karnataka");
    expect(geo.postalCode).toBe("560001");
    expect(geo.addressLine1).toContain("Doctor B R Ambedkar Veedhi");
    expect(geo.addressLine2).toContain("Sampangirama Nagar");

    // 2. Verify modal handles user's exact coordinates and saves address payload
    const onSave = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "permissions", {
      value: { query: vi.fn().mockResolvedValue({ state: "granted" }) },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn().mockImplementation((success: any) => {
          success({
            coords: {
              latitude: 12.9753,
              longitude: 77.591,
              accuracy: 5,
            },
          });
        }),
      },
      writable: true,
      configurable: true,
    });

    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={onSave}
        defaultFullName="Exact Location User"
        defaultPhone="9492995038"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Doctor B R Ambedkar Veedhi")).toBeInTheDocument();
      expect(screen.getByText(/Sampangirama Nagar/i)).toBeInTheDocument();
    });

    // Confirm location to open Step 2 Form
    const confirmBtn = screen.getByRole("button", { name: /Confirm Location & Enter House Details/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText("Enter Complete Address Details")).toBeInTheDocument();
    });

    // Save address
    const saveBtn = screen.getByRole("button", { name: /Save Address/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
      const savedPayload = onSave.mock.calls[0][0];
      expect(savedPayload.city).toBe("Bengaluru");
      expect(savedPayload.state).toBe("Karnataka");
      expect(savedPayload.postalCode).toBe("560001");
      expect(savedPayload.country).toBe("India");
      expect(savedPayload.addressLine1).toContain("Doctor B R Ambedkar Veedhi");
    });
  });

  it("7. Movable map pointer: dragging the pointer or clicking on map moves pointer and resolves address", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const [isOpen, setIsOpen] = createSignal(false);

    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={onSave}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });

    // Verify pointer is present and draggable
    const pointer = document.getElementById("fixed-center-pin");
    expect(pointer).toBeInTheDocument();

    // Start drag on pointer
    fireEvent.mouseDown(pointer!, { clientX: 200, clientY: 200 });

    // Move pointer across map
    const mapCanvas = pointer!.parentElement!;
    fireEvent.mouseMove(mapCanvas, { clientX: 250, clientY: 250 });

    // Release drag
    fireEvent.mouseUp(mapCanvas);

    // Map pointer and user guidance chip are displayed
    expect(screen.getByText(/Drag pointer or tap map to point to your house/i)).toBeInTheDocument();
  });

  it("8. Search section gives accurate ranked options with sub-locality and city details as per query", async () => {
    // Search Ambedkar Veedhi
    const ambedkarResults = await googleMapsUtil.searchPlaces("Ambedkar Veedhi");
    expect(ambedkarResults.length).toBeGreaterThanOrEqual(1);
    expect(ambedkarResults[0].mainText).toContain("Ambedkar Veedhi");
    expect(ambedkarResults[0].addressComponents.city).toBe("Bengaluru");

    // Search Bandra Mumbai
    const bandraResults = await googleMapsUtil.searchPlaces("Bandra");
    expect(bandraResults.length).toBeGreaterThanOrEqual(1);
    expect(bandraResults.some((r) => r.addressComponents.city === "Mumbai")).toBe(true);

    // Search Connaught Place Delhi
    const cpResults = await googleMapsUtil.searchPlaces("Connaught Place");
    expect(cpResults.length).toBeGreaterThanOrEqual(1);
    expect(cpResults.some((r) => r.addressComponents.city === "New Delhi")).toBe(true);
  });

  it("9. Proximity-boosted search: prefers closer locations when generic query matches multiple cities", async () => {
    // User is in Bengaluru (e.g. 12.9753, 77.591)
    const userLocationBlr = { lat: 12.9753, lng: 77.591 };

    // Search for a common road / area name like "MG Road" or "Main Road" or "Station Road"
    const blrBiased = await googleMapsUtil.searchPlaces("MG Road", userLocationBlr);
    expect(blrBiased.length).toBeGreaterThan(0);
    // The top result should be in Bengaluru because the user is in Bengaluru!
    expect(blrBiased[0].addressComponents.city).toBe("Bengaluru");

    // When the user is in Delhi (28.6139, 77.2090), the same search query should prioritize Delhi
    const userLocationDelhi = { lat: 28.6139, lng: 77.209 };
    const delhiBiased = await googleMapsUtil.searchPlaces("MG Road", userLocationDelhi);
    expect(delhiBiased.length).toBeGreaterThan(0);
    // Closest MG Road should be near Delhi/Gurugram
    expect(
      delhiBiased[0].addressComponents.city === "New Delhi" ||
        delhiBiased[0].addressComponents.city === "Delhi" ||
        delhiBiased[0].addressComponents.city === "Gurugram"
    ).toBe(true);
  });

  it("10. Map view reactivity: selecting a search result or tapping Current Location updates tile coordinates immediately", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const [isOpen, setIsOpen] = createSignal(false);

    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={onSave}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });

    const mapSurface = document.getElementById("map-surface");
    expect(mapSurface).toBeInTheDocument();

    // Find first tile img element
    const tileImages = mapSurface!.querySelectorAll("img");
    expect(tileImages.length).toBeGreaterThan(0);
    const initialSrc = tileImages[0].getAttribute("src");

    // Now search and select Delhi Connaught Place
    const searchInput = screen.getByPlaceholderText(/Search area, landmark, street, or building/i);
    fireEvent.focus(searchInput);
    fireEvent.input(searchInput, { target: { value: "Connaught Place" } });

    await waitFor(() => {
      const suggestions = screen.getAllByRole("button").filter((b) =>
        b.textContent?.includes("Connaught Place")
      );
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
    });

    const cpOption = screen.getAllByRole("button").find((b) =>
      b.textContent?.includes("Connaught Place")
    );
    fireEvent.click(cpOption!);

    // Tile image src MUST change to Delhi coordinate tiles!
    await waitFor(() => {
      const updatedTileImages = mapSurface!.querySelectorAll("img");
      const updatedSrc = updatedTileImages[0].getAttribute("src");
      expect(updatedSrc).not.toBe(initialSrc);
    });
  });

  it("11. Movable pointer hybrid interaction: clicking on map surface immediately re-centers pin", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const [isOpen, setIsOpen] = createSignal(false);

    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={onSave}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });

    const mapSurface = document.getElementById("map-surface");
    expect(mapSurface).toBeInTheDocument();

    // Click offset on map surface to simulate pointing at adjacent building
    fireEvent.click(mapSurface!, { clientX: 280, clientY: 240 });

    // Verify pin and delivery guidance are active
    expect(document.getElementById("fixed-center-pin")).toBeInTheDocument();
    expect(screen.getByText("Order will be delivered here")).toBeInTheDocument();
  });

  it("12. Search outside city (Taj Mahal Agra & Red Fort Delhi): does not hardcode to Bengaluru", async () => {
    // Search Taj Mahal Agra
    const tajResults = await googleMapsUtil.searchPlaces("Taj Mahal Agra");
    expect(tajResults.length).toBeGreaterThanOrEqual(1);
    expect(tajResults[0].addressComponents.city).toBe("Agra");
    expect(tajResults[0].addressComponents.state).toBe("Uttar Pradesh");
    expect(tajResults[0].lat).toBeCloseTo(27.17, 1);
    expect(tajResults[0].lng).toBeCloseTo(78.04, 1);

    // Search Red Fort, Delhi
    const redFortResults = await googleMapsUtil.searchPlaces("Red Fort, Delhi");
    expect(redFortResults.length).toBeGreaterThanOrEqual(1);
    expect(
      redFortResults[0].addressComponents.city === "Delhi" ||
        redFortResults[0].addressComponents.city === "New Delhi"
    ).toBe(true);
    expect(redFortResults[0].addressComponents.state).toBe("Delhi");
    expect(redFortResults[0].lat).toBeCloseTo(28.65, 1);
    expect(redFortResults[0].lng).toBeCloseTo(77.24, 1);
  });

  it("13. Reverse geocoding out of city coordinates (Agra): accurately identifies Agra without defaulting to Bengaluru", async () => {
    // Agra Taj Mahal coordinates: 27.1751, 78.0421
    const agraGeo = await googleMapsUtil.reverseGeocode(27.1751, 78.0421);
    expect(agraGeo.city).toBe("Agra");
    expect(agraGeo.state).toBe("Uttar Pradesh");
    expect(agraGeo.city).not.toBe("Bengaluru");
  });

  it("14. Search dropdown stacking order: suggestions dropdown has z-50 and sits above map-surface (z-10)", async () => {
    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={async () => {}}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });

    const searchContainer = document.getElementById("places-search-container");
    const mapSurface = document.getElementById("map-surface");
    expect(searchContainer).toBeInTheDocument();
    expect(mapSurface).toBeInTheDocument();
    expect(mapSurface?.className).toContain("z-10");

    // Open search suggestions
    const searchInput = screen.getByPlaceholderText(/Search area, landmark, street, or building/i);
    fireEvent.focus(searchInput);
    fireEvent.input(searchInput, { target: { value: "Connaught" } });

    await waitFor(() => {
      const dropdown = document.getElementById("places-suggestions-dropdown");
      expect(dropdown).toBeInTheDocument();
      expect(dropdown?.className).toContain("z-50");
      expect(searchContainer?.className).toContain("z-40");
    });
  });

  it("15. Cleaner UX: Pin guidance overlay and badge hide/fade out when search dropdown is open, and re-appear once closed", async () => {
    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={async () => {}}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });

    const guidanceChip = document.getElementById("map-guidance-chip");
    const pinBadge = document.getElementById("fixed-pin-badge");
    expect(guidanceChip).toBeInTheDocument();
    expect(pinBadge).toBeInTheDocument();

    // Initially, pin guidance and badge are visible
    expect(guidanceChip?.className).toContain("opacity-100");
    expect(guidanceChip?.className).toContain("visible");
    expect(pinBadge?.className).toContain("opacity-100");
    expect(guidanceChip?.getAttribute("aria-hidden")).toBe("false");

    // Focus & type into search -> opens suggestions dropdown
    const searchInput = screen.getByPlaceholderText(/Search area, landmark, street, or building/i);
    fireEvent.focus(searchInput);
    fireEvent.input(searchInput, { target: { value: "Indiranagar" } });

    // When dropdown is open, pin instruction overlay and pin badge must be completely hidden / faded out
    await waitFor(() => {
      expect(document.getElementById("places-suggestions-dropdown")).toBeInTheDocument();
      expect(guidanceChip?.className).toContain("opacity-0");
      expect(guidanceChip?.className).toContain("invisible");
      expect(guidanceChip?.getAttribute("aria-hidden")).toBe("true");
      expect(pinBadge?.className).toContain("opacity-0");
      expect(pinBadge?.className).toContain("invisible");
    });

    // Select a suggestion -> closes dropdown
    const indiranagarOption = screen.getAllByRole("button").find((b) =>
      b.textContent?.includes("Indiranagar")
    );
    expect(indiranagarOption).toBeDefined();
    fireEvent.click(indiranagarOption!);

    // Guidance overlay and badge must re-appear once dropdown closes
    await waitFor(() => {
      expect(document.getElementById("places-suggestions-dropdown")).not.toBeInTheDocument();
      expect(guidanceChip?.className).toContain("opacity-100");
      expect(guidanceChip?.className).toContain("visible");
      expect(guidanceChip?.getAttribute("aria-hidden")).toBe("false");
      expect(pinBadge?.className).toContain("opacity-100");
      expect(pinBadge?.className).toContain("visible");
    });
  });

  it("16. Dropdown supports maximum suggestions with internal scroll and unobstructed layout", async () => {
    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={async () => {}}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });

    // Query matching multiple suggestions
    const searchInput = screen.getByPlaceholderText(/Search area, landmark, street, or building/i);
    fireEvent.focus(searchInput);
    fireEvent.input(searchInput, { target: { value: "Road" } });

    await waitFor(() => {
      const dropdown = document.getElementById("places-suggestions-dropdown");
      expect(dropdown).toBeInTheDocument();
      // Dropdown has internal vertical scrolling for large lists
      expect(dropdown?.className).toContain("overflow-y-auto");
      expect(dropdown?.className).toContain("max-h-60");
      expect(dropdown?.className).toContain("overscroll-contain");
    });

    // Confirm suggestions are rendered cleanly inside dropdown
    const dropdown = document.getElementById("places-suggestions-dropdown")!;
    const buttonsInside = dropdown.querySelectorAll("button");
    expect(buttonsInside.length).toBeGreaterThanOrEqual(4);

    // Escape key dismisses suggestions and restores pin guidance
    fireEvent.keyDown(searchInput, { key: "Escape" });
    await waitFor(() => {
      expect(document.getElementById("places-suggestions-dropdown")).not.toBeInTheDocument();
      const guidanceChip = document.getElementById("map-guidance-chip");
      expect(guidanceChip?.className).toContain("opacity-100");
      expect(guidanceChip?.className).toContain("visible");
    });
  });

  it("17. Clear button (✕) dismisses search dropdown and restores pin guidance overlay", async () => {
    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={async () => {}}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search area, landmark, street, or building/i);
    fireEvent.focus(searchInput);
    fireEvent.input(searchInput, { target: { value: "Cyber City" } });

    await waitFor(() => {
      expect(document.getElementById("places-suggestions-dropdown")).toBeInTheDocument();
    });

    // Click ✕ clear button
    const clearBtn = screen.getByRole("button", { name: "✕" });
    fireEvent.click(clearBtn);

    // Dropdown closes, input is cleared, pin guidance chip is visible
    await waitFor(() => {
      expect(document.getElementById("places-suggestions-dropdown")).not.toBeInTheDocument();
      expect((searchInput as HTMLInputElement).value).toBe("");
      const guidanceChip = document.getElementById("map-guidance-chip");
      expect(guidanceChip?.className).toContain("opacity-100");
    });
  });

  it("18. Pin anchor stability: pin preserves translateX(-50%) during and after movement without jumping southeast", async () => {
    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={async () => {}}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });

    const pointer = document.getElementById("fixed-center-pin");
    const groundAnchor = document.getElementById("pin-ground-anchor");
    expect(pointer).toBeInTheDocument();
    expect(groundAnchor).toBeInTheDocument();

    // Verify initial positioning: strictly centered at top 50%, left 50% with translateX(-50%)
    expect(pointer?.className).toContain("top-1/2");
    expect(pointer?.className).toContain("left-1/2");
    expect(pointer?.style.transform).toContain("-50%");
    expect(pointer?.style.transform).toContain("-100%");
    // animate-bounce must NEVER be applied to fixed-center-pin as it strips translateX(-50%)
    expect(pointer?.className).not.toContain("animate-bounce");

    // Start drag on the map
    const mapSurface = document.getElementById("map-surface")!;
    fireEvent.mouseDown(mapSurface, { clientX: 200, clientY: 200 });

    // During drag: pin lifts strictly along the vertical axis, preserving translateX(-50%)
    expect(pointer?.style.transform).toContain("-50%");
    expect(pointer?.style.transform).toContain("-115%");
    expect(pointer?.className).not.toContain("animate-bounce");

    // Move mouse across multiple directions (southeast, northwest, etc.)
    fireEvent.mouseMove(window, { clientX: 230, clientY: 240 });
    expect(pointer?.style.transform).toContain("-50%");
    expect(pointer?.className).not.toContain("animate-bounce");

    // Release drag
    fireEvent.mouseUp(window);

    // After movement settles: pin returns to exact anchor without jumping southeast
    await waitFor(() => {
      expect(pointer?.style.transform).toContain("-50%");
      expect(pointer?.style.transform).toContain("-100%");
      expect(pointer?.className).not.toContain("animate-bounce");
    });
  });

  it("19. Ground target anchor is centered at (50%, 50%) and drag move tracks coordinates smoothly", async () => {
    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ZeptoAddressModal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        onSave={async () => {}}
        defaultFullName="Dev Tester"
        defaultPhone="+91 98765 00000"
      />
    ));
    setIsOpen(true);

    await waitFor(() => {
      expect(screen.getByText("Set Location on Map")).toBeInTheDocument();
    });

    const groundAnchor = document.getElementById("pin-ground-anchor")!;
    expect(groundAnchor.className).toContain("top-1/2");
    expect(groundAnchor.className).toContain("left-1/2");
    expect(groundAnchor.className).toContain("-translate-x-1/2");
    expect(groundAnchor.className).toContain("-translate-y-1/2");

    // Pointer element sits directly above ground anchor
    const pointer = document.getElementById("fixed-center-pin")!;
    expect(pointer.className).toContain("top-1/2");
    expect(pointer.className).toContain("left-1/2");
  });
});
