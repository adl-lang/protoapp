/* @generated from adl module protoapp.apis.captest */

import * as ADL from '@adllang/adl-runtime';
import * as common_capability from './../../common/capability';
import * as common_http from './../../common/http';

export interface Capability {
  user_id: string;
  roles: string[];
}

export function makeCapability(
  input: {
    user_id: string,
    roles: string[],
  }
): Capability {
  return {
    user_id: input.user_id,
    roles: input.roles,
  };
}

const Capability_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"Capability","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"user_id","serializedName":"user_id","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"roles","serializedName":"roles","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"primitive","value":"Vector"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snCapability: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"Capability"};

export function texprCapability(): ADL.ATypeExpr<Capability> {
  return {value : {typeRef : {kind: "reference", value : snCapability}, parameters : []}};
}

export interface ApiRequests {
  a: common_capability.HttpPost<common_http.Unit, A_ApiResp>;
  accessTokenApi: common_capability.CapabilityApi<A_ApiToken, common_http.Unit, A_Api>;
}

export function makeApiRequests(
  input: {
    a?: common_capability.HttpPost<common_http.Unit, A_ApiResp>,
    accessTokenApi?: common_capability.CapabilityApi<A_ApiToken, common_http.Unit, A_Api>,
  }
): ApiRequests {
  return {
    a: input.a === undefined ? {path : "/a", rateLimit : null, reqType : common_http.texprUnit(), respType : texprA_ApiResp()} : input.a,
    accessTokenApi: input.accessTokenApi === undefined ? {token : texprA_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {b : {path : "/b", rateLimit : null, reqType : texprA_ApiToken(), respType : texprB_ApiResp()}, accessTokenApi : {token : texprB_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {c : {path : "/c", rateLimit : null, reqType : texprB_ApiToken(), respType : texprC_ApiResp()}, accessTokenApi : {token : texprC_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {hello : {path : "/hello", rateLimit : null, reqType : texprC_ApiToken(), respType : ADL.texprString()}}, name : ""}}, name : ""}}, name : ""} : input.accessTokenApi,
  };
}

const ApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"ApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":{"path":"/a"}},"name":"a","serializedName":"a","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"A_ApiResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{"service":{}}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"A_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"A_Api"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"ApiRequests"};

export function texprApiRequests(): ADL.ATypeExpr<ApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snApiRequests}, parameters : []}};
}

export type A_ApiToken = string;

const A_ApiToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"A_ApiToken","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snA_ApiToken: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"A_ApiToken"};

export function texprA_ApiToken(): ADL.ATypeExpr<A_ApiToken> {
  return {value : {typeRef : {kind: "reference", value : snA_ApiToken}, parameters : []}};
}

export type A_ApiTokenMarker = common_capability.CapabilityToken<A_ApiToken>;

const A_ApiTokenMarker_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"A_ApiTokenMarker","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"A_ApiToken"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityToken"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snA_ApiTokenMarker: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"A_ApiTokenMarker"};

export function texprA_ApiTokenMarker(): ADL.ATypeExpr<A_ApiTokenMarker> {
  return {value : {typeRef : {kind: "reference", value : snA_ApiTokenMarker}, parameters : []}};
}

export type B_ApiToken = string;

const B_ApiToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"B_ApiToken","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snB_ApiToken: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"B_ApiToken"};

export function texprB_ApiToken(): ADL.ATypeExpr<B_ApiToken> {
  return {value : {typeRef : {kind: "reference", value : snB_ApiToken}, parameters : []}};
}

export type B_ApiTokenMarker = common_capability.CapabilityToken<B_ApiToken>;

const B_ApiTokenMarker_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"B_ApiTokenMarker","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"B_ApiToken"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityToken"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snB_ApiTokenMarker: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"B_ApiTokenMarker"};

export function texprB_ApiTokenMarker(): ADL.ATypeExpr<B_ApiTokenMarker> {
  return {value : {typeRef : {kind: "reference", value : snB_ApiTokenMarker}, parameters : []}};
}

