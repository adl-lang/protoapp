//! `#[derive(HttpApi)]` for ADL-generated HTTP API structs.
//!
//! An ADL API is a struct whose fields are `HttpReq<I, O>` values, with the
//! method and security given as field defaults:
//!
//! ```ignore
//! #[derive(HttpApi)]
//! #[http_api(runtime = "crate::http_api")]
//! pub struct Api {
//!     pub healthy: HttpReq<(), ()>,
//!     pub who_am_i: HttpReq<(), UserWithId>,
//! }
//! ```
//!
//! From that this derive emits a handler trait with one method per endpoint,
//! so that adding an endpoint to the ADL fails compilation until it is
//! implemented, plus a `register` that mounts every endpoint into a host.
//!
//! # Method and security
//!
//! Both come from annotations, read here at expansion time. Either may sit on
//! the api struct instead of the field, where it sets the default for that
//! struct's own endpoints:
//!
//! ```ignore
//! #[adl_annotation(name="common.http.HttpSecurity", value="{\"tokenWithRole\":\"admin\"}")]
//! pub struct AdminApi {
//!     pub create_user: HttpReq<UserDetails, AppUserId>,   // inherits the role
//! }
//! ```
//!
//! A struct default does not reach a nested api: that is a separate
//! declaration, and one that may be nested at more than one field, so its
//! policy belongs to its own declaration rather than to a mount point. The
//! annotation on a nested field is an error for the same reason.
//!
//! The method falls back to post. The security policy does not fall back at
//! all: an endpoint that resolves to no policy fails to compile, because one
//! that quietly became public would be open with nothing in the ADL saying
//! so. Each resolved value is emitted as `METHOD_<FIELD>` and
//! `security_<field>`, the latter a function because `tokenWithRole` carries
//! a `String`.
//!
//! # Nested APIs
//!
//! A field whose type is not an `HttpReq` is taken to be another API struct,
//! nested under this one:
//!
//! ```ignore
//! pub struct Api {
//!     pub who_am_i: HttpReq<(), UserWithId>,
//!     pub admin: AdminApi,
//!     pub admin_dry_run: AdminApi,
//! }
//! ```
//!
//! The nested struct needs its own `#[derive(HttpApi)]`, which gives it its
//! own handler trait; this derive can only require that trait, not generate
//! it. The requirement lands on the enclosing handler trait, which gains an
//! associated type and an accessor per nested field:
//!
//! ```ignore
//! pub trait ApiHandlers<Ctx>: Send + Sync + 'static {
//!     type Error;
//!
//!     type Admin: AdminApiHandlers<Ctx, Error = Self::Error>;
//!     fn admin(&self) -> Arc<Self::Admin>;
//!
//!     type AdminDryRun: AdminApiHandlers<Ctx, Error = Self::Error>;
//!     fn admin_dry_run(&self) -> Arc<Self::AdminDryRun>;
//!
//!     // and one method per HttpReq field
//! }
//! ```
//!
//! A mount point is identified by the field, not by the type, so the two
//! `AdminApi` fields above get an associated type each and can be served by
//! different handler types — a dry run implementation holding no database
//! pool, say. Leaving either out is a compile error, so no nested endpoint
//! can go unimplemented, and none can silently inherit another's handlers.
//!
//! # Paths
//!
//! An endpoint's path is not carried by `HttpReq`; it is derived as `"/"`
//! followed by the field's **ADL** name. That is the `#[serde(rename = "...")]`
//! value where the Rust backend had to rename the field, and the Rust
//! identifier otherwise — never the identifier alone, which is snake cased and
//! keyword escaped and so would disagree with the other backends.
//!
//! A field annotated `@HttpPath` in the ADL overrides that. adlc carries the
//! annotation through as an `#[adl_annotation(...)]` attribute, which this
//! derive reads at expansion time:
//!
//! ```ignore
//! #[adl_annotation(name="common.http.HttpPath", value="\"/\"")]
//! pub healthy: HttpReq<(), ()>,
//! ```
//!
//! Paths compose through nesting: a nested API's endpoints are mounted under
//! the path of the field it is nested at, so `AdminApi::create_user` at field
//! `admin` is served from `/admin/create_user`.
//!
//! Each path is also emitted as a `PATH_<FIELD>` associated constant —
//! including one per nested field, holding that API's prefix — so that hand
//! written wiring and tests refer to an endpoint symbolically rather than
//! repeating a literal that nothing would check. **These constants are
//! relative to where their API is mounted.** For a top level API that is the
//! whole path; for a nested one, the caller composes, as
//! `Api::PATH_ADMIN` followed by `AdminApi::PATH_CREATE_USER`.

