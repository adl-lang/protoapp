# ADL Rust server: current state and plan

Notes on the Rust server side of protoapp: how it works today, and what is planned next.
Files referred to: `adl/common/http.adl`, `rust/adl/src/http_api.rs`, the derive in
`rust/adl/derive/src/lib.rs`, `rust/server/src/server/{poem_adl_interop,routing,handlers}.rs`,
and the generated `rust/adl/src/gen/protoapp/apis/ui.rs`.

## Goal

Rust HTTP RPC services implemented from ADL API definitions, where:

- Generated or macro-produced code uses straightforward, explicit types. Syntactic
  friendliness for hand-written code is not a priority.
- The wire format is JSON, using ADL's serde-based serialization.
- ADL-defined endpoints can be mixed with hand-written ones, under a host framework of
  choice (axum, poem, etc.).

## Current state

### Endpoint model

An API is an ADL struct whose fields are `common.http.HttpReq<I,O>` values. `HttpReq` has
`method` (`get` or `post`, default `post`), `security` (`public`, `token` or
`tokenWithRole: String`), and `reqType`/`respType` type tokens. Method and security are
given as field defaults.

An endpoint's path is `"/"` followed by its ADL field name, derived identically by the Rust
and TypeScript backends. A `@HttpPath "<path>"` annotation on the field replaces it
verbatim (it must start with `/`); the health check uses `@HttpPath "/"`. Renaming an ADL
field is therefore a wire-breaking change.

A field that is not an `HttpReq` is another API struct nested under it, and its endpoints
are served beneath the field's path, e.g. `/admin/create_user`. The same API type may be
nested at more than one field.

### `#[derive(HttpApi)]`

`adlc rust` generates the API struct. `RustExtraDeriveTraits ["adl::HttpApi"]` in
`ui.adl-rs` adds the derive, which lives in `rust/adl/derive` (`syn` and `quote`). It
matches field types syntactically on `HttpReq<I, O>`, and emits:

- An endpoint trait `<Api>Endpoints` with one method per endpoint. Adding an endpoint in
  ADL fails to compile until the handler implements it.
- `impl HttpApi<Ctx, M, H>` whose `register_at(prefix, ..)` mounts every endpoint into a
  host-agnostic `Mount` trait (`http_api.rs`); `register` is `register_at("")`. `routing.rs`
  mounts `Api` with one `adl_api_at` call and `handlers.rs` implements the generated traits.
- `PATH_<FIELD>` constants, relative to where the API is mounted. Each nested field adds a
  prefix constant, so hand-written wiring composes them (`Api::PATH_ADMIN` +
  `AdminApi::PATH_CREATE_USER`).
- For each nested field, an associated type bounded by the nested API's endpoint trait and
  an accessor for it. The mount point is identified by the field, not the type, so two
  fields of one API type may be served by different handler types. Each nested API needs
  its own `RustExtraDeriveTraits ["adl::HttpApi"]` line.
- An `<Api>Client`, generic over an `Invoke` transport (the client-side counterpart of
  `Mount`). Paths compose through nested accessors, and the public/secured split follows
  the security annotation.

Macros only see tokens, so method and security are runtime values read from the struct's
defaults, while paths and security policy (which decides handler signatures) are read at
expansion time from annotations.

### Security

The security policy of each endpoint decides its handler's signature. A `public` endpoint's
handler takes `(ctx, req)`. Every other handler takes `(ctx, identity, req)`, where
`Identity` is an associated type supplied by the host and produced only by the policy
check. `Mount` has `mount_public` and `mount_secured` for the two shapes, so neither a
handler nor a host can skip the check.

`check_security` runs once, in one place. A bad or absent token is fatal only where a
credential is required, and is ignored on a public endpoint. Absent or unusable
credentials give 401, and valid credentials with the wrong role give 403. A `token`
endpoint accepts any role; restrict one with `tokenWithRole`.

### Annotations in generated Rust

`adlc.config.rust.RustEmitAnnotation`, applied to an annotation's declaration, makes adlc
emit each use as `#[adl_annotation(name="..", value="<adl json>")]`. adlc adds the
`adl_rt::AdlAnnotations` derive to the item so the attribute is legal; helper attributes
are visible to every derive on the item, which is how `HttpApi` reads `@HttpPath` and
`@HttpSecurity`. This needs adlc 1.4.1, which the `adl` input in `flake.nix` pins.
Generated code names the published `adl_rt` crate directly (no `--runtime-module`).

