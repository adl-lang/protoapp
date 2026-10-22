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

build:
	cargo build --workspace

check:
	cargo fmt --check
	cargo clippy --all-targets --workspace -- -D warnings

check-build: check build

ci-test:
	DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb \
	cargo test -- --test-threads=1

test: dev-db
	DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb \
	cargo test -- --test-threads=1

dev-db:
	(cd ../platform/dev && docker compose up -d db)
