# API Specification: Orders & Tracking Management

- **Endpoints**:
  - `GET /api/v1/profile/orders`
  - `GET /api/v1/profile/orders/{orderId}`
  - `POST /api/v1/profile/orders/{orderId}/cancel`
  - `POST /api/v1/profile/orders/{orderId}/return`
- **Service**: Auth & Profile Service (`auth-service` - Port 8081)
- **Authentication**: Required (`Authorization: Bearer <accessToken>`)

---

## 1. List Orders (Paginated & Filterable)
**Endpoint**: `GET /api/v1/profile/orders?page=0&size=10&status=PROCESSING`

### Response (200 OK)
```json
{
  "content": [
    {
      "id": "a93e3d17-3806-4448-912c-9bf7d995aa08",
      "orderNumber": "ORD-20260914-1001",
      "status": "PROCESSING",
      "subtotal": 299.99,
      "shippingFee": 0.00,
      "tax": 24.00,
      "totalAmount": 323.99,
      "trackingCarrier": "FedEx",
      "trackingNumber": "FX-9928172901",
      "createdAt": "2026-09-14T08:00:00Z",
      "items": [
        {
          "id": "e722a46b-84a1-43ee-9226-e17f0cb9e578",
          "productId": "8d3e921b-4fa6-4074-a0eb-bc0eef7f6eb9",
          "sku": "AURA-TECH-001-M",
          "title": "Aura Ultra Wireless ANC Headphones",
          "quantity": 1,
          "unitPrice": 299.99,
          "subtotal": 299.99,
          "imageUrl": "http://localhost:8081/uploads/products/aura-anc-1.webp"
        }
      ],
      "timeline": [
        {
          "status": "PLACED",
          "timestamp": "2026-09-14T08:00:00Z",
          "notes": "Order placed successfully"
        },
        {
          "status": "CONFIRMED",
          "timestamp": "2026-09-14T08:05:00Z",
          "notes": "Payment verified"
        },
        {
          "status": "PROCESSING",
          "timestamp": "2026-09-14T08:30:00Z",
          "notes": "Sent to fulfillment center"
        }
      ]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

---

## 2. Cancel Order
**Endpoint**: `POST /api/v1/profile/orders/{orderId}/cancel`

- Orders can only be cancelled in `PLACED`, `CONFIRMED`, or `PROCESSING` states.
- Returns 400 Bad Request if already shipped or delivered.

---

## 3. Return Order
**Endpoint**: `POST /api/v1/profile/orders/{orderId}/return`

### Request Body
```json
{
  "reason": "DEFECTIVE",
  "comments": "Right ear cup does not produce audio"
}
```
