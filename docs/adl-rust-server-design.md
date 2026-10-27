# ADL Rust server runtime: design notes

Context for Claude Code. This summarises a design discussion about improving the Rust
server side of [adl-lang/protoapp](https://github.com/adl-lang/protoapp). The person driving
this owns the adl-lang org and wrote most of ADL and protoapp.

## Goal

Rust HTTP RPC services implemented from ADL API definitions, where:

- Generated or macro-produced code uses **straightforward, explicit types**. Syntactic
  friendliness for hand-written code is not a priority.
- The wire format is **JSON**, using ADL's serde-based serialization.
- Developers can **mix ADL-defined endpoints with custom hand-written endpoints**, and can
  choose a higher-level framework (axum, poem, etc.) to host them.

## What protoapp does today (verified by reading the source)

Files read: `adl/common/http.adl` and `rust/server/src/server/poem_adl_interop.rs`.
**Not yet read:** `rust/server/src/server/routing.rs` and the generated
`rust/server/src/adl/gen/protoapp/apis/ui.rs`. Read these before making changes.

- **Endpoint type** (`common/http.adl`): `struct HttpReq<I,O>` with:
  - `method: HttpMethod`, a union of `get` and `post`, defaulting to `post`
  - `security: HttpSecurity`, a union of `public`, `token`, and `tokenWithRole: String`
  - `reqType: TypeToken<I>` and `respType: TypeToken<O>`, both defaulting to null

  An API is an ADL struct whose fields are `HttpReq<I,O>` values, with method and
  security given as field defaults. The path is not among them: it is derived from the
  field name by each backend, as described under "Path from the field name" below. The
  TypeScript client and the API workbench also consume `security`.
- **Server framework:** poem, with sqlx and postgres.
- **`poem_adl_interop.rs`:**
  - `DynRouteExt::adl_dyn_req(path, req: &HttpReq<I,O>, handler)` mounts the endpoint at
    `path` as a poem `Endpoint` (`AdlDynReq`).
  - Input decoding: POST reads a JSON body. GET reads the query param
    `input=<urlencoded JSON>`; with no query string it deserializes from JSON `null`, which
    is used for Void inputs.
  - The output is always encoded as `Json(o)`.
  - `AdlReqContext<S> { state: S, claims: Option<jwt::AccessClaims> }`.
  - State and `DynJwtSecurityCheck` are fetched with `req.data::<T>().expect(...)`, so a
    missing setup call is a runtime panic.
  - The security check (`AccessTokenChecker::check_security`) runs in one place for all
    endpoints.
  - `HandlerError` is `Anyhow(anyhow::Error)` or `Poem(poem::Error)`. `From<HandlerError>
    for poem::Error` maps `Anyhow(_)` to a bare 500 and discards the error.

## Identified improvements (rough priority)

1. **Compile-time handler completeness.** Generate a per-API handler trait and a
   `register` function, so that adding an endpoint in ADL fails compilation until it is
   implemented. This needs confirming against `routing.rs`, which presumably registers
   endpoints by hand with `adl_req`.
2. **Typed state and JWT checker.** Hold `Arc<S>` and `Arc<dyn JwtSecurityCheck>` in the
   router instead of `req.data().expect()`.
3. **Fix the security-check order. DONE** (commit `15e0fc0`). Any `Authorization` header
   was decoded with `?` before the endpoint policy was consulted, so an expired or
   malformed token gave a 401 even on `public` endpoints such as login or refresh, making
   the `HttpSecurity::Public` arm dead code whenever a header was present. A bad token is
   now only fatal where a token is required; on a public endpoint it is anonymous. A valid
   token on a public endpoint still reaches the handler as claims.

   Two notes on the defect, since they bear on how urgently the rest of this list matters.
   It was fail-closed — a bad token never yielded claims, so there was no bypass, only
   over-rejection. And it was latent in-repo: `ServiceBase` routes the four public
   endpoints through `mkReqFn`, which sends no `Authorization` header
   (`ts/ui/src/service/service-base.ts`, `ts/ui/src/service/index.ts`). It would bite a
   client attaching its token uniformly — mobile, `curl`, a proxy — or a refactor that
   unified the two TS factories.

   Done at the same time, beyond the original item: the two rejection statuses were both
   403, and are now split — absent or unusable credentials give 401, valid credentials
   with the wrong role give 403. This preserves `ts/ui`'s logout-on-401 path, which today
   relies on the very `?` that was removed. The jwt decode-failure log also moved from
   `error!` to `debug!`, as an anonymous request carrying a stale token is now routine.

   Covered by `server_security_policy` in `rust/server/src/server/tests/mod.rs`, which
   pins eight of the nine policy/credential combinations.
4. **Log internal errors** before converting `HandlerError::Anyhow` to a 500.
5. **Remove framework types from handler signatures.** Replace `HandlerError::Poem` with
   an owned enum: `Unauthorized`, `Forbidden`, `BadRequest(String)`,
   `Internal(anyhow::Error)`.
6. **Make the runtime a `tower::Service`** so it can be mounted in axum, poem or bare
   hyper (see below). This enables testing with `ServiceExt::oneshot`, with no socket.
7. Smaller items:
   - Set an explicit request body size limit.
   - Move from `fn` pointer handlers to trait methods. This follows from item 1.
   - Derive the path from the field name. **DONE** (see below).

Items 1–5 can be done while staying on poem. Item 6 is the larger change.

## Target architecture

### Layers

- **hyper 1.x** handles HTTP/1 and HTTP/2. It has its own `hyper::service::Service`
  trait, with `call(&self)` and no `poll_ready`, so it doesn't depend on tower.
- **tower** is a protocol-agnostic `Service` plus `Layer` abstraction. **tower-http**
  provides the HTTP middleware (tracing, compression, CORS, limits).
- The shared vocabulary is the `http` and `http-body` 1.x crates.
- `hyper_util::service::TowerToHyperService` adapts a tower service for hyper. It clones
  the service per request, so services should be cheap to clone (`Arc` inside).
- axum is a router built on tower and served by hyper. poem has its own `Endpoint` and
  `Middleware` traits, plus a `tower-compat` feature (`TowerCompatExt::compat()` and
  `TowerLayerCompatExt`). actix-web is not tower-based and would need a custom shim.

### Runtime crate design rules

- The public interface is `tower::Service<http::Request<B>>`, **generic over the request
  body `B`**. Don't expose `hyper::body::Incoming`.
  - `S`: the app state and handler-implementing type, held as `Arc<S>`. Bounds:
    `Send + Sync + 'static`.
  - `B`: the host's body type (hyper `Incoming`, axum `Body`, poem `BoxBody`, or a test
    body). Bounds: `http_body::Body + Send + 'static`, `B::Data: Send`,
    `B::Error: Into<BoxError>`.
  - The service must be `Clone`, use `Error = Infallible` and `Response =
    http::Response<Full<Bytes>>`. It should also be `Sync`, because poem's compat
    adapter requires it.
  - `poll_ready` is always ready. Put backpressure in tower layers such as
    `ConcurrencyLimitLayer`.
