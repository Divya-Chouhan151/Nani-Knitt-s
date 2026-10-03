export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug: string;
  path?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  barcode?: string;
  variantOptions?: Record<string, string>;
  stockQuantity: number;
  stockStatus: StockStatus;
  isDefault: boolean;
}

export interface ProductSummary {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  category: ProductCategoryRef;
  thumbnailUrl: string;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  averageRating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  badge?: string | null;
  createdAt: string;
  color?: string;
  colorHex?: string;
  productType?: string;
  audience?: string; // "Women" | "Men" | "Kids" | "Unisex"
  /** Temporary placeholder/seed data flag until seller photography is uploaded */
  isPlaceholder?: boolean;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  images: ProductImage[];
  variants: ProductVariant[];
  baseAttributes?: Record<string, string>;
  returnPolicy?: string;
  warranty?: string;
}

export interface ProductFilterCriteria {
  page?: number;
  size?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating_desc" | "popularity" | string;
  categoryId?: string;
  categorySlug?: string;
  query?: string;
  brand?: string;
  color?: string;
  productType?: string;
  audience?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
}
