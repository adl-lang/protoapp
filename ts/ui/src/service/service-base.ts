import { HttpFetch, HttpRequest } from "./http";

import * as ADL from "@adllang/adl-runtime";
import { HttpReq, snHttpReq, texprHttpPath } from "@protoapp/adl/common/http";
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
      if (endpoint.req.method === "get") {
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
      if (endpoint.req.method === "get") {
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
  req: HttpReq<I, O>;
}

/** The endpoints of an api struct, keyed by their ADL field names. */
export type Endpoints<A> = {
  [K in EndpointKey<A> & keyof A]: Endpoint<ReqOf<A[K]>, RespOf<A[K]>>;
};

/**
 * Pair every endpoint of an api struct with the path it is mounted at.
 *
 * `api` supplies each endpoint's method and security, which are runtime
 * values; `texpr` supplies its declaration, which is where the path comes
 * from, so both are needed.
 */
export function endpoints<A>(resolver: ADL.DeclResolver, texpr: ADL.ATypeExpr<A>, api: A): Endpoints<A> {
  if (texpr.value.typeRef.kind !== "reference" || texpr.value.parameters.length !== 0) {
    throw new Error("an api must be a monomorphic declaration");
  }
  const decl = resolver(texpr.value.typeRef.value);
  if (decl.decl.type_.kind !== "struct_") {
    throw new Error(`an api must be a struct, but ${decl.moduleName}.${decl.decl.name} is not`);
  }
  const fields = api as Record<string, unknown>;
  const result: Record<string, Endpoint<unknown, unknown>> = {};
  for (const field of decl.decl.type_.value.fields) {
    if (field.typeExpr.typeRef.kind === "reference" && scopedNamesEqual(field.typeExpr.typeRef.value, snHttpReq)) {
      result[field.name] = {
        path: endpointPath(resolver, field),
        req: fields[field.name] as HttpReq<unknown, unknown>,
      };
    }
  }
  // This loop visits exactly the fields EndpointKey selects, both being the
  // HttpReq ones, but the compiler cannot see that the two agree.
  return result as Endpoints<A>;
}

/**
 * The HTTP path of an endpoint: its `@HttpPath` annotation if the ADL field
 * carries one, and otherwise "/" followed by the field name.
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

/** The request type of an `HttpReq` valued field. */
type ReqOf<T> = T extends HttpReq<infer I, unknown> ? I : never;

/** The response type of an `HttpReq` valued field. */
type RespOf<T> = T extends HttpReq<unknown, infer O> ? O : never;

/** Those fields of an api struct that are endpoints. */
type EndpointKey<A> = {
  [K in keyof A]: A[K] extends HttpReq<unknown, unknown> ? K : never;
}[keyof A];

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
