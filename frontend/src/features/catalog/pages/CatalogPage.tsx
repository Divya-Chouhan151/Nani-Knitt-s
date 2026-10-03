import { createResource, createSignal, createEffect, on, Suspense, Show } from "solid-js";
import { useSearchParams, useNavigate, useLocation } from "@solidjs/router";
import { fetchProducts, fetchProductByIdOrSlug } from "../../../api/products";
import { searchCatalog, SearchFacets } from "../../../api/search";
import { createCatalogStore } from "../stores/catalogStore";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { ProductToolbar } from "../components/ProductToolbar";
import { ProductGrid } from "../components/ProductGrid";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import { ProductQuickViewModal } from "../components/ProductQuickViewModal";
import { Pagination } from "../components/Pagination";
import { SearchFacetSidebar } from "../../search/components/SearchFacetSidebar";
import { ProductDetail, ProductFilterCriteria, ProductSummary } from "../../../types/product";
import { wishlistStore } from "../../profile/stores/wishlistStore";
import { cartStore } from "../../cart/stores/cartStore";
import { MARKETING_COPY } from "../../../config/marketing";
import { localeStore } from "../../../stores/localeStore";
import { triggerCelebration } from "../../../components/CelebrationEffects";

export function CatalogPage() {
  let searchParams: any = {};
  let setSearchParams: any = () => {};
  try {
    const [sp, ssp] = useSearchParams();
    searchParams = sp;
    setSearchParams = ssp;
  } catch {
    // outside router environment fallback
  }

  const initialQuery = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const initialCategory = typeof searchParams.category === "string" ? searchParams.category.trim() : undefined;
  const store = createCatalogStore({
    query: initialQuery,
    categorySlug: initialCategory,
  });

  let navigate: ReturnType<typeof useNavigate>;
  try {
    navigate = useNavigate();
  } catch {
    navigate = () => {};
  }

  let location: ReturnType<typeof useLocation>;
  try {
    location = useLocation();
  } catch {
    location = { pathname: "/search", search: "", hash: "", query: {}, state: {} };
  }

  const [quickViewProduct, setQuickViewProduct] = createSignal<ProductDetail | null>(null);
  const [searchFacets, setSearchFacets] = createSignal<SearchFacets | undefined>(undefined);
  const [didYouMean, setDidYouMean] = createSignal<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = createSignal(false);

  // Synchronize store query and category with URL search parameters
  createEffect(
    on(
      () => [searchParams.q, searchParams.category],
      ([sq, scat]) => {
        const urlQuery = typeof sq === "string" ? sq.trim() : "";
        const currentQuery = (store.criteria().query || "").trim();
        if (urlQuery !== currentQuery) {
          store.setQuery(urlQuery);
        }

        const urlCategory = typeof scat === "string" ? scat.trim() : undefined;
        const currentCategory = store.criteria().categorySlug;
        if (urlCategory !== currentCategory) {
          store.setCategorySlug(urlCategory);
        }
      }
    )
  );

  const handleSearchChange = (query: string) => {
    store.setQuery(query);
    if (location.pathname === "/search" || location.pathname === "/") {
      setSearchParams({ q: query.trim() ? query.trim() : undefined }, { replace: true });
    }
  };

  const handleSearchSubmit = (query: string) => {
    const q = query.trim();
    store.setQuery(q);
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const handleSelectCategory = (categorySlug?: string) => {
    store.setCategorySlug(categorySlug);
    setSearchParams({ category: categorySlug || undefined }, { replace: true });
  };

  const handleResetFilters = () => {
    store.resetFilters();
    setSearchParams({ q: undefined, category: undefined }, { replace: true });
  };

  const fetchCatalogData = async (c: ProductFilterCriteria) => {
    if (c.query || c.brand || c.minPrice || c.maxPrice || c.minRating) {
      try {
        const searchResult = await searchCatalog({
          q: c.query,
          category: c.categorySlug,
          brand: c.brand,
          minPrice: c.minPrice,
          maxPrice: c.maxPrice,
          minRating: c.minRating,
          inStockOnly: c.inStockOnly,
          sort: c.sort,
          page: c.page,
          size: c.size,
        });

        setSearchFacets(searchResult.facets);
        setDidYouMean(searchResult.didYouMean || null);
        return searchResult;
      } catch (err) {
        console.error("Search service error, using fallback catalog:", err);
      }
    }

    setDidYouMean(null);
    return fetchProducts(c);
  };

  // Fine-grained resource: automatically re-fetches when store.criteria() changes
  const [productsData] = createResource(store.criteria, fetchCatalogData);

  const handleAddToCart = async (product: ProductSummary) => {
    const success = await cartStore.addItem({
      productId: product.id,
      sku: product.slug,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.thumbnailUrl,
    });
    if (success) {
      triggerCelebration("cart");
    }
  };

  const handleQuickView = async (product: ProductSummary) => {
    try {
      const details = await fetchProductByIdOrSlug(product.slug);
      setQuickViewProduct(details);
    } catch {
      // Fallback
      alert(`Could not load quick view for ${product.title}`);
    }
  };

  const handleToggleWishlist = (product: ProductDetail) => {
    const wasWishlisted = wishlistStore.isWishlisted(product);
    wishlistStore.toggleWishlist(product);
    if (!wasWishlisted) {
      triggerCelebration("wishlist");
    }
  };

  return (
    <div class="min-h-screen bg-[var(--bg-page)] flex flex-col">
      {/* Sticky Global Header */}
      <Header
        searchQuery={store.criteria().query || ""}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Hero Artisan Banner with 3D Depth, Warm Copy & Handcrafted Visual Accents */}
      <section class="relative bg-gradient-to-br from-[var(--bg-section-a)] via-[var(--bg-page)] to-amber-100/20 dark:to-stone-900/40 border-b border-[var(--border)] py-12 px-4 overflow-hidden">
        {/* Subtle decorative textured background elements */}
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-400/5 blur-3xl pointer-events-none" />
        <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-rose-300/10 to-amber-400/5 blur-3xl pointer-events-none" />

        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div class="max-w-2xl">
            {/* Cute Handcrafted Badge */}
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-400/10 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-3 border border-rose-500/20 shadow-xs">
              <span class="animate-yarn-bounce inline-block">🧶</span>
              <span>
                <strong class="bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-500 dark:from-rose-400 dark:via-fuchsia-300 dark:to-amber-300 bg-clip-text text-transparent font-black">Nani's Knitts</strong> • Handcrafted With Love &amp; Heart
              </span>
            </div>

            <h1 class="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
              {localeStore.t("hero.headline") || MARKETING_COPY.hero.headline}
            </h1>
            <p class="text-sm sm:text-base text-[var(--text-secondary)] mt-3 leading-relaxed">
              {localeStore.t("hero.subheadline") || MARKETING_COPY.hero.supportingText}
            </p>
          </div>

          {/* 3D Depth Artisan Feature Badges */}
          <div class="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div class="p-4 rounded-2xl bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border)] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform group">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                ✨
              </div>
              <span class="block text-sm font-bold text-[var(--text-primary)]">100% Handcrafted</span>
              <span class="text-[11px] text-[var(--text-secondary)] font-medium">Authentic maker studios</span>
            </div>
            <div class="p-4 rounded-2xl bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border)] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform group">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                🌿
              </div>
              <span class="block text-sm font-bold text-[var(--text-primary)]">Mindful Materials</span>
              <span class="text-[11px] text-[var(--text-secondary)] font-medium">Sustainably gathered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Workspace */}
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Show when={location.pathname === "/search"}>
          <div class="mb-4">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate("/");
                }
              }}
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-500)]/50 transition-all cursor-pointer group shadow-2xs"
              aria-label="Go back to previous page"
            >
              <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </Show>

        <ProductToolbar
          totalElements={productsData()?.totalElements || 0}
          activeFilterCount={store.activeFilterCount()}
          onResetFilters={handleResetFilters}
          onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        />

        {/* Active Search Term Banner */}
        <Show when={store.criteria().query && store.criteria().query!.trim().length > 0}>
          <div class="mb-5 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-xs">
            <div class="flex items-center gap-2 text-sm text-[var(--text-primary)] font-medium">
              <span>🔍</span>
              <span>
                Search results for: <strong class="text-[var(--brand-600)]">"{store.criteria().query}"</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                store.setQuery("");
                if (location.pathname === "/search") {
                  navigate("/search", { replace: true });
                } else {
                  setSearchParams({ q: undefined }, { replace: true });
                }
              }}
              class="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              Clear search ✕
            </button>
          </div>
        </Show>

        {/* Spelling Correction / Did You Mean Banner */}
        <Show when={didYouMean()}>
          <div class="mb-6 p-4 rounded-2xl bg-[var(--brand-50)] dark:bg-[var(--brand-950)] border border-[var(--brand-200)] dark:border-[var(--brand-800)] flex items-center gap-3 text-xs text-[var(--text-primary)]">
            <span class="text-base">💡</span>
            <span>
              Did you mean{" "}
              <button
                type="button"
                onClick={() => handleSearchSubmit(didYouMean()!)}
                class="font-bold text-[var(--brand-600)] hover:underline cursor-pointer"
              >
                "{didYouMean()}"
              </button>
              ?
            </span>
          </div>
        </Show>

        {/* Filter Layout: Left = Persistent Sidebar on Desktop, Right = Product Grid */}
        <div class="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Left-Hand Side Persistent Filter Panel (Sticky alongside product grid) */}
          <aside class="hidden lg:block w-64 flex-shrink-0 sticky top-24 self-start order-1">
            <SearchFacetSidebar
              facets={searchFacets()}
              selectedCategory={store.criteria().categorySlug}
              selectedBrand={store.criteria().brand}
              selectedColor={store.criteria().color}
              selectedProductType={store.criteria().productType}
              selectedMinPrice={store.criteria().minPrice}
              selectedMaxPrice={store.criteria().maxPrice}
              selectedMinRating={store.criteria().minRating}
              sort={store.criteria().sort || "newest"}
              onSortChange={store.setSort}
              onSelectCategory={handleSelectCategory}
              onSelectBrand={store.setBrand}
              onSelectColor={store.setColor}
              onSelectProductType={store.setProductType}
              onSelectPriceRange={store.setPriceRange}
              onSelectMinRating={store.setMinRating}
              onResetFilters={handleResetFilters}
              activeFilterCount={store.activeFilterCount()}
            />
          </aside>

          {/* Main Product Grid on the Right */}
          <div class="flex-1 min-w-0 w-full order-2">
            <Show when={productsData.error}>
              <div class="text-center py-16 px-4 bg-[var(--bg-surface)] border border-rose-500/20 rounded-2xl mb-6">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-2xl mb-2">
                  ⚠️
                </div>
                <h3 class="text-lg font-bold text-[var(--text-primary)] mb-2">Search Service Unavailable</h3>
                <p class="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                  We encountered an issue querying the catalog. Please try again.
                </p>
                <button
                  type="button"
                  onClick={() => store.resetFilters()}
                  class="px-5 py-2.5 rounded-xl bg-[var(--brand-600)] text-[var(--text-on-brand)] font-medium hover:bg-[var(--brand-700)] transition-all shadow-sm"
                >
                  Reset &amp; Retry
                </button>
              </div>
            </Show>

            {/* Suspense Boundary for Data Fetching */}
            <Suspense fallback={<ProductGridSkeleton count={8} />}>
              <Show when={productsData()}>
                {(data) => (
                  <>
                    <ProductGrid
                      products={data().content}
                      onAddToCart={handleAddToCart}
                      onQuickView={handleQuickView}
                      onResetFilters={store.resetFilters}
                    />

                    <Show when={data().totalPages > 1}>
                      <Pagination
                        pageNumber={data().pageNumber}
                        totalPages={data().totalPages}
                        pageSize={data().pageSize}
                        onPageChange={store.setPage}
                        onPageSizeChange={store.setPageSize}
                      />
                    </Show>
                  </>
                )}
              </Show>
            </Suspense>
          </div>
        </div>

        {/* Mobile Filter & Sort Modal Drawer */}
        <Show when={isMobileFilterOpen()}>
          <div class="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div
              class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setIsMobileFilterOpen(false)}
              aria-hidden="true"
            />
            <div class="fixed inset-y-0 left-0 max-w-full flex pr-10">
              <div class="w-screen max-w-xs sm:max-w-sm bg-[var(--bg-page)] border-r border-[var(--border)] shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300 overflow-y-auto p-4">
                <div class="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)]">
                  <span class="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>⚙️</span>
                    <span>Filter & Sort Creations</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    class="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Close filters"
                  >
                    ✕
                  </button>
                </div>
                <SearchFacetSidebar
                  facets={searchFacets()}
                  selectedCategory={store.criteria().categorySlug}
                  selectedBrand={store.criteria().brand}
                  selectedColor={store.criteria().color}
                  selectedProductType={store.criteria().productType}
                  selectedMinPrice={store.criteria().minPrice}
                  selectedMaxPrice={store.criteria().maxPrice}
                  selectedMinRating={store.criteria().minRating}
                  sort={store.criteria().sort || "newest"}
                  onSortChange={store.setSort}
                  onSelectCategory={handleSelectCategory}
                  onSelectBrand={store.setBrand}
                  onSelectColor={store.setColor}
                  onSelectProductType={store.setProductType}
                  onSelectPriceRange={store.setPriceRange}
                  onSelectMinRating={store.setMinRating}
                  onResetFilters={handleResetFilters}
                  activeFilterCount={store.activeFilterCount()}
                  isMobileDrawer={true}
                  onApplyMobile={() => setIsMobileFilterOpen(false)}
                />
              </div>
            </div>
          </div>
        </Show>
      </main>

      {/* Quick View Modal */}
      <Show when={quickViewProduct()}>
        {(product) => (
          <ProductQuickViewModal
            product={product()}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={async (prod, qty) => {
              const success = await cartStore.addItem({
                productId: prod.id,
                sku: prod.slug,
                title: prod.title,
                price: prod.price,
                quantity: qty,
                imageUrl: prod.thumbnailUrl || prod.images?.[0]?.url,
              });
              if (success) {
                triggerCelebration("cart");
              }
            }}
            onBuyNow={async (prod, qty) => {
              const success = await cartStore.addItem({
                productId: prod.id,
                sku: prod.slug,
                title: prod.title,
                price: prod.price,
                quantity: qty,
                imageUrl: prod.thumbnailUrl || prod.images?.[0]?.url,
              });
              setQuickViewProduct(null);
              cartStore.openCart();
              if (success) {
                triggerCelebration("cart");
              }
            }}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlistStore.isWishlisted(product())}
          />
        )}
      </Show>

      {/* Shared Artisan Footer */}
      <Footer />
    </div>
  );
}
