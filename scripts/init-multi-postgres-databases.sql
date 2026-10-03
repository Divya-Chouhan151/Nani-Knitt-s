-- Create microservice databases if not already present
SELECT 'CREATE DATABASE ecommerce_product'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_product')\gexec

SELECT 'CREATE DATABASE ecommerce_auth'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_auth')\gexec

SELECT 'CREATE DATABASE ecommerce_cart'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_cart')\gexec
