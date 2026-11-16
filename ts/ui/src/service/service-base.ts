import { HttpFetch, HttpRequest } from "./http";

import * as ADL from "@adllang/adl-runtime";
import {
  HttpMethod,
  HttpReq,
  HttpSecurity,
  snHttpReq,
  texprHttpMethod,
  texprHttpPath,
  texprHttpSecurity,
} from "@protoapp/adl/common/http";
import * as AST from "@protoapp/adl/sys/adlast";
import { createJsonBinding, Json, JsonBinding, scopedNamesEqual } from "@adllang/adl-runtime";

export class ServiceBase {
  constructor(
    private readonly http: HttpFetch,
    private readonly baseUrl: string,
    private readonly resolver: ADL.DeclResolver,
  ) {}

  // An endpoint is passed in as a value from `endpoints()` below, rather than
  // named by its api struct and field, because an HttpReq on its own carries
  // neither its path nor any way to find it.

  mkReqFn<I, O>(endpoint: Endpoint<I, O>): ReqFn<I, O> {
    const bb = createBiBinding(this.resolver, endpoint.req);
    return (req) => {
      const jsonArgs = bb.reqJB.toJson(req);
      if (endpoint.method === "get") {
        const queryString = encodeQueryString(jsonArgs);
        return this.requestAdl("get", endpoint.path, queryString, undefined, bb.respJB, undefined);
      } else {
        return this.requestAdl("post", endpoint.path, undefined, jsonArgs, bb.respJB, undefined);
      }
    };
  }

  mkAuthReqFn<I, O>(endpoint: Endpoint<I, O>): AuthReqFn<I, O> {
    const bb = createBiBinding(this.resolver, endpoint.req);
    return (authToken: string, req) => {
      const jsonArgs = bb.reqJB.toJson(req);
      if (endpoint.method === "get") {
        const queryString = encodeQueryString(jsonArgs);
        return this.requestAdl("get", endpoint.path, queryString, undefined, bb.respJB, authToken);
      } else {
        return this.requestAdl("post", endpoint.path, undefined, jsonArgs, bb.respJB, authToken);
      }
    };
  }

  async requestAdl<O>(
    method: "get" | "post",
    path: string,
    queryString: string | undefined,
    jsonBody: Json | undefined,
    respJB: JsonBinding<O>,
    authToken: string | undefined,
  ): Promise<O> {
    // Construct request
    const headers: { [key: string]: string } = {};
    if (authToken) {
      headers["Authorization"] = "Bearer " + authToken;
    }
    headers["Content-Type"] = "application/json";
    const httpReq: HttpRequest = {
      url: this.baseUrl + path + (queryString === undefined ? "" : "?" + queryString),
      headers,
      method,
      body: jsonBody === undefined ? undefined : JSON.stringify(jsonBody),
    };

    // Make request
    const resp = await this.http.fetch(httpReq);

    // Check for errors
    if (!resp.ok) {
      throw new AdlRequestError(httpReq, resp.status, await resp.text());
    }

    // Parse and response
    const respJson = await resp.json();
    return respJB.fromJsonE(respJson as Json);
  }
}

export class AdlRequestError extends Error {
  constructor(
    readonly httpReq: HttpRequest,
    readonly respStatus: number,
    readonly respBody: string,
  ) {
    super(`Encountered server error attempting ${httpReq.method} request to ${httpReq.url} failed: ${respStatus}`);
  }
}

export function encodeQueryString(reqJson: Json) {
  return reqJson === null ? undefined : `input=${encodeURIComponent(JSON.stringify(reqJson))}`;
}

export type ReqFn<I, O> = (req: I) => Promise<O>;
export type AuthReqFn<I, O> = (authToken: string, req: I) => Promise<O>;

/** An endpoint of an api struct: where it is mounted, and how to call it. */
export interface Endpoint<I, O> {
  path: string;
  method: HttpMethod;
  security: HttpSecurity;

  /**
   * Carries no data of its own: an `HttpReq` is two type tokens, since the
   * path, method and security all live in the declaration. It is kept for the
   * `reqType`/`respType` the json bindings are built from.
   */
  req: HttpReq<I, O>;
}

/**
 * The endpoints of an api struct, keyed by their ADL field names.
 *
 * A field holding a nested api becomes a nested `Endpoints`, so an
 * `AdminApi` at field `admin` is reached as `api.admin.create_user`.
 */
export type Endpoints<A> = {
  [K in keyof A]: A[K] extends HttpReq<unknown, unknown> ? Endpoint<ReqOf<A[K]>, RespOf<A[K]>> : Endpoints<A[K]>;
};

/**
 * Pair every endpoint of an api struct with the declaration facts needed to
 * call it: its path, method and security policy.
 *
 * `texpr` supplies the declaration, which all three come from; `api` supplies
 * the `HttpReq` values, which are what the json bindings are built from.
 *
 * A field that is not an `HttpReq` is taken to be a nested api, exactly as
 * the rust `HttpApi` derive takes it, and its endpoints are mounted under
 * that field's own path. The two must agree, or requests miss the server's
 * routes.
 */