use proc_macro::TokenStream;
use proc_macro2::Span;
use quote::{format_ident, quote};
use syn::{
    parse_macro_input, spanned::Spanned, Data, DeriveInput, Fields, GenericArgument, Ident,
    PathArguments, Type,
};

/// One endpoint recovered from a field of the API struct.
struct Endpoint {
    /// Field identifier, which becomes the trait method name.
    name: Ident,
    /// The endpoint's HTTP path: the `@HttpPath` annotation if the field
    /// carries one, and otherwise `"/"` and the ADL field name.
    path: String,
    /// Identifier of the `PATH_<FIELD>` constant holding [`Endpoint::path`].
    path_const: Ident,
    /// The endpoint's http method, from its `@HttpMethod` annotation.
    method: Method,
    /// Identifier of the `METHOD_<FIELD>` constant holding [`Endpoint::method`].
    method_const: Ident,
    /// The endpoint's security policy, from its `@HttpSecurity` annotation.
    security: Security,
    /// Identifier of the `security_<field>` function returning
    /// [`Endpoint::security`]. A function rather than a constant because
    /// `tokenWithRole` carries a `String`, which no constant can hold.
    security_fn: Ident,
    /// Request type: the `I` of `HttpReq<I, O>`.
    req: Type,
    /// Response type: the `O` of `HttpReq<I, O>`.
    resp: Type,
    /// Doc comments on the field, carried onto the trait method.
    docs: Vec<syn::Attribute>,
}

/// An endpoint's http method. Post when `@HttpMethod` is absent, which is the
/// default the ADL documents.
#[derive(Clone)]
enum Method {
    Get,
    Post,
}

/// An endpoint's security policy, from its `@HttpSecurity` annotation. There
/// is no default; see [`http_security`].
///
/// A local copy of the ADL union rather than the generated type, because the
/// generated code lives in the crate that depends on this one.
#[derive(Clone)]
enum Security {
    Public,
    Token,
    TokenWithRole(String),
}

/// An API nested under a field of this one.
struct Nested {
    /// Field identifier. Reaches the nested API's value on the API struct,
    /// and names the accessor on the handler trait that yields the handlers
    /// for this mount point.
    name: Ident,
    /// Identifier of the handler trait's associated type for this mount
    /// point: [`Nested::name`] in pascal case. Per mount point rather than
    /// per type, so two fields of the same API type can be served by
    /// different handler types.
    assoc: Ident,
    /// The path segment this API's endpoints are mounted under, relative to
    /// the enclosing API.
    path: String,
    /// Identifier of the `PATH_<FIELD>` constant holding [`Nested::path`].
    path_const: Ident,
    /// The nested API's generated handler trait, which bounds the handler
    /// type this mount point is served by.
    handlers: syn::Path,
}

#[proc_macro_derive(HttpApi, attributes(http_api))]
pub fn derive_http_api(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    match expand(input) {
        Ok(ts) => ts.into(),
        Err(e) => e.to_compile_error().into(),
    }
}

