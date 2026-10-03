# Nani's Knitts — Handmade & Heartfelt 🧶

A modern, high-performance e-commerce platform built with a Java Spring Boot microservices backend and a SolidJS frontend.

---

## 🌟 Architecture Overview

### Frontend
- **Framework**: SolidJS + Vite + Tailwind CSS
- **Features**: Real-time Catalog Browsing, Search with instant filters, Wishlist management, Interactive Doorstep Map Pinpoint Address Picker (India-wide), Cart & Checkout.

### Backend Microservices
- **Auth & Profile Service** (`port 8081`): JWT authentication, customer profiles, address book with geocoding, payment settings.
- **Product Catalog Service** (`port 8080`): Categories, products, variants, image galleries, stock status.
- **Cart & Wishlist Service** (`port 8082`): Shopping cart state, wishlist persistence.
- **Search Service** (`port 8083`): Full-text search and category ranking.

### Infrastructure
- PostgreSQL, Kafka, and Elasticsearch managed via Docker Compose.
- Automated orchestration via `Makefile` (`make run-all`, `make test`, `make data-seed`).

---

## 🚀 Quick Start

```bash
# 1. Start all infrastructure containers, backend services, and frontend
make run-all

# 2. Check service status
make status

# 3. Seed demo data (products, categories, users)
make data-seed

# 4. Run test suites
make test
```