### Host and wire behaviour

- Host: poem, with sqlx and postgres. `poem_adl_interop.rs` mounts endpoints as poem
  endpoints.
- POST reads a JSON body. GET reads the query parameter `input=<urlencoded JSON>`, or
  deserializes from JSON `null` when there is no query string (Void inputs). Output is
  always `Json(o)`.
- App state and the JWT checker are fetched with `req.data::<T>().expect(..)`, so a missing
  setup call is a runtime panic.
- `HandlerError` is `Anyhow(anyhow::Error)` or `Poem(poem::Error)`; `Anyhow` becomes a bare
  500 and the error is discarded.
- Domain errors are ADL types inside `O`, returned with a 200.

### Code generation

`tasks/genadl.sh` (or `task genadl`) runs `adlc typescript`, `adlc rust`, and the external
subcommands `adlc ts-package`, `adlc rust-seaquery-schema` and `adlc sqlschema` from
`adlc-extensions/`. The db column definitions in `rust/adl/src/db/schema.rs` come from
`adlc rust-seaquery-schema`.

## Plan

### 1. Smaller server changes (on poem)

- **Typed state and JWT checker.** Hold `Arc<S>` and `Arc<dyn JwtSecurityCheck>` in the
  router rather than `req.data().expect()`, and collapse the `AdlReqContext` wrapper.
- **Log internal errors** before converting `HandlerError::Anyhow` to a 500.
- **Owned handler error type.** Replace `HandlerError::Poem` with an enum: `Unauthorized`,
  `Forbidden`, `BadRequest(String)`, `Internal(anyhow::Error)`.
- **Set a request body size limit.**

### 2. A `tower::Service` runtime

Make the runtime a `tower::Service` so it can be mounted in axum, poem or bare hyper, and
tested with `ServiceExt::oneshot` with no socket. First step: an interop module with the
`tower::Service` boundary, including GET query-string decoding matching current behaviour,
with one API ported to it and the poem path kept for comparison.

Design rules:

- The public interface is `tower::Service<http::Request<B>>`, generic over the request body
  `B` (`http_body::Body + Send + 'static`, `B::Data: Send`, `B::Error: Into<BoxError>`).
  Do not expose `hyper::body::Incoming`.
- The state `S` is held as `Arc<S>` (`Send + Sync + 'static`). The service is `Clone` and
  `Sync` (poem's compat adapter needs it), with `Error = Infallible` and
  `Response = http::Response<Full<Bytes>>`.
- `poll_ready` is always ready. Backpressure belongs in tower layers.
- Handlers receive a request context exposing headers and extensions (e.g.
  `http::request::Parts`), so host middleware can share auth data with ADL handlers.
- Routing is by type erasure: `Arc<dyn Fn(Arc<S>, Ctx, Bytes) -> BoxFut>` in a `HashMap`
  keyed by path, with `security` and `method`; duplicate routes assert.
- The serve loop is an optional helper built on hyper-util's `server::conn::auto::Builder`.
- Transport failures (bad JSON, auth, not found, too large, internal) are HTTP status
  codes; domain errors stay in `O`.

Layers: hyper 1.x serves HTTP/1 and HTTP/2; tower provides `Service` and `Layer`, tower-http
the middleware; the shared types are `http` and `http-body` 1.x. Adapt a tower service to
hyper with `hyper_util::service::TowerToHyperService` (it clones the service per request).
axum is built on tower; poem has a `tower-compat` feature; actix-web would need a shim.

Mixing ADL and custom endpoints under axum would look like:

```rust
let mut adl = adl_runtime::Router::new(state.clone(), jwt_checker);
ui_api.register(&mut adl);

let app = axum::Router::new()
    .route("/healthz", get(health))            // custom endpoint
    .nest_service("/api", adl.into_service())  // ADL endpoints
    .layer(TraceLayer::new_for_http());
```

### 3. Db schema and annotations through macros (optional)

The db column definitions come from a typescript tool, while `HttpApi` is a derive. These
alternatives would make adl to rust consistent.

The obstacle for a db derive: a derive sees only the item it is attached to. The table type
is `pub struct AppUserTable(pub WithId<AppUser>)`, whose columns are `AppUser`'s fields plus
the `id` added through `@DbSpread`, and the derive can see neither type's fields.

**Option A: two cooperating derives, no new input.**

- A derive on the table newtype reads the `DbTable` annotation (via `RustEmitAnnotation`),
  parses `WithId<AppUser>` syntactically for the inner type, and emits
  `impl HasTable for AppUser { const TABLE: &str = ".."; .. }` and the `id()` column.
- A derive on the inner struct sees the named fields and emits an inherent
  `impl AppUser { pub fn email() -> ColumnSpec<StringNE> { .. } }`. Field types are copied
  as tokens.
- Limits: the `WithId<X>` shape is hardcoded and spreads nested more than one level are
  not handled.
- Call sites change from `schema::AppUser::email()` to `AppUser::email()`, in
  `rust/server/src/server/db/mod.rs`.
- To verify: that adlc's Rust backend emits `adl_annotation` on a newtype (`Internal.hs`
  does it for structs and their fields), otherwise a small adlc change is needed.

