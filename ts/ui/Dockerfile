# The protoapp web UI: a vite build served by caddy, which also reverse
# proxies /api to the server.
#
# Build from the ts/ workspace root rather than this directory, because the UI
# depends on the @protoapp/adl workspace package:
#
#   cd ts && docker build --file ui/Dockerfile --tag protoapp-ui:latest .
#
# or `deno task build-ui-image` from the repository root.
#
# API_ENDPOINT must be set at run time and has no default, so that nothing
# silently proxies to the wrong place:
#
#   docker run -p 80:80 -e API_ENDPOINT=protoapp-server:8080 protoapp-ui:latest

# Build Stage 1
FROM node:24.21.0-alpine AS builder
WORKDIR /build

# pnpm is pinned here rather than read from a packageManager field, as this
# workspace has no root package.json. Keep the version in step with
# ../../.prototools and ../../nix/flake.nix.
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

# .npmrc carries the jsr registry that @adllang/adl-runtime resolves through.
COPY .npmrc pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./

# Every workspace member, including those the UI does not depend on: the
# lockfile has an importer for each, so --frozen-lockfile fails if one is
# missing.
COPY adl ./adl
COPY api-workbench ./api-workbench
COPY prettier-config ./prettier-config
COPY ui ./ui

RUN pnpm install --frozen-lockfile
RUN cd ui && pnpm build

FROM caddy:2.11.3
COPY --from=builder /build/ui/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /build/ui/dist /usr/share/caddy
