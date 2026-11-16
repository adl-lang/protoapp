//! Host-agnostic plumbing for serving and calling ADL-defined HTTP endpoints.
//!
//! `#[derive(HttpApi)]` emits a `register` function that drives [`Mount`] and
//! a client that drives [`Invoke`], so these are the only things the
//! generated code needs to know about its host. Neither names a web
//! framework or an http client: poem, axum or a test harness each provide
//! their own [`Mount`], and a reqwest wrapper or an in-process stub its own
//! [`Invoke`].

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

/// A transport that ADL endpoints can be invoked through.
///
/// The client side counterpart of [`Mount`]. `#[derive(HttpApi)]` emits an
/// `<Api>Client` that drives this, so it is the only thing the generated
/// client needs to know about how a request is sent. It names no http
/// library, and it carries no base url: a transport already knows where it
/// points, which is what leaves `<Api>Client::new(transport)` the whole
/// constructor.
pub trait Invoke: Send + Sync {
    /// Error returned by every call: a transport failure, or a response the
    /// server refused.
    type Error;

    /// The credential proving who is calling, as this transport presents it:
    /// an encoded JWT, an api key, a signing key.
    ///
    /// Note how this differs from [`Mount::Identity`], which is what the
    /// server has *authenticated*. The two occupy the same place in an
    /// endpoint's signature but point in opposite directions, which is why
    /// the client and the server do not share one trait.
    ///
    /// `?Sized` so that a transport whose credential is a string can name it
    /// `str` and have call sites pass `&jwt` rather than cloning one per
    /// call.
    type Identity: ?Sized + Send + Sync;

    /// Invoke a `public` endpoint at `path`, with `method` as the ADL
    /// declares it.
    ///
    /// Both come from the declaration rather than from a value, exactly as in
    /// [`Mount::mount_public`]: only the generated code has them.
    ///
    /// Takes no identity, and this signature offers the caller no way to
    /// supply one. A public endpoint ignores a credential, so a client that
    /// appeared to send one would be describing something the server does not
    /// do.
    fn invoke_public<I, O>(
        &self,
        path: &str,
        method: HttpMethod,
        req: &I,
    ) -> impl Future<Output = Result<O, Self::Error>> + Send
    where
        I: Serialize + Send + Sync,
        O: DeserializeOwned + Send;

    /// Invoke an endpoint whose policy requires a credential.
    ///
    /// The policy itself is not passed, unlike [`Mount::mount_secured`].
    /// `token` and `tokenWithRole` are presented identically — the role is
    /// the server's to check — so the public/secured split already tells a
    /// transport everything it does differently, and an `HttpSecurity` would
    /// allocate a `String` on every call to say nothing. The server mounts
    /// once at startup and so can afford the policy; a client cannot, and has
    /// no use for it.
    fn invoke_secured<I, O>(
        &self,
        path: &str,
        method: HttpMethod,
        identity: &Self::Identity,
        req: &I,
    ) -> impl Future<Output = Result<O, Self::Error>> + Send
    where
        I: Serialize + Send + Sync,
        O: DeserializeOwned + Send;
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
    use super::HttpMethod;
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

    /// What the generated client puts on the wire, without a server.
    ///
    /// Records each call instead of sending it, then fails, so that one test
    /// covers every endpoint shape: there is nothing to decode and no
    /// transport to stand up.
    #[derive(Default)]
    struct Recorder(std::sync::Mutex<Vec<String>>);

    impl super::Invoke for Recorder {
        type Error = ();

        /// A bearer token, unsized so that a call site can pass `&jwt`.
        type Identity = str;

        async fn invoke_public<I, O>(
            &self,
            path: &str,
            method: HttpMethod,
            _req: &I,
        ) -> Result<O, ()>
        where
            I: serde::Serialize + Send + Sync,
            O: serde::de::DeserializeOwned + Send,
        {
            self.0
                .lock()
                .unwrap()
                .push(format!("{method:?} {path} public"));
            Err(())
        }

        async fn invoke_secured<I, O>(
            &self,
            path: &str,
            method: HttpMethod,
            identity: &str,
            _req: &I,
        ) -> Result<O, ()>
        where
            I: serde::Serialize + Send + Sync,
            O: serde::de::DeserializeOwned + Send,
        {
            self.0
                .lock()
                .unwrap()
                .push(format!("{method:?} {path} as {identity}"));
            Err(())
        }
    }

    /// The generated client addresses the same endpoints the registration
    /// mounts, which is the whole reason for generating it rather than
    /// writing it.
    ///
    /// Pinned together in one assertion because the interesting part is that
    /// every value comes from the ADL: the `@HttpPath` override on `healthy`,
    /// the method and policy inherited from the `Api` struct, the `post` that
    /// `new_message` overrides, and the prefix composed for the nested
    /// `AdminApi`.
    #[tokio::test]
    async fn the_generated_client_calls_the_declared_endpoints() {
        use crate::gen::protoapp::apis::ui::{
            ApiClient, NewMessageReq, PageReq, QueryUsersReq, RecentMessagesReq,
        };

        let recorder = std::sync::Arc::new(Recorder::default());
        let client = ApiClient::at(recorder.clone(), String::new());

        // A public endpoint takes no credential: there is no argument for
        // one, because the server would ignore it.
        let _ = client.healthy(&()).await;
        let _ = client.who_am_i(&jwt(), &()).await;
        let _ = client
            .new_message(
                &jwt(),
                &NewMessageReq {
                    message: "hello".to_owned(),
                },
            )
            .await;
        let _ = client
            .recent_messages(
                &jwt(),
                &RecentMessagesReq {
                    page: PageReq::new(),
                },
            )
            .await;
        // The nested client is handed the composed prefix, so the caller
        // never names the mount point.
        let _ = client
            .admin()
            .query_users(
                &jwt(),
                &QueryUsersReq {
                    page: PageReq::new(),
                },
            )
            .await;

        assert_eq!(
            *recorder.0.lock().unwrap(),
            vec![
                "Get / public",
                "Get /who_am_i as jwt",
                "Post /new_message as jwt",
                "Get /recent_messages as jwt",
                "Get /admin/query_users as jwt",
            ]
        );
    }

    fn jwt() -> String {
        "jwt".to_owned()
    }
}
