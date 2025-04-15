This respository implements a small full stack web application, using [ADL] as the "typing glue". It's intended to
demonstrate the benefits of the strong cross language type system provided by ADL, and also to serve as a template
that can be forked as a starting point for new projects.

The application is a trivial messaging system, where authenticated users can post messages to a shared noticeboard.

The technology stack consists of:

- [postgresql] for the relational store
- [rust]+[poem]+[sqlx] for the application server
- [typescript]+[react] for the web user interface

[ADL]:https://github.com/adl-lang/adl
[postgresql]:https://www.postgresql.org/
[rust]:https://www.rust-lang.org/
[poem]:https://github.com/poem-web/poem
[sqlx]:https://github.com/launchbadge/sqlx
[typescript]:https://www.typescriptlang.org/
[react]:https://react.dev/

# 1 Why ADL

[ADL] is a framework for building cross language data models. In this repo we use ADL to define

* the relational [database schema](./adl/protoapp/db.adl)
* the client/server [http based API](./adl/protoapp/apis/ui.adl)
* the server [config file format](./adl/protoapp/config/server.adl)

From these, we generate:

* the [postgres SQL](./sql/adl-gen/adl-tables.latest.sql) for the db schema
* the rust [db schema binding](./rust/server/src/adl/db/schema.rs)
* the rust [api binding](./rust/server/src/adl/gen/protoapp/apis/ui.rs) (used [here](,/rust/server/src/server/routing.rs))
* the typescript [api binding](./ts/ui/src/adl-gen/protoapp/apis/ui.ts) (used [here](./ts/ui/src/service/index.ts))

Having strong types end to end in the system provides many benefits. Some of these are described below.

## 1.1 A strongly typed DB model

The ADL data model is more expressive than SQL - hence we benefit from having ADL as the db schema source of truth. For
example if we wish to store a complex structured value in a db field we can define it's type in ADL whilst persisting
it as a postgresql `jsonb` value. The rust db binding will automatically map between the db json value and the ADL generated
rust type whenever reading/writing the field.

Additionally, in our ADL db model, we distinguished between db keys of different types. eg db keys for the user
table ([AppUserId](./adl/protoapp/db.adl#L18)), vs db keys for the message
table([MessageId](./adl/protoapp/db.adl#L32)). For these we generate distinct key types
in the rust server code, eliminating at compile time the possibility of mixing up key types.


## 1.2 Declarative API security

Each ADL defined API endpoint declares its security policy, which is a value of type
[HttpSecurity](./adl/common/http.adl#L35). In the rust server implementation this is implemented
for all endpoints (existing and future) at a [single point](./rust/server/src/server/poem_adl_interop.rs#L181)

## 1.3 Generated Forms

The typescript code has runtime type information about all ADL types. This means that it's possible to automatically
generate a UI form for any ADL type, no matter how complex it's algebraic structure. Furthermore, the ADL file
[common/strings.adl](./adl/common/strings.adl) defines specific types of strings, and any generated forms reflects the
use of these. For example:

* Type `StringNE` produces a string field that must not be empty
* Type `EmailAddress` produces a string field that must be a valid email
* Type `Password` produces a hidden string field (with a show button)
* Type `StringML` produces a multi line string editor

Also the generated forms validate the different db types, described above: 

![workbench 4](docs/workbench-4.png)

## 1.4 API Workbench UI

The system includes an "API workbench" which is a stand alone UI automatically derived from the ADL definition. This
UI provides generated forms to execute all api endpoints, and capture their responses. As soon an an endpoint is added or modified
this UI is updated accordingly.

The API Workbench references the ADL endpoint security policies (see above) to ensure that only the endpoints accessible to the
current user are shown.

1) The api workbench in use:
![workbench 1](docs/workbench-1.png)

2) Choosing an endpoint:
![workbench 2](docs/workbench-2.png)

3) Constructing an endpoint request:
![workbench 3](docs/workbench-3.png)


# 2 Local setup

Currently linux and macos are supported.

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

# 3 Local development

When you've changed any ADL, regenerate rust/typescript/sql code with

```bash
deno task genadl
```

## 3.1 Start postgres


```bash
(cd platform/dev; docker compose up -d db)
```

## 3.2 Run the unit tests

```bash
(
cd rust/server
export DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb
cargo test -- --test-threads=1
)
```

## 3.3 Start the server

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

## 3.4 Create some test users

```bash
(
cd rust/server
export DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb
cargo run --bin protoapp-tools -- create-user joe@test.com Joe xyzzy1
cargo run --bin protoapp-tools -- create-user --is-admin sarah@test.com Sarah abcdef
)
```

## 3.5 Start the ui in dev mode

```bash
(
cd ts/ui
# note pnpm is installed by local-setup.sh
pnpm install
pnpm run dev
)
```

## 3.6 Start the api workbench in dev mode
```bash
(
cd ts/api-workbench
# note pnpm is installed by local-setup.sh
pnpm install
pnpm run dev
)


The (minimal) web application will be accessible at: http://localhost:5173
The api workbench will be accessible at: http://localhost:5174

## 4 Forking

The following linux commands can be used to rename "protoapp" to "myproject" in a fork
of this repo:

```
git mv adl/{protoapp,myproject}
git mv rust/adl/src/gen/{protoapp,myproject}
git mv rust/server/src/bin/{protoapp,myproject}-server.rs
git mv rust/server/src/bin/{protoapp,myproject}-tools.rs
git mv ts/adl/src/{protoapp,myproject}
sed -i -e 's|protoapp|myproject|g'  $(git ls-files)
sed -i -e 's|Protoapp|MyProject|g'  $(git ls-files)
sed -i -e 's|PROTOAPP|MYPROJECT|g'  $(git ls-files)
deno task genadl
```

macos sed doesn't support multi file in place updates, so an alternative tool will
be required.
