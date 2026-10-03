# API Specification: Get Products List

- **Endpoint**: `GET /api/v1/products`
- **Service**: Product Service
- **Authentication**: None (Public)
- **Description**: Returns a paginated, filtered, and sorted list of active products for catalog browsing, landing page discovery, and search results.

---

## 1. Request Query Parameters

| Parameter | Type | Required | Default | Constraints / Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `page` | Integer | No | `0` | `@Min(0)` | Zero-indexed page number |
| `size` | Integer | No | `20` | `@Min(1)`, `@Max(100)` | Page size limit |
| `sort` | String | No | `newest` | Allowed: `price_asc`, `price_desc`, `newest`, `rating_desc` | Sorting strategy |
| `categoryId` | UUID | No | - | Valid UUID format | Filter by specific category ID |
| `categorySlug` | String | No | - | Max length 100 | Filter by category slug (matches category and descendants via path) |
| `query` | String | No | - | Max length 120, sanitization applied | Full-text / prefix search against title, brand, and description |
| `minPrice` | Decimal | No | - | `@PositiveOrZero` | Minimum price filter (inclusive) |
| `maxPrice` | Decimal | No | - | `@PositiveOrZero`, `>= minPrice` | Maximum price filter (inclusive) |
| `minRating` | Decimal | No | - | `@DecimalMin("1.0")`, `@DecimalMax("5.0")` | Minimum average rating filter |
| `inStockOnly` | Boolean | No | `false` | - | If `true`, returns only products with at least one variant in stock |

---

## 2. Response Schema (200 OK)

```json
{
  "content": [
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
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 84,
  "totalPages": 5,
  "isFirst": true,
  "isLast": false,
  "hasNext": true,
  "hasPrevious": false
}
```

### Field Definitions

- `content[].id` (`UUID`): Unique identifier of the product.
- `content[].title` (`String`): Display name of the product.
- `content[].slug` (`String`): URL-friendly unique slug.
- `content[].shortDescription` (`String`): Truncated description for cards.
- `content[].category` (`Object`): Category reference (`id`, `name`, `slug`).
- `content[].thumbnailUrl` (`String`): Primary thumbnail CDN URL.
- `content[].price` (`BigDecimal`): Base / lowest variant price formatted to 2 decimals.
- `content[].compareAtPrice` (`BigDecimal | null`): Original MSRP for discount calculation.
- `content[].currency` (`String`): ISO 4217 3-letter currency code (`USD`).
- `content[].averageRating` (`BigDecimal`): Cached average rating (scale 1.00 to 5.00).
- `content[].reviewCount` (`Integer`): Total number of approved reviews.
- `content[].stockStatus` (`Enum`): `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`.
- `content[].badge` (`String | null`): Optional merchandising tag (`NEW`, `BESTSELLER`, `SALE`).
- `content[].createdAt` (`Instant`): ISO-8601 timestamp.

---

## 3. Error Responses

### 400 Bad Request (Validation Failure)
Returned when pagination parameters or numeric constraints are violated:
```json
{
  "timestamp": "2026-09-13T14:10:00Z",
  "status": 400,
  "error": "Validation Failed",
  "details": [
    {
      "field": "size",
      "rejectedValue": 250,
      "message": "must be less than or equal to 100"
    },
    {
      "field": "minRating",
      "rejectedValue": 6.5,
      "message": "must be less than or equal to 5.0"
    }
  ]
}
```

---

## 4. Example Request

```bash
curl -X GET "https://api.example.com/api/v1/products?categorySlug=keyboards-and-mice&sort=price_asc&minPrice=50&maxPrice=200&page=0&size=20" \
  -H "Accept: application/json"
```
