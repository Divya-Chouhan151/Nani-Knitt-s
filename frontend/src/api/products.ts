import { apiClient } from "./client";
import { PageResponse } from "../types/api";
import { ProductDetail, ProductFilterCriteria, ProductSummary } from "../types/product";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Temporary Placeholder / Seed Metadata Map for Nani's Knitts.
 * NOTE: All images are royalty-free stock photos of authentic hand-knitted and crochet woollen goods
 * sourced from Unsplash (under the Unsplash License: free for commercial and non-commercial use).
 * Replace these placeholder images and seed metadata once real seller photography is uploaded.
 */
export interface ProductKnitOverride {
  title?: string;
  slug?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  category?: { id: string; name: string; slug: string };
  color: string;
  colorHex: string;
  productType: string;
  audience: "Women" | "Men" | "Kids";
  isPlaceholder?: boolean;
}

export const PRODUCT_METADATA_MAP: Record<string, ProductKnitOverride> = {
  // 1. Chunky Hand-Knit Merino Wool Blanket
  "knit-01": {
    title: "Chunky Hand-Knit Merino Wool Blanket",
    slug: "chunky-hand-knit-merino-wool-blanket",
    shortDescription: "Ultra-soft 100% Australian merino wool chunky knit throw, handmade with care by artisan weavers.",
    thumbnailUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-women", name: "Women", slug: "women" },
    color: "Rose Pink",
    colorHex: "#f472b6",
    productType: "Blankets",
    audience: "Women",
    isPlaceholder: true,
  },
  "chunky-hand-knit-merino-wool-blanket": {
    color: "Rose Pink",
    colorHex: "#f472b6",
    productType: "Blankets",
    audience: "Women",
    isPlaceholder: true,
  },

  // 2. Hand-Spun Alpaca Cable Knit Scarf
  "knit-02": {
    title: "Hand-Spun Alpaca Cable Knit Scarf",
    slug: "hand-spun-alpaca-cable-knit-scarf",
    shortDescription: "Warm and lightweight luxury alpaca wool scarf featuring an intricate heritage cable knit stitch.",
    thumbnailUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-women", name: "Women", slug: "women" },
    color: "Mustard",
    colorHex: "#eab308",
    productType: "Scarves",
    audience: "Women",
    isPlaceholder: true,
  },
  "hand-spun-alpaca-cable-knit-scarf": {
    color: "Mustard",
    colorHex: "#eab308",
    productType: "Scarves",
    audience: "Women",
    isPlaceholder: true,
  },

  // 3. Vintage Fisherman Ribbed Knit Sweater
  "knit-03": {
    title: "Vintage Fisherman Ribbed Knit Sweater",
    slug: "vintage-fisherman-ribbed-knit-sweater",
    shortDescription: "Heavyweight pure wool pullover with raglan sleeves and natural moisture-resistant lanolin finish.",
    thumbnailUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-men", name: "Men", slug: "men" },
    color: "Forest Green",
    colorHex: "#15803d",
    productType: "Sweaters",
    audience: "Men",
    isPlaceholder: true,
  },
  "vintage-fisherman-ribbed-knit-sweater": {
    color: "Forest Green",
    colorHex: "#15803d",
    productType: "Sweaters",
    audience: "Men",
    isPlaceholder: true,
  },

  // 4. Handmade Crocheted Fox Stuffed Animal
  "knit-04": {
    title: "Handmade Crocheted Fox Stuffed Animal",
    slug: "handmade-crocheted-fox-stuffed-animal",
    shortDescription: "Adorable amigurumi forest fox crafted with organic certified non-toxic cotton yarn.",
    thumbnailUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-kids", name: "Kids", slug: "kids" },
    color: "Pastel Coral",
    colorHex: "#fb7185",
    productType: "Toys",
    audience: "Kids",
    isPlaceholder: true,
  },
  "handmade-crocheted-fox-stuffed-animal": {
    color: "Pastel Coral",
    colorHex: "#fb7185",
    productType: "Toys",
    audience: "Kids",
    isPlaceholder: true,
  },

  // 5. Warm Woven Slouchy Beanie Cap
  "knit-05": {
    title: "Warm Woven Slouchy Beanie Cap",
    slug: "warm-woven-slouchy-beanie-cap",
    shortDescription: "Chunky ribbed double-folded wool beanie cap tailored for wind protection and cozy everyday warmth.",
    thumbnailUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-men", name: "Men", slug: "men" },
    color: "Charcoal",
    colorHex: "#374151",
    productType: "Caps",
    audience: "Men",
    isPlaceholder: true,
  },
  "warm-woven-slouchy-beanie-cap": {
    color: "Charcoal",
    colorHex: "#374151",
    productType: "Caps",
    audience: "Men",
    isPlaceholder: true,
  },

  // 6. Organic Merino Hand-Knitted Baby Booties
  "knit-06": {
    title: "Organic Merino Hand-Knitted Baby Booties",
    slug: "organic-cotton-hand-knitted-baby-booties",
    shortDescription: "Gentle hand-knitted woolen booties with adjustable tie-cuffs for infants and toddlers.",
    thumbnailUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-kids", name: "Kids", slug: "kids" },
    color: "Soft Lavender",
    colorHex: "#c084fc",
    productType: "Socks",
    audience: "Kids",
    isPlaceholder: true,
  },
  "organic-cotton-hand-knitted-baby-booties": {
    color: "Soft Lavender",
    colorHex: "#c084fc",
    productType: "Socks",
    audience: "Kids",
    isPlaceholder: true,
  },

  // 7. Heirloom Honeycomb Knitted Throw
  "knit-07": {
    title: "Heirloom Honeycomb Knitted Throw",
    slug: "heirloom-honeycomb-knitted-throw",
    shortDescription: "Intricate textured waffle-knit blanket crafted with un-dyed organic sheep wool.",
    thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-women", name: "Women", slug: "women" },
    color: "Cream",
    colorHex: "#fef3c7",
    productType: "Blankets",
    audience: "Women",
    isPlaceholder: true,
  },
  "heirloom-honeycomb-knitted-throw": {
    color: "Cream",
    colorHex: "#fef3c7",
    productType: "Blankets",
    audience: "Women",
    isPlaceholder: true,
  },

  // 8. Hand-Knitted Fair Isle Wool Cardigan (Replaces legacy keyboard)
  "c1f76d20-8e10-48e2-9b2f-4a0b271e8c91": {
    title: "Hand-Knitted Fair Isle Wool Cardigan",
    slug: "hand-knitted-fair-isle-wool-cardigan",
    shortDescription: "Traditional Scottish Fair Isle patterned buttoned cardigan knitted from 100% Shetland wool.",
    thumbnailUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-men", name: "Men", slug: "men" },
    color: "Navy Blue",
    colorHex: "#1e3a8a",
    productType: "Sweaters",
    audience: "Men",
    isPlaceholder: true,
  },
  "ergonomic-bamboo-wireless-mechanical-keyboard": {
    title: "Hand-Knitted Fair Isle Wool Cardigan",
    slug: "hand-knitted-fair-isle-wool-cardigan",
    shortDescription: "Traditional Scottish Fair Isle patterned buttoned cardigan knitted from 100% Shetland wool.",
    thumbnailUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-men", name: "Men", slug: "men" },
    color: "Navy Blue",
    colorHex: "#1e3a8a",
    productType: "Sweaters",
    audience: "Men",
    isPlaceholder: true,
  },

  // 9. Cozy Cable-Knit Wool Mittens (Replaces legacy mouse)
  "d2e87c31-9f21-49f3-ac30-5b1c382f9d02": {
    title: "Cozy Cable-Knit Wool Mittens",
    slug: "cozy-cable-knit-wool-mittens",
    shortDescription: "Fleece-lined hand-knitted woolen mittens with decorative diamond cable stitches.",
    thumbnailUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-women", name: "Women", slug: "women" },
    color: "Oatmeal",
    colorHex: "#fef3c7",
    productType: "Mittens",
    audience: "Women",
    isPlaceholder: true,
  },
  "precision-ergonomic-vertical-mouse": {
    title: "Cozy Cable-Knit Wool Mittens",
    slug: "cozy-cable-knit-wool-mittens",
    shortDescription: "Fleece-lined hand-knitted woolen mittens with decorative diamond cable stitches.",
    thumbnailUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-women", name: "Women", slug: "women" },
    color: "Oatmeal",
    colorHex: "#fef3c7",
    productType: "Mittens",
    audience: "Women",
    isPlaceholder: true,
  },

  // 10. Chunky Bobble Crochet Beanie with Pom (Replaces legacy monitor)
  "a3b98d42-0a32-40a4-bd41-6c2d493a0e13": {
    title: "Chunky Bobble Crochet Beanie with Pom",
    slug: "chunky-bobble-crochet-beanie-with-pom",
    shortDescription: "Textured bobble-stitch crochet winter hat topped with a handcrafted yarn pom-pom.",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-women", name: "Women", slug: "women" },
    color: "Burnt Orange",
    colorHex: "#ea580c",
    productType: "Caps",
    audience: "Women",
    isPlaceholder: true,
  },
  "ultra-wide-34-inch-curved-monitor": {
    title: "Chunky Bobble Crochet Beanie with Pom",
    slug: "chunky-bobble-crochet-beanie-with-pom",
    shortDescription: "Textured bobble-stitch crochet winter hat topped with a handcrafted yarn pom-pom.",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-women", name: "Women", slug: "women" },
    color: "Burnt Orange",
    colorHex: "#ea580c",
    productType: "Caps",
    audience: "Women",
    isPlaceholder: true,
  },

  // 11. Handcrafted Amigurumi Bunny Stuffed Toy (Replaces legacy headphones)
  "b4c09e53-1b43-41b5-ce52-7d3e5a4b1f24": {
    title: "Handcrafted Amigurumi Bunny Stuffed Toy",
    slug: "handcrafted-amigurumi-bunny-stuffed-toy",
    shortDescription: "Sweet long-eared crocheted bunny toy dressed in a tiny handmade pastel pinafore.",
    thumbnailUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-kids", name: "Kids", slug: "kids" },
    color: "Mint Cream",
    colorHex: "#a7f3d0",
    productType: "Toys",
    audience: "Kids",
    isPlaceholder: true,
  },
  "active-noise-cancelling-studio-headphones": {
    title: "Handcrafted Amigurumi Bunny Stuffed Toy",
    slug: "handcrafted-amigurumi-bunny-stuffed-toy",
    shortDescription: "Sweet long-eared crocheted bunny toy dressed in a tiny handmade pastel pinafore.",
    thumbnailUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-kids", name: "Kids", slug: "kids" },
    color: "Mint Cream",
    colorHex: "#a7f3d0",
    productType: "Toys",
    audience: "Kids",
    isPlaceholder: true,
  },

  // 12. Nordic Geometric Wool Knitted Scarf (Replaces legacy desk riser)
  "c5d10f64-2c54-42c6-df63-8e4f6b5c2035": {
    title: "Nordic Geometric Wool Knitted Scarf",
    slug: "nordic-geometric-wool-knitted-scarf",
    shortDescription: "Double-thick jacquard knit muffler with classic Scandinavian snowflake and diamond motifs.",
    thumbnailUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-men", name: "Men", slug: "men" },
    color: "Slate Grey",
    colorHex: "#4b5563",
    productType: "Scarves",
    audience: "Men",
    isPlaceholder: true,
  },
  "solid-walnut-desk-shelf-monitor-riser": {
    title: "Nordic Geometric Wool Knitted Scarf",
    slug: "nordic-geometric-wool-knitted-scarf",
    shortDescription: "Double-thick jacquard knit muffler with classic Scandinavian snowflake and diamond motifs.",
    thumbnailUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-men", name: "Men", slug: "men" },
    color: "Slate Grey",
    colorHex: "#4b5563",
    productType: "Scarves",
    audience: "Men",
    isPlaceholder: true,
  },

  // 13. Merino Wool Hooded Baby Romper (Replaces legacy usb cable)
  "d6e21075-3d65-43d7-e074-9f507c6d3146": {
    title: "Merino Wool Hooded Baby Romper",
    slug: "merino-wool-hooded-baby-romper",
    shortDescription: "Seamless all-in-one knitted wool romper with bear-ear hood and genuine wooden toggle buttons.",
    thumbnailUrl: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-kids", name: "Kids", slug: "kids" },
    color: "Sky Blue",
    colorHex: "#60a5fa",
    productType: "Sweaters",
    audience: "Kids",
    isPlaceholder: true,
  },
  "custom-coiled-aviator-usbc-cable": {
    title: "Merino Wool Hooded Baby Romper",
    slug: "merino-wool-hooded-baby-romper",
    shortDescription: "Seamless all-in-one knitted wool romper with bear-ear hood and genuine wooden toggle buttons.",
    thumbnailUrl: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-kids", name: "Kids", slug: "kids" },
    color: "Sky Blue",
    colorHex: "#60a5fa",
    productType: "Sweaters",
    audience: "Kids",
    isPlaceholder: true,
  },

  // 14. Artisan Chunky Cable Knit Cardigan (Replaces legacy desk pad)
  "e7f32186-4e76-44e8-f185-a0618d7e4257": {
    title: "Artisan Chunky Cable Knit Cardigan",
    slug: "artisan-chunky-cable-knit-cardigan",
    shortDescription: "Oversized cozy knit coatigan with deep pockets and handcrafted mother-of-pearl buttons.",
    thumbnailUrl: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-women", name: "Women", slug: "women" },
    color: "Cream",
    colorHex: "#fef3c7",
    productType: "Sweaters",
    audience: "Women",
    isPlaceholder: true,
  },
  "minimalist-felt-cork-desk-pad": {
    title: "Artisan Chunky Cable Knit Cardigan",
    slug: "artisan-chunky-cable-knit-cardigan",
    shortDescription: "Oversized cozy knit coatigan with deep pockets and handcrafted mother-of-pearl buttons.",
    thumbnailUrl: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-women", name: "Women", slug: "women" },
    color: "Cream",
    colorHex: "#fef3c7",
    productType: "Sweaters",
    audience: "Women",
    isPlaceholder: true,
  },

  // 15. Ribbed Waffle Knit Thermal Wool Scarf (Replaces legacy monitor arm)
  "f8043297-5f87-45f9-0296-b1729e8f5368": {
    title: "Ribbed Waffle Knit Thermal Wool Scarf",
    slug: "ribbed-waffle-knit-thermal-wool-scarf",
    shortDescription: "Extra-long masculine wool scarf with tactile waffle ribbing and fringe trim.",
    thumbnailUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-men", name: "Men", slug: "men" },
    color: "Charcoal",
    colorHex: "#374151",
    productType: "Scarves",
    audience: "Men",
    isPlaceholder: true,
  },
  "modular-dual-monitor-aluminum-arm": {
    title: "Ribbed Waffle Knit Thermal Wool Scarf",
    slug: "ribbed-waffle-knit-thermal-wool-scarf",
    shortDescription: "Extra-long masculine wool scarf with tactile waffle ribbing and fringe trim.",
    thumbnailUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-men", name: "Men", slug: "men" },
    color: "Charcoal",
    colorHex: "#374151",
    productType: "Scarves",
    audience: "Men",
    isPlaceholder: true,
  },
};

