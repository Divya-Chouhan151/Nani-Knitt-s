# API Specification: User Address Book Management

- **Endpoints**:
  - `GET /api/v1/profile/addresses`
  - `POST /api/v1/profile/addresses`
  - `PUT /api/v1/profile/addresses/{id}`
  - `DELETE /api/v1/profile/addresses/{id}`
  - `PUT /api/v1/profile/addresses/{id}/default-shipping`
  - `PUT /api/v1/profile/addresses/{id}/default-billing`
- **Service**: Auth & Profile Service (`auth-service` - Port 8081)
- **Authentication**: Required (`Authorization: Bearer <accessToken>`)

---

## 1. List User Addresses
**Endpoint**: `GET /api/v1/profile/addresses`

### Response (200 OK)
```json
[
  {
    "id": "22e1b12b-34a8-4217-b70d-327c51483b3f",
    "recipientName": "Alex Morgan",
    "phone": "+1 555-0199",
    "street": "742 Evergreen Terrace",
    "apartment": "Apt 4B",
    "city": "Springfield",
    "state": "OR",
    "postalCode": "97477",
    "country": "US",
    "defaultShipping": true,
    "defaultBilling": false
  }
]
```

---

## 2. Create New Address
**Endpoint**: `POST /api/v1/profile/addresses`

### Request Body
```json
{
  "recipientName": "Alex Morgan",
  "phone": "+1 555-0199",
  "street": "100 Main Street",
  "apartment": "",
  "city": "Seattle",
  "state": "WA",
  "postalCode": "98101",
  "country": "US",
  "defaultShipping": false,
  "defaultBilling": true
}
```

### Response (200 OK)
Returns created address object with generated UUID.

---

## 3. Set Default Shipping / Billing
- `PUT /api/v1/profile/addresses/{id}/default-shipping`
- `PUT /api/v1/profile/addresses/{id}/default-billing`
Automatically resets previous default flags to ensure single default invariant per user.
