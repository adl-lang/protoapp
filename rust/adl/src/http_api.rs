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

use crate::gen::common::http::HttpReq;

/// A boxed future, as returned by an erased handler.
pub type BoxFuture<T> = Pin<Box<dyn Future<Output = T> + Send + 'static>>;

/// An erased endpoint handler: takes the request context and the decoded
/// request body, and resolves to the response or an error.
pub type Handler<Ctx, I, O, E> =
    Box<dyn Fn(Ctx, I) -> BoxFuture<Result<O, E>> + Send + Sync + 'static>;

/// A host that ADL endpoints can be mounted into.
///
/// Consuming and returning `Self` mirrors how routers are usually built
/// (poem's `Route::at`, axum's `Router::route`), so an implementation needs no
/// interior mutability or `Option` juggling.
pub trait Mount<Ctx>: Sized {
    /// Error the host maps to an HTTP response.
    type Error;

    /// Mount one endpoint at `path`. `req` carries the method and security
    /// policy; `handler` is the implementation, already erased to its wire
    /// types.
    ///
    /// The path is passed separately because it is not part of `HttpReq`: it
    /// is derived from the endpoint's ADL field name, which only the generated
    /// code knows.
    fn mount<I, O>(
        self,
        path: &str,
        req: &HttpReq<I, O>,
        handler: Handler<Ctx, I, O, Self::Error>,
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
    /// Mount every endpoint of this API into `mount`.
    fn register(&self, mount: M, handlers: std::sync::Arc<H>) -> M;
}

#[cfg(test)]
mod tests {
    use crate::gen::protoapp::apis::ui::{ApiRequests, WebRequests};

    /// Pins the rule that `#[derive(HttpApi)]` builds a path from the ADL
    /// field name. Every backend has to derive paths identically, so a change
    /// here is a change to the wire protocol and should fail loudly.
    #[test]
    fn paths_come_from_adl_field_names() {
        assert_eq!(ApiRequests::PATH_NEW_MESSAGE, "/new_message");
        assert_eq!(ApiRequests::PATH_WHO_AM_I, "/who_am_i");
        assert_eq!(ApiRequests::PATH_QUERY_USERS, "/query_users");
        assert_eq!(WebRequests::PATH_LOGIN, "/login");
        assert_eq!(WebRequests::PATH_REFRESH, "/refresh");
        assert_eq!(WebRequests::PATH_LOGOUT, "/logout");
    }

    /// And that an `@HttpPath` annotation in the ADL overrides it. The
    /// annotation reaches the derive as an `#[adl_annotation(..)]` attribute
    /// on the generated field, so this covers the whole chain from the ADL
    /// through adlc to the expansion.
    #[test]
    fn http_path_annotation_overrides_the_field_name() {
        assert_eq!(ApiRequests::PATH_HEALTHY, "/");
    }
}