/**
 * Enriches product summaries and details to guarantee:
 * 1. Consistent woollen/crochet imagery and title mapping across all pages.
 * 2. Proper category mapping (strictly Men, Women, or Kids).
 * 3. Tagging with isPlaceholder: true so placeholders are transparently identifiable.
 */
export function enrichProduct<T extends ProductSummary>(p: T): T {
  const meta = PRODUCT_METADATA_MAP[p.id] || PRODUCT_METADATA_MAP[p.slug];
  if (meta) {
    return {
      ...p,
      title: meta.title || p.title,
      slug: meta.slug || p.slug,
      shortDescription: meta.shortDescription || p.shortDescription,
      thumbnailUrl: meta.thumbnailUrl || p.thumbnailUrl,
      category: meta.category || p.category,
      color: meta.color || p.color,
      colorHex: meta.colorHex || p.colorHex,
      productType: meta.productType || p.productType,
      audience: meta.audience || p.audience,
      isPlaceholder: true,
    };
  }
  return {
    ...p,
    color: p.color || "Rose Pink",
    colorHex: p.colorHex || "#f472b6",
    productType: p.productType || "Blankets",
    audience: p.audience || "Women",
    isPlaceholder: true,
  };
}

/**
 * Seed Catalog: 100% Handcrafted Knitted and Crochet Woollen Creations.
 * All photos licensed under Unsplash License (free for commercial and personal use).
 * Marked with isPlaceholder: true pending seller photography uploads.
 */