- The serve loop is an **optional helper** built on hyper-util's
  `server::conn::auto::Builder`. It is not required.
- Handlers receive a request context exposing headers and extensions (for example
  `http::request::Parts`), so tower or host middleware can share auth data with ADL
  handlers.
- Routing works by type erasure. `Router::post`/`req` takes the typed endpoint and the
  handler, and stores `Arc<dyn Fn(Arc<S>, Ctx, Bytes) -> BoxFut>` in a `HashMap` keyed by
  path, together with `security` and `method`. It asserts on duplicate routes.
- Error split:
  - Transport and runtime failures (bad JSON, auth, not found, too large, internal) are
    HTTP status codes.
  - Domain errors are ADL types inside `O`, returned with a 200 status.

### Macro: `#[derive(AdlApi)]` on the generated API struct

The ADL compiler stays a pure type generator. It emits the API struct with serde derives
plus `#[derive(AdlApi)]`. The derive proc macro (`syn` and `quote`) does the following:

- Matches field types **syntactically** on the literal `HttpReq<I, O>`. Aliases are not
  recognised, so this form must be documented. Non-matching fields should produce a
  `syn::Error`.
- Emits a `<Api>Handlers` trait with one method per field:
  `fn name(&self, ctx, req: I) -> impl Future<Output = Result<O, RpcError>> + Send`.
- Emits `impl <Api> { pub fn register<S: <Api>Handlers>(&self, r: &mut Router<S>) }`.
  `register` takes `&self` because `method` and `security` are runtime ADL data on each
  `HttpReq` value.
- Uses span-preserving errors that point at fields.
- Macros only see tokens. Field default values (method, security) are not visible at
  expansion time, so they must come from the struct value at runtime, or from emitted
  attributes.

