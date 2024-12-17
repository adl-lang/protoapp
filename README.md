A demonstration 3 tier application using ADL as the "typing glue".

# Local setup

Install docker for your platform. Then install deno, node, and adl into a repo
local directory by running the local setup script:

```
. deno/local-setup.sh

deno --version
node --version
adlc show --version 
```


# Run locally

Start postgres using docker and setup some roles:


```
(cd platform/dev; docker compose up -d db)
```

Run the unit tests via cargo:

```
(
cd rust/server
export DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb
cargo test -- --test-threads=1
)
```

## Start the server

```
(
cd rust/server
export PROTOAPP_SERVER_CONFIG='{
  "http_bind_addr": "0.0.0.0:8081",
  "db": {
    "host": "localhost",
    "port": 5432,
    "dbname": "appdb",
    "user": "postgres",
    "password": "xyzzy"
  },
  "jwt_access_secret": "shouldbetrulysecretbutnotrightnow",
  "jwt_refresh_secret": "nottomentionthisone"
 }'
export RUST_LOG=info
cargo run --bin protoapp-server
)
```

This will create the db schema and/or apply any necessary migrations

# Create some test users

```
(
cd rust/server
export DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb
cargo run --bin protoapp-tools -- create-user joe@test.com Joe xyzzy
cargo run --bin protoapp-tools -- create-user --is-admin sarah@test.com Sarah abcde
)
```

## Start the ui in dev mode

```
(
cd ts/ui
yarn
yarn dev
)
```