export const MOCK_PRODUCTS: ProductSummary[] = [
  {
    id: "knit-01",
    title: "Chunky Hand-Knit Merino Wool Blanket",
    slug: "chunky-hand-knit-merino-wool-blanket",
    shortDescription: "Ultra-soft 100% Australian merino wool chunky knit throw, handmade with care by artisan weavers.",
    category: { id: "cat-women", name: "Women", slug: "women" },
    thumbnailUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80",
    price: 4599,
    compareAtPrice: 5999,
    currency: "INR",
    averageRating: 4.95,
    reviewCount: 88,
    stockStatus: "IN_STOCK",
    badge: "BESTSELLER",
    createdAt: "2026-09-10T12:00:00Z",
    color: "Rose Pink",
    colorHex: "#f472b6",
    productType: "Blankets",
    audience: "Women",
    isPlaceholder: true,
  },
  {
    id: "knit-02",
    title: "Hand-Spun Alpaca Cable Knit Scarf",
    slug: "hand-spun-alpaca-cable-knit-scarf",
    shortDescription: "Warm and lightweight luxury alpaca wool scarf featuring an intricate heritage cable knit stitch.",
    category: { id: "cat-women", name: "Women", slug: "women" },
    thumbnailUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80",
    price: 2499,
    compareAtPrice: 3200,
    currency: "INR",
    averageRating: 4.88,
    reviewCount: 45,
    stockStatus: "IN_STOCK",
    badge: "NEW",
    createdAt: "2026-09-08T10:00:00Z",
    color: "Mustard",
    colorHex: "#eab308",
    productType: "Scarves",
    audience: "Women",
    isPlaceholder: true,
  },
  {
    id: "knit-03",
    title: "Vintage Fisherman Ribbed Knit Sweater",
    slug: "vintage-fisherman-ribbed-knit-sweater",
    shortDescription: "Heavyweight pure wool pullover with raglan sleeves and natural moisture-resistant lanolin finish.",
    category: { id: "cat-men", name: "Men", slug: "men" },
    thumbnailUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
    price: 5899,
    compareAtPrice: 7200,
    currency: "INR",
    averageRating: 4.9,
    reviewCount: 62,
    stockStatus: "IN_STOCK",
    badge: "FEATURED",
    createdAt: "2026-09-06T14:30:00Z",
    color: "Forest Green",
    colorHex: "#15803d",
    productType: "Sweaters",
    audience: "Men",
    isPlaceholder: true,
  },
  {
    id: "knit-04",
    title: "Handmade Crocheted Fox Stuffed Animal",
    slug: "handmade-crocheted-fox-stuffed-animal",
    shortDescription: "Adorable amigurumi forest fox crafted with organic certified non-toxic cotton yarn.",
    category: { id: "cat-kids", name: "Kids", slug: "kids" },
    thumbnailUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80",
    price: 1299,
    compareAtPrice: 1699,
    currency: "INR",
    averageRating: 4.96,
    reviewCount: 104,
    stockStatus: "IN_STOCK",
    badge: "FAVORITE",
    createdAt: "2026-09-05T09:15:00Z",
    color: "Pastel Coral",
    colorHex: "#fb7185",
    productType: "Toys",
    audience: "Kids",
    isPlaceholder: true,
  },
  {
    id: "knit-05",
    title: "Warm Woven Slouchy Beanie Cap",
    slug: "warm-woven-slouchy-beanie-cap",
    shortDescription: "Chunky ribbed double-folded wool beanie cap tailored for wind protection and cozy everyday warmth.",
    category: { id: "cat-men", name: "Men", slug: "men" },
    thumbnailUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80",
    price: 1499,
    compareAtPrice: 1899,
    currency: "INR",
    averageRating: 4.85,
    reviewCount: 52,
    stockStatus: "IN_STOCK",
    badge: null,
    createdAt: "2026-09-04T16:20:00Z",
    color: "Charcoal",
    colorHex: "#374151",
    productType: "Caps",
    audience: "Men",
    isPlaceholder: true,
  },
  {
    id: "knit-06",
    title: "Organic Merino Hand-Knitted Baby Booties",
    slug: "organic-cotton-hand-knitted-baby-booties",
    shortDescription: "Gentle hand-knitted woolen booties with adjustable tie-cuffs for infants and toddlers.",
    category: { id: "cat-kids", name: "Kids", slug: "kids" },
    thumbnailUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80",
    price: 999,
    compareAtPrice: 1299,
    currency: "INR",
    averageRating: 4.92,
    reviewCount: 39,
    stockStatus: "IN_STOCK",
    badge: "NEW",
    createdAt: "2026-09-03T11:45:00Z",
    color: "Soft Lavender",
    colorHex: "#c084fc",
    productType: "Socks",
    audience: "Kids",
    isPlaceholder: true,
  },
  {
    id: "knit-07",
    title: "Heirloom Honeycomb Knitted Throw",
    slug: "heirloom-honeycomb-knitted-throw",
    shortDescription: "Intricate textured waffle-knit blanket crafted with un-dyed organic sheep wool.",
    category: { id: "cat-women", name: "Women", slug: "women" },
    thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    price: 5299,
    compareAtPrice: 6500,
    currency: "INR",
    averageRating: 4.91,
    reviewCount: 71,
    stockStatus: "IN_STOCK",
    badge: "BESTSELLER",
    createdAt: "2026-09-02T13:00:00Z",
    color: "Cream",
    colorHex: "#fef3c7",
    productType: "Blankets",
    audience: "Women",
    isPlaceholder: true,
  },
  {
    id: "knit-08",
    title: "Hand-Knitted Fair Isle Wool Cardigan",
    slug: "hand-knitted-fair-isle-wool-cardigan",
    shortDescription: "Traditional Scottish Fair Isle patterned buttoned cardigan knitted from 100% Shetland wool.",
    category: { id: "cat-men", name: "Men", slug: "men" },
    thumbnailUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80",
    price: 6499,
    compareAtPrice: 7999,
    currency: "INR",
    averageRating: 4.88,
    reviewCount: 56,
    stockStatus: "IN_STOCK",
    badge: "FEATURED",
    createdAt: "2026-09-01T15:00:00Z",
    color: "Navy Blue",
    colorHex: "#1e3a8a",
    productType: "Sweaters",
    audience: "Men",
    isPlaceholder: true,
  },
  {
    id: "knit-09",
    title: "Cozy Cable-Knit Wool Mittens",
    slug: "cozy-cable-knit-wool-mittens",
    shortDescription: "Fleece-lined hand-knitted woolen mittens with decorative diamond cable stitches.",
    category: { id: "cat-women", name: "Women", slug: "women" },
    thumbnailUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    price: 1199,
    compareAtPrice: 1599,
    currency: "INR",
    averageRating: 4.82,
    reviewCount: 43,
    stockStatus: "IN_STOCK",
    badge: null,
    createdAt: "2026-08-30T10:00:00Z",
    color: "Oatmeal",
    colorHex: "#fef3c7",
    productType: "Mittens",
    audience: "Women",
    isPlaceholder: true,
  },
  {
    id: "knit-10",
    title: "Chunky Bobble Crochet Beanie with Pom",
    slug: "chunky-bobble-crochet-beanie-with-pom",
    shortDescription: "Textured bobble-stitch crochet winter hat topped with a handcrafted yarn pom-pom.",
    category: { id: "cat-women", name: "Women", slug: "women" },
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    price: 1399,
    compareAtPrice: 1799,
    currency: "INR",
    averageRating: 4.9,
    reviewCount: 67,
    stockStatus: "IN_STOCK",
    badge: "FAVORITE",
    createdAt: "2026-08-28T09:30:00Z",
    color: "Burnt Orange",
    colorHex: "#ea580c",
    productType: "Caps",
    audience: "Women",
    isPlaceholder: true,
  },
  {
    id: "knit-11",
    title: "Handcrafted Amigurumi Bunny Stuffed Toy",
    slug: "handcrafted-amigurumi-bunny-stuffed-toy",
    shortDescription: "Sweet long-eared crocheted bunny toy dressed in a tiny handmade pastel pinafore.",
    category: { id: "cat-kids", name: "Kids", slug: "kids" },
    thumbnailUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80",
    price: 1449,
    compareAtPrice: 1899,
    currency: "INR",
    averageRating: 4.97,
    reviewCount: 92,
    stockStatus: "IN_STOCK",
    badge: "BESTSELLER",
    createdAt: "2026-08-26T14:15:00Z",
    color: "Mint Cream",
    colorHex: "#a7f3d0",
    productType: "Toys",
    audience: "Kids",
    isPlaceholder: true,
  },
  {
    id: "knit-12",
    title: "Nordic Geometric Wool Knitted Scarf",
    slug: "nordic-geometric-wool-knitted-scarf",
    shortDescription: "Double-thick jacquard knit muffler with classic Scandinavian snowflake and diamond motifs.",
    category: { id: "cat-men", name: "Men", slug: "men" },
    thumbnailUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80",
    price: 2799,
    compareAtPrice: 3499,
    currency: "INR",
    averageRating: 4.89,
    reviewCount: 50,
    stockStatus: "IN_STOCK",
    badge: null,
    createdAt: "2026-08-24T11:20:00Z",
    color: "Slate Grey",
    colorHex: "#4b5563",
    productType: "Scarves",
    audience: "Men",
    isPlaceholder: true,
  },
];

