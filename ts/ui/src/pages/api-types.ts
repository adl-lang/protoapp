import { HttpSecurity } from "@/adl-gen/common/http";
import { VEditor } from "@/components/forms/mui/veditor";
import { JsonBinding } from "@adllang/adl-runtime";

import * as AST from "@/adl-gen/sys/adlast";
import * as ADL from "@adllang/adl-runtime";

export type Endpoint =
  HttpEndpoint
  // | CapHttpEndpoint 
  | Api<unknown>;

export type HttpEndpoint = HttpPostEndpoint<unknown, unknown> | HttpGetEndpoint<unknown>;
// export type CapHttpEndpoint = CapHttpPostEndpoint<unknown, unknown> | CapHttpGetEndpoint<unknown>;

export interface Api<C> {
  name: string;
  docString: string,
  kind: 'api';
  typetoken: ADL.ATypeExpr<C>;
  token_val: C;
  // endpoints: Endpoint[];
  endpoints: HttpEndpoint[];
  parent: AST.Struct;
}

// export type CapHttpGetEndpoint<O> = Omit<HttpGetEndpoint<O>, "security">;
// export type CapHttpPostEndpoint<I, O> = Omit<HttpPostEndpoint<I, O>, "security">;

export interface HttpGetEndpoint<O> {
  kind: 'get';
  name: string;
  path: string;
  security?: HttpSecurity,
  docString: string,
  veditorO: VEditor<O>;
  jsonBindingO: JsonBinding<O>;
  parent: AST.Struct;
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
  parent: AST.Struct;
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
