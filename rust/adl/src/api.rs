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

    /// Mount one endpoint. `req` carries the method, path and security policy;
    /// `handler` is the implementation, already erased to its wire types.
    fn mount<I, O>(self, req: &HttpReq<I, O>, handler: Handler<Ctx, I, O, Self::Error>) -> Self
    where
        I: DeserializeOwned + Send + Sync + 'static,
        O: Serialize + Send + Sync + 'static;
}

/// An ADL API that can mount itself into a host.
///
/// Implemented by `#[derive(HttpApi)]` for each API struct. `H` is the API's
/// generated handler trait, which cannot be an associated type because it is a
/// trait, so it stays a free parameter constrained by the generated impl.
///
/// This is what lets a host write one mounting helper for every API, rather
/// than one per API struct.
pub trait Api<Ctx, M, H>
where
    M: Mount<Ctx>,
{
    /// Mount every endpoint of this API into `mount`.
    fn register(&self, mount: M, handlers: std::sync::Arc<H>) -> M;
}
