import { ProductSummary } from "../types/product";
import { enrichProduct, MOCK_PRODUCTS, filterProductList } from "./products";

const SEARCH_API_URL = import.meta.env.VITE_SEARCH_API_URL || "/api/v1/search";

export interface FacetBucket {
  key: string;
  count: number;
}

export interface RangeFacetBucket {
  key: string;
  count: number;
  from?: number;
  to?: number;
}

export interface SearchFacets {
  categories: FacetBucket[];
  brands: FacetBucket[];
  priceRanges: RangeFacetBucket[];
  ratings: RangeFacetBucket[];
  stockStatuses: FacetBucket[];
}

export interface SearchResult {
  content: ProductSummary[];
  facets: SearchFacets;
  didYouMean?: string | null;
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ProductSuggestion {
  id: string;
  title: string;
  slug: string;
  categoryName?: string;
  price?: number;
  thumbnailUrl?: string;
}

export interface CategorySuggestion {
  name: string;
  slug: string;
}

export interface SuggestionResponse {
  query: string;
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  brands: string[];
}

export interface SearchFilterCriteria {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

function mapHitToProductSummary(hit: any): ProductSummary {
  const categoryName = hit.categoryName || hit.category?.name || "Handcrafted";
  const categorySlug = hit.categorySlug || hit.category?.slug || "handcrafted";
  const categoryId = hit.category?.id || `cat-${categorySlug}`;

  const summary: ProductSummary = {
    id: hit.id,
    title: hit.title,
    slug: hit.slug,
    shortDescription: hit.shortDescription,
    category: {
      id: categoryId,
      name: categoryName,
      slug: categorySlug,
    },
    thumbnailUrl: hit.thumbnailUrl,
    price: Number(hit.price) || 0,
    compareAtPrice: hit.compareAtPrice ? Number(hit.compareAtPrice) : null,
    currency: "INR",
    averageRating: Number(hit.averageRating) || 5.0,
    reviewCount: Number(hit.reviewCount) || 0,
    stockStatus: hit.stockStatus || "IN_STOCK",
    badge: hit.badge || null,
    createdAt: hit.createdAt || new Date().toISOString(),
  };

  return enrichProduct(summary);
}

export async function searchCatalog(criteria: SearchFilterCriteria): Promise<SearchResult> {
  const params = new URLSearchParams();
  if (criteria.q) params.append("q", criteria.q);
  if (criteria.category) params.append("category", criteria.category);
  if (criteria.brand) params.append("brand", criteria.brand);
  if (criteria.minPrice !== undefined) params.append("minPrice", criteria.minPrice.toString());
  if (criteria.maxPrice !== undefined) params.append("maxPrice", criteria.maxPrice.toString());
  if (criteria.minRating !== undefined) params.append("minRating", criteria.minRating.toString());
  if (criteria.inStockOnly) params.append("inStockOnly", "true");
  if (criteria.sort) params.append("sort", criteria.sort);
  if (criteria.page !== undefined) params.append("page", criteria.page.toString());
  if (criteria.size !== undefined) params.append("size", criteria.size.toString());

  const queryString = params.toString();
  const url = `${SEARCH_API_URL}${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Search error: ${res.status}`);
    const data = await res.json();

    const content: ProductSummary[] = (data.content || []).map(mapHitToProductSummary);

