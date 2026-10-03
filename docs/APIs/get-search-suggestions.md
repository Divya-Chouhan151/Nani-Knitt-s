# API Specification: Search Auto-Complete Suggestions

- **Endpoint**: `GET /api/v1/search/suggestions`
- **Service**: Search Service (`search-service` - Port 8083)
- **Authentication**: Optional / Public
- **Description**: Ultra low-latency auto-complete endpoint returning matched product titles, categories, and brands for debounced header search.

---

## 1. Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `q` | String | Yes | - | Prefix query (min 2 characters) |
| `limit` | Integer | No | `8` | Maximum suggestions to return |

---

## 2. Response Schema (200 OK)

```json
{
  "query": "key",
  "products": [
    {
      "id": "c1f76d20-8e10-48e2-9b2f-4a0b271e8c91",
      "title": "Ergonomic Bamboo Wireless Mechanical Keyboard",
      "slug": "ergonomic-bamboo-wireless-mechanical-keyboard",
      "categoryName": "Keyboards & Mice",
      "price": 11049.00,
      "thumbnailUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3"
    },
    {
      "id": "e2f88d31-9f22-49f4-bc31-6b2c483f9e03",
      "title": "Custom Mechanical Keycap Set (PBT)",
      "slug": "custom-mechanical-keycap-set-pbt",
      "categoryName": "Keyboards & Mice",
      "price": 2499.00,
      "thumbnailUrl": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef"
    }
  ],
  "categories": [
    {
      "name": "Keyboards & Mice",
      "slug": "keyboards-and-mice"
    }
  ],
  "brands": [
    "Keychron",
    "AuraWorks"
  ]
}
```
