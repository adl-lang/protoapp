//! Host-agnostic plumbing for mounting ADL-defined HTTP endpoints.
//!
//! `#[derive(HttpApi)]` emits a `register` function that drives [`Mount`], so
//! this is the only thing the generated code needs to know about the host. It
//! deliberately names no web framework: poem, axum or a test harness each
//! provide their own [`Mount`] implementation.

use std::future::Future;
use std::pin::Pin;

use serde::de::DeserializeOwned;
use serde::Serialize;

// Re-exported so that generated code can name them through the one runtime
// path it is given, rather than having to know where adlc put the module.
pub use crate::gen::common::http::{HttpMethod, HttpSecurity};

/// A boxed future, as returned by an erased handler.
pub type BoxFuture<T> = Pin<Box<dyn Future<Output = T> + Send + 'static>>;

/// An erased handler for a `public` endpoint: takes the request context and
/// the decoded request body, and resolves to the response or an error.
pub type Handler<Ctx, I, O, E> =
    Box<dyn Fn(Ctx, I) -> BoxFuture<Result<O, E>> + Send + Sync + 'static>;

/// An erased handler for an endpoint whose policy requires a credential.
///
/// Takes the caller's identity in addition, which the host has authenticated
/// against the endpoint's policy before calling. There is no `Option`: a
/// handler of this shape cannot be reached without one.
pub type SecuredHandler<Ctx, Id, I, O, E> =
    Box<dyn Fn(Ctx, Id, I) -> BoxFuture<Result<O, E>> + Send + Sync + 'static>;

/// A host that ADL endpoints can be mounted into.
///
/// Consuming and returning `Self` mirrors how routers are usually built
/// (poem's `Route::at`, axum's `Router::route`), so an implementation needs no
/// interior mutability or `Option` juggling.
pub trait Mount<Ctx>: Sized {
    /// Error the host maps to an HTTP response.
    type Error;

    /// The caller's identity, as this host authenticates it. A verified JWT's
    /// claims, a session record, whatever the host deals in.
    ///
    /// `Send + 'static` because it is handed to a handler across an await, in
    /// a future the host may move between threads.
    type Identity: Send + 'static;

    /// Mount a `public` endpoint at `path`, with `method` as the ADL declares
    /// it.
    ///
    /// Both come from the declaration rather than from a value: the path from
    /// the endpoint's ADL field name or its `@HttpPath`, the method from
    /// `@HttpMethod`. Only the generated code has them, which is why they are
    /// passed rather than read off an `HttpReq`.
    ///
    /// The handler takes no identity, and this signature gives the host no
    /// way to supply one. A credential on a public request is ignored, which
    /// is what lets a client holding a stale token still reach login.
    fn mount_public<I, O>(
        self,
        path: &str,
        method: HttpMethod,
        handler: Handler<Ctx, I, O, Self::Error>,
    ) -> Self
    where
        I: DeserializeOwned + Send + Sync + 'static,
        O: Serialize + Send + Sync + 'static;

    /// Mount an endpoint whose `security` requires a credential.
    ///
    /// The implementation must authenticate the request against `security`
    /// and reject it if it does not pass, because the only way to call
    /// `handler` is to produce a [`Mount::Identity`]. Enforcement therefore
    /// cannot be left to the handler, nor forgotten by it: a handler that
    /// ignores its identity argument is merely not interested in who called,
    /// never unguarded.
    fn mount_secured<I, O>(
        self,
        path: &str,
        method: HttpMethod,
        security: &HttpSecurity,
        handler: SecuredHandler<Ctx, Self::Identity, I, O, Self::Error>,
    ) -> Self
    where
        I: DeserializeOwned + Send + Sync + 'static,
        O: Serialize + Send + Sync + 'static;
}

