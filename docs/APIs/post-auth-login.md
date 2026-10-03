# API Specification: User Login

- **Endpoint**: `POST /api/v1/auth/login`
- **Service**: Auth Service
- **Authentication**: None (Public)
- **Description**: Authenticates user credentials, generates a new JWT access token, sets a cryptographically secure rotating refresh token in an HttpOnly cookie, and logs the security audit event.

---

## 1. Request Body Schema (`application/json`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `email` | String | Yes | Valid email format | Registered user email |
| `password` | String | Yes | Non-empty | User plaintext password |

### Example Request Body

```json
{
  "email": "customer@aura.com",
  "password": "Password123!"
}
```

---

## 2. Response Schema (200 OK)

### Response Headers

```http
Set-Cookie: refreshToken=d3f2824e-bca1-4f10-9cf4-49c71a391c52; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
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

### 401 Unauthorized (Invalid Credentials)
```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

### 423 Locked (Account Locked due to repeated failures)
```json
{
  "code": "ACCOUNT_LOCKED",
  "message": "Too many failed attempts. Account locked for 15 minutes."
}
```