fn expand(input: DeriveInput) -> syn::Result<proc_macro2::TokenStream> {
    let api = &input.ident;
    let runtime = runtime_path(&input)?;

    if !input.generics.params.is_empty() {
        return Err(syn::Error::new(
            input.generics.span(),
            "HttpApi cannot be derived for a generic struct: an API must be monomorphic",
        ));
    }

    let (endpoints, nested) = collect_fields(&input)?;
    if endpoints.is_empty() && nested.is_empty() {
        return Err(syn::Error::new(
            input.span(),
            "HttpApi requires at least one `HttpReq<I, O>` field",
        ));
    }

    let trait_name = format_ident!("{}Handlers", api);

    // One trait method per endpoint. `Ctx` and `Error` are left to the
    // implementor so that the generated trait names no framework types.
    let methods = endpoints.iter().map(|e| {
        let Endpoint {
            name,
            req,
            resp,
            docs,
            ..
        } = e;
        quote! {
            #(#docs)*
            fn #name(
                &self,
                ctx: Ctx,
                req: #req,
            ) -> impl ::core::future::Future<Output = ::core::result::Result<#resp, Self::Error>> + ::core::marker::Send;
        }
    });

    // One associated type and one accessor per nested API. The accessor is
    // what lets two fields of the same API type be served by different
    // handler values: the mount point is identified by the field, not by the
    // type, so each gets its own associated type even where they coincide.
    let nested_items = nested.iter().map(|n| {
        let Nested {
            name,
            assoc,
            handlers,
            ..
        } = n;
        let assoc_doc = format!("Handler type serving the nested `{name}` API.");
        let fn_doc = format!(
            "The handlers for the nested `{name}` API.\n\n\
             Yielded by value so that the registration can move it into the \
             mounted routes, which outlive this call; holding the nested \
             handlers in an `Arc` field and cloning it is the expected \
             implementation."
        );
        quote! {
            #[doc = #assoc_doc]
            type #assoc: #handlers<Ctx, Error = Self::Error>;

            #[doc = #fn_doc]
            fn #name(&self) -> ::std::sync::Arc<Self::#assoc>;
        }
    });

    let doc = format!(
        "Handlers for every endpoint of [`{api}`].\n\n\
         Generated by `#[derive(HttpApi)]`. Adding an endpoint to the ADL adds a \
         method here, so an incomplete implementation is a compile error."
    );

    // One `mount` call per endpoint. The closure is what erases the typed
    // trait method down to what the host can store.
    let mounts = endpoints.iter().map(|e| {
        let name = &e.name;
        let path_const = &e.path_const;
        let method = method_expr(&e.method, &runtime);
        let security = security_expr(&e.security, &runtime);
        quote! {
            let mount = {
                let handlers = handlers.clone();
                mount.mount(
                    &::std::format!("{}{}", prefix, Self::#path_const),
                    #method,
                    &#security,
                    ::std::boxed::Box::new(move |ctx, req| {
                        let handlers = handlers.clone();
                        ::std::boxed::Box::pin(async move { handlers.#name(ctx, req).await })
                    }),
                )
            };
        }
    });

    // Each nested API registers itself, under this API's prefix extended by
    // the field it is nested at.
    let nested_mounts = nested.iter().map(|n| {
        let Nested {
            name,
            path_const,
            assoc,
            ..
        } = n;
        quote! {
            let mount = #runtime::HttpApi::<
                Ctx,
                M,
                <H as #trait_name<Ctx>>::#assoc,
            >::register_at(
                &self.#name,
                &::std::format!("{}{}", prefix, Self::#path_const),
                mount,
                <H as #trait_name<Ctx>>::#name(&*handlers),
            );
        }
    });

    // The paths as associated constants, so that hand written wiring and tests
    // can name an endpoint instead of repeating its path as a literal.
    let path_consts = endpoints.iter().map(|e| {
        let Endpoint {
            path,
            path_const,
            name,
            ..
        } = e;
        let doc =
            format!("HTTP path of the `{name}` endpoint, relative to where this API is mounted.");
        quote! {
            #[doc = #doc]
            pub const #path_const: &'static str = #path;
        }
    });

    // The method as a constant, and the policy as a function, so that hand
    // written wiring reads the declaration rather than restating it. The
    // policy cannot be a constant: `tokenWithRole` carries a `String`.
    let method_consts = endpoints.iter().map(|e| {
        let Endpoint {
            method,
            method_const,
            name,
            ..
        } = e;
        let method = method_expr(method, &runtime);
        let doc = format!("HTTP method of the `{name}` endpoint.");
        quote! {
            #[doc = #doc]
            pub const #method_const: #runtime::HttpMethod = #method;
        }
    });

    let security_fns = endpoints.iter().map(|e| {
        let Endpoint {
            security,
            security_fn,
            name,
            ..
        } = e;
        let security = security_expr(security, &runtime);
        let doc = format!("Security policy of the `{name}` endpoint.");
        quote! {
            #[doc = #doc]
            pub fn #security_fn() -> #runtime::HttpSecurity { #security }
        }
    });

    let nested_path_consts = nested.iter().map(|n| {
        let Nested {
            path,
            path_const,
            name,
            ..
        } = n;
        let doc = format!(
            "Path prefix of the nested `{name}` API, relative to where this API is mounted."
        );
        quote! {
            #[doc = #doc]
            pub const #path_const: &'static str = #path;
        }
    });

    let register_doc = format!(
        "Mount every endpoint of [`{api}`] into `mount`.\n\n\
         Generated by `#[derive(HttpApi)]`, so no endpoint can be left unwired. \
         Takes `&self` because the method and security of each endpoint are \
         runtime values on the struct, and consumes and returns the host so it \
         composes with the usual router builders."
    );

    Ok(quote! {
        impl #api {
            #(#path_consts)*
            #(#nested_path_consts)*
            #(#method_consts)*
            #(#security_fns)*
        }

        #[doc = #doc]
        pub trait #trait_name<Ctx>: ::core::marker::Send + ::core::marker::Sync + 'static {
            /// Error returned by every handler; mapped to a response by the host.
            type Error;

            #(#methods)*
            #(#nested_items)*
        }

        impl<Ctx, M, H> #runtime::HttpApi<Ctx, M, H> for #api
        where
            Ctx: ::core::marker::Send + 'static,
            M: #runtime::Mount<Ctx>,
            H: #trait_name<Ctx, Error = M::Error>,
        {
            #[doc = #register_doc]
            fn register_at(&self, prefix: &str, mount: M, handlers: ::std::sync::Arc<H>) -> M {
                #(#mounts)*
                #(#nested_mounts)*
                mount
            }
        }
    })
}

/// Read the host plumbing path from `#[http_api(runtime = "...")]`, defaulting
/// to `::adl::http_api`. The generated struct and the runtime live in different
/// crates in general, so this cannot be inferred.
fn runtime_path(input: &DeriveInput) -> syn::Result<syn::Path> {
    let mut found: Option<syn::Path> = None;
    for attr in input.attrs.iter().filter(|a| a.path().is_ident("http_api")) {
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("runtime") {
                let lit: syn::LitStr = meta.value()?.parse()?;
                found = Some(lit.parse()?);
                Ok(())
            } else {
                Err(meta.error("unrecognised http_api option; expected `runtime`"))
            }
        })?;
    }
    match found {
        Some(p) => Ok(p),
        None => syn::parse_str("::adl::http_api"),
    }
}

