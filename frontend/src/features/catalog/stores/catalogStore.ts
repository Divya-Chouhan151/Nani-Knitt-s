import { createSignal } from "solid-js";
import { ProductFilterCriteria } from "../../../types/product";

export function createCatalogStore(initial?: Partial<ProductFilterCriteria>) {
  const [criteria, setCriteria] = createSignal<ProductFilterCriteria>({
    page: 0,
    size: 20,
    sort: "newest",
    inStockOnly: false,
    query: "",
    ...initial,
  });

  const setPage = (page: number) => setCriteria((prev) => ({ ...prev, page }));
  const setPageSize = (size: number) => setCriteria((prev) => ({ ...prev, size, page: 0 }));
  const setSort = (sort: string) => setCriteria((prev) => ({ ...prev, sort, page: 0 }));
  const setQuery = (query: string) => setCriteria((prev) => ({ ...prev, query, page: 0 }));
  const setCategorySlug = (categorySlug?: string) => setCriteria((prev) => ({ ...prev, categorySlug, page: 0 }));
  const setBrand = (brand?: string) => setCriteria((prev) => ({ ...prev, brand, page: 0 }));
  const setColor = (color?: string) => setCriteria((prev) => ({ ...prev, color, page: 0 }));
  const setProductType = (productType?: string) => setCriteria((prev) => ({ ...prev, productType, page: 0 }));
  const setPriceRange = (minPrice?: number, maxPrice?: number) => setCriteria((prev) => ({ ...prev, minPrice, maxPrice, page: 0 }));
  const setMinRating = (minRating?: number) => setCriteria((prev) => ({ ...prev, minRating, page: 0 }));
  const setInStockOnly = (inStockOnly: boolean) => setCriteria((prev) => ({ ...prev, inStockOnly, page: 0 }));

  const resetFilters = () =>
    setCriteria({
      page: 0,
      size: 20,
      sort: "newest",
      inStockOnly: false,
      query: "",
      categorySlug: undefined,
      brand: undefined,
      color: undefined,
      productType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
    });

  const activeFilterCount = () => {
    let count = 0;
    const c = criteria();
    if (c.query && c.query.trim().length > 0) count++;
    if (c.categorySlug) count++;
    if (c.brand) count++;
    if (c.color) count++;
    if (c.productType) count++;
    if (c.minPrice !== undefined || c.maxPrice !== undefined) count++;
    if (c.minRating !== undefined) count++;
    return count;
  };

  return {
    criteria,
    setPage,
    setPageSize,
    setSort,
    setQuery,
    setCategorySlug,
    setBrand,
    setColor,
    setProductType,
    setPriceRange,
    setMinRating,
    setInStockOnly,
    resetFilters,
    activeFilterCount,
  };
}
