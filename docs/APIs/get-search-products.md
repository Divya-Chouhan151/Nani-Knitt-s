# API Specification: Full-Text Search with Facets & Spell Correction

- **Endpoint**: `GET /api/v1/search`
- **Service**: Search Service (`search-service` - Port 8083)
- **Authentication**: Optional / Public
- **Description**: Returns ranked search hits across products with faceted aggregations, spelling correction ("did you mean"), and pagination.

---

## 1. Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `q` | String | No | `""` | Free-text search query (multi-word, fuzzy tolerance) |
| `category` | String | No | - | Category slug or name filter |
| `brand` | String | No | - | Brand name filter |
| `minPrice` | BigDecimal | No | - | Minimum price filter |
| `maxPrice` | BigDecimal | No | - | Maximum price filter |
| `minRating` | BigDecimal | No | - | Minimum rating filter (e.g., 4.0) |
| `inStockOnly` | Boolean | No | `false` | When true, restricts results to `IN_STOCK` items |
| `sort` | String | No | `relevance` | Sort options: `relevance`, `price_asc`, `price_desc`, `rating_desc`, `newest` |
| `page` | Integer | No | `0` | Zero-indexed page number |
| `size` | Integer | No | `20` | Results per page (max 100) |

---

## 2. Response Schema (200 OK)

```json
{
  "content": [
    {
      "id": "c1f76d20-8e10-48e2-9b2f-4a0b271e8c91",
      "title": "Ergonomic Bamboo Wireless Mechanical Keyboard",
      "slug": "ergonomic-bamboo-wireless-mechanical-keyboard",
      "shortDescription": "Dual-mode Bluetooth 5.2 mechanical keyboard handcrafted with natural solid bamboo.",
      "categoryName": "Keyboards & Mice",
      "categorySlug": "keyboards-and-mice",
      "brand": "AuraWorks",
      "price": 11049.00,
      "compareAtPrice": 13599.00,
      "averageRating": 4.85,
      "reviewCount": 142,
      "stockStatus": "IN_STOCK",
      "thumbnailUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
      "badge": "BESTSELLER",
      "score": 4.82
    }
  ],
  "facets": {
    "categories": [
      { "key": "Keyboards & Mice", "count": 12 },
      { "key": "Monitors", "count": 8 }
    ],
    "brands": [
      { "key": "AuraWorks", "count": 15 },
      { "key": "Keychron", "count": 5 }
    ],
    "priceRanges": [
      { "key": "Under ₹5,000", "count": 4, "from": 0, "to": 5000 },
      { "key": "₹5,000 - ₹15,000", "count": 10, "from": 5000, "to": 15000 },
      { "key": "₹15,000 - ₹30,000", "count": 6, "from": 15000, "to": 30000 },
      { "key": "Over ₹30,000", "count": 4, "from": 30000, "to": null }
    ],
    "ratings": [
      { "key": "4.5 & up", "count": 14, "from": 4.5 },
      { "key": "4.0 & up", "count": 22, "from": 4.0 }
    ]
  },
  "didYouMean": null,
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 24,
  "totalPages": 2,
  "isFirst": true,
  "isLast": false,
  "hasNext": true,
  "hasPrevious": false
}
```

---

## 3. Spelling Suggestion Example

When a user searches for `"keybord"`:
```json
{
  "content": [...],
  "didYouMean": "keyboard",
  "totalElements": 12
}
```
