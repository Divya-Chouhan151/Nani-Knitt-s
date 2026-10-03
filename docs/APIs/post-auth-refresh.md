# API Specification: Refresh Access Token

- **Endpoint**: `POST /api/v1/auth/refresh`
- **Service**: Auth Service
- **Authentication**: Valid `refreshToken` HttpOnly Cookie
- **Description**: Performs refresh token rotation (RTR). Validates the incoming refresh token, revokes it, issues a fresh access token, and sets a newly rotated refresh token cookie. Detects and blocks token reuse attacks.

---

## 1. Request Parameters

No request body is sent. The browser automatically attaches the cookie:

```http
Cookie: refreshToken=d3f2824e-bca1-4f10-9cf4-49c71a391c52
```

---

## 2. Response Schema (200 OK)

### Response Headers

```http
Set-Cookie: refreshToken=2a809b1f-7b3e-4f33-8a39-9d0b3017a419; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

### Response Body

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

---

## 3. Error Responses

### 401 Unauthorized (Missing or Expired Token)
```json
{
  "code": "REFRESH_TOKEN_EXPIRED",
  "message": "Refresh token has expired or is invalid. Please sign in again."
}
```

### 403 Forbidden (Token Reuse Detected)
```json
{
  "code": "TOKEN_REUSE_DETECTED",
  "message": "Suspicious token activity detected. All active sessions have been revoked."
}
```