/// An ADL API that can mount itself into a host.
///
/// Implemented by `#[derive(HttpApi)]` for each API struct, so the trait and
/// the derive share a name, as `serde::Serialize` does. `H` is the API's
/// generated handler trait, which cannot be an associated type because it is a
/// trait, so it stays a free parameter constrained by the generated impl.
///
/// This is what lets a host write one mounting helper for every API, rather
/// than one per API struct.
pub trait HttpApi<Ctx, M, H>
where
    M: Mount<Ctx>,
{
    /// Mount every endpoint of this API into `mount`, under `prefix`.
    ///
    /// `prefix` is prepended to each endpoint's own path. An API nested in
    /// another is registered with the parent's prefix and the field name it is
    /// nested under, so an `AdminApi` at field `admin` mounts its `create_user`
    /// at `/admin/create_user`.
    fn register_at(&self, prefix: &str, mount: M, handlers: std::sync::Arc<H>) -> M;

    /// Mount every endpoint of this API into `mount`, at its own paths.
    ///
    /// The entry point for a top level API; [`HttpApi::register_at`] is what
    /// nesting uses.
    fn register(&self, mount: M, handlers: std::sync::Arc<H>) -> M {
        self.register_at("", mount, handlers)
    }
}

#[cfg(test)]
mod tests {
    use crate::gen::protoapp::apis::ui::{AdminApi, Api, WebApi};

    /// Pins the rule that `#[derive(HttpApi)]` builds a path from the ADL
    /// field name. Every backend has to derive paths identically, so a change
    /// here is a change to the wire protocol and should fail loudly.
    #[test]
    fn paths_come_from_adl_field_names() {
        assert_eq!(Api::PATH_NEW_MESSAGE, "/new_message");
        assert_eq!(Api::PATH_WHO_AM_I, "/who_am_i");
        assert_eq!(WebApi::PATH_LOGIN, "/login");
        assert_eq!(WebApi::PATH_REFRESH, "/refresh");
        assert_eq!(WebApi::PATH_LOGOUT, "/logout");
    }

    /// And that an `@HttpPath` annotation in the ADL overrides it. The
    /// annotation reaches the derive as an `#[adl_annotation(..)]` attribute
    /// on the generated field, so this covers the whole chain from the ADL
    /// through adlc to the expansion.
    #[test]
    fn http_path_annotation_overrides_the_field_name() {
        assert_eq!(Api::PATH_HEALTHY, "/");
    }

    /// The `@HttpMethod` and `@HttpSecurity` annotations reach the derive the
    /// same way `@HttpPath` does, and become a constant and a function on the
    /// API struct. Pinned here because every backend reads these two from the
    /// ADL, so a change is a change to the wire protocol.
    #[test]
    fn method_and_security_come_from_annotations() {
        use crate::gen::common::http::{HttpMethod, HttpSecurity};

        assert_eq!(Api::METHOD_NEW_MESSAGE, HttpMethod::Post);
        assert_eq!(Api::METHOD_WHO_AM_I, HttpMethod::Get);
        // `new_message` and `who_am_i` take their policy from the `Api`
        // struct's own annotation; `healthy` overrides it at the field. That
        // the two resolve differently is the whole point of allowing a
        // default, so pin both.
        assert_eq!(Api::security_new_message(), HttpSecurity::Token);
        assert_eq!(Api::security_who_am_i(), HttpSecurity::Token);
        assert_eq!(Api::security_healthy(), HttpSecurity::Public);

        // Every `AdminApi` endpoint inherits the role, which the ADL names
        // once on the struct.
        let admin = HttpSecurity::TokenWithRole("admin".to_owned());
        assert_eq!(AdminApi::security_create_user(), admin);
        assert_eq!(AdminApi::security_update_user(), admin);
        assert_eq!(AdminApi::security_query_users(), admin);

        assert_eq!(WebApi::security_login(), HttpSecurity::Public);
    }

    /// A nested API's paths are relative to where it is mounted, and the
    /// enclosing API contributes the prefix. Both halves are constants, so
    /// hand written wiring composes them the same way the generated
    /// registration does.
    #[test]
    fn nested_api_paths_are_relative_to_their_mount_point() {
        assert_eq!(Api::PATH_ADMIN, "/admin");
        assert_eq!(AdminApi::PATH_CREATE_USER, "/create_user");
        assert_eq!(
            format!("{}{}", Api::PATH_ADMIN, AdminApi::PATH_CREATE_USER),
            "/admin/create_user"
        );
    }
}
