# Makefile for ArchiEase Docker Operations

.PHONY: help build up down logs clean dev prod deploy

# Default target
help:
	@echo "ArchiEase Docker Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-logs     - View development logs"
	@echo "  make dev-down     - Stop development environment"
	@echo ""
	@echo "Production:"
	@echo "  make prod-build   - Build production images"
	@echo "  make prod-up      - Start production environment"
	@echo "  make prod-down    - Stop production environment"
	@echo "  make prod-logs    - View production logs"
	@echo "  make prod-restart - Restart production containers"
	@echo ""
	@echo "Build:"
	@echo "  make build        - Build application image"
	@echo "  make clean        - Clean Docker resources"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy       - Full production deployment"

# Development commands
dev:
	@echo "Starting development environment..."
	docker-compose up -d
	@echo "Application running at http://localhost:8080"

dev-logs:
	docker-compose logs -f

dev-down:
	docker-compose down

# Production commands
prod-build:
	@echo "Building production images..."
	docker-compose -f docker-compose.prod.yml build --no-cache

prod-up:
	@if [ ! -f .env.prod ]; then \
		echo "Error: .env.prod file not found!"; \
		echo "Copy env.prod.template to .env.prod and configure it."; \
		exit 1; \
	fi
	@echo "Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@docker-compose -f docker-compose.prod.yml ps

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

prod-logs-app:
	docker-compose -f docker-compose.prod.yml logs -f app

prod-logs-db:
	docker-compose -f docker-compose.prod.yml logs -f mysql

prod-restart:
	docker-compose -f docker-compose.prod.yml restart

prod-status:
	docker-compose -f docker-compose.prod.yml ps

# Build commands
build:
	@echo "Building application image..."
	docker build -t archiease:latest .

# Cleanup commands
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f

clean-all: clean
	@echo "Removing all images..."
	docker rmi archiease:latest || true
	docker rmi archiease-app-prod || true

# Health check
health:
	@echo "Checking application health..."
	@curl -s http://localhost:8080/actuator/health || echo "Application not responding"

# Database backup
backup-db:
	@echo "Backing up database..."
	@mkdir -p backups
	@docker exec archiease-mysql-prod mysqldump -u root -p$${MYSQL_ROOT_PASSWORD} project_tracker_db > backups/db_backup_$$(date +%Y%m%d_%H%M%S).sql || \
	 docker exec archiease-mysql-prod mysqldump -u root project_tracker_db > backups/db_backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup completed"

# Full deployment (for AWS)
deploy:
	@echo "Full production deployment..."
	@if [ ! -f .env.prod ]; then \
		echo "Error: .env.prod file not found!"; \
		echo "Copy deployment/aws/env.prod.template to .env.prod and configure it."; \
		exit 1; \
	fi
	@make prod-build
	@make prod-up
	@echo "Deployment complete!"
	@echo "Check status with: make prod-status"
	@echo "View logs with: make prod-logs"