/// Split the struct's fields into endpoints and nested APIs, in declaration
/// order.
///
/// Matching is syntactic: a field whose type spells `HttpReq<_, _>` as its last
/// path segment is an endpoint. An alias for it is not recognised, which is why
/// the ADL Rust backend's un-aliased output is relied on here. Every other
/// field is taken to be another API struct, nested under this one.
fn collect_fields(input: &DeriveInput) -> syn::Result<(Vec<Endpoint>, Vec<Nested>)> {
    // Defaults for this struct's own endpoints, which a field annotation
    // overrides. They do not reach a nested API: that is a separate
    // declaration, and one that may be nested at more than one field, so its
    // policy has to belong to its own declaration rather than to wherever it
    // happens to be mounted.
    let api_method = http_method(&input.attrs)?;
    let api_security = http_security(&input.attrs)?;

    let data = match &input.data {
        Data::Struct(d) => d,
        _ => {
            return Err(syn::Error::new(
                input.span(),
                "HttpApi can only be derived for a struct",
            ))
        }
    };
    let fields = match &data.fields {
        Fields::Named(f) => &f.named,
        _ => {
            return Err(syn::Error::new(
                data.fields.span(),
                "HttpApi requires a struct with named fields",
            ))
        }
    };

    let mut endpoints = Vec::new();
    let mut nested = Vec::new();
    for field in fields {
        let name = field
            .ident
            .clone()
            .ok_or_else(|| syn::Error::new(field.span(), "endpoint field must be named"))?;

        let path_const = format_ident!("PATH_{}", unraw(&name).to_uppercase());
        let path = match http_path(field)? {
            Some(path) => path,
            None => format!("/{}", adl_field_name(field, &name)),
        };

        match http_req_args(&field.ty) {
            Some((req, resp)) => endpoints.push(Endpoint {
                method: http_method(&field.attrs)?
                    .or_else(|| api_method.clone())
                    .unwrap_or(Method::Post),
                method_const: format_ident!("METHOD_{}", unraw(&name).to_uppercase()),
                security: match http_security(&field.attrs)?.or_else(|| api_security.clone()) {
                    Some(security) => security,
                    None => {
                        return Err(syn::Error::new(
                            field.span(),
                            format!(
                                "endpoint `{name}` resolves to no {HTTP_SECURITY}: annotate \
                                 the field, or the api struct to set a default for all of \
                                 its endpoints. There is no language level default, \
                                 because an endpoint whose policy fell back to public \
                                 would be open with nothing in the ADL saying so"
                            ),
                        ))
                    }
                },
                security_fn: format_ident!("security_{}", unraw(&name)),
                path,
                path_const,
                name,
                req,
                resp,
                docs: field
                    .attrs
                    .iter()
                    .filter(|a| a.path().is_ident("doc"))
                    .cloned()
                    .collect(),
            }),
            None => {
                for forbidden in [HTTP_METHOD, HTTP_SECURITY] {
                    if let Some(annotation) = sole_annotation(&field.attrs, forbidden)? {
                        return Err(syn::Error::new(
                            annotation.span,
                            format!(
                                "{forbidden} on `{name}` would apply to a nested api at \
                                 one of its mount points. Annotate the nested struct, or \
                                 its endpoints, so that it means the same wherever it is \
                                 mounted"
                            ),
                        ));
                    }
                }
                let assoc = Ident::new(&pascal_case(&unraw(&name)), name.span());
                if assoc == "Error" {
                    return Err(syn::Error::new(
                        field.span(),
                        "a nested API cannot be at a field named `error`: its \
                         associated type would collide with the handler trait's \
                         `Error`",
                    ));
                }
                nested.push(Nested {
                    handlers: handlers_trait(&field.ty)?,
                    path,
                    path_const,
                    assoc,
                    name,
                })
            }
        }
    }
    Ok((endpoints, nested))
}

