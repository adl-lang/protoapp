import { HttpSecurity } from "@/adl-gen/common/http";
import { VEditor } from "@/components/forms/mui/veditor";
import { JsonBinding } from "@adllang/adl-runtime";
import * as ADL from "@adllang/adl-runtime";

export type Endpoint = HttpEndpoint | Api;

export type HttpEndpoint = HttpPostEndpoint<unknown, unknown> | HttpGetEndpoint<unknown>;

export interface Api {
  name: string;
  docString: string,
  kind: 'api';
  token: ADL.ATypeExpr<unknown>;
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
