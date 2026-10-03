# API Specification: User Logout

- **Endpoint**: `POST /api/v1/auth/logout`
- **Service**: Auth Service
- **Authentication**: Optional Bearer Token or `refreshToken` Cookie
- **Description**: Invalidates the active refresh token in the database, records a logout security audit log, and instructs the browser to clear the `refreshToken` HttpOnly cookie.

---

## 1. Request Headers / Cookies

```http
Cookie: refreshToken=2a809b1f-7b3e-4f33-8a39-9d0b3017a419
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Response Schema (200 OK)

### Response Headers

```http
Set-Cookie: refreshToken=; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

### Response Body

```json
{
  "message": "Successfully logged out"
}
```
