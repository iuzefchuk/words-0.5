.PHONY: daemon dev prod

daemon:
	@docker info >/dev/null 2>&1 || colima start

dev: daemon
	docker compose -f compose.yaml -f compose.dev.yaml up --build --watch

prod: daemon
	docker compose up --build
