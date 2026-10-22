# Build Stage
#
# Built from the `rust` directory, not from `rust/server`, since the server
# crate is a member of the workspace rooted there:
#
#   cd rust && docker build --file server/Dockerfile --tag protoapp-server:latest .
#
# cargo-chef splits the build in two: `cook` compiles the dependencies from a
# recipe derived from Cargo.toml and Cargo.lock alone, so that layer survives
# every source change and only a dependency change rebuilds it.
FROM rust:1.95 AS chef
# Keyed on the base image alone, so this holds across every other change.
# cargo-chef builds nothing that ships, so the pinned toolchain need not
# compile it.
RUN cargo install cargo-chef --locked
WORKDIR /usr/src/app
# rust-toolchain.toml names components the base image does not ship. Install
# them above every source COPY, so the download caches instead of repeating.
COPY rust-toolchain.toml .
RUN rustup toolchain install

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /usr/src/app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin protoapp-server

# Runtime Stage
FROM debian:bookworm-slim
RUN apt-get update && apt install -y openssl ca-certificates
COPY --from=builder /usr/src/app/target/release/protoapp-server /usr/local/bin/protoapp-server
# ENTRYPOINT rather than CMD so that `docker run <image> --config <file>` passes
# the flag to the server instead of replacing the command with it.
ENTRYPOINT ["protoapp-server"]
