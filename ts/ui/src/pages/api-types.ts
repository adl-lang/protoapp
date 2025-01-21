import { HttpSecurity } from "@/adl-gen/common/http";
import { VEditor } from "@/components/forms/mui/veditor";
import { JsonBinding } from "@adllang/adl-runtime";

import * as AST from "@/adl-gen/sys/adlast";
import * as ADL from "@adllang/adl-runtime";

export type Endpoint =
    HttpEndpoint
  | Api<unknown>;

export type HttpEndpoint = HttpPostEndpoint<unknown, unknown> | HttpGetEndpoint<unknown>;

export interface CalledApi<C> {
  token_type: ADL.ATypeExpr<C>;
  value: C;
}

export interface CapToken<C> {
  type: AST.TypeExpr;
  apis_called: CalledApi<unknown>[],
  token_value: C;
};

export interface Api<C> {
  name: string;
  docString: string,
  kind: 'api';
  apis_called: CalledApi<unknown>[],
  typetoken: ADL.ATypeExpr<C>;
  token_value: C;
  endpoints: Endpoint[];
}

export interface HttpGetEndpoint<O> {
  kind: 'get';
  name: string;
  path: string;
  security?: HttpSecurity,
  docString: string,
  veditorO: VEditor<O>;
  jsonBindingO: JsonBinding<O>;
  apis_called?: CalledApi<unknown>[],
}

export interface HttpPostEndpoint<I, O> {
  kind: 'post';
  name: string;
  path: string;
  security?: HttpSecurity,
  docString: string,
  veditorI: VEditor<I>;
  veditorO: VEditor<O>;
  jsonBindingI: JsonBinding<I>;
  jsonBindingO: JsonBinding<O>;
  apis_called?: CalledApi<unknown>[],
}

export type ExecutingRequest = {
  startedAt: Date,
  endpoint: HttpEndpoint,
  req?: unknown,
}

export interface CompletedRequest {
  startedAt: Date,
  endpoint: HttpEndpoint,
  req?: unknown,
  durationMs: number,
  resp: CompletedResponse,
}

export type CompletedResponse
  = { success: true, value: unknown }
  | { success: false, httpStatus: number, responseBody: string }
  ;
