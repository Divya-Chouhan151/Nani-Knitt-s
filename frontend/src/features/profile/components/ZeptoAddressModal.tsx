import { createSignal, createMemo, createEffect, onMount, onCleanup, For, Show, on } from "solid-js";
import { Address, AddressPayload } from "../../../types/profile";
import {
  PlaceSuggestion,
  GeocodedAddress,
  PRESET_LOCATIONS,
  getLocalMatches,
  searchPlaces,
  reverseGeocode,
  checkLocationPermission,
  getDeviceLocation,
  lookupPincode,
  loadGoogleMapsScript,
} from "../utils/googleMaps";

export interface ZeptoAddressModalProps {
  isOpen: boolean;
  editingAddress?: Address | null;
  onClose: () => void;
  onSave: (payload: AddressPayload) => Promise<void>;
  isFirstAddress?: boolean;
  defaultFullName?: string;
  defaultPhone?: string;
}

export function ZeptoAddressModal(props: ZeptoAddressModalProps) {
  // Step state: "map" (Pin selection) -> "form" (Manual address details)
  const [step, setStep] = createSignal<"map" | "form">("map");

  // Location Permission state
  const [permissionState, setPermissionState] = createSignal<"granted" | "denied" | "prompt">("prompt");
  const [isLocating, setIsLocating] = createSignal(false);
  const [permissionNotice, setPermissionNotice] = createSignal<string | null>(null);

  // Map Coordinates & Panning State (Map pans under the fixed center pin)
  const [mapCoords, setMapCoords] = createSignal<{ lat: number; lng: number }>({
    lat: 12.9784,
    lng: 77.6408,
  });
  const [zoom, setZoom] = createSignal(16);
  const [panOffset, setPanOffset] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = createSignal(false);
  const [dragStart, setDragStart] = createSignal<{ x: number; y: number } | null>(null);

  const tileOffsets = [
    { dx: -2, dy: -2 }, { dx: -1, dy: -2 }, { dx: 0, dy: -2 }, { dx: 1, dy: -2 }, { dx: 2, dy: -2 },
    { dx: -2, dy: -1 }, { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, { dx: 2, dy: -1 },
    { dx: -2, dy: 0 },  { dx: -1, dy: 0 },  { dx: 0, dy: 0 },  { dx: 1, dy: 0 },  { dx: 2, dy: 0 },
    { dx: -2, dy: 1 },  { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 },  { dx: 2, dy: 1 },
    { dx: -2, dy: 2 },  { dx: -1, dy: 2 },  { dx: 0, dy: 2 },  { dx: 1, dy: 2 },  { dx: 2, dy: 2 },
  ];

  const [isPinBouncing, setIsPinBouncing] = createSignal(false);
  const triggerPinBounce = () => {
    setIsPinBouncing(true);
    setTimeout(() => setIsPinBouncing(false), 550);
  };

  const tileInfo = createMemo(() => {
    const z = zoom();
    const lat = Math.max(-85.0511, Math.min(85.0511, mapCoords().lat));
    const lng = ((((mapCoords().lng + 180) % 360) + 360) % 360) - 180;
    const n = Math.pow(2, z);
    const latRad = (lat * Math.PI) / 180;
    const exactX = ((lng + 180) / 360) * n;
    const exactY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
    const centerX = Math.floor(exactX);
    const centerY = Math.floor(exactY);
    const subX = (exactX - centerX) * 256;
    const subY = (exactY - centerY) * 256;
    return { z, centerX, centerY, subX, subY };
  });

  // Resolved Address from Pin
  const [resolvedAddress, setResolvedAddress] = createSignal<GeocodedAddress | null>(null);
  const [isGeocoding, setIsGeocoding] = createSignal(false);

  // Places Search within Map screen
  const [searchQuery, setSearchQuery] = createSignal("");
  const [suggestions, setSuggestions] = createSignal<PlaceSuggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = createSignal(false);
  const [isSearching, setIsSearching] = createSignal(false);

  // Step 2 Form Fields (Zepto review & complete details)
  const [label, setLabel] = createSignal<"Home" | "Work" | "Other">("Home");
  const [fullName, setFullName] = createSignal("");
  const [phone, setPhone] = createSignal("");
  const [addressLine1, setAddressLine1] = createSignal(""); // Flat / House / Building
  const [addressLine2, setAddressLine2] = createSignal(""); // Area / Street / Locality
  const [landmark, setLandmark] = createSignal("");
  const [city, setCity] = createSignal("");
  const [state, setState] = createSignal("");
  const [postalCode, setPostalCode] = createSignal("");
  const [country, setCountry] = createSignal("India");
  const [isDefaultShipping, setIsDefaultShipping] = createSignal(false);
  const [isDefaultBilling, setIsDefaultBilling] = createSignal(false);
  const [pincodeFeedback, setPincodeFeedback] = createSignal<string | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [isDraggingPin, setIsDraggingPin] = createSignal(false);

  let mapContainerRef: HTMLDivElement | undefined;
  let googleMapInstance: any = null;
  let debounceTimer: any = null;
  let searchDebounceTimer: any = null;
  let currentGeocodeId = 0;
  let searchRequestId = 0;
  let totalDragDistance = 0;

  function pixelOffsetToCoords(
    dx: number,
    dy: number,
    centerLat: number,
    centerLng: number,
    zoomLevel: number
  ): { lat: number; lng: number } {
    const worldSize = 256 * Math.pow(2, zoomLevel);
    const centerWorldX = ((centerLng + 180) / 360) * worldSize;
    const latRad0 = (centerLat * Math.PI) / 180;
    const centerWorldY =
      ((1 - Math.log(Math.tan(latRad0) + 1 / Math.cos(latRad0)) / Math.PI) / 2) *
      worldSize;

    const targetWorldX = centerWorldX + dx;
    const targetWorldY = centerWorldY + dy;

    const newLng = ((targetWorldX / worldSize) * 360 - 180 + 540) % 360 - 180;
    const yNorm = 1 - (2 * targetWorldY) / worldSize;
    const newLatRad = Math.atan(Math.sinh(Math.PI * yNorm));
    const newLat = Math.max(-85.0511, Math.min(85.0511, (newLatRad * 180) / Math.PI));

    return { lat: newLat, lng: newLng };
  }

  const triggerGeocode = async (lat: number, lng: number) => {
    const reqId = ++currentGeocodeId;
    setIsGeocoding(true);
    try {
      const geo = await reverseGeocode(lat, lng);
      if (reqId === currentGeocodeId) {
        setResolvedAddress(geo);
      }
    } catch (e) {
      console.warn("Geocode error:", e);
    } finally {
      if (reqId === currentGeocodeId) {
        setIsGeocoding(false);
      }
    }
  };

  const debouncedGeocode = (lat: number, lng: number) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    setIsGeocoding(true);
    debounceTimer = setTimeout(() => triggerGeocode(lat, lng), 300);
  };

  // Initialize or reset flow on modal open
  createEffect(
    on(
      [() => props.isOpen, () => props.editingAddress],
      ([isOpen, editing]) => {
        if (!isOpen) return;

        if (editing) {
          const a = editing;
          setLabel((a.label as any) || "Home");
          setFullName(a.fullName || "");
          setPhone(a.phone || "");
          setAddressLine1(a.addressLine1 || "");
          setAddressLine2(a.addressLine2 || "");
          setCity(a.city || "");
          setState(a.state || "");
          setPostalCode(a.postalCode || "");
          setCountry(a.country || "India");
          setIsDefaultShipping(a.isDefaultShipping || false);
          setIsDefaultBilling(a.isDefaultBilling || false);
          setStep("form"); // Edit existing opens directly to form
        } else {
          // New address flow: Starts at Step 1 (Zepto Map Pin Selection)
          setStep("map");
          setLabel("Home");
          setFullName(props.defaultFullName || "");
          setPhone(props.defaultPhone || "");
          setAddressLine1("");
          setAddressLine2("");
          setLandmark("");
          setCity("");
          setState("");
          setPostalCode("");
          setCountry("India");
          setIsDefaultShipping(!!props.isFirstAddress);
          setIsDefaultBilling(!!props.isFirstAddress);
          setPanOffset({ x: 0, y: 0 });
          setSearchQuery("");

          // Default coordinates before GPS resolves
          setMapCoords({ lat: 12.9784, lng: 77.6408 });
          triggerGeocode(12.9784, 77.6408);

          // Fresh live permission check and immediate permission seeking
          checkLocationPermission().then(async (perm) => {
            setPermissionState(perm);
            if (perm === "denied") {
              setPermissionNotice(
                "Location permission is off in your browser settings. Use the search bar, tap the map, or move the pointer to set your pin."
              );
            } else {
              // Always actively seek location permission before starting GPS
              setIsLocating(true);
              const devLoc = await getDeviceLocation();
              setIsLocating(false);
              const refreshedPerm = await checkLocationPermission();
              setPermissionState(refreshedPerm);
              if (devLoc) {
                setPermissionState("granted");
                setMapCoords(devLoc);
                triggerGeocode(devLoc.lat, devLoc.lng);
              }
            }
          });
        }
      }
    )
  );

  onMount(async () => {
    await loadGoogleMapsScript();
  });

  onCleanup(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  });

  // Request browser location permission when user taps "Enable Location" / "Retry GPS"
  const handleRequestPermission = async () => {
    setIsLocating(true);
    const loc = await getDeviceLocation();
    setIsLocating(false);

    const perm = await checkLocationPermission();
    setPermissionState(perm);

    if (loc && perm === "granted") {
      setMapCoords(loc);
      setPanOffset({ x: 0, y: 0 });
      setPermissionNotice(null);
      triggerPinBounce();
      triggerGeocode(loc.lat, loc.lng);
    } else {
      setPermissionNotice("Location access was denied. You can search your address or move the map pointer manually.");
    }
  };

  // Use Current Location GPS trigger
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    const loc = await getDeviceLocation();
    setIsLocating(false);

    const perm = await checkLocationPermission();
    setPermissionState(perm);

    if (loc) {
      setPermissionState("granted");
      setMapCoords(loc);
      setPanOffset({ x: 0, y: 0 });
      setPermissionNotice(null);
      triggerPinBounce();
      triggerGeocode(loc.lat, loc.lng);
    } else {
      if (perm === "denied") {
        setPermissionNotice("Location access is disabled in browser settings. You can drag the map pointer or search manually.");
      }
    }
  };

  // Autocomplete search handlers (debounced with request sequencing & user coordinates for proximity)
  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    const reqId = ++searchRequestId;

    if (val.trim().length <= 1) {
      setSuggestions(PRESET_LOCATIONS.slice(0, 4));
      return;
    }

    // Instant local matches (0ms synchronous update)
    const local = getLocalMatches(val, mapCoords());
    if (local.length > 0) {
      setSuggestions(local);
      setIsSuggestionsOpen(true);
    }

    searchDebounceTimer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchPlaces(val, mapCoords());
        if (reqId === searchRequestId) {
          if (results.length > 0) {
            setSuggestions(results);
          }
          setIsSuggestionsOpen(true);
        }
      } catch {
        // ignore
      } finally {
        if (reqId === searchRequestId) {
          setIsSearching(false);
        }
      }
    }, 150);
  };

  const handleSelectSuggestion = (s: PlaceSuggestion) => {
    setSearchQuery(s.mainText);
    setIsSuggestionsOpen(false);
    setMapCoords({ lat: s.lat, lng: s.lng });
    setPanOffset({ x: 0, y: 0 });
    triggerPinBounce();
    ++currentGeocodeId;
    setResolvedAddress({
      ...s.addressComponents,
      lat: s.lat,
      lng: s.lng,
      formattedAddress: s.description,
    });
  };

  // Map panning & Pin drag handlers
  const handleStartDrag = (clientX: number, clientY: number, fromPin = false) => {
    setIsPanning(true);
    setIsDraggingPin(fromPin);
    totalDragDistance = 0;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!dragStart()) return;
    const dx = clientX - dragStart()!.x;
    const dy = clientY - dragStart()!.y;
    totalDragDistance += Math.hypot(dx, dy);

    setDragStart({ x: clientX, y: clientY });

    const z = zoom();
    const n = Math.pow(2, z);
    const deltaLng = -(dx / 256) * (360 / n);
    const latRad = (mapCoords().lat * Math.PI) / 180;
    const deltaLat = (dy / 256) * (360 / n) * Math.cos(latRad);
    const newLat = Math.max(-85.0511, Math.min(85.0511, mapCoords().lat + deltaLat));
    const newLng = ((mapCoords().lng + deltaLng + 540) % 360) - 180;
    setMapCoords({ lat: newLat, lng: newLng });
    debouncedGeocode(newLat, newLng);
  };

  const handleEndDrag = () => {
    if (isDraggingPin() || isPanning()) {
      setIsDraggingPin(false);
      setIsPanning(false);
      setDragStart(null);
      triggerPinBounce();
      triggerGeocode(mapCoords().lat, mapCoords().lng);
    }
  };

  // Window-level mouse listeners to keep dragging smooth even outside map bounds
  createEffect(() => {
    if (isPanning() || isDraggingPin()) {
      const onWinMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientX, e.clientY);
      };
      const onWinMouseUp = () => {
        handleEndDrag();
      };
      window.addEventListener("mousemove", onWinMouseMove);
      window.addEventListener("mouseup", onWinMouseUp);
      onCleanup(() => {
        window.removeEventListener("mousemove", onWinMouseMove);
        window.removeEventListener("mouseup", onWinMouseUp);
      });
    }
  });

  // Close search suggestions dropdown when user clicks outside search container
  createEffect(() => {
    if (isSuggestionsOpen()) {
      const handleWindowClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest("#places-search-container") && !target.closest(".places-dropdown")) {
          setIsSuggestionsOpen(false);
        }
      };
      window.addEventListener("mousedown", handleWindowClick);
      onCleanup(() => {
        window.removeEventListener("mousedown", handleWindowClick);
      });
    }
  });

  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest(".places-dropdown")) return;
    if (isSuggestionsOpen()) {
      setIsSuggestionsOpen(false);
    }
    handleStartDrag(e.clientX, e.clientY, false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEndDrag();
  };

  const handleTouchStart = (e: TouchEvent) => {
    if ((e.target as HTMLElement).closest(".places-dropdown")) return;
    if (isSuggestionsOpen()) {
      setIsSuggestionsOpen(false);
    }
    if (e.touches.length === 1) {
      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, false);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleEndDrag();
  };

  // Click on map directly moves pointer to that house/building
  const handleMapClick = (e: MouseEvent) => {
    if (totalDragDistance > 5) return;
    if ((e.target as HTMLElement).closest(".places-dropdown") || (e.target as HTMLElement).closest("button")) return;
    if (!mapContainerRef) return;

    const rect = mapContainerRef.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);
    const newCoords = pixelOffsetToCoords(offsetX, offsetY, mapCoords().lat, mapCoords().lng, zoom());
    setMapCoords(newCoords);
    triggerPinBounce();
    triggerGeocode(newCoords.lat, newCoords.lng);
  };

  // Step 1 -> Step 2: Confirm Location on Map locks coordinates and opens manual detail form
  const handleConfirmLocation = () => {
    const geo = resolvedAddress();
    setAddressLine1((prev) => prev.trim() || geo?.addressLine1 || "Doorstep Address");
    setAddressLine2((prev) => prev.trim() || geo?.addressLine2 || "Main Area");
    if (geo?.landmark) {
      setLandmark(geo.landmark);
    }
    setCity((prev) => prev.trim() || geo?.city || "");
    setState((prev) => prev.trim() || geo?.state || "");
    setPostalCode((prev) => prev.trim() || geo?.postalCode || "");
    setCountry((prev) => prev.trim() || geo?.country || "India");
    setStep("form");
  };

  // Pincode input handler
  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setPostalCode(clean);
    if (clean.length === 6) {
      const lookup = lookupPincode(clean);
      if (lookup) {
        setCity(lookup.city);
        setState(lookup.state);
        setPincodeFeedback(`Auto-detected: ${lookup.city}, ${lookup.state}`);
      } else {
        setPincodeFeedback(null);
      }
    } else {
      setPincodeFeedback(null);
    }
  };

  // Step 2 Submission: Saves completed address with robust defaults so it never fails
  const handleSave = async (e: Event) => {
    e.preventDefault();
    const effectiveName = fullName().trim() || props.defaultFullName || "User";
    const effectivePhone = phone().trim() || props.defaultPhone || "9876543210";
    const effectiveLine1 = addressLine1().trim() || resolvedAddress()?.addressLine1 || "Doorstep Address";
    const effectiveCity = city().trim() || resolvedAddress()?.city || "Selected Area";
    const effectiveState = state().trim() || resolvedAddress()?.state || "India";
    const effectivePostal = postalCode().trim() || resolvedAddress()?.postalCode || "";
    const effectiveCountry = country().trim() || resolvedAddress()?.country || "India";

    setIsSubmitting(true);
    try {
      let finalLine2 = addressLine2().trim();
      if (landmark().trim()) {
        finalLine2 = finalLine2 ? `${finalLine2} (Near ${landmark().trim()})` : `Near ${landmark().trim()}`;
      }

      const payload: AddressPayload = {
        label: label() || "Home",
        fullName: effectiveName,
        phone: effectivePhone,
        addressLine1: effectiveLine1,
        addressLine2: finalLine2 || undefined,
        city: effectiveCity,
        state: effectiveState,
        postalCode: effectivePostal,
        country: effectiveCountry,
        isDefaultShipping: isDefaultShipping(),
        isDefaultBilling: isDefaultBilling(),
      };
      await props.onSave(payload);
      props.onClose();
    } catch (err: any) {
      alert(err.message || "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Show when={props.isOpen}>
      <div
        id="zepto-address-modal"
        class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      >
        <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-2">
          {/* Top Modal Header */}
          <div class="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-page)]/60">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-base shadow-xs">
                📍
              </span>
              <div>
                <h3 class="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  {props.editingAddress
                    ? "Edit Delivery Address"
                    : step() === "map"
                    ? "Set Location on Map"
                    : "Enter Complete Address Details"}
                </h3>
                <p class="text-[11px] text-[var(--text-secondary)]">
                  {step() === "map"
                    ? "Step 1 of 2: Position pin at your exact doorstep"
                    : "Step 2 of 2: Confirm flat number & recipient details"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              class="w-7 h-7 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* STEP 1: Zepto Map Pin Selection Screen */}
          <Show when={step() === "map"}>
            <div class="flex-1 flex flex-col min-h-[480px] sm:min-h-[520px] relative select-none">
              {/* Seeking Permission Banner */}
              <Show when={isLocating()}>
                <div class="p-2.5 bg-blue-500/10 border-b border-blue-500/20 px-4 flex items-center justify-between gap-2 text-xs text-blue-800 dark:text-blue-300">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span class="font-medium">Seeking GPS location permission to track your exact doorstep...</span>
                  </div>
                </div>
              </Show>

              {/* Permission Denied Banner */}
              <Show when={permissionState() === "denied"}>
                <div class="p-2.5 bg-amber-500/10 border-b border-amber-500/20 px-4 flex items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <div class="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Location access disabled in browser. Move the map pointer or search your address.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    class="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
                  >
                    Enable GPS
                  </button>
                </div>
              </Show>

              {/* Permission Prompt Banner */}
              <Show when={permissionState() === "prompt" && !isLocating()}>
                <div class="p-2.5 bg-blue-500/10 border-b border-blue-500/20 px-4 flex items-center justify-between gap-2 text-xs text-blue-800 dark:text-blue-300">
                  <div class="flex items-center gap-2">
                    <span>🎯</span>
                    <span>Enable location to auto-detect your current doorstep pin.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    disabled={isLocating()}
                    class="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                  >
                    Enable GPS
                  </button>
                </div>
              </Show>

              {/* Search Bar at Top of Map */}
              <div
                id="places-search-container"
                class={`p-3 bg-[var(--bg-surface)]/95 border-b border-[var(--border)] relative transition-all ${
                  isSuggestionsOpen() ? "z-40" : "z-30"
                }`}
              >
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-[var(--text-secondary)] text-sm pointer-events-none">
                    🔍
                  </span>
                  <input
                    id="places-search-input"
                    type="text"
                    value={searchQuery()}
                    onInput={(e) => {
                      const val = (e.target as HTMLInputElement)?.value ?? e.currentTarget?.value ?? "";
                      handleSearchInput(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (suggestions().length > 0) {
                          handleSelectSuggestion(suggestions()[0]);
                        }
                      } else if (e.key === "Escape") {
                        setIsSuggestionsOpen(false);
                      }
                    }}
                    onFocus={() => {
                      if (suggestions().length === 0) setSuggestions(PRESET_LOCATIONS.slice(0, 4));
                      setIsSuggestionsOpen(true);
                    }}
                    placeholder="Search area, landmark, street, or building..."
                    class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 pl-9 pr-14 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shadow-inner transition-all"
                  />
                  <Show when={isSearching()}>
                    <span class="absolute right-8 w-3.5 h-3.5 border-2 border-[var(--brand-500)] border-t-transparent rounded-full animate-spin pointer-events-none" />
                  </Show>
                  <Show when={searchQuery().length > 0}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSuggestionsOpen(false);
                      }}
                      class="absolute right-2.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full cursor-pointer"
                    >
                      ✕
                    </button>
                  </Show>
                </div>

                {/* Suggestions Dropdown */}
                <Show when={isSuggestionsOpen()}>
                  <div
                    id="places-suggestions-dropdown"
                    role="listbox"
                    aria-label="Location search suggestions"
                    class="places-dropdown absolute left-3 right-3 top-full mt-1.5 z-50 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl max-h-60 sm:max-h-72 overflow-y-auto overscroll-contain divide-y divide-[var(--border)]/40 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <Show
                      when={suggestions().length > 0}
                      fallback={
                        <div class="p-3 text-center text-xs text-[var(--text-secondary)]">
                          No matching locations found for "{searchQuery()}"
                        </div>
                      }
                    >
                      <For each={suggestions()}>
                        {(s) => (
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestion(s)}
                            class="w-full p-2.5 text-left flex items-start gap-2.5 hover:bg-[var(--brand-50)]/50 dark:hover:bg-[var(--brand-950)]/50 transition-colors cursor-pointer"
                          >
                            <span class="text-sm mt-0.5 text-emerald-600">📍</span>
                            <div class="flex-1 min-w-0">
                              <p class="text-xs font-bold text-[var(--text-primary)] truncate">{s.mainText}</p>
                              <p class="text-[10px] text-[var(--text-secondary)] truncate">
                                {s.secondaryText || s.description}
                              </p>
                            </div>
                          </button>
                        )}
                      </For>
                    </Show>
                  </div>
                </Show>
              </div>

              {/* Central Map Canvas with Movable Pointer & Click-to-place */}
              <div
                id="map-surface"
                ref={mapContainerRef}
                class="flex-1 relative z-10 w-full overflow-hidden bg-[#e5e3df] dark:bg-[#1f2937] cursor-grab active:cursor-grabbing select-none min-h-[300px]"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleMapClick}
              >
                {/* Fallback Grid & Vector Background */}
                <div
                  class="absolute inset-0 w-full h-full pointer-events-none"
                  style={{
                    "background-image":
                      "radial-gradient(#94a3b8 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1px, #f8fafc 1px)",
                    "background-size": "32px 32px, 64px 64px",
                  }}
                >
                  <svg
                    class="absolute inset-0 w-full h-full opacity-20 dark:opacity-10"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M-200,200 Q300,100 1000,350" fill="none" stroke="#60a5fa" stroke-width="12" />
                    <path d="M150,-100 L400,700 M650,-100 L600,700" fill="none" stroke="#fcd34d" stroke-width="10" />
                    <rect x="250" y="160" width="140" height="90" rx="8" fill="#86efac" opacity="0.4" />
                    <rect x="520" y="280" width="120" height="80" rx="8" fill="#93c5fd" opacity="0.4" />
                  </svg>
                </div>

                {/* Real OpenStreetMap Tiles Grid */}
                <div class="absolute inset-0 pointer-events-none overflow-hidden">
                  <For each={tileOffsets}>
                    {(t) => {
                      const tileX = () => tileInfo().centerX + t.dx;
                      const tileY = () => tileInfo().centerY + t.dy;
                      const maxCoord = () => Math.pow(2, tileInfo().z);
                      const safeX = () => ((tileX() % maxCoord()) + maxCoord()) % maxCoord();
                      const tileUrl = () => {
                        if (tileY() < 0 || tileY() >= maxCoord()) return "";
                        return `https://tile.openstreetmap.org/${tileInfo().z}/${safeX()}/${tileY()}.png`;
                      };

                      return (
                        <img
                          src={tileUrl()}
                          alt=""
                          loading="lazy"
                          class="absolute w-[256px] h-[256px] pointer-events-none transition-opacity duration-200 opacity-90 dark:opacity-80 dark:invert-[0.85] dark:hue-rotate-180"
                          style={{
                            left: `calc(50% - ${tileInfo().subX}px + ${t.dx * 256}px)`,
                            top: `calc(50% - ${tileInfo().subY}px + ${t.dy * 256}px)`,
                            display: tileUrl() ? "block" : "none",
                          }}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      );
                    }}
                  </For>
                </div>

                {/* User Guidance Chip */}
                <div
                  id="map-guidance-chip"
                  class={`absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border)] shadow-md text-[11px] font-medium text-[var(--text-secondary)] pointer-events-none flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ease-in-out ${
                    isSuggestionsOpen()
                      ? "opacity-0 -translate-y-2 pointer-events-none invisible"
                      : "opacity-100 translate-y-0 visible"
                  }`}
                  aria-hidden={isSuggestionsOpen()}
                >
                  <span>📍</span>
                  <span>Drag pointer or tap map to point to your house</span>
                </div>

                {/* Map Controls: Zoom in/out */}
                <div class="absolute top-3 right-3 z-20 flex flex-col shadow-lg rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoom((z) => Math.min(19, z + 1));
                    }}
                    class="w-7 h-7 flex items-center justify-center font-bold text-sm text-[var(--text-primary)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer border-b border-[var(--border)]"
                    title="Zoom in"
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoom((z) => Math.max(12, z - 1));
                    }}
                    class="w-7 h-7 flex items-center justify-center font-bold text-sm text-[var(--text-primary)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer"
                    title="Zoom out"
                    aria-label="Zoom out"
                  >
                    −
                  </button>
                </div>

                {/* 📍 MOVABLE MAP POINTER (Hybrid Pan + Building-level Pick & Drop) */}
                <div
                  id="fixed-center-pin"
                  class={`absolute top-1/2 left-1/2 z-30 flex flex-col items-center cursor-grab active:cursor-grabbing select-none pointer-events-auto transition-transform duration-150 ${
                    isPinBouncing() ? "animate-bounce" : ""
                  }`}
                  style={{
                    transform: isDraggingPin() || isPanning() ? "translate(-50%, -115%)" : "translate(-50%, -100%)",
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleStartDrag(e.clientX, e.clientY, true);
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length === 1) {
                      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, true);
                    }
                  }}
                  title="Drag pointer or tap anywhere on map to point to right house/building"
                >
                  <div
                    id="fixed-pin-badge"
                    class={`mb-1 px-3 py-1 rounded-full bg-slate-900/95 text-white text-[11px] font-bold shadow-xl border border-white/20 whitespace-nowrap flex items-center gap-1.5 transition-all duration-150 ${
                      isSuggestionsOpen()
                        ? "opacity-0 scale-95 pointer-events-none invisible"
                        : isPanning() || isDraggingPin()
                        ? "opacity-90 -translate-y-2 visible"
                        : "opacity-100 translate-y-0 visible"
                    }`}
                    aria-hidden={isSuggestionsOpen()}
                  >
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isDraggingPin() ? "Drop at your house/building" : "Order will be delivered here"}</span>
                  </div>

                  <div
                    class={`relative transition-transform duration-150 ease-out origin-bottom ${
                      isDraggingPin()
                        ? "-translate-y-6 scale-125 drop-shadow-2xl"
                        : isPanning()
                        ? "-translate-y-3 scale-110 drop-shadow-2xl"
                        : "translate-y-0 scale-100 drop-shadow-md"
                    }`}
                  >
                    <svg width="40" height="52" viewBox="0 0 44 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22 0C9.85 0 0 9.85 0 22C0 37.5 22 56 22 56C22 56 44 37.5 44 22C44 9.85 34.15 0 22 0Z"
                        fill="#e11d48"
                        stroke="#ffffff"
                        stroke-width="2.5"
                      />
                      <circle cx="22" cy="22" r="7" fill="#ffffff" />
                    </svg>
                  </div>

                  {/* Pin Base Shadow & Target Ring */}
                  <div class="relative flex items-center justify-center -mt-1">
                    <div class="w-4 h-4 rounded-full border-2 border-rose-500 bg-rose-500/30 animate-ping absolute" />
                    <div class="w-2.5 h-1.5 bg-black/40 rounded-full" />
                  </div>
                </div>

                {/* Recenter GPS Button (Only functional if permission granted) */}
                <button
                  type="button"
                  id="recenter-location-btn"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating()}
                  class={`absolute bottom-3 right-3 z-20 p-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    permissionState() === "denied"
                      ? "opacity-60 text-[var(--text-secondary)]"
                      : "text-[var(--brand-600)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-950)]"
                  }`}
                  title={
                    permissionState() === "denied"
                      ? "Location permission disabled in browser"
                      : "Recenter to my current GPS location"
                  }
                  aria-label="Recenter to my current location"
                >
                  <span>🎯</span>
                  <span class="text-[11px] hidden sm:inline">
                    {permissionState() === "denied"
                      ? "GPS Disabled"
                      : isLocating()
                      ? "Locating..."
                      : "Current Location"}
                  </span>
                </button>
              </div>

              {/* Bottom Sheet / Bar: Live Address Readout & Confirm Location Button */}
              <div class="p-4 bg-[var(--bg-surface)] border-t border-[var(--border)] shadow-xl space-y-3 z-20">
                <div class="flex items-start gap-2.5">
                  <span class="text-base text-rose-500 mt-0.5">📍</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-600)]">
                      Selected Location
                    </p>
                    <h4 class="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate mt-0.5">
                      {resolvedAddress()?.addressLine1 || "Pinpoint exact location"}
                    </h4>
                    <p class="text-[11px] text-[var(--text-secondary)] truncate">
                      {resolvedAddress()?.addressLine2 ? `${resolvedAddress()?.addressLine2}, ` : ""}
                      {resolvedAddress()?.city
                        ? `${resolvedAddress()?.city}, ${resolvedAddress()?.state} - ${resolvedAddress()?.postalCode}`
                        : "Drag the map to fine-tune exact doorstep"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="confirm-location-btn"
                  onClick={handleConfirmLocation}
                  class="w-full py-3 rounded-2xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  <span>Confirm Location &amp; Enter House Details</span>
                </button>
              </div>
            </div>
          </Show>

          {/* STEP 2: Manual Address Detail Form (Zepto Review & Correction) */}
          <Show when={step() === "form"}>
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Confirmed Pin Summary Banner with "Change" option */}
              <div class="p-3 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-base text-rose-500">📍</span>
                  <div class="min-w-0">
                    <p class="font-bold text-[var(--text-primary)] truncate">
                      {addressLine2() || addressLine1() || "Selected Location"}
                    </p>
                    <p class="text-[10px] text-[var(--text-secondary)] truncate">
                      {city()}, {state()} - {postalCode()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("map")}
                  class="text-[11px] font-bold text-[var(--brand-600)] hover:underline shrink-0 cursor-pointer"
                >
                  Change on Map
                </button>
              </div>

              {/* Manual Form (All fields editable) */}
              <form onSubmit={handleSave} class="space-y-3.5">
                {/* Flat / House / Building No. (Required — user specifies floor/flat) */}
                <div>
                  <label class="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    House / Flat / Floor / Building No. <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1()}
                    onInput={(e) => setAddressLine1(e.currentTarget.value)}
                    placeholder="House/Flat number, Building name, or Street"
                    class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
                  />
                  <p class="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    Zepto delivery partners use this to deliver directly to your door.
                  </p>
                </div>

                {/* Area / Street / Locality */}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Area / Street / Sector <span class="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine2()}
                      onInput={(e) => setAddressLine2(e.currentTarget.value)}
                      placeholder="e.g. Apt 4B, 4th Block, Sector 2"
                      class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark()}
                      onInput={(e) => setLandmark(e.currentTarget.value)}
                      placeholder="e.g. Near Metro Station / Behind Hospital"
                      class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
                    />
                  </div>
                </div>

                {/* Pincode, City, State, Country */}
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label class="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Pincode <span class="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode()}
                      onInput={(e) => handlePincodeChange(e.currentTarget.value)}
                      placeholder="PIN / Postal Code"
                      maxLength={10}
                      class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      City <span class="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city()}
                      onInput={(e) => setCity(e.currentTarget.value)}
                      placeholder="City"
                      class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      State <span class="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={state()}
                      onInput={(e) => setState(e.currentTarget.value)}
                      placeholder="State"
                      class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Country <span class="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={country()}
                      onInput={(e) => setCountry(e.currentTarget.value)}
                      placeholder="Country"
                      class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
                    />
                  </div>
                </div>

                <Show when={pincodeFeedback()}>
                  <p class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ {pincodeFeedback()}
                  </p>
                </Show>

                {/* Full Name & Mobile Number */}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[var(--border)]/60">
                  <div>
                    <label class="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Receiver's Full Name <span class="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName()}
                      onInput={(e) => setFullName(e.currentTarget.value)}
                      placeholder="Full Name"
                      class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Contact Mobile Number <span class="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone()}
                      onInput={(e) => setPhone(e.currentTarget.value)}
                      placeholder="+91 98765 43210"
                      class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
                    />
                  </div>
                </div>

                {/* Address Label Selector: Strictly Home / Work / Other */}
                <div class="space-y-1.5 pt-1">
                  <label class="block text-xs font-bold text-[var(--text-primary)]">
                    Save Address As <span class="text-rose-500">*</span>
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setLabel("Home")}
                      class={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        label() === "Home"
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                          : "bg-[var(--bg-page)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span>🏠</span>
                      <span>Home</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabel("Work")}
                      class={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        label() === "Work"
                          ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs"
                          : "bg-[var(--bg-page)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span>💼</span>
                      <span>Work</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabel("Other")}
                      class={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        label() === "Other"
                          ? "bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 shadow-xs"
                          : "bg-[var(--bg-page)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span>📍</span>
                      <span>Other</span>
                    </button>
                  </div>
                </div>

                {/* Default Address Checkboxes */}
                <div class="space-y-2 pt-2 border-t border-[var(--border)]/60">
                  <label class="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-primary)] font-medium">
                    <input
                      type="checkbox"
                      checked={isDefaultShipping()}
                      onChange={(e) => setIsDefaultShipping(e.currentTarget.checked)}
                      class="rounded border-[var(--border)] text-[var(--brand-600)] focus:ring-[var(--brand-500)]"
                    />
                    <span>Make this my default delivery address</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-primary)] font-medium">
                    <input
                      type="checkbox"
                      checked={isDefaultBilling()}
                      onChange={(e) => setIsDefaultBilling(e.currentTarget.checked)}
                      class="rounded border-[var(--border)] text-[var(--brand-600)] focus:ring-[var(--brand-500)]"
                    />
                    <span>Make this my default billing address</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div class="flex items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep("map")}
                    class="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--border)]/30 transition-colors cursor-pointer"
                  >
                    ← Back to Map
                  </button>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={props.onClose}
                      class="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting()}
                      class="px-6 py-2.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center gap-2"
                    >
                      <span>{isSubmitting() ? "Saving..." : "Save Address"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}

// Export as GoogleMapsAddressModal for transparent drop-in compatibility
export const GoogleMapsAddressModal = ZeptoAddressModal;
