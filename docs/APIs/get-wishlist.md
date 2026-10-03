# API Specification: Wishlist Management

- **Endpoints**:
  - `GET /api/v1/profile/wishlist`
  - `POST /api/v1/profile/wishlist`
  - `DELETE /api/v1/profile/wishlist/{itemId}`
- **Service**: Auth & Profile Service (`auth-service` - Port 8081)
- **Authentication**: Required (`Authorization: Bearer <accessToken>`)

---

## 1. Get User Wishlist
**Endpoint**: `GET /api/v1/profile/wishlist`

### Response (200 OK)
```json
[
  {
    "id": "41c61ae3-cb19-482a-a92c-e1bc1287e14d",
    "productId": "8d3e921b-4fa6-4074-a0eb-bc0eef7f6eb9",
    "sku": "AURA-TECH-001-M",
    "title": "Aura Ultra Wireless ANC Headphones",
    "price": 299.99,
    "imageUrl": "http://localhost:8081/uploads/products/aura-anc-1.webp",
    "inStock": true,
    "addedAt": "2026-09-14T09:15:00Z"
  }
]
```

---

## 2. Add Product to Wishlist
**Endpoint**: `POST /api/v1/profile/wishlist`

### Request Body
```json
{
  "productId": "8d3e921b-4fa6-4074-a0eb-bc0eef7f6eb9",
  "sku": "AURA-TECH-001-M",
  "title": "Aura Ultra Wireless ANC Headphones",
  "price": 299.99,
  "imageUrl": "http://localhost:8081/uploads/products/aura-anc-1.webp"
}
```

---

## 3. Remove Product from Wishlist
**Endpoint**: `DELETE /api/v1/profile/wishlist/{itemId}`
### Response (204 No Content)