export function endpoints<A>(resolver: ADL.DeclResolver, texpr: ADL.ATypeExpr<A>, api: A): Endpoints<A> {
  return endpointsAt(resolver, texpr, api, "");
}

function endpointsAt<A>(resolver: ADL.DeclResolver, texpr: ADL.ATypeExpr<A>, api: A, prefix: string): Endpoints<A> {
  if (texpr.value.typeRef.kind !== "reference" || texpr.value.parameters.length !== 0) {
    throw new Error("an api must be a monomorphic declaration");
  }
  const decl = resolver(texpr.value.typeRef.value);
  if (decl.decl.type_.kind !== "struct_") {
    throw new Error(`an api must be a struct, but ${decl.moduleName}.${decl.decl.name} is not`);
  }
  const fields = api as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const field of decl.decl.type_.value.fields) {
    const path = prefix + endpointPath(resolver, field);
    if (field.typeExpr.typeRef.kind === "reference" && scopedNamesEqual(field.typeExpr.typeRef.value, snHttpReq)) {
      result[field.name] = {
        path,
        method: endpointMethod(resolver, field, decl.decl.annotations),
        security: endpointSecurity(resolver, field, decl.decl.annotations),
        req: fields[field.name] as HttpReq<unknown, unknown>,
      };
    } else {
      result[field.name] = endpointsAt(resolver, ADL.makeATypeExpr<unknown>(field.typeExpr), fields[field.name], path);
    }
  }
  // This loop mirrors the mapped type exactly, taking the same branch on the
  // same condition, but the compiler cannot see that the two agree.
  return result as Endpoints<A>;
}

/**
 * The path of a field of an api struct, relative to where that struct is
 * mounted: its `@HttpPath` annotation if it carries one, and otherwise "/"
 * followed by the field name. For a nested api this is the prefix its own
 * endpoints hang off.
 *
 * HttpReq carries no path, so each backend derives one from the declaration,
 * and they must all derive it identically or requests miss the server's
 * routes. The rust server reads the same annotation at compile time, out of
 * the `#[adl_annotation(...)]` attributes adlc emits beside the generated
 * field; see rust/adl/derive.
 */
export function endpointPath(resolver: ADL.DeclResolver, field: AST.Field): string {
  const path = ADL.getAnnotation(createJsonBinding(resolver, texprHttpPath()), field.annotations);
  if (path === undefined) {
    return "/" + field.name;
  }
  if (!path.startsWith("/")) {
    throw new Error(`the HttpPath on ${field.name} is used verbatim, so it must start with "/", but is "${path}"`);
  }
  return path;
}

/**
 * The http method of an endpoint: its own `@HttpMethod` annotation, else the
 * one on its api struct, else post.
 *
 * Unlike the security policy, a wrong default here is harmless: the endpoint
 * is merely uncacheable.
 */
export function endpointMethod(
  resolver: ADL.DeclResolver,
  field: AST.Field,
  apiAnnotations: AST.Annotations,
): HttpMethod {
  const jb = createJsonBinding(resolver, texprHttpMethod());
  return ADL.getAnnotation(jb, field.annotations) ?? ADL.getAnnotation(jb, apiAnnotations) ?? "post";
}

/**
 * The security policy of an endpoint: its own `@HttpSecurity` annotation, else
 * the one on its api struct.
 *
 * There is no fallback beyond that. An endpoint whose policy defaulted to
 * public would be open with nothing in the ADL saying so, and the ADL is what
 * every backend reads. The rust derive refuses to compile such a declaration;
 * here it throws when the endpoints are walked, which is at startup.
 *
 * `apiAnnotations` are those of the struct the field belongs to, and not of
 * any struct it is nested in: a nested api may be mounted at more than one
 * field, so its policy belongs to its own declaration.
 */
export function endpointSecurity(
  resolver: ADL.DeclResolver,
  field: AST.Field,
  apiAnnotations: AST.Annotations,
): HttpSecurity {
  const jb = createJsonBinding(resolver, texprHttpSecurity());
  const security = ADL.getAnnotation(jb, field.annotations) ?? ADL.getAnnotation(jb, apiAnnotations);
  if (security === undefined) {
    throw new Error(`the endpoint ${field.name} resolves to no HttpSecurity: annotate the field, or its api struct`);
  }
  return security;
}

/** The request type of an `HttpReq` valued field. */
type ReqOf<T> = T extends HttpReq<infer I, unknown> ? I : never;

/** The response type of an `HttpReq` valued field. */
type RespOf<T> = T extends HttpReq<unknown, infer O> ? O : never;

interface BiTypeExpr<I, O> {
  reqType: ADL.ATypeExpr<I>;
  respType: ADL.ATypeExpr<O>;
}

interface BiBinding<I, O> {
  reqJB: JsonBinding<I>;
  respJB: JsonBinding<O>;
}

function createBiBinding<I, O>(resolver: ADL.DeclResolver, rtype: BiTypeExpr<I, O>): BiBinding<I, O> {
  return {
    reqJB: createJsonBinding(resolver, rtype.reqType),
    respJB: createJsonBinding(resolver, rtype.respType),
  };
}
