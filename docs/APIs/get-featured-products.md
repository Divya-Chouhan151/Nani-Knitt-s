# API Specification: Get Featured Products

- **Endpoint**: `GET /api/v1/products/featured`
- **Service**: Product Service
- **Authentication**: None (Public)
- **Description**: Returns curated top-rated, best-selling, or handpicked promotional products for the landing page highlight reel, promo carousel, or top ribbon.

---

## 1. Request Query Parameters

| Parameter | Type | Required | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `limit` | Integer | No | `8` | `@Min(1)`, `@Max(20)` | Maximum number of featured items to return |
| `tag` | String | No | `FEATURED` | Allowed: `FEATURED`, `BESTSELLER`, `TRENDING`, `SALE` | Merchandising tag filter |

---

## 2. Response Schema (200 OK)

```json
[
  {
    "id": "c1f76d20-8e10-48e2-9b2f-4a0b271e8c91",
    "title": "Ergonomic Bamboo Wireless Mechanical Keyboard",
    "slug": "ergonomic-bamboo-wireless-mechanical-keyboard",
    "shortDescription": "Dual-mode Bluetooth 5.2 mechanical keyboard handcrafted with natural bamboo.",
    "category": {
      "id": "e83e5891-b14a-4d7a-b5ea-16e0339d2c12",
      "name": "Keyboards & Mice",
      "slug": "keyboards-and-mice"
    },
    "thumbnailUrl": "https://cdn.example.com/products/kb-01/thumb.webp",
    "price": 129.99,
    "compareAtPrice": 159.99,
    "currency": "USD",
    "averageRating": 4.85,
    "reviewCount": 142,
    "stockStatus": "IN_STOCK",
    "badge": "BESTSELLER",
    "createdAt": "2026-08-15T10:30:00Z"
  }
]
```

---

## 3. Error Responses

### 400 Bad Request
Returned if `limit` is out of bounds or `tag` is invalid:
```json
{
  "timestamp": "2026-09-13T14:15:00Z",
  "status": 400,
  "error": "Validation Failed",
  "details": [
    {
      "field": "limit",
      "rejectedValue": 50,
      "message": "must be less than or equal to 20"
    }
  ]
}
```

---

## 4. Example Request

```bash
curl -X GET "https://api.example.com/api/v1/products/featured?limit=6&tag=BESTSELLER" \
  -H "Accept: application/json"
```
