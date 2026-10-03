# API Specification: User Registration

- **Endpoint**: `POST /api/v1/auth/register`
- **Service**: Auth Service
- **Authentication**: None (Public)
- **Description**: Registers a new customer account, persists credentials securely using BCrypt, issues a short-lived access JWT and sets a rotating refresh token in an HttpOnly cookie.

---

## 1. Request Body Schema (`application/json`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `email` | String | Yes | Valid email format, max 255 chars, unique | User email address (case-insensitive) |
| `password` | String | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char | Raw user password |
| `firstName` | String | Yes | Min 2, max 100 chars | User given name |
| `lastName` | String | Yes | Min 2, max 100 chars | User family name |

### Example Request Body

```json
{
  "email": "customer@aura.com",
  "password": "Password123!",
  "firstName": "Alex",
  "lastName": "Morgan"
}
```

---

## 2. Response Schema (201 Created)

### Response Headers

```http
Set-Cookie: refreshToken=8f39a04b-9c2e-4b71-a477-d5d36e2f75a1; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

### Response Body

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "e4b2d308-4682-4f32-84b2-a42e5b721dae",
    "email": "customer@aura.com",
    "firstName": "Alex",
    "lastName": "Morgan",
    "roles": ["ROLE_CUSTOMER"],
    "status": "ACTIVE"
  }
}
```

---

## 3. Error Responses

### 400 Bad Request (Validation Failure)
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed for one or more fields",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters and contain at least one digit and special symbol"
    }
  ]
}
```

### 409 Conflict (Email Already Registered)
```json
{
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "An account with email customer@aura.com already exists"
}
```
