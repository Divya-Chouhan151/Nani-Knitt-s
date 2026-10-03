# ==============================================================================
# AuraCommerce Platform Makefile
# Multi-Service Orchestration, Database Lifecycle, and Data Injection/Flush
# ==============================================================================

SHELL := /bin/bash
.DEFAULT_GOAL := help

# Toolchain configuration
JAVA_HOME ?= /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export JAVA_HOME
export PATH := $(JAVA_HOME)/bin:$(PATH)

PID_DIR := $(CURDIR)/.pids
COMPOSE_FILE := docker-compose.yml
DOCKER_COMPOSE ?= $(shell command -v docker >/dev/null 2>&1 && echo "docker compose" || (command -v podman-compose >/dev/null 2>&1 && echo "podman-compose" || echo "podman compose"))

# Colors for terminal output
BOLD  := \033[1m
GREEN := \033[32m
CYAN  := \033[36m
YELLOW:= \033[33m
RED   := \033[31m
RESET := \033[0m

## -----------------------------------------------------------------------------
## 📖 Help & Usage
## -----------------------------------------------------------------------------
.PHONY: help
help:
	@echo -e "$(BOLD)$(CYAN)AuraCommerce Control Panel$(RESET)"
	@echo -e "Usage: $(BOLD)make <target>$(RESET)\n"
	@echo -e "$(BOLD)Infrastructure & Database:$(RESET)"
	@echo -e "  $(GREEN)infra-up$(RESET)        Start Postgres (5433), Kafka (9092), and Elasticsearch (9200)"
	@echo -e "  $(GREEN)infra-down$(RESET)      Stop all infrastructure containers"
	@echo -e "  $(GREEN)infra-status$(RESET)    Display running infrastructure container status"
	@echo -e "  $(GREEN)db-logs$(RESET)         Follow Postgres container logs"
	@echo ""
	@echo -e "$(BOLD)Running Services:$(RESET)"
	@echo -e "  $(GREEN)run-backend$(RESET)     Start all 4 backend services in background (Product, Auth, Cart, Search)"
	@echo -e "  $(GREEN)stop-backend$(RESET)    Gracefully terminate all background backend services"
	@echo -e "  $(GREEN)run-frontend$(RESET)    Start frontend SolidJS dev server (Port 3000)"
	@echo -e "  $(GREEN)run-product$(RESET)     Run Product Service (Port 8080)"
	@echo -e "  $(GREEN)run-auth$(RESET)        Run Auth & Profile Service (Port 8081)"
	@echo -e "  $(GREEN)run-cart$(RESET)        Run Cart Service (Port 8082)"
	@echo -e "  $(GREEN)run-search$(RESET)      Run Search Service (Port 8083)"
	@echo -e "  $(GREEN)run-all$(RESET)         Start infra, backend services, and frontend"
	@echo -e "  $(GREEN)stop-all$(RESET)        Stop frontend, backend services, and containers"
	@echo -e "  $(GREEN)status$(RESET)          Health check all service HTTP ports"
	@echo ""
	@echo -e "$(BOLD)Data Management (Inject & Flush):$(RESET)"
	@echo -e "  $(GREEN)data-inject$(RESET)     Inject demo products, master admin, orders, FAQs & reindex search"
	@echo -e "  $(GREEN)data-seed$(RESET)       Alias for data-inject"
	@echo -e "  $(GREEN)data-flush$(RESET)      Truncate all tables across databases and delete search index"
	@echo -e "  $(GREEN)data-reset$(RESET)      Flush all tables and re-seed clean demo data"
	@echo ""
	@echo -e "$(BOLD)Build & Test:$(RESET)"
	@echo -e "  $(GREEN)build$(RESET)           Compile all backend modules (Maven) and build frontend"
	@echo -e "  $(GREEN)test$(RESET)            Run all tests (Backend unit/integration + Frontend Vitest/E2E)"
	@echo -e "  $(GREEN)test-backend$(RESET)    Run Maven test suite across all 4 microservices"
	@echo -e "  $(GREEN)test-frontend$(RESET)   Run Vitest and Playwright test suites"
	@echo ""

## -----------------------------------------------------------------------------
## 🐳 Infrastructure & Database Targets
## -----------------------------------------------------------------------------
.PHONY: infra-up db-up
infra-up db-up:
	@echo -e "$(CYAN)Starting infrastructure containers (Postgres, Kafka, Elasticsearch)...$(RESET)"
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d
	@echo -e "$(GREEN)Waiting for Postgres to be ready...$(RESET)"
	@until (command -v docker >/dev/null 2>&1 && docker exec ecommerce-postgres pg_isready -U postgres >/dev/null 2>&1) || (command -v podman >/dev/null 2>&1 && podman exec ecommerce-postgres pg_isready -U postgres >/dev/null 2>&1) || nc -z localhost 5433; do \
		sleep 1; \
	done
	@echo -e "$(GREEN)✓ Infrastructure is ready!$(RESET)"

.PHONY: infra-down db-down
infra-down db-down:
	@echo -e "$(YELLOW)Stopping infrastructure containers...$(RESET)"
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down
	@echo -e "$(GREEN)✓ Infrastructure stopped.$(RESET)"

.PHONY: infra-status db-status
infra-status db-status:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) ps

.PHONY: db-logs
db-logs:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f postgres

## -----------------------------------------------------------------------------
## 🚀 Individual Service Runners (Foreground)
## -----------------------------------------------------------------------------
.PHONY: run-product
run-product:
	@echo -e "$(CYAN)Starting Product Service on port 8080...$(RESET)"
	cd backend && mvn spring-boot:run -pl product-service

.PHONY: run-auth
run-auth:
	@echo -e "$(CYAN)Starting Auth & Profile Service on port 8081...$(RESET)"
	cd backend && mvn spring-boot:run -pl auth-service

.PHONY: run-cart
run-cart:
	@echo -e "$(CYAN)Starting Cart Service on port 8082...$(RESET)"
	cd backend && mvn spring-boot:run -pl cart-service

.PHONY: run-search
run-search:
	@echo -e "$(CYAN)Starting Search Service on port 8083...$(RESET)"
	cd backend && mvn spring-boot:run -pl search-service

.PHONY: run-frontend
run-frontend:
	@echo -e "$(CYAN)Starting Frontend SolidJS dev server on port 5173...$(RESET)"
	cd frontend && pnpm dev

## -----------------------------------------------------------------------------
## ⚙️ Multi-Service Background Runners
## -----------------------------------------------------------------------------
.PHONY: run-backend
run-backend:
	@mkdir -p $(PID_DIR)
	@echo -e "$(CYAN)Launching backend services in background...$(RESET)"
	@if [ ! -f $(PID_DIR)/product.pid ]; then \
		echo "Starting Product Service (8080)..."; \
		(cd backend && nohup mvn spring-boot:run -pl product-service > $(PID_DIR)/product.log 2>&1 & echo $$! > $(PID_DIR)/product.pid); \
	fi
	@if [ ! -f $(PID_DIR)/auth.pid ]; then \
		echo "Starting Auth Service (8081)..."; \
		(cd backend && nohup mvn spring-boot:run -pl auth-service > $(PID_DIR)/auth.log 2>&1 & echo $$! > $(PID_DIR)/auth.pid); \
	fi
	@if [ ! -f $(PID_DIR)/cart.pid ]; then \
		echo "Starting Cart Service (8082)..."; \
		(cd backend && nohup mvn spring-boot:run -pl cart-service > $(PID_DIR)/cart.log 2>&1 & echo $$! > $(PID_DIR)/cart.pid); \
	fi
	@if [ ! -f $(PID_DIR)/search.pid ]; then \
		echo "Starting Search Service (8083)..."; \
		(cd backend && nohup mvn spring-boot:run -pl search-service > $(PID_DIR)/search.log 2>&1 & echo $$! > $(PID_DIR)/search.pid); \
	fi
	@echo -e "$(GREEN)✓ Backend services started. Logs available in $(PID_DIR)/*.log$(RESET)"

.PHONY: stop-backend
stop-backend:
	@echo -e "$(YELLOW)Stopping background backend services...$(RESET)"
	@for service in product auth cart search; do \
		if [ -f $(PID_DIR)/$$service.pid ]; then \
			PID=$$(cat $(PID_DIR)/$$service.pid); \
			echo "Stopping $$service (PID: $$PID)..."; \
			kill $$PID 2>/dev/null || true; \
			rm -f $(PID_DIR)/$$service.pid; \
		fi; \
	done
	@pkill -f "com.ecommerce.*ServiceApplication" 2>/dev/null || true
	@pkill -f "spring-boot:run" 2>/dev/null || true
	@for port in 8080 8081 8082 8083; do \
		PIDS=$$(lsof -ti:$$port 2>/dev/null); \
		if [ -n "$$PIDS" ]; then \
			kill -9 $$PIDS 2>/dev/null || true; \
		fi; \
	done
	@echo -e "$(GREEN)✓ All backend services stopped.$(RESET)"

.PHONY: run-frontend-bg
run-frontend-bg:
	@mkdir -p $(PID_DIR)
	@if [ ! -f $(PID_DIR)/frontend.pid ]; then \
		echo "Starting Frontend Dev Server (3000)..."; \
		(cd frontend && nohup pnpm dev > $(PID_DIR)/frontend.log 2>&1 & echo $$! > $(PID_DIR)/frontend.pid); \
	fi
	@echo -e "$(GREEN)✓ Frontend started in background.$(RESET)"

.PHONY: stop-frontend
stop-frontend:
	@if [ -f $(PID_DIR)/frontend.pid ]; then \
		PID=$$(cat $(PID_DIR)/frontend.pid); \
		echo "Stopping frontend (PID: $$PID)..."; \
		kill $$PID 2>/dev/null || true; \
		rm -f $(PID_DIR)/frontend.pid; \
	fi
	@pkill -f "vite" 2>/dev/null || true
	@echo -e "$(GREEN)✓ Frontend stopped.$(RESET)"

.PHONY: wait-backend
wait-backend:
	@echo -e "$(CYAN)Waiting for backend services to be ready...$(RESET)"
	@for i in {1..30}; do \
		if nc -z localhost 8080 2>/dev/null && nc -z localhost 8081 2>/dev/null; then \
			echo -e "$(GREEN)✓ Backend services are ready!$(RESET)"; \
			exit 0; \
		fi; \
		sleep 1; \
	done; \
	echo -e "$(YELLOW)Backend still initializing, proceeding...$(RESET)"

.PHONY: run-all
run-all: infra-up run-backend wait-backend
	@echo -e "$(CYAN)Starting frontend...$(RESET)"
	cd frontend && pnpm dev

.PHONY: run-all-bg
run-all-bg: infra-up run-backend wait-backend run-frontend-bg
	@echo -e "$(GREEN)✓ All services (infra, backend, frontend) started in background!$(RESET)"

.PHONY: stop-all
stop-all: stop-frontend stop-backend infra-down
	@echo -e "$(GREEN)✓ Everything stopped.$(RESET)"

## -----------------------------------------------------------------------------
## 🩺 Health Check / Status
## -----------------------------------------------------------------------------
.PHONY: status
status:
	@echo -e "$(BOLD)Checking Service Endpoints:$(RESET)"
	@check_port() { \
		local name=$$1; local port=$$2; \
		if nc -z localhost $$port 2>/dev/null || curl -s http://localhost:$$port >/dev/null 2>&1; then \
			echo -e "  $$name (Port $$port): $(GREEN)ONLINE$(RESET)"; \
		else \
			echo -e "  $$name (Port $$port): $(RED)OFFLINE$(RESET)"; \
		fi; \
	}; \
	check_port "Postgres DB         " 5433; \
	check_port "Elasticsearch       " 9200; \
	check_port "Kafka Broker        " 9092; \
	check_port "Product Service     " 8080; \
	check_port "Auth Service        " 8081; \
	check_port "Cart Service        " 8082; \
	check_port "Search Service      " 8083; \
	check_port "Frontend Storefront " 3000

## -----------------------------------------------------------------------------
## 💾 Data Management: Inject & Flush
## -----------------------------------------------------------------------------
.PHONY: data-inject data-seed
data-inject data-seed:
	@./scripts/seed-data.sh

.PHONY: data-flush
data-flush:
	@./scripts/flush-data.sh

.PHONY: data-reset
data-reset: data-flush data-seed
	@echo -e "$(GREEN)✓ Data reset complete!$(RESET)"

## -----------------------------------------------------------------------------
## 🔨 Build & Test
## -----------------------------------------------------------------------------
.PHONY: build
build:
	@echo -e "$(CYAN)Building backend modules...$(RESET)"
	cd backend && mvn clean compile -DskipTests
	@echo -e "$(CYAN)Building frontend bundle...$(RESET)"
	cd frontend && pnpm build
	@echo -e "$(GREEN)✓ Build completed successfully!$(RESET)"

.PHONY: test-backend
test-backend:
	@echo -e "$(CYAN)Running backend tests...$(RESET)"
	cd backend && mvn test -pl cart-service,auth-service,search-service

.PHONY: test-frontend
test-frontend:
	@echo -e "$(CYAN)Running frontend unit tests (Vitest)...$(RESET)"
	cd frontend && pnpm test --run
	@echo -e "$(CYAN)Running frontend E2E tests (Playwright)...$(RESET)"
	cd frontend && pnpm test:e2e

.PHONY: test
test: test-backend test-frontend
	@echo -e "$(GREEN)✓ All backend and frontend test suites passed!$(RESET)"