/// The handler trait that `#[derive(HttpApi)]` generates for an API type.
///
/// Named by convention rather than looked up: the derive on the nested struct
/// builds it from that struct's own name, so the enclosing API can name it
/// without seeing the nested definition. Resolved in the same scope the field
/// type is written in, which is where the derive put it.
fn handlers_trait(ty: &Type) -> syn::Result<syn::Path> {
    let Type::Path(tp) = ty else {
        return Err(syn::Error::new(
            ty.span(),
            "a nested API must be a named struct implementing HttpApi",
        ));
    };
    let mut path = tp.path.clone();
    let last = path
        .segments
        .last_mut()
        .ok_or_else(|| syn::Error::new(ty.span(), "a nested API must be a named struct"))?;
    if !last.arguments.is_none() {
        return Err(syn::Error::new(
            ty.span(),
            "a nested API cannot be generic: an API must be monomorphic",
        ));
    }
    last.ident = format_ident!("{}Handlers", last.ident);
    Ok(path)
}

/// Scoped name of the ADL annotation that overrides an endpoint's path.
const HTTP_PATH: &str = "common.http.HttpPath";

/// Scoped name of the ADL annotation giving an endpoint's http method.
const HTTP_METHOD: &str = "common.http.HttpMethod";

/// Scoped name of the ADL annotation giving an endpoint's security policy.
const HTTP_SECURITY: &str = "common.http.HttpSecurity";

/// The single annotation named `name` in `attrs`, if there is one.
///
/// Takes the attribute list rather than the field, because `@HttpMethod` and
/// `@HttpSecurity` may also annotate the API struct itself, where they set a
/// default for its endpoints.
///
/// More than one is an error rather than a last-wins, since the duplicates
/// would have to disagree to be noticeable at all.
fn sole_annotation(attrs: &[syn::Attribute], name: &str) -> syn::Result<Option<AdlAnnotation>> {
    let mut found: Option<AdlAnnotation> = None;
    for annotation in adl_annotations(attrs)? {
        if annotation.name != name {
            continue;
        }
        if found.is_some() {
            return Err(syn::Error::new(
                annotation.span,
                format!("duplicate {name} annotation"),
            ));
        }
        found = Some(annotation);
    }
    Ok(found)
}