export const MOCK_GALLERY_IMAGES: Record<string, Array<{ url: string; altText: string }>> = {
  "chunky-hand-knit-merino-wool-blanket": [
    { url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1000&auto=format&fit=crop&q=80", altText: "Chunky knit texture close-up" },
    { url: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=1000&auto=format&fit=crop&q=80", altText: "Merino wool knit draped on bed" },
  ],
  "hand-spun-alpaca-cable-knit-scarf": [
    { url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1000&auto=format&fit=crop&q=80", altText: "Warm cable knit weave" },
    { url: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=1000&auto=format&fit=crop&q=80", altText: "Soft wool scarf texture" },
  ],
  "vintage-fisherman-ribbed-knit-sweater": [
    { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1000&auto=format&fit=crop&q=80", altText: "Ribbed stitch knit texture" },
    { url: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=1000&auto=format&fit=crop&q=80", altText: "Heavyweight wool pullover detail" },
  ],
  "handmade-crocheted-fox-stuffed-animal": [
    { url: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1000&auto=format&fit=crop&q=80", altText: "Hand-stitched amigurumi fox" },
    { url: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=1000&auto=format&fit=crop&q=80", altText: "Soft cotton crochet stitches" },
  ],
  "warm-woven-slouchy-beanie-cap": [
    { url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=1000&auto=format&fit=crop&q=80", altText: "Charcoal wool beanie fold" },
    { url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&auto=format&fit=crop&q=80", altText: "Knit wool hat crown" },
  ],
  "organic-cotton-hand-knitted-baby-booties": [
    { url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1000&auto=format&fit=crop&q=80", altText: "Soft pastel baby booties" },
    { url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=1000&auto=format&fit=crop&q=80", altText: "Delicate baby wool knit detail" },
  ],
  "heirloom-honeycomb-knitted-throw": [
    { url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80", altText: "Honeycomb knit pattern" },
  ],
  "hand-knitted-fair-isle-wool-cardigan": [
    { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1000&auto=format&fit=crop&q=80", altText: "Fair Isle cardigan button line" },
  ],
  "cozy-cable-knit-wool-mittens": [
    { url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80", altText: "Cable knit mittens in snow" },
  ],
  "chunky-bobble-crochet-beanie-with-pom": [
    { url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80", altText: "Bobble crochet stitch and pom" },
  ],
  "handcrafted-amigurumi-bunny-stuffed-toy": [
    { url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1000&auto=format&fit=crop&q=80", altText: "Crochet bunny ears and expression" },
  ],
  "nordic-geometric-wool-knitted-scarf": [
    { url: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=1000&auto=format&fit=crop&q=80", altText: "Nordic snowflake jacquard weave" },
  ],
};

export function filterProductList(items: ProductSummary[], criteria: ProductFilterCriteria): ProductSummary[] {
  let filtered = [...items];

  // Category or Audience filter (Men, Women, Kids, or specific slug)
  if (criteria.categorySlug) {
    const slugLower = criteria.categorySlug.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.category?.slug?.toLowerCase() === slugLower ||
        p.category?.name?.toLowerCase() === slugLower ||
        p.audience?.toLowerCase() === slugLower
    );
  }

  // Colour filter
  if (criteria.color) {
    const colorLower = criteria.color.toLowerCase();
    filtered = filtered.filter((p) => p.color?.toLowerCase() === colorLower);
  }

  // Product Type filter
  if (criteria.productType) {
    const typeLower = criteria.productType.toLowerCase();
    filtered = filtered.filter((p) => p.productType?.toLowerCase() === typeLower);
  }

  // Price range filters
  if (criteria.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= criteria.minPrice!);
  }
  if (criteria.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= criteria.maxPrice!);
  }

  // Rating filter
  if (criteria.minRating !== undefined) {
    filtered = filtered.filter((p) => p.averageRating >= criteria.minRating!);
  }

  // Stock status filter
  if (criteria.inStockOnly) {
    filtered = filtered.filter((p) => p.stockStatus !== "OUT_OF_STOCK");
  }

  // Text search query
  if (criteria.query && criteria.query.trim().length > 0) {
    const tokens = criteria.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    filtered = filtered.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const desc = (p.shortDescription || "").toLowerCase();
      const color = (p.color || "").toLowerCase();
      const type = (p.productType || "").toLowerCase();
      const cat = (p.category?.name || "").toLowerCase();
      const aud = (p.audience || "").toLowerCase();
      return tokens.every(
        (t) =>
          title.includes(t) ||
          desc.includes(t) ||
          color.includes(t) ||
          type.includes(t) ||
          cat.includes(t) ||
          aud.includes(t)
      );
    });
  }

  // Sorting
  switch (criteria.sort) {
    case "price_asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => b.averageRating - a.averageRating);
      break;
    case "popularity":
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "newest":
    default:
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return filtered;
}

export async function fetchProducts(criteria: ProductFilterCriteria = {}): Promise<PageResponse<ProductSummary>> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const enriched = MOCK_PRODUCTS.map(enrichProduct);
    const filtered = filterProductList(enriched, criteria);

    const page = criteria.page || 0;
    const size = criteria.size || 20;
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const paginatedContent = filtered.slice(start, start + size);

    return {
      content: paginatedContent,
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

  try {
    const res = await apiClient<PageResponse<ProductSummary>>(`/products`);
    // Enrich server content to map legacy backend IDs to authentic woollen creations
    const serverItems = res.content.map(enrichProduct);
    const existingIds = new Set(serverItems.map((i) => i.id));
    const extraKnits = MOCK_PRODUCTS.filter((m) => !existingIds.has(m.id)).map(enrichProduct);
    const allProducts = [...extraKnits, ...serverItems];

    const filtered = filterProductList(allProducts, criteria);

    const page = criteria.page || 0;
    const size = criteria.size || 20;
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const paginatedContent = filtered.slice(start, start + size);

    return {
      content: paginatedContent,
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      isFirst: page === 0,
      isLast: page >= totalPages - 1 || totalPages === 0,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0,
    };
  } catch (err) {
    // Graceful offline fallback to mock collection
    const enriched = MOCK_PRODUCTS.map(enrichProduct);
    const filtered = filterProductList(enriched, criteria);

    const page = criteria.page || 0;
    const size = criteria.size || 20;
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const paginatedContent = filtered.slice(start, start + size);

    return {
      content: paginatedContent,
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

export async function fetchProductByIdOrSlug(idOrSlug: string): Promise<ProductDetail> {
  const findInMock = () => {
    const summary = MOCK_PRODUCTS.find((p) => p.slug === idOrSlug || p.id === idOrSlug);
    if (!summary) return null;

    const enriched = enrichProduct(summary);
    const customGallery = MOCK_GALLERY_IMAGES[summary.slug] || [
      { url: summary.thumbnailUrl, altText: summary.title },
    ];

    return {
      ...enriched,
      description: `Every piece from Nani's Knitts is crafted with patience and devotion. The ${summary.title} uses premium natural fibers, sustainable dye-baths, and heritage handcrafted techniques designed to last a lifetime.`,
      images: customGallery.map((img, i) => ({
        id: `img-${i}`,
        url: img.url,
        altText: img.altText,
        isPrimary: i === 0,
        sortOrder: i,
      })),
      variants: [
        {
          id: `var-${summary.id}-default`,
          sku: `${summary.slug.slice(0, 8).toUpperCase()}-DEF`,
          price: summary.price,
          compareAtPrice: summary.compareAtPrice,
          stockQuantity: summary.stockStatus === "OUT_OF_STOCK" ? 0 : 25,
          stockStatus: summary.stockStatus,
          isDefault: true,
        },
      ],
      baseAttributes: {
        "Craft Technique": "Handmade / Artisan Needlecraft",
        "Primary Material": enriched.color || "Pure Natural Fibers",
        "Care Instructions": "Hand wash cold with gentle soap, dry flat in shade",
      },
      returnPolicy: "7-day easy returns on non-customized pieces in original artisan packaging.",
      warranty: "1-year craftwork authenticity guarantee.",
    };
  };

  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const mockDetail = findInMock();
    if (mockDetail) return mockDetail;
    throw { status: 404, error: "Product Not Found", message: `Product ${idOrSlug} not found` };
  }

  try {
    const detail = await apiClient<ProductDetail>(`/products/${idOrSlug}`);
    return enrichProduct(detail);
  } catch (err) {
    const fallback = findInMock();
    if (fallback) return fallback;
    throw err;
  }
}
