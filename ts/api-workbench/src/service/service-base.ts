import { HttpFetch, HttpRequest } from "./http";
import * as ADL from "@adllang/adl-runtime";
import { HttpReq } from "@protoapp/adl/common/http";
import { createJsonBinding, Json, JsonBinding } from "@adllang/adl-runtime";

export class ServiceBase {
  constructor(
    private readonly http: HttpFetch,
    private readonly baseUrl: string,
    private readonly resolver: ADL.DeclResolver,
  ) {}

  // The endpoint is named by its api struct and field, rather than passed as
  // an HttpReq value, because HttpReq no longer carries a path: the path comes
  // from the field name, which a value on its own has no way to know.

  mkReqFn<A, K extends EndpointKey<A> & keyof A & string>(api: A, name: K): ReqFn<ReqOf<A[K]>, RespOf<A[K]>> {
    const rtype = endpointOf(api, name);
    const path = endpointPath(name);
    const bb = createBiBinding(this.resolver, rtype);
    return (req) => {
      const jsonArgs = bb.reqJB.toJson(req);
      if (rtype.method === "get") {
        const queryString = encodeQueryString(jsonArgs);
        return this.requestAdl("get", path, queryString, undefined, bb.respJB, undefined);
      } else {
        return this.requestAdl("post", path, undefined, jsonArgs, bb.respJB, undefined);
      }
    };
  }

  mkAuthReqFn<A, K extends EndpointKey<A> & keyof A & string>(api: A, name: K): AuthReqFn<ReqOf<A[K]>, RespOf<A[K]>> {
    const rtype = endpointOf(api, name);
    const path = endpointPath(name);
    const bb = createBiBinding(this.resolver, rtype);
    return (authToken: string, req) => {
      const jsonArgs = bb.reqJB.toJson(req);
      if (rtype.method === "get") {
        const queryString = encodeQueryString(jsonArgs);
        return this.requestAdl("get", path, queryString, undefined, bb.respJB, authToken);
      } else {
        return this.requestAdl("post", path, undefined, jsonArgs, bb.respJB, authToken);
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
    return respJB.fromJsonE(respJson);
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

/**
 * The HTTP path of an endpoint, derived from its ADL field name.
 *
 * HttpReq carries no path: each backend derives one from the field the
 * endpoint is declared under, and they must all derive it identically or
 * requests miss the server's routes. The TypeScript backend uses the ADL field
 * name verbatim as the property name, so the key here is already that name.
 */
export function endpointPath(name: string): string {
  return "/" + name;
}

/** The request type of an `HttpReq` valued field. */
type ReqOf<T> = T extends HttpReq<infer I, unknown> ? I : never;

/** The response type of an `HttpReq` valued field. */
type RespOf<T> = T extends HttpReq<unknown, infer O> ? O : never;

/** Those fields of an api struct that are endpoints. */
type EndpointKey<A> = {
  [K in keyof A]: A[K] extends HttpReq<unknown, unknown> ? K : never;
}[keyof A];

/**
 * The endpoint at `api[name]`.
 *
 * `EndpointKey` has already established that the field is an `HttpReq`, but
 * not in a form the compiler can relate back to `ReqOf`/`RespOf`, hence the
 * assertion.
 */
function endpointOf<A, K extends EndpointKey<A> & keyof A>(api: A, name: K): HttpReq<ReqOf<A[K]>, RespOf<A[K]>> {
  return api[name] as HttpReq<ReqOf<A[K]>, RespOf<A[K]>>;
}

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