    return {
      content,
      facets: data.facets || {
        categories: [],
        brands: [],
        priceRanges: [],
        ratings: [],
        stockStatuses: [],
      },
      didYouMean: data.didYouMean || null,
      pageNumber: data.pageNumber || 0,
      pageSize: data.pageSize || criteria.size || 20,
      totalElements: data.totalElements !== undefined ? data.totalElements : content.length,
      totalPages: data.totalPages !== undefined ? data.totalPages : Math.ceil(content.length / (criteria.size || 20)),
      isFirst: data.isFirst ?? true,
      isLast: data.isLast ?? true,
      hasNext: data.hasNext ?? false,
      hasPrevious: data.hasPrevious ?? false,
    };
  } catch {
    // Graceful offline fallback to client-side filtering over mock collection
    const enriched = MOCK_PRODUCTS.map(enrichProduct);
    const filtered = filterProductList(enriched, {
      query: criteria.q,
      categorySlug: criteria.category,
      brand: criteria.brand,
      minPrice: criteria.minPrice,
      maxPrice: criteria.maxPrice,
      minRating: criteria.minRating,
      inStockOnly: criteria.inStockOnly,
      sort: criteria.sort,
      page: criteria.page,
      size: criteria.size,
    });

    const page = criteria.page || 0;
    const size = criteria.size || 20;
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const paginatedContent = filtered.slice(start, start + size);

    // Compute basic facets from filtered items
    const catMap = new Map<string, number>();
    const brandMap = new Map<string, number>();
    filtered.forEach((p) => {
      const c = p.category?.name || "Handcrafted";
      catMap.set(c, (catMap.get(c) || 0) + 1);
      const b = p.audience || "Artisan";
      brandMap.set(b, (brandMap.get(b) || 0) + 1);
    });

    return {
      content: paginatedContent,
      facets: {
        categories: Array.from(catMap.entries()).map(([key, count]) => ({ key, count })),
        brands: Array.from(brandMap.entries()).map(([key, count]) => ({ key, count })),
        priceRanges: [
          { key: "Under ₹2,000", count: filtered.filter((p) => p.price < 2000).length, from: 0, to: 2000 },
          { key: "₹2,000 - ₹5,000", count: filtered.filter((p) => p.price >= 2000 && p.price <= 5000).length, from: 2000, to: 5000 },
          { key: "Over ₹5,000", count: filtered.filter((p) => p.price > 5000).length, from: 5000 },
        ],
        ratings: [
          { key: "4.5 & up", count: filtered.filter((p) => p.averageRating >= 4.5).length, from: 4.5, to: 5.0 },
          { key: "4.0 & up", count: filtered.filter((p) => p.averageRating >= 4.0).length, from: 4.0, to: 5.0 },
        ],
        stockStatuses: [
          { key: "IN_STOCK", count: filtered.filter((p) => p.stockStatus === "IN_STOCK").length },
        ],
      },
      didYouMean: null,
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      isFirst: page === 0,
      isLast: page >= totalPages - 1 || totalPages === 0,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0,
    };
  }
}

export async function fetchSuggestions(query: string, limit: number = 6): Promise<SuggestionResponse> {
  if (!query || query.trim().length < 2) {
    return { query, products: [], categories: [], brands: [] };
  }

  const qTrim = query.trim();
  const url = `${SEARCH_API_URL}/suggestions?q=${encodeURIComponent(qTrim)}&limit=${limit}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Suggestions error: ${res.status}`);
    const data = await res.json();
    return {
      query: data.query || qTrim,
      products: data.products || [],
      categories: data.categories || [],
      brands: data.brands || [],
    };
  } catch {
    // Offline fallback suggestions from local products
    const qLower = qTrim.toLowerCase();
    const enriched = MOCK_PRODUCTS.map(enrichProduct);
    const matched = enriched
      .filter((p) => p.title.toLowerCase().includes(qLower) || (p.shortDescription || "").toLowerCase().includes(qLower))
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        categoryName: p.category.name,
        price: p.price,
        thumbnailUrl: p.thumbnailUrl,
      }));

    return {
      query: qTrim,
      products: matched,
      categories: [
        { name: "Women", slug: "women" },
        { name: "Men", slug: "men" },
        { name: "Kids", slug: "kids" },
      ].filter((c) => c.name.toLowerCase().includes(qLower)),
      brands: ["Nani's Knitts"].filter((b) => b.toLowerCase().includes(qLower)),
    };
  }
}