/// The `@HttpMethod` in `attrs`, if there is one.
///
/// Returns `None` when absent so that an endpoint can fall back to its API
/// struct's annotation, and that to post.
fn http_method(attrs: &[syn::Attribute]) -> syn::Result<Option<Method>> {
    let Some(annotation) = sole_annotation(attrs, HTTP_METHOD)? else {
        return Ok(None);
    };
    let branch: String = serde_json::from_str(&annotation.value).map_err(|e| {
        syn::Error::new(
            annotation.span,
            format!("{HTTP_METHOD} must be a string, but its value is not: {e}"),
        )
    })?;
    match branch.as_str() {
        "get" => Ok(Some(Method::Get)),
        "post" => Ok(Some(Method::Post)),
        other => Err(syn::Error::new(
            annotation.span,
            format!("{HTTP_METHOD} must be \"get\" or \"post\", got {other:?}"),
        )),
    }
}

/// The `@HttpSecurity` in `attrs`, if there is one.
///
/// Returns `None` when absent; there is no language level default, and
/// [`collect_fields`] turns an endpoint that resolves to nothing into an
/// error. A policy that defaulted to public would leave an endpoint open with
/// nothing in the ADL saying so, and the ADL is what the clients and the api
/// workbench read.
fn http_security(attrs: &[syn::Attribute]) -> syn::Result<Option<Security>> {
    let Some(annotation) = sole_annotation(attrs, HTTP_SECURITY)? else {
        return Ok(None);
    };
    let value: serde_json::Value = serde_json::from_str(&annotation.value).map_err(|e| {
        syn::Error::new(
            annotation.span,
            format!("{HTTP_SECURITY} value is not valid json: {e}"),
        )
    })?;
    let bad = |detail: &str| {
        syn::Error::new(
            annotation.span,
            format!(
                "{HTTP_SECURITY} must be \"public\", \"token\" or \
                 {{\"tokenWithRole\": \"<role>\"}}: {detail}"
            ),
        )
    };
    match &value {
        serde_json::Value::String(branch) => match branch.as_str() {
            "public" => Ok(Some(Security::Public)),
            "token" => Ok(Some(Security::Token)),
            other => Err(bad(&format!("unknown branch {other:?}"))),
        },
        serde_json::Value::Object(fields) if fields.len() == 1 => {
            match fields.get("tokenWithRole").and_then(|r| r.as_str()) {
                Some(role) => Ok(Some(Security::TokenWithRole(role.to_owned()))),
                None => Err(bad("the only branch taking a value is tokenWithRole")),
            }
        }
        _ => Err(bad("expected a string or a single field object")),
    }
}

