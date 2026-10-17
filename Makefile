# Helali DevOps helpers (split compose: infra / backend / frontend)
COMPOSE ?= docker compose
PROJECT ?= helali

.PHONY: infra backend frontend up down ps logs pull prune

infra:
	$(COMPOSE) -f docker-compose.infra.yml --project-name $(PROJECT)-infra up -d --wait

backend:
	$(COMPOSE) -f docker-compose.backend.yml --project-name $(PROJECT)-app up -d --force-recreate --wait

frontend:
	$(COMPOSE) -f docker-compose.frontend.yml --project-name $(PROJECT)-web up -d --force-recreate --wait

# Local full stack (build from Dockerfiles; profile=full)
up:
	$(COMPOSE) -f docker-compose.yml --project-name $(PROJECT) --profile full up -d --build

down:
	-$(COMPOSE) -f docker-compose.frontend.yml --project-name $(PROJECT)-web down
	-$(COMPOSE) -f docker-compose.backend.yml --project-name $(PROJECT)-app down
	-$(COMPOSE) -f docker-compose.infra.yml --project-name $(PROJECT)-infra down

ps:
	@docker ps --filter name=helali --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

logs:
	@docker logs helali-backend --tail 80 2>/dev/null || true
	@docker logs helali-frontend --tail 80 2>/dev/null || true

pull:
	-$(COMPOSE) -f docker-compose.backend.yml pull
	-$(COMPOSE) -f docker-compose.frontend.yml pull

prune:
	docker image prune -f
