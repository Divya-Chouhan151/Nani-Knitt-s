#!/usr/bin/env bash
set -e

echo "🌱 Seeding E-Commerce Platform Data..."

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PG_CONTAINER="ecommerce-postgres"
PG_USER="${DB_USERNAME:-postgres}"
PG_PASSWORD="${DB_PASSWORD:-postgres}"
PG_HOST="${DB_HOST:-localhost}"
PG_PORT="${DB_PORT:-5433}"

CONTAINER_CLI="$(command -v docker 2>/dev/null || command -v podman 2>/dev/null || true)"

run_sql_file() {
    local db=$1
    local file=$2
    echo "  -> Applying $(basename "$file") into '$db'..."
    if [ -n "$CONTAINER_CLI" ] && $CONTAINER_CLI ps --format '{{.Names}}' | grep -q "^${PG_CONTAINER}$"; then
        $CONTAINER_CLI exec -i -e PGPASSWORD="$PG_PASSWORD" "$PG_CONTAINER" psql -U "$PG_USER" -d "$db" < "$file" > /dev/null 2>&1 || true
    elif command -v psql >/dev/null 2>&1; then
        PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$db" -f "$file" > /dev/null 2>&1 || true
    fi
}

# 1. Product Service Migrations & Seed
for f in "$ROOT_DIR"/backend/product-service/src/main/resources/db/migration/*.sql; do
    [ -f "$f" ] && run_sql_file "ecommerce_product" "$f"
done

# 2. Auth Service Migrations & Seed
for f in "$ROOT_DIR"/backend/auth-service/src/main/resources/db/migration/*.sql; do
    [ -f "$f" ] && run_sql_file "ecommerce_auth" "$f"
done

# 3. Cart Service Migrations
for f in "$ROOT_DIR"/backend/cart-service/src/main/resources/db/migration/*.sql; do
    [ -f "$f" ] && run_sql_file "ecommerce_cart" "$f"
done

# 4. Trigger Search Service Reindex if running
echo "  -> Triggering Search Service reindex..."
curl -s -X POST "http://localhost:8083/api/v1/search/admin/reindex" > /dev/null 2>&1 || true

echo "✨ Seeding complete!"
