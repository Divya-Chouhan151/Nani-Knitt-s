# E-Commerce Backend

Guide for coding agents (and devs) working on this backend. Stack: Java + Spring Boot + Maven + PostgreSQL. Frontend (SolidJS) consumes this as REST API. Development is strict TDD — no exceptions.

## Stack

- Java 17 (LTS)
- Spring Boot (latest stable 3.x)
- Maven (not Gradle) — single multi-module or single-module, decide early, stay consistent
- PostgreSQL (prod + dev via Podman/Testcontainers)
- Spring Data JPA + Hibernate
- Flyway for DB migrations (never `hibernate.ddl-auto=update` in real workflow — schema changes go through migration files only)
- JUnit 5 + Mockito + AssertJ for tests
- Testcontainers for integration tests against real Postgres (not H2 — avoid dialect mismatch bugs)
- Bean Validation (`jakarta.validation`) for request validation
- Spring Security + JWT (or OAuth2 resource server) for auth
- MapStruct for DTO <-> Entity mapping (avoid manual boilerplate mappers)

## TDD Workflow (Mandatory — Red/Green/Refactor)

For every feature/change, follow this order. No production code without a failing test first.

1. **Red** — Write a failing test first that expresses the desired behavior (unit or integration, whichever fits the layer).
2. **Green** — Write the minimum code to make the test pass. No extra abstraction yet.
3. **Refactor** — Clean up (naming, duplication, extract methods) with tests staying green throughout.
4. Repeat per behavior, not per class. Small steps.

**The coding agent must never write a controller/service/repository method without first writing (or being shown) its corresponding test.** If asked to add a feature and no test exists, write the test first, confirm it fails logically, then implement.

### Test layers required per feature

- **Unit tests** — service layer logic, business rules, mappers. Mock repositories/external deps.
- **Repository/integration tests** — via Testcontainers + real Postgres, test actual queries (especially custom `@Query`, projections, pagination). Testcontainers talks to the container runtime via the Docker API — point it at Podman's socket (e.g. `DOCKER_HOST=unix:///run/user/<uid>/podman/podman.sock`, with the Podman socket service enabled) or set `testcontainers.properties` (`docker.host=...`) so tests run without Docker installed.
- **Web layer tests** — `@WebMvcTest` or full `@SpringBootTest` with `MockMvc`/`RestAssured` for controller endpoints: status codes, validation errors, response shape.
- **Contract/API tests** — for critical flows (checkout, payment, order placement) add end-to-end test hitting real running context (Testcontainers Postgres + full Spring context).

### Coverage expectation

- Business logic (service layer): aim high coverage, but prioritize meaningful assertions over % chasing.
- Every bug fix: add a regression test reproducing the bug BEFORE fixing it.

## Validation — Required on Every Change

Validation happens at multiple layers, not just one:

1. **Request-level (DTO) validation** — every incoming request DTO annotated with Bean Validation (`@NotNull`, `@NotBlank`, `@Positive`, `@Size`, `@Email`, custom `@Constraint` for domain rules like SKU format, currency codes). Controller must have `@Valid` on `@RequestBody`.
2. **Global exception handling** — `@ControllerAdvice` + `@ExceptionHandler` mapping validation errors (`MethodArgumentNotValidException`) to consistent JSON error response (field, message, code). Never leak stack traces to client.
3. **Business rule validation in service layer** — DTO validation only checks shape/format. Domain rules (stock available, price > 0, order not already shipped before cancel, coupon not expired) validated explicitly in service layer with custom exceptions (`InsufficientStockException`, `InvalidOrderStateException`, etc.), each mapped to proper HTTP status.
4. **DB-level constraints as last line of defense** — NOT NULL, UNIQUE, CHECK constraints, FK constraints in Flyway migrations. App-level validation must not be the only safety net.
5. **Every PR/change must include:**
   - Test(s) proving the validation rejects invalid input (400 for bad request, 409/422 for business rule violation as appropriate).
   - Test(s) proving valid input passes.
   - Updated/added Flyway migration if DB constraint changed.

## Project Structure

```
src/main/java/com/<company>/ecommerce/
  config/          # Security, CORS, OpenAPI, Bean config
  controller/      # REST controllers — thin, delegate to service
  service/         # Business logic, transactional boundaries (@Transactional here, not in controller)
  repository/      # Spring Data JPA repositories
  domain/          # JPA entities
  dto/             # Request/response DTOs
  mapper/          # MapStruct mappers
  exception/       # Custom exceptions + GlobalExceptionHandler
  validation/      # Custom Bean Validation constraints
src/main/resources/
  db/migration/    # Flyway migration scripts (V1__init.sql, V2__add_orders.sql, ...)
  application.yml
src/test/java/...  # mirrors main structure
src/test/resources/
  application-test.yml
```

## Layering & Transaction Rules

- Controllers: no business logic, no direct repository access. Only call service, map exceptions to HTTP via `@ControllerAdvice`.
- `@Transactional` at service method level, not on controllers or repositories. Keep transactions short — no external HTTP calls inside a transaction.
- Entities never returned directly from controller — always map to DTO (prevents leaking JPA proxies, lazy-loading issues, and accidental exposure of internal fields).
- Avoid `@Data` on entities (Lombok) — causes issues with JPA equals/hashCode/toString on lazy proxies. Use explicit `@Getter`/`@Setter` or manual methods, and hand-written `equals`/`hashCode` based on business key or ID.

## Database / Migration Rules

- Every schema change = new Flyway migration file, sequential version, never edit a past migration once merged.
- Migrations must be reversible in intent (write a corresponding rollback plan even if Flyway doesn't auto-generate down-migrations).
- Index foreign keys and frequently filtered columns (e.g. `product.sku`, `order.status`, `order.user_id`).
- Money fields: `NUMERIC(19,2)` or similar fixed-point — never `FLOAT`/`DOUBLE` for currency.

## API Conventions

- REST resource naming: plural nouns (`/api/v1/products`, `/api/v1/orders`), versioned from day one (`/api/v1/...`).
- Consistent error response shape across all endpoints:
  ```json
  { "timestamp": "...", "status": 400, "error": "Validation Failed", "details": [{"field": "email", "message": "must be a valid email"}] }
  ```
- Pagination via `Pageable` (`?page=&size=&sort=`) for list endpoints — never return unbounded lists (product catalog, orders).
- Idempotency: payment/order-creation endpoints must accept idempotency key header to prevent duplicate orders on retry.

## Do NOT

- Do NOT write implementation code before a test exists for it (breaks TDD contract of this project).
- Do NOT use `ddl-auto=update`/`create` — schema changes only via Flyway.
- Do NOT put business/validation logic in controllers.
- Do NOT return JPA entities directly from any endpoint.
- Do NOT use H2 for integration tests — use Testcontainers Postgres to catch real dialect issues.
- Do NOT skip regression test when fixing a bug.
- Do NOT commit secrets/DB credentials — use environment variables / Spring profiles + `application-local.yml` (gitignored).

## When Implementing a Feature (coding agent, follow this checklist)

1. Write failing test(s) first — unit + integration as appropriate for the layer touched.
2. Implement minimal code to pass.
3. Add/verify DTO validation annotations + custom business validation in service.
4. Add Flyway migration if schema changed, with matching DB constraint.
5. Add/verify global exception mapping for any new exception type.
6. Refactor once green; keep tests passing.
7. Confirm error responses follow the standard shape.