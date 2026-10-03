# API Specification: Shopping Cart Service

- **Endpoints**:
  - `GET /api/v1/cart`
  - `POST /api/v1/cart/items`
  - `PUT /api/v1/cart/items/{itemId}`
  - `DELETE /api/v1/cart/items/{itemId}`
  - `DELETE /api/v1/cart`
- **Service**: Cart Service (`cart-service` - Port 8082)
- **Authentication**: Required (`Authorization: Bearer <accessToken>` or `X-User-Id` header)

---

## 1. Get User Cart
**Endpoint**: `GET /api/v1/cart`

### Response (200 OK)
```json
{
  "items": [
    {
      "id": "7b8971fa-71df-416b-bfa9-c70a8d462ba4",
      "userId": "e4b2d308-4682-4f32-84b2-a42e5b721dae",
      "productId": "8d3e921b-4fa6-4074-a0eb-bc0eef7f6eb9",
      "sku": "AURA-TECH-001-M",
      "title": "Aura Ultra Wireless ANC Headphones",
      "price": 299.99,
      "quantity": 2,
      "imageUrl": "http://localhost:8081/uploads/products/aura-anc-1.webp",
      "createdAt": "2026-09-14T10:00:00Z",
      "updatedAt": "2026-09-14T10:00:00Z"
    }
  ],
  "totalItems": 2,
  "subtotal": 599.98,
  "tax": 48.00,
  "shipping": 0.00,
  "total": 647.98
}
```

---

## 2. Add Item to Cart
**Endpoint**: `POST /api/v1/cart/items`

### Request Body
```json
{
  "productId": "8d3e921b-4fa6-4074-a0eb-bc0eef7f6eb9",
  "sku": "AURA-TECH-001-M",
  "title": "Aura Ultra Wireless ANC Headphones",
  "price": 299.99,
  "quantity": 1,
  "imageUrl": "http://localhost:8081/uploads/products/aura-anc-1.webp"
}
```

### Response (200 OK)
Returns the created or updated `CartItemDTO`.

---

## 3. Update Item Quantity
**Endpoint**: `PUT /api/v1/cart/items/{itemId}`

### Request Body
```json
{
  "quantity": 3
}
```

---

## 4. Remove Item
**Endpoint**: `DELETE /api/v1/cart/items/{itemId}`
### Response (204 No Content)

---

## 5. Clear Cart
**Endpoint**: `DELETE /api/v1/cart`
### Response (204 No Content)
