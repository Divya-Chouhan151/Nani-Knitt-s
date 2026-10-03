# Payment Methods API & UPI Management

## Overview
Endpoints for managing saved payment methods under User Profile Settings.
Supports UPI VPA (Virtual Payment Address) addition, validation, listing, default assignment, and deletion.

## Endpoints

### 1. Validate VPA
Validates UPI ID syntax and simulates/calls payment gateway verification to resolve account holder name and issuing bank.

- **URL:** `/api/v1/profile/payment-methods/validate-vpa`
- **Method:** `POST`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "vpa": "rahul.sharma@okhdfcbank"
}
```
- **Response (200 OK):**
```json
{
  "vpa": "rahul.sharma@okhdfcbank",
  "isValid": true,
  "accountHolderName": "Rahul Sharma",
  "bankName": "HDFC Bank",
  "gatewayReferenceId": "tok_vpa_d88b48f654b0451a",
  "message": "UPI ID verified successfully"
}
```

### 2. Add UPI Payment Method
Verifies and saves a UPI ID to the user's profile.
- **URL:** `/api/v1/profile/payment-methods/upi`
- **Method:** `POST`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "vpa": "rahul.sharma@okhdfcbank",
  "accountHolderName": "Rahul Sharma",
  "makeDefault": true
}
```
- **Response (201 Created):**
```json
{
  "id": 1,
  "type": "UPI",
  "vpa": "rahul.sharma@okhdfcbank",
  "maskedVpa": "rah***@okhdfcbank",
  "accountHolderName": "Rahul Sharma",
  "bankName": "HDFC Bank",
  "isVerified": true,
  "isDefault": true,
  "createdAt": "2026-09-29T18:30:00"
}
```

### 3. List Saved Payment Methods
Returns active (non-deleted) payment methods for the authenticated user.
- **URL:** `/api/v1/profile/payment-methods`
- **Method:** `GET`
- **Auth:** Bearer Token
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "type": "UPI",
    "vpa": "rahul.sharma@okhdfcbank",
    "maskedVpa": "rah***@okhdfcbank",
    "accountHolderName": "Rahul Sharma",
    "bankName": "HDFC Bank",
    "isVerified": true,
    "isDefault": true,
    "createdAt": "2026-09-29T18:30:00"
  }
]
```

### 4. Set Method as Default
- **URL:** `/api/v1/profile/payment-methods/{id}/default`
- **Method:** `PATCH`
- **Auth:** Bearer Token
- **Response (200 OK):** `PaymentMethodResponse`

### 5. Remove Payment Method (Soft Delete)
- **URL:** `/api/v1/profile/payment-methods/{id}`
- **Method:** `DELETE`
- **Auth:** Bearer Token
- **Response (204 No Content)**

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PAYMENT_GATEWAY_PROVIDER` | `mock` | Gateway provider for VPA resolution and validation (`mock`, `razorpay`, `cashfree`) |
| `RAZORPAY_KEY_ID` | `""` | Razorpay Key ID when live gateway provider is enabled |
| `RAZORPAY_KEY_SECRET` | `""` | Razorpay Key Secret when live gateway provider is enabled |
