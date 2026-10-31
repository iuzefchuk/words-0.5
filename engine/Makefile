.PHONY: build format lint

build:
	cargo build --release
	cargo build --release --target wasm32-unknown-unknown

format:
	cargo fmt

lint:
	cargo clippy --all-targets -- -D warnings