**Option B: macros read an `adlc ast` file.** `genadl` also runs
`adlc ast --combined-output rust/adl/src/gen/.adl-ast.json`, and the derives read it at
expansion time.

- The derive looks up `protoapp.db.AppUserTable` in the AST and resolves spreads itself,
  so it needs no `WithId<X>` convention. This ports `getDbFields` (about 60 lines).
- Column types come from Rust inference rather than a port of the type mapping:

  ```rust
  fn col<R, T>(table: &'static str, name: &'static str, _proj: fn(&R) -> &T) -> ColumnSpec<T>
  // emitted: col("app_user", "email", |r: &AppUserTable| &r.0.value.email)
  ```

  The primary key is typed `DbKey<AppUserTable>` explicitly.
- The expansion includes `const _: &[u8] = include_bytes!("..")` so cargo reruns the macro
  when the file changes. The derive crate cannot depend on `adl` (which depends on it), so
  it parses the AST as `serde_json::Value` or with small structs, cached in a `OnceLock`.
- Finding a declaration needs its ADL module name. Searching by decl name is enough at
  this size; the general fix is an adlc attribute such as
  `#[adl_decl(module="protoapp.db", name="AppUserTable")]` on every generated decl.
- The AST file is a large committed generated artifact, written by the same `genadl` run
  as the Rust. Macro output is inspected with `cargo expand`. A `build.rs` writing
  `schema.rs` into `OUT_DIR` is a less magical variant.

**Applying option B to `HttpApi`.** The derive would read method, security and path
annotations from the AST, so `RustEmitAnnotation`, `adl_rt::AdlAnnotations` and the
`adl_annotation` attributes would no longer be needed here. It would also see nested API
declarations and struct-level defaults, so the per-nested-API derive lines could go and
the rule that a struct default does not reach a nested API could be reconsidered. Field
types would still come from the struct's tokens. The cost is reworking the annotation and
nesting reads in the derive. `server_security_policy` and the `/admin/*` server tests are
the regression check.

**Order if pursued.** Build the shared AST loader in `rust/adl/derive` and prove it on a db
derive for `AppUserTable` and `Message`. Then port `HttpApi`'s annotation lookups to it,
keeping the attribute reading until the tests pass. Then remove the `RustEmitAnnotation`
lines from the `.adl-rs` files, and the per-nested-API derive lines if no longer needed.

Neither option removes the typescript tooling entirely, since `adlc sqlschema` still
resolves spreads in typescript.

## Rough edges

- A field that is neither an `HttpReq` nor an API struct is read as a nested API, and
  fails as an unsatisfied `HttpApi` or handler-trait bound that does not name the mistake.
- Method names may collide between an API and the APIs nested in it if one type implements
  several of the endpoint traits in a tree. A collision surfaces as an ambiguity error.
- `ts/ui` and `ts/api-workbench` each carry a near-copy of `service-base.ts`.
- Neither `adl_rt` nor `adl_rt_derive` declares an MSRV.

## Unverified

- Whether a service with `Error = Infallible` satisfies poem's `TowerCompatExt` bound
  (`Err: Into<poem::Error>`).
- Whether request extensions set by poem middleware survive poem's tower-compat conversion.
- Crate versions (as of Oct 2026: hyper 1.11.x, axum 0.8.9 with 0.9 in progress, poem
  3.1.x, tower 0.x). Recheck before pinning.
