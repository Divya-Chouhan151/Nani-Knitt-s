# API Specification: Get Categories

- **Endpoint**: `GET /api/v1/categories`
- **Service**: Product Service
- **Authentication**: None (Public)
- **Description**: Retrieves the complete catalog category structure, either as a nested hierarchy tree (for navigation menus and collapsible sidebar filters) or as a flat list with materialized paths.

---

## 1. Request Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `tree` | Boolean | No | `true` | When `true`, returns nested children; when `false`, returns flat array ordered by materialized path. |
| `includeEmpty` | Boolean | No | `false` | When `false`, excludes categories with 0 active products. |

---

## 2. Response Schema (200 OK)

### Tree Format (`tree=true`)

```json
[
  {
    "id": "11111111-2222-3333-4444-555555555555",
    "name": "Electronics",
    "slug": "electronics",
    "path": "/electronics",
    "parentId": null,
    "productCount": 240,
    "children": [
      {
        "id": "e83e5891-b14a-4d7a-b5ea-16e0339d2c12",
        "name": "Keyboards & Mice",
        "slug": "keyboards-and-mice",
        "path": "/electronics/keyboards-and-mice",
        "parentId": "11111111-2222-3333-4444-555555555555",
        "productCount": 84,
        "children": []
      },
      {
        "id": "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
        "name": "Monitors",
        "slug": "monitors",
        "path": "/electronics/monitors",
        "parentId": "11111111-2222-3333-4444-555555555555",
        "productCount": 46,
        "children": []
      }
    ]
  },
  {
    "id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "name": "Home Office",
    "slug": "home-office",
    "path": "/home-office",
    "parentId": null,
    "productCount": 115,
    "children": []
  }
]
```

### Flat Format (`tree=false`)

```json
[
  {
    "id": "11111111-2222-3333-4444-555555555555",
    "name": "Electronics",
    "slug": "electronics",
    "path": "/electronics",
    "parentId": null,
    "productCount": 240
  },
  {
    "id": "e83e5891-b14a-4d7a-b5ea-16e0339d2c12",
    "name": "Keyboards & Mice",
    "slug": "keyboards-and-mice",
    "path": "/electronics/keyboards-and-mice",
    "parentId": "11111111-2222-3333-4444-555555555555",
    "productCount": 84
  }
]
```

---

## 3. Example Request

```bash
curl -X GET "https://api.example.com/api/v1/categories?tree=true&includeEmpty=false" \
  -H "Accept: application/json"
```