export type C_ApiToken = string;

const C_ApiToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"C_ApiToken","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snC_ApiToken: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"C_ApiToken"};

export function texprC_ApiToken(): ADL.ATypeExpr<C_ApiToken> {
  return {value : {typeRef : {kind: "reference", value : snC_ApiToken}, parameters : []}};
}

export type C_ApiTokenMarker = common_capability.CapabilityToken<C_ApiToken>;

const C_ApiTokenMarker_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"C_ApiTokenMarker","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"C_ApiToken"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityToken"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snC_ApiTokenMarker: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"C_ApiTokenMarker"};

export function texprC_ApiTokenMarker(): ADL.ATypeExpr<C_ApiTokenMarker> {
  return {value : {typeRef : {kind: "reference", value : snC_ApiTokenMarker}, parameters : []}};
}

export interface A_Api {
  b: common_capability.HttpPost<A_ApiToken, B_ApiResp>;
  accessTokenApi: common_capability.CapabilityApi<B_ApiToken, common_http.Unit, B_Api>;
}

export function makeA_Api(
  input: {
    b?: common_capability.HttpPost<A_ApiToken, B_ApiResp>,
    accessTokenApi?: common_capability.CapabilityApi<B_ApiToken, common_http.Unit, B_Api>,
  }
): A_Api {
  return {
    b: input.b === undefined ? {path : "/b", rateLimit : null, reqType : texprA_ApiToken(), respType : texprB_ApiResp()} : input.b,
    accessTokenApi: input.accessTokenApi === undefined ? {token : texprB_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {c : {path : "/c", rateLimit : null, reqType : texprB_ApiToken(), respType : texprC_ApiResp()}, accessTokenApi : {token : texprC_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {hello : {path : "/hello", rateLimit : null, reqType : texprC_ApiToken(), respType : ADL.texprString()}}, name : ""}}, name : ""} : input.accessTokenApi,
  };
}

const A_Api_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"A_Api","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":{"path":"/b"}},"name":"b","serializedName":"b","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"A_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"B_ApiResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{"service":{}}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"B_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"B_Api"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snA_Api: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"A_Api"};

export function texprA_Api(): ADL.ATypeExpr<A_Api> {
  return {value : {typeRef : {kind: "reference", value : snA_Api}, parameters : []}};
}

export interface B_Api {
  c: common_capability.HttpPost<B_ApiToken, C_ApiResp>;
  accessTokenApi: common_capability.CapabilityApi<C_ApiToken, common_http.Unit, C_Api>;
}

export function makeB_Api(
  input: {
    c?: common_capability.HttpPost<B_ApiToken, C_ApiResp>,
    accessTokenApi?: common_capability.CapabilityApi<C_ApiToken, common_http.Unit, C_Api>,
  }
): B_Api {
  return {
    c: input.c === undefined ? {path : "/c", rateLimit : null, reqType : texprB_ApiToken(), respType : texprC_ApiResp()} : input.c,
    accessTokenApi: input.accessTokenApi === undefined ? {token : texprC_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {hello : {path : "/hello", rateLimit : null, reqType : texprC_ApiToken(), respType : ADL.texprString()}}, name : ""} : input.accessTokenApi,
  };
}

const B_Api_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"B_Api","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":{"path":"/c"}},"name":"c","serializedName":"c","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"B_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"C_ApiResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{"service":{}}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"C_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"C_Api"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snB_Api: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"B_Api"};

export function texprB_Api(): ADL.ATypeExpr<B_Api> {
  return {value : {typeRef : {kind: "reference", value : snB_Api}, parameters : []}};
}

export interface C_Api {
  hello: common_capability.HttpPost<C_ApiToken, string>;
}

export function makeC_Api(
  input: {
    hello?: common_capability.HttpPost<C_ApiToken, string>,
  }
): C_Api {
  return {
    hello: input.hello === undefined ? {path : "/hello", rateLimit : null, reqType : texprC_ApiToken(), respType : ADL.texprString()} : input.hello,
  };
}

