# API Specification: User Profile Management

- **Endpoints**:
  - `GET /api/v1/profile`
  - `PUT /api/v1/profile`
  - `POST /api/v1/profile/avatar`
  - `POST /api/v1/profile/request-email-change`
  - `POST /api/v1/profile/confirm-email-change`
  - `POST /api/v1/profile/request-phone-change`
  - `POST /api/v1/profile/confirm-phone-change`
- **Service**: Auth & Profile Service (`auth-service`)
- **Authentication**: Required (`Authorization: Bearer <accessToken>`)

---

## 1. Get Profile Details
**Endpoint**: `GET /api/v1/profile`

### Response (200 OK)
```json
{
  "id": "e4b2d308-4682-4f32-84b2-a42e5b721dae",
  "username": "customer",
  "email": "customer@aura.com",
  "firstName": "Alex",
  "lastName": "Morgan",
  "phoneNumber": "+1 555-0199",
  "phoneVerified": true,
  "dob": "1992-05-18",
  "gender": "PREFER_NOT_TO_SAY",
  "avatarUrl": "http://localhost:8081/uploads/avatars/uuid-avatar.png",
  "twoFactorEnabled": false,
  "createdAt": "2026-08-15T10:30:00Z"
}
```

---

## 2. Update Profile Details
**Endpoint**: `PUT /api/v1/profile`

### Request Body
```json
{
  "firstName": "Alex",
  "lastName": "Morgan",
  "dob": "1992-05-18",
  "gender": "FEMALE"
}
```

### Response (200 OK)
Returns the updated profile object.

---

## 3. Upload Avatar
**Endpoint**: `POST /api/v1/profile/avatar`
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file` (Image file: PNG, JPEG, WebP)

### Response (200 OK)
```json
{
  "avatarUrl": "http://localhost:8081/uploads/avatars/e4b2d308-avatar.webp"
}
```

---

## 4. Email & Phone Change Verification Flow
- `POST /api/v1/profile/request-email-change`: Initiates 6-digit OTP code to new email.
- `POST /api/v1/profile/confirm-email-change`: `{ "newEmail": "new@aura.com", "code": "123456" }`
- `POST /api/v1/profile/request-phone-change`: Initiates 6-digit OTP to new phone number.
- `POST /api/v1/profile/confirm-phone-change`: `{ "newPhone": "+1555123456", "code": "654321" }`
