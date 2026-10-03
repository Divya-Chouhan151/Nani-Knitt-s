# API Specification: Get Product Facets

- **Endpoint**: `GET /api/v1/products/facets`
- **Service**: Product Service
- **Authentication**: None (Public)
- **Description**: Returns aggregated facet counts, available price boundaries (min and max across the catalog), and rating breakdown based on the current filtering context. This powers the dynamic landing page sidebar filters.

---

## 1. Request Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `categoryId` | UUID | No | Scope facets within a specific category |
| `categorySlug` | String | No | Scope facets within a category slug |
| `query` | String | No | Scope facets within a search keyword |

---

## 2. Response Schema (200 OK)

```json
{
  "priceRange": {
    "min": 19.99,
    "max": 899.99
  },
  "ratingDistribution": [
    { "rating": 5, "count": 48 },
    { "rating": 4, "count": 26 },
    { "rating": 3, "count": 8 },
    { "rating": 2, "count": 2 },
    { "rating": 1, "count": 0 }
  ],
  "categories": [
    {
      "id": "e83e5891-b14a-4d7a-b5ea-16e0339d2c12",
      "name": "Keyboards & Mice",
      "slug": "keyboards-and-mice",
      "count": 84
    },
    {
      "id": "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
      "name": "Monitors",
      "slug": "monitors",
      "count": 46
    }
  ],
  "inStockCount": 122,
  "outOfStockCount": 8
}
```

---

## 3. Example Request

```bash
curl -X GET "https://api.example.com/api/v1/products/facets?categorySlug=electronics" \
  -H "Accept: application/json"
```
