# syntax=docker/dockerfile:1
FROM rust:1-slim-bookworm AS engine
WORKDIR /app/engine
COPY engine ./
RUN --mount=type=cache,target=/usr/local/cargo/registry --mount=type=cache,target=/app/engine/target \
    cargo build --release && cp target/release/libengine.so /libengine.so

FROM golang:1-bookworm AS build
WORKDIR /app/server
COPY server/go.mod server/go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY server ./
RUN --mount=type=cache,target=/go/pkg/mod --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /server ./cmd/server

FROM gcr.io/distroless/cc-debian12:nonroot
ENV SERVER_PORT=5678
WORKDIR /app/server
COPY --from=engine /libengine.so /app/engine/target/release/libengine.so
COPY engine/src/assets/dictionary.bin /app/engine/src/assets/dictionary.bin
COPY --from=build /server /app/server/server
HEALTHCHECK --start-period=10s --start-interval=1s CMD ["/app/server/server", "healthcheck"]
ENTRYPOINT ["/app/server/server"]
