This respository implements a trivial messaging web application, using [ADL] as the "typing glue". The protoapp stack consists of:

- postgresql for the relational store
- rust+poet+sqlx for the application server
- typescript+react for the web user interface

The intention is that this repo can be used as a template for new projects.

[ADL]:https://github.com/adl-lang/adl

# Overview

[ADL] is a framework for building cross language data models. In this repo we use ADL to define

* a relational [database schema](./adl/protoapp/db.adl)
* a client/server [http based API](./adl/protoapp/apis/ui.adl)

From these, we generate:

* the [postgres SQL](./sql/adl-gen/adl-tables.latest.sql) for the db schema
* the rust [db schema binding](./rust/server/src/adl/db/schema.rs)
* the rust [api binding](./rust/server/src/adl/gen/protoapp/apis/ui.rs) (used [here](,/rust/server/src/server/routing.rs))
* the typescript [api binding](./ts/ui/src/adl-gen/protoapp/apis/ui.ts) (used [here](./ts/ui/src/service/index.ts))

Atop this we have hand written rust code to implement the api atop the database model, and hand written typescript code implementing
the web browser single page application in terms of the rust api.

# Local setup

Install docker and rust/cargo for your platform. Then install deno, node, pnpm, and adl into a repo
local directory by sourcing the local setup script:

```bash
. deno/local-setup.sh
```

Check installed tool versions with:

```
deno --version
node --version
adlc show --version 
```

# Local development

When you've changed any ADL, regenerate rust/typescript/sql code with

```bash
deno task genadl
```

Start postgres using docker:


```bash
(cd platform/dev; docker compose up -d db)
```

Run the unit tests via cargo:

```bash
(
cd rust/server
export DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb
cargo test -- --test-threads=1
)
```

## Start the server

```bash
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

```bash
(
cd rust/server
export DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb
cargo run --bin protoapp-tools -- create-user joe@test.com Joe xyzzy1
cargo run --bin protoapp-tools -- create-user --is-admin sarah@test.com Sarah abcdef
)
```

## Start the ui in dev mode

```bash
(
cd ts/ui
# note pnpm is installed by local-setup.sh
pnpm install
pnpm run dev
)
```

The (minimal) web application will be accessible at: http://localhost:5173
The api workbence will be accessible at: http://localhost:5173/api-dashboard
