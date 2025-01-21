import { HttpSecurity } from "@/adl-gen/common/http";
import { VEditor } from "@/components/forms/mui/veditor";
import { JsonBinding } from "@adllang/adl-runtime";

import * as AST from "@/adl-gen/sys/adlast";
import * as ADL from "@adllang/adl-runtime";
import { DeliveryMethod } from "@/adl-gen/common/capability";

export type Endpoint =
    HttpEndpoint
  | Api<unknown>;

// export type HttpEndpoint = HttpPostEndpoint<unknown, unknown> | HttpGetEndpoint<unknown>;
export type HttpEndpoint = HttpXEndpoint<unknown, unknown>;

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
  kind: 'api';
  name: string;
  docString: string,
  apis_called: CalledApi<unknown>[],
  typetoken: ADL.ATypeExpr<C>;
  token_value: C;
  endpoints: Endpoint[];
}

type Method = 'get' | 'post'

// export interface HttpGetEndpoint<O> {
//   kind: 'get';
//   method: 'get';
//   name: string;
//   path: string;
//   security?: HttpSecurity,
//   docString: string,
//   veditorO: VEditor<O>;
//   jsonBindingO: JsonBinding<O>;
//   apis_called?: CalledApi<unknown>[],
//   token_delivery_method?: DeliveryMethod,
// }

export interface CapTokenInstance {
  delivery_method: DeliveryMethod,
  value: unknown,
}

export interface HttpXEndpoint<I, O> {
  kind: 'callable';
  method: 'post' | 'get';
  name: string;
  path: string;
  security?: HttpSecurity,
  docString: string,
  veditorI: VEditor<I>;
  veditorO: VEditor<O>;
  jsonBindingI: JsonBinding<I>;
  jsonBindingO: JsonBinding<O>;
  apis_called?: CalledApi<unknown>[],
  token?: CapTokenInstance
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
