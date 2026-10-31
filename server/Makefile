.PHONY: build dev format lint

build:
	CGO_ENABLED=0 go build -o dist/server ./cmd/server

dev:
	set -a; [ -f ../.env ] && . ../.env; set +a; go run ./cmd/server

format:
	gofmt -l -w .

lint:
	go vet ./...
