# syntax=docker/dockerfile:1
FROM node:26-slim AS dev
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY engine ../engine
COPY client ./
CMD ["npm", "run", "dev", "--", "--host"]

FROM dev AS build
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/client/dist /srv
COPY <<'EOF' /etc/caddy/Caddyfile
:80 {
	root * /srv
	encode zstd gzip {
		match {
			header Content-Type application/javascript*
			header Content-Type application/json*
			header Content-Type application/octet-stream*
			header Content-Type image/svg+xml*
			header Content-Type text/*
		}
	}
	handle /assets/* {
		header Cache-Control "public, max-age=31536000, immutable"
		file_server
	}
	handle /api/* {
		reverse_proxy server:{$SERVER_PORT:5678}
	}
	handle {
		header Cache-Control no-cache
		try_files {path} /index.html
		file_server
	}
}
EOF
