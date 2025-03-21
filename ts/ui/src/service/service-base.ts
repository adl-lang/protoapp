import { HttpFetch, HttpRequest } from "./http";
import * as ADL from "@adllang/adl-runtime";
import { HttpGet, HttpPost } from "@/adl-gen/common/http";
import { createJsonBinding, Json, JsonBinding } from "@adllang/adl-runtime";
import { QueryStats } from "@mui/icons-material";


export class ServiceBase {

  constructor(
    private readonly http: HttpFetch,
    private readonly baseUrl: string,
    private readonly resolver: ADL.DeclResolver,
  ) {
  }

  mkPostFn<I, O>(rtype: HttpPost<I, O>): ReqFn<I, O> {
    const bb = createBiBinding<I, O>(this.resolver, rtype);
    return (req: I) => {
      const jsonArgs = bb.reqJB.toJson(req);
      return this.requestAdl("post", rtype.path, undefined, jsonArgs, bb.respJB, undefined);
    };
  }

  mkAuthPostFn<I, O>(rtype: HttpPost<I, O>): AuthReqFn<I, O> {
    const bb = createBiBinding<I, O>(this.resolver, rtype);
    return (authToken:string, req: I) => {
      const jsonArgs = bb.reqJB.toJson(req);
      return this.requestAdl("post", rtype.path, undefined, jsonArgs, bb.respJB, authToken);
    };
  }

  mkGetFn<I, O>(rtype: HttpGet<I,O>): ReqFn<I,O> {
    const bb = createBiBinding<I, O>(this.resolver, rtype);
    return (req: I) => {
      const reqJson = bb.reqJB.toJson(req);
      const queryString = encodeQueryString(reqJson);
      return this.requestAdl("get", rtype.path, queryString, undefined, bb.respJB, undefined);
    };
  }

  mkAuthGetFn<I, O>(rtype: HttpGet<I,O>): AuthReqFn<I,O> {
    const bb = createBiBinding<I, O>(this.resolver, rtype);
    return (authToken:string, req: I) => {
      const reqJson = bb.reqJB.toJson(req);
      const queryString = encodeQueryString(reqJson);
      return this.requestAdl("get", rtype.path, queryString, undefined, bb.respJB, authToken);
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
      body: jsonBody === undefined ? undefined: JSON.stringify(jsonBody)
    };

    // Make request
    const resp = await this.http.fetch(httpReq);

    // Check for errors
    if (!resp.ok) {
      throw new AdlRequestError(
        httpReq, resp.status, await resp.text()
      );
    }

    // Parse and response
    const respJson = await resp.json();
    return respJB.fromJsonE(respJson);
  }
}

export class AdlRequestError extends Error {
  constructor(readonly httpReq: HttpRequest, readonly respStatus: number, readonly respBody: string) {
    super(`Encountered server error attempting ${httpReq.method} request to ${httpReq.url} failed: ${respStatus}`)
  }
} 

export function encodeQueryString(reqJson: Json) {
  return reqJson === null ? undefined : `input=${encodeURIComponent(JSON.stringify(reqJson))}`;
}

export type ReqFn<I, O> = (req: I) => Promise<O>;
export type AuthReqFn<I, O> = (authToken: string, req: I) => Promise<O>;

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
    respJB: createJsonBinding(resolver, rtype.respType)
  };
}
