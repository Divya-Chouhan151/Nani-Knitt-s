# API Specification: Get Authenticated User Profile

- **Endpoint**: `GET /api/v1/auth/me`
- **Service**: Auth Service
- **Authentication**: Required (`Authorization: Bearer <accessToken>`)
- **Description**: Returns the profile details and assigned roles of the currently authenticated user.

---

## 1. Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | String | Yes | `Bearer <jwt_access_token>` |

---

## 2. Response Schema (200 OK)

```json
{
  "id": "e4b2d308-4682-4f32-84b2-a42e5b721dae",
  "email": "customer@aura.com",
  "firstName": "Alex",
  "lastName": "Morgan",
  "roles": ["ROLE_CUSTOMER"],
  "status": "ACTIVE",
  "emailVerified": true,
  "createdAt": "2026-08-15T10:30:00Z"
}
```

---

## 3. Error Responses

### 401 Unauthorized
```json
{
  "code": "UNAUTHORIZED",
  "message": "Full authentication is required to access this resource"
}
```
