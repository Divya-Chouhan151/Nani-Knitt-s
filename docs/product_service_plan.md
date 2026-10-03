# Backend Implementation Plan: Product Service (Spring Boot & PostgreSQL)

This document defines the architecture, database schema, domain models, Spring Data JPA specifications, MapStruct mappers, controller endpoints, and strict **Test-Driven Development (TDD)** execution steps for the **Product Service**.

---

## 1. Stack & Architectural Standards

Adhering strictly to [AGENT.md](file:///Users/msp/DC/Projects/e-commerce/AGENT.md):
- **Runtime**: Java 17 (LTS)
- **Framework**: Spring Boot 3.x
- **Build Tool**: Maven (multi-module setup with parent `backend/pom.xml`)
- **Database**: PostgreSQL 16+
- **Migrations**: Flyway (`src/main/resources/db/migration/`)
- **ORM & Data**: Spring Data JPA + Hibernate (no `ddl-auto=update`)
- **DTO Mapping**: MapStruct
- **Validation**: Jakarta Bean Validation (`jakarta.validation`)
- **Testing**: JUnit 5, AssertJ, Mockito, Testcontainers (`org.testcontainers:postgresql`)
- **Currency & Money**: Fixed-point `NUMERIC(19,2)` / `java.math.BigDecimal`

---

## 2. Maven Multi-Module Project Structure

```
backend/
├── pom.xml                                   # Parent POM: dependency management, compiler plugins
└── product-service/
    ├── pom.xml                               # Spring Boot starter, JPA, Flyway, Testcontainers, MapStruct
    └── src/
        ├── main/
        │   ├── java/com/ecommerce/product/
        │   │   ├── config/                   # WebMvcConfig, CorsConfig, OpenAPI
        │   │   ├── controller/               # ProductController, CategoryController
        │   │   ├── domain/                   # Product, ProductVariant, ProductImage, Category
        │   │   ├── dto/
        │   │   │   ├── request/              # ProductFilterCriteria
        │   │   │   └── response/             # ProductSummaryDto, ProductDetailDto, CategoryDto, FacetDto
        │   │   ├── exception/                # ProductNotFoundException, GlobalExceptionHandler
        │   │   ├── mapper/                   # ProductMapper, CategoryMapper
        │   │   ├── repository/               # ProductRepository, CategoryRepository, ProductVariantRepository
        │   │   ├── service/                  # ProductService, CategoryService, FacetService
        │   │   └── specification/            # ProductSpecifications (dynamic JPA Predicate criteria)
        │   └── resources/
        │       ├── application.yml
        │       └── db/migration/
        │           ├── V1__init_categories_and_products.sql
        │           └── V2__seed_demo_catalog.sql
        └── test/
            ├── java/com/ecommerce/product/
            │   ├── controller/               # @WebMvcTest slice tests with MockMvc
            │   ├── repository/               # @DataJpaTest with Testcontainers real PostgreSQL
            │   ├── service/                  # Mockito unit tests for business rules & mappers
            │   └── integration/              # Full @SpringBootTest API contract tests
            └── resources/
                └── application-test.yml
```

---

## 3. Database Schema & Flyway Migration (`V1__init_categories_and_products.sql`)

```sql
-- Categories table with materialized path hierarchy
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    path VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories(path varchar_pattern_ops);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description VARCHAR(500),
    description TEXT,
    base_attributes JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    badge VARCHAR(50),
    average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (average_rating >= 0.00 AND average_rating <= 5.00),
    review_count INT NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_average_rating ON products(average_rating DESC);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Product variants (SKU level: price, compare-at, stock status)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(64) UNIQUE NOT NULL,
    price NUMERIC(19, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(19, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= price),
    barcode VARCHAR(64),
    variant_options JSONB DEFAULT '{}'::jsonb,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    stock_status VARCHAR(32) NOT NULL DEFAULT 'IN_STOCK',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_price ON product_variants(price);
CREATE INDEX idx_variants_stock_status ON product_variants(stock_status);

-- Product images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(1024) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
```

---

## 4. Domain Entities & Mapping Design

### Rules (from `AGENT.md`)
- **No `@Data`**: Avoid Lombok `@Data` on JPA entities to prevent broken equals/hashCode and lazy loading loops. Use `@Getter`, `@Setter`, and hand-written `equals`/`hashCode` based on business key / ID.
- **DTO Isolation**: Entities are strictly never returned across REST controllers. MapStruct generates mappers at compile time.

### Entity Relationships
- `Product` (1) <---> (N) `ProductVariant` (CascadeType.ALL, orphanRemoval = true)
- `Product` (1) <---> (N) `ProductImage` (CascadeType.ALL, orphanRemoval = true)
- `Product` (N) <---> (1) `Category` (FetchType.LAZY)

### Dynamic Criteria Filtering (`ProductSpecifications.java`)
Using Spring Data JPA `Specification<Product>`:
- **Category Filter**: Matches `category.id = :id` or `category.path LIKE :pathPrefix%`.
- **Keyword Search**: Matches case-insensitive title, short description, or SKU (`cb.like(cb.lower(root.get("title")), "%" + query.toLowerCase() + "%")`).
- **Price Bounds**: Joins `product_variants` where `variant.isDefault = true` or `min(variant.price)` within `[minPrice, maxPrice]`.
- **Rating**: `root.get("averageRating") >= :minRating`.
- **In-Stock Only**: `variants.stockStatus != 'OUT_OF_STOCK'`.
- **Active Only**: `root.get("isActive") = true`.

---

## 5. Strict TDD Implementation Workflow (Red -> Green -> Refactor)

Every layer must be developed following the strict Red/Green/Refactor cycle mandated by `AGENT.md`:

```
+-------------------------------------------------------------------------------+
| PHASE 1: Multi-Module & Testcontainers Infrastructure                         |
|   - Red: Write BaseIntegrationTest requiring running Postgres container       |
|   - Green: Configure Maven parent pom.xml, product-service pom.xml, Flyway    |
|   - Verify: Container spins up and executes V1__init schema successfully      |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 2: Category Domain & Hierarchy API (GET /api/v1/categories)            |
|   1. Red: CategoryRepositoryTest (tree & path prefix queries against PG)     |
|   2. Green: Implement Category entity and Spring Data repository              |
|   3. Red: CategoryServiceTest (tree building algorithm & empty filtering)   |
|   4. Green: Implement CategoryService and CategoryMapper (MapStruct)          |
|   5. Red: CategoryControllerTest (@WebMvcTest: 200 OK shape, JSON contract)   |
|   6. Green: Implement CategoryController                                      |
|   7. Refactor: Code cleanup, Assertions pass                                  |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 3: Product Listing API with Dynamic Filtering (GET /api/v1/products)    |
|   1. Red: ProductRepositorySpecificationTest (Testcontainers integration)    |
|      - Test category path subtree filter                                      |
|      - Test price range filtering                                             |
|      - Test search keyword across title & description                         |
|      - Test sorting (price_asc, price_desc, newest, rating_desc)              |
|   2. Green: Implement ProductSpecifications & ProductRepository               |
|   3. Red: ProductServiceTest (mocked repo, business validation, DTO mapping)  |
|   4. Green: Implement ProductService.getProducts(criteria, pageable)          |
|   5. Red: ProductControllerTest (MockMvc: validation 400s, response 200 OK)  |
|      - size > 100 triggers MethodArgumentNotValidException with 400 Bad Req   |
|      - minRating > 5.0 triggers 400 Bad Request                               |
|      - valid criteria returns Page<ProductSummaryDto>                         |
|   6. Green: Implement ProductController, GlobalExceptionHandler               |
|   7. Refactor: Optimize query join fetches to avoid N+1 queries               |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 4: Single Product Detail API (GET /api/v1/products/{idOrSlug})          |
|   1. Red: ProductRepositoryTest (findBySlug and findByIdWithDetails queries)  |
|   2. Green: Add custom @EntityGraph or join fetch queries to repository       |
|   3. Red: ProductServiceTest (success mapping vs ProductNotFoundException)   |
|   4. Green: Implement ProductService.getProductByIdOrSlug()                   |
|   5. Red: ProductControllerTest (200 OK detail contract, 404 Not Found)      |
|   6. Green: Implement endpoint and map ProductNotFoundException to 404 JSON   |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 5: Featured Products & Dynamic Facet Counts                             |
|   1. Red: Test for GET /api/v1/products/featured (limit clamp, tag filter)    |
|   2. Green: Implement featured products query & endpoint                      |
|   3. Red: Test for GET /api/v1/products/facets (aggregating min/max price,    |
|           rating distribution, and scoped category counts)                    |
|   4. Green: Implement FacetService using JPA aggregation projections          |
|   5. Red: Controller tests for facet responses                                |
|   6. Green: Expose GET /api/v1/products/facets                                |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 6: End-to-End System & Contract Verification                           |
|   - Full integration test (ProductServiceE2EIT) with real Testcontainers DB   |
|   - Run `mvn clean verify` across all modules                                 |
+-------------------------------------------------------------------------------+
```

---

## 6. Detailed Layer Specifications

### 6.1 Controller Layer (`ProductController.java` & `CategoryController.java`)
- Thin REST endpoints delegating immediately to Service.
- Validated inputs via `@Valid`:
  ```java
  @GetMapping
  public ResponseEntity<PageResponse<ProductSummaryDto>> getProducts(
      @Valid ProductFilterCriteria criteria,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
      return ResponseEntity.ok(productService.getProducts(criteria, pageable));
  }
  ```

### 6.2 Service Layer (`ProductServiceImpl.java`)
- Annotated with `@Transactional(readOnly = true)`.
- Combines dynamic `Specification` with pagination.
- Efficient fetch joins (`@EntityGraph`) for primary thumbnail image and default variant to avoid N+1 query problems.

### 6.3 Exception Handling (`GlobalExceptionHandler.java`)
- Translates `MethodArgumentNotValidException` to uniform error response:
  ```json
  {
    "timestamp": "2026-09-13T14:20:00Z",
    "status": 400,
    "error": "Validation Failed",
    "details": [{"field": "size", "message": "must be less than or equal to 100"}]
  }
  ```
- Translates `ProductNotFoundException` to HTTP 404.

---

## 7. Performance & Optimization Norms

1. **N+1 Prevention**:
   - `Product` has multiple variants and images. The list query (`/api/v1/products`) must only fetch summary fields and the single primary thumbnail image or default variant using batch fetching (`@BatchSize(size = 25)`) or custom DTO projection.
2. **Read-Heavy Indexing**:
   - Explicit indexes on `category_id`, `slug`, `path`, `is_active`, `price`, and `average_rating` ensure sub-10ms query times on PostgreSQL.
3. **Connection Pooling**:
   - HikariCP pool sized for high concurrency, paired with Testcontainers for dev/test parity.
