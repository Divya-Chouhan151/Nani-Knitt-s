# API Specification: Get Product by ID or Slug

- **Endpoint**: `GET /api/v1/products/{idOrSlug}`
- **Service**: Product Service
- **Authentication**: None (Public)
- **Description**: Retrieves complete product details, image gallery, specification attributes, and available SKU variants by product UUID or unique SEO slug.

---

## 1. Path Parameters

| Parameter | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `idOrSlug` | String | Yes | UUID format or slug regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` (max 120 chars) | Identifies the product by UUID or SEO URL slug |

---

## 2. Response Schema (200 OK)

```json
{
  "id": "c1f76d20-8e10-48e2-9b2f-4a0b271e8c91",
  "title": "Ergonomic Bamboo Wireless Mechanical Keyboard",
  "slug": "ergonomic-bamboo-wireless-mechanical-keyboard",
  "description": "Handcrafted from sustainable solid bamboo with hot-swappable tactile switches...",
  "shortDescription": "Dual-mode Bluetooth 5.2 mechanical keyboard handcrafted with natural bamboo.",
  "category": {
    "id": "e83e5891-b14a-4d7a-b5ea-16e0339d2c12",
    "name": "Keyboards & Mice",
    "slug": "keyboards-and-mice",
    "path": "/electronics/accessories/keyboards-and-mice"
  },
  "images": [
    {
      "id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
      "url": "https://cdn.example.com/products/kb-01/main.webp",
      "altText": "Front view of ergonomic bamboo keyboard",
      "isPrimary": true,
      "sortOrder": 0
    },
    {
      "id": "2c8d7bfe-cafe-4c12-8a9d-bc9efccd5cfe",
      "url": "https://cdn.example.com/products/kb-01/side-profile.webp",
      "altText": "Side incline profile showing walnut wrist rest",
      "isPrimary": false,
      "sortOrder": 1
    }
  ],
  "baseAttributes": {
    "connectivity": "Bluetooth 5.2 & USB-C",
    "batteryCapacity": "4000mAh",
    "material": "Solid Moso Bamboo",
    "switchType": "Tactile Brown"
  },
  "variants": [
    {
      "id": "f5d08311-37e4-44bf-a9d9-bb4f59e951d3",
      "sku": "KB-BAMBOO-BROWN",
      "price": 129.99,
      "compareAtPrice": 159.99,
      "barcode": "8901234567890",
      "variantOptions": {
        "switch": "Brown Tactile",
        "layout": "ANSI 75%"
      },
      "stockStatus": "IN_STOCK",
      "availableStock": 42
    },
    {
      "id": "67f7813a-a192-4217-bcbf-47806fcfd582",
      "sku": "KB-BAMBOO-RED",
      "price": 129.99,
      "compareAtPrice": 159.99,
      "barcode": "8901234567891",
      "variantOptions": {
        "switch": "Red Linear",
        "layout": "ANSI 75%"
      },
      "stockStatus": "LOW_STOCK",
      "availableStock": 3
    }
  ],
  "averageRating": 4.85,
  "reviewCount": 142,
  "badge": "BESTSELLER",
  "isActive": true,
  "createdAt": "2026-08-15T10:30:00Z",
  "updatedAt": "2026-09-01T14:20:00Z"
}
```

---

## 3. Error Responses

### 404 Not Found
Returned when no active product exists for the requested ID or slug:
```json
{
  "timestamp": "2026-09-13T14:12:00Z",
  "status": 404,
  "error": "Product Not Found",
  "details": [
    {
      "message": "Product with identifier 'non-existent-slug' not found"
    }
  ]
}
```

---

## 4. Example Request

```bash
curl -X GET "https://api.example.com/api/v1/products/ergonomic-bamboo-wireless-mechanical-keyboard" \
  -H "Accept: application/json"
```