/// The method as an expression of the generated `HttpMethod` type.
fn method_expr(method: &Method, runtime: &syn::Path) -> proc_macro2::TokenStream {
    match method {
        Method::Get => quote! { #runtime::HttpMethod::Get },
        Method::Post => quote! { #runtime::HttpMethod::Post },
    }
}

/// The policy as an expression of the generated `HttpSecurity` type.
fn security_expr(security: &Security, runtime: &syn::Path) -> proc_macro2::TokenStream {
    match security {
        Security::Public => quote! { #runtime::HttpSecurity::Public },
        Security::Token => quote! { #runtime::HttpSecurity::Token },
        Security::TokenWithRole(role) => {
            quote! { #runtime::HttpSecurity::TokenWithRole(#role.to_owned()) }
        }
    }
}

/// The `@HttpPath` override on a field, if it has one.
///
/// adlc emits each ADL annotation marked `RustEmitAnnotation` as
/// `#[adl_annotation(name = "<scoped name>", value = "<json>")]`, where the
/// value is the annotation's ADL json encoding. `HttpPath` is a `String`, so
/// its encoding is a json string.
///
/// Everything here is an error rather than a fallback to the field name: a
/// path that silently reverts to the default would leave the generated server
/// mounted somewhere the clients are not looking, which is exactly the class
/// of bug the generation is meant to rule out.
fn http_path(field: &syn::Field) -> syn::Result<Option<String>> {
    let Some(annotation) = sole_annotation(&field.attrs, HTTP_PATH)? else {
        return Ok(None);
    };
    let path: String = serde_json::from_str(&annotation.value).map_err(|e| {
        syn::Error::new(
            annotation.span,
            format!("{HTTP_PATH} must be a string, but its value is not: {e}"),
        )
    })?;
    if !path.starts_with('/') {
        return Err(syn::Error::new(
            annotation.span,
            format!("{HTTP_PATH} is used verbatim and so must start with `/`, got {path:?}"),
        ));
    }
    Ok(Some(path))
}

/// One `#[adl_annotation(...)]` attribute, as adlc emits it.
struct AdlAnnotation {
    /// The annotation's ADL scoped name, eg `common.http.HttpPath`.
    name: String,
    /// The annotation's value in ADL's json encoding, still unparsed: the
    /// attribute is shared by annotations of every type, so only the reader
    /// of a particular one knows what shape to expect.
    value: String,
    span: Span,
}

/// The `#[adl_annotation(...)]` attributes among `attrs`.
///
/// Parsed strictly. The attribute is machine written, so anything unexpected
/// in one means a disagreement between this derive and the version of adlc
/// that generated the code, which is worth reporting rather than ignoring.
fn adl_annotations(attrs: &[syn::Attribute]) -> syn::Result<Vec<AdlAnnotation>> {
    let mut annotations = Vec::new();
    for attr in attrs.iter().filter(|a| a.path().is_ident("adl_annotation")) {
        let mut name: Option<String> = None;
        let mut value: Option<String> = None;
        attr.parse_nested_meta(|meta| {
            let slot = if meta.path.is_ident("name") {
                &mut name
            } else if meta.path.is_ident("value") {
                &mut value
            } else {
                return Err(meta.error("expected `name` or `value`"));
            };
            let lit: syn::LitStr = meta.value()?.parse()?;
            if slot.replace(lit.value()).is_some() {
                return Err(meta.error("given twice"));
            }
            Ok(())
        })?;
        match (name, value) {
            (Some(name), Some(value)) => annotations.push(AdlAnnotation {
                name,
                value,
                span: attr.span(),
            }),
            _ => {
                return Err(syn::Error::new(
                    attr.span(),
                    "adl_annotation requires both `name` and `value`",
                ))
            }
        }
    }
    Ok(annotations)
}

/// The field's name as written in the ADL, which is what the path is built
/// from.
///
/// The Rust backend snake cases and keyword escapes field names, emitting
/// `#[serde(rename = "...")]` whenever it had to change one. That rename is
/// therefore the ADL name, and the identifier is only correct in its absence.
/// Deriving a path from the identifier alone would silently disagree with the
/// TypeScript client, which has the ADL name directly.
///
/// adlc only ever emits the `rename = "..."` form; serde's
/// `rename(serialize = ..., deserialize = ...)` is not recognised, and falls
/// back to the identifier.
fn adl_field_name(field: &syn::Field, ident: &Ident) -> String {
    for attr in field.attrs.iter().filter(|a| a.path().is_ident("serde")) {
        let mut found: Option<String> = None;
        let _ = attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("rename") {
                let lit: syn::LitStr = meta.value()?.parse()?;
                found = Some(lit.value());
                return Ok(());
            }
            // Step over the serde options we don't care about, such as the
            // `default = "..."` that every defaulted ADL field carries.
            if let Ok(value) = meta.value() {
                let _: syn::Expr = value.parse()?;
            }
            Ok(())
        });
        if let Some(name) = found {
            return name;
        }
    }
    unraw(ident)
}

/// `admin_dry_run` to `AdminDryRun`, for the associated type naming the
/// handlers of a nested API.
fn pascal_case(name: &str) -> String {
    name.split('_')
        .filter(|word| !word.is_empty())
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                Some(first) => first.to_uppercase().chain(chars).collect::<String>(),
                None => String::new(),
            }
        })
        .collect()
}

/// An identifier's text without the raw-identifier `r#` prefix.
fn unraw(ident: &Ident) -> String {
    ident.to_string().trim_start_matches("r#").to_owned()
}

/// If `ty` is spelled `HttpReq<I, O>`, return `(I, O)`.
fn http_req_args(ty: &Type) -> Option<(Type, Type)> {
    let Type::Path(tp) = ty else { return None };
    let seg = tp.path.segments.last()?;
    if seg.ident != "HttpReq" {
        return None;
    }
    let PathArguments::AngleBracketed(args) = &seg.arguments else {
        return None;
    };
    let types: Vec<Type> = args
        .args
        .iter()
        .filter_map(|a| match a {
            GenericArgument::Type(t) => Some(t.clone()),
            _ => None,
        })
        .collect();
    match types.as_slice() {
        [req, resp] => Some((req.clone(), resp.clone())),
        _ => None,
    }
}