const C_Api_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"C_Api","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":{"path":"/hello"}},"name":"hello","serializedName":"hello","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"C_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snC_Api: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"C_Api"};

export function texprC_Api(): ADL.ATypeExpr<C_Api> {
  return {value : {typeRef : {kind: "reference", value : snC_Api}, parameters : []}};
}

export interface A_ApiResp_Token {
  kind: 'token';
  value: string;
}

export type A_ApiResp = A_ApiResp_Token;

export interface A_ApiRespOpts {
  token: string;
}

export function makeA_ApiResp<K extends keyof A_ApiRespOpts>(kind: K, value: A_ApiRespOpts[K]) { return {kind, value}; }

const A_ApiResp_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"A_ApiResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[{"key":{"moduleName":"protoapp.apis.captest","name":"A_ApiTokenMarker"},"value":{}}],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snA_ApiResp: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"A_ApiResp"};

export function texprA_ApiResp(): ADL.ATypeExpr<A_ApiResp> {
  return {value : {typeRef : {kind: "reference", value : snA_ApiResp}, parameters : []}};
}

export interface B_ApiResp_Token {
  kind: 'token';
  value: string;
}

export type B_ApiResp = B_ApiResp_Token;

export interface B_ApiRespOpts {
  token: string;
}

export function makeB_ApiResp<K extends keyof B_ApiRespOpts>(kind: K, value: B_ApiRespOpts[K]) { return {kind, value}; }

const B_ApiResp_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"B_ApiResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[{"key":{"moduleName":"protoapp.apis.captest","name":"B_ApiTokenMarker"},"value":{}}],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snB_ApiResp: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"B_ApiResp"};

export function texprB_ApiResp(): ADL.ATypeExpr<B_ApiResp> {
  return {value : {typeRef : {kind: "reference", value : snB_ApiResp}, parameters : []}};
}

export interface C_ApiResp_Token {
  kind: 'token';
  value: string;
}

export type C_ApiResp = C_ApiResp_Token;

export interface C_ApiRespOpts {
  token: string;
}

export function makeC_ApiResp<K extends keyof C_ApiRespOpts>(kind: K, value: C_ApiRespOpts[K]) { return {kind, value}; }

const C_ApiResp_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"C_ApiResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[{"key":{"moduleName":"protoapp.apis.captest","name":"C_ApiTokenMarker"},"value":{}}],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.captest"};

export const snC_ApiResp: ADL.ScopedName = {moduleName:"protoapp.apis.captest", name:"C_ApiResp"};

export function texprC_ApiResp(): ADL.ATypeExpr<C_ApiResp> {
  return {value : {typeRef : {kind: "reference", value : snC_ApiResp}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "protoapp.apis.captest.Capability" : Capability_AST,
  "protoapp.apis.captest.ApiRequests" : ApiRequests_AST,
  "protoapp.apis.captest.A_ApiToken" : A_ApiToken_AST,
  "protoapp.apis.captest.A_ApiTokenMarker" : A_ApiTokenMarker_AST,
  "protoapp.apis.captest.B_ApiToken" : B_ApiToken_AST,
  "protoapp.apis.captest.B_ApiTokenMarker" : B_ApiTokenMarker_AST,
  "protoapp.apis.captest.C_ApiToken" : C_ApiToken_AST,
  "protoapp.apis.captest.C_ApiTokenMarker" : C_ApiTokenMarker_AST,
  "protoapp.apis.captest.A_Api" : A_Api_AST,
  "protoapp.apis.captest.B_Api" : B_Api_AST,
  "protoapp.apis.captest.C_Api" : C_Api_AST,
  "protoapp.apis.captest.A_ApiResp" : A_ApiResp_AST,
  "protoapp.apis.captest.B_ApiResp" : B_ApiResp_AST,
  "protoapp.apis.captest.C_ApiResp" : C_ApiResp_AST
};
