.PHONY: dev prod

dev:
	docker compose -f compose.yaml -f compose.dev.yaml up --build --watch

prod:
	docker compose up --build
