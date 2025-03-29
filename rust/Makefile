dev-server: check dev-db
	cd server &&                                                  \
	PROTOAPP_SERVER_CONFIG='{                                     \
		"http_bind_addr": "0.0.0.0:8081",                         \
		"db": {                                                   \
			"host": "localhost",                                  \
			"port": 5432,                                         \
			"dbname": "appdb",                                    \
			"user": "postgres",                                   \
			"password": "xyzzy"                                   \
		},                                                        \
		"jwt_access_secret": "shouldbetrulysecretbutnotrightnow", \
		"jwt_refresh_secret": "nottomentionthisone"               \
	}'                                                            \
	RUST_LOG=info                                                 \
	cargo run --bin protoapp-server

build: install-toolchain
	cargo build --workspace

check: install-toolchain
	cargo fmt --check
	cargo clippy --workspace -- -D warnings

check-build: check build

ci-test: install-toolchain
	DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb \
	cargo test -- --test-threads=1

test: install-toolchain dev-db
	DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb \
	cargo test -- --test-threads=1

dev-db:
	(cd ../platform/dev && docker compose up -d db)

install-toolchain:
	rustup show active-toolchain || rustup toolchain install