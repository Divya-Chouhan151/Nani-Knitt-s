#!/usr/bin/env bash
set -e

echo "🧹 Flushing E-Commerce Platform Data..."

PG_CONTAINER="ecommerce-postgres"
PG_USER="${DB_USERNAME:-postgres}"
PG_PASSWORD="${DB_PASSWORD:-postgres}"
PG_HOST="${DB_HOST:-localhost}"
PG_PORT="${DB_PORT:-5433}"

CONTAINER_CLI="$(command -v docker 2>/dev/null || command -v podman 2>/dev/null || true)"

run_sql() {
    local db=$1
    local sql=$2
    if [ -n "$CONTAINER_CLI" ] && $CONTAINER_CLI ps --format '{{.Names}}' | grep -q "^${PG_CONTAINER}$"; then
        $CONTAINER_CLI exec -i -e PGPASSWORD="$PG_PASSWORD" "$PG_CONTAINER" psql -U "$PG_USER" -d "$db" -c "$sql" > /dev/null 2>&1 || true
    elif command -v psql >/dev/null 2>&1; then
        PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$db" -c "$sql" > /dev/null 2>&1 || true
    fi
}

echo "  -> Flushing 'ecommerce_cart' database..."
run_sql "ecommerce_cart" "TRUNCATE TABLE cart_items CASCADE;"

echo "  -> Flushing 'ecommerce_auth' database..."
run_sql "ecommerce_auth" "TRUNCATE TABLE support_ticket_messages, support_tickets, return_requests, order_status_history, order_items, orders, wishlist_items, user_settings, user_verifications, user_addresses, security_audit_logs, refresh_tokens, user_roles, users CASCADE;"

echo "  -> Flushing 'ecommerce_product' database..."
run_sql "ecommerce_product" "TRUNCATE TABLE product_images, product_variants, products, categories CASCADE;"

echo "  -> Flushing Elasticsearch index..."
curl -s -X DELETE "http://localhost:9200/products_*" > /dev/null 2>&1 || true

echo "✨ All databases and indices flushed clean!"