### Path from the field name. DONE

`path` has been removed from `common.http.HttpReq`. An endpoint's path is now `"/"`
followed by its **ADL field name**, derived independently but identically by each
backend:

- `#[derive(HttpApi)]` reads `#[serde(rename = "...")]` where the Rust backend had to
  rename the field, and the identifier otherwise — never the identifier alone, which is
  snake-cased and keyword-escaped. It emits each path as a `PATH_<FIELD>` associated
  constant and passes it to `Mount::mount`, which gained a `path` parameter.
- The TypeScript backend uses the ADL field name verbatim as the property name, so
  `ServiceBase` and the workbench both derive from it directly (`endpointPath`).
  `mkReqFn`/`mkAuthReqFn` now take the api struct and a field name rather than an
  `HttpReq` value, because a value detached from its field cannot know its own path.

`api::tests::paths_come_from_adl_field_names` pins the rule on the Rust side; the six
server tests exercise it over real HTTP.

Consequences, accepted deliberately:

- **Paths moved.** `/whoami` is now `/who_am_i`, `/users/create` is `/create_user`, and
  the health check is at `/healthy` rather than `/`. This was acceptable because protoapp
  has no deployed external clients.
- **Renaming an ADL field is now a wire-breaking change.** On the Rust side a rename at
  least breaks the build wherever a `PATH_` constant is named; TypeScript just follows the
  new name silently.
- **No override exists yet.** The intended one is an ADL annotation,
  `newtype HttpPath = String;`, applied as `@HttpPath "/"` to a field. TypeScript can
  honour it today — field annotations reach the TS AST — but Rust cannot: the Rust backend
  reads field annotations only for `RustStorageModel` and emits no AST, so the annotation
  never reaches the derive. Honouring it on one side only would 404, so neither side does.

#### Getting the override: the adlc change

A meta annotation on the annotation declaration tells the Rust backend to carry it
through. This is reachable because `Annotations t = Map ScopedName (t, JSON.Value)`
(`lib0/lib/ADL/Compiler/AST.hs:19`) and `resolveAnnotations` stores
`RT_Named (sn, decl)` (`Processing.hs:495-500`), so every use site can reach the
annotation's own declaration. Nothing reads that component today.

1. `adl/stdlib/adlc/config/rust.adl` — `type RustEmitAnnotation = Void;` (presence-only)
2. regenerate `ADL/Adlc/Config/Rust.hs` via `adlc-bootstrap`
3. `Rust/Internal.hs` — `snRustEmitAnnotation` plus a predicate over the resolved
   annotation that checks the declaring decl
4. `Rust.hs` — emit a per-struct inherent `field_annotations()` returning
   `&'static [(field, annotation, json)]`, beside the two existing hardcoded field
   attribute sites at `:164` and `:303`
5. `adl/common/http.adl-rs` — `annotation HttpPath RustEmitAnnotation;`, keeping the
   Rust-specific opt-in out of the backend-neutral module
6. goldens

An inherent function rather than a `#[adl_annotation(...)]` attribute, because an
attribute is only legal where a derive registers it as a helper, which couples adlc's
output to a derive being present; a function is always legal Rust and readable by
anything. The derive then prefers the override over the field name, and the `PATH_`
constants start carrying it with no change at the call sites.

### Mixing example (axum host)

```rust
let mut adl = adl_runtime::Router::new(state.clone(), jwt_checker);
ui_api.register(&mut adl);

let app = axum::Router::new()
    .route("/healthz", get(health))            // custom endpoint
    .nest_service("/api", adl.into_service())  // ADL endpoints
    .layer(TraceLayer::new_for_http());
```

## Unverified points to test

- Whether a service with `Error = Infallible` satisfies poem's `TowerCompatExt` bound
  (`Err: Into<poem::Error>`).
- Whether request extensions set by poem middleware survive poem's tower-compat
  conversion.
- Versions as of Oct 2026: hyper 1.11.x, axum 0.8.9 (0.9 in progress on main, with
  breaking changes), poem 3.1.x, tower 0.x. Recheck before pinning.

## Suggested first step

Read `routing.rs` and the generated `ui.rs`. Then write a new interop module implementing
improvements 1–5 against the real `HttpReq` and `HttpSecurity` types, with the
`tower::Service` boundary in place, including GET query-string decoding that matches
current behaviour. Port one API to it and keep the existing poem path working for
comparison.
