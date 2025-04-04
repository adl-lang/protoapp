/* @generated from adl module common.http */

import * as ADL from '@adllang/adl-runtime';

/**
 * Request types
 */
export interface HttpReq<I, O> {
  method: HttpMethod;
  path: string;
  security: HttpSecurity;
  reqType: ADL.ATypeExpr<I>;
  respType: ADL.ATypeExpr<O>;
}

const HttpReq_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Request types\n"}],"name":"HttpReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":"post"},"name":"method","serializedName":"method","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpMethod"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"path","serializedName":"path","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"security","serializedName":"security","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpSecurity"}}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"reqType","serializedName":"reqType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"I"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"respType","serializedName":"respType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"O"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}}],"typeParams":["I","O"]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpReq: ADL.ScopedName = {moduleName:"common.http", name:"HttpReq"};

export function texprHttpReq<I, O>(texprI : ADL.ATypeExpr<I>, texprO : ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpReq<I, O>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.http",name : "HttpReq"}}, parameters : [texprI.value, texprO.value]}};
}

export type HttpMethod = 'get' | 'post';
export const valuesHttpMethod : HttpMethod[] = ['get', 'post'];

const HttpMethod_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"HttpMethod","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"get","serializedName":"get","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"post","serializedName":"post","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpMethod: ADL.ScopedName = {moduleName:"common.http", name:"HttpMethod"};

export function texprHttpMethod(): ADL.ATypeExpr<HttpMethod> {
  return {value : {typeRef : {kind: "reference", value : snHttpMethod}, parameters : []}};
}

export interface HttpSecurity_Public {
  kind: 'public';
}
export interface HttpSecurity_Token {
  kind: 'token';
}
export interface HttpSecurity_TokenWithRole {
  kind: 'tokenWithRole';
  value: string;
}

export type HttpSecurity = HttpSecurity_Public | HttpSecurity_Token | HttpSecurity_TokenWithRole;

export interface HttpSecurityOpts {
  public: null;
  token: null;
  tokenWithRole: string;
}

export function makeHttpSecurity<K extends keyof HttpSecurityOpts>(kind: K, value: HttpSecurityOpts[K]) { return {kind, value}; }

const HttpSecurity_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"HttpSecurity","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"public","serializedName":"public","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"tokenWithRole","serializedName":"tokenWithRole","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpSecurity: ADL.ScopedName = {moduleName:"common.http", name:"HttpSecurity"};

export function texprHttpSecurity(): ADL.ATypeExpr<HttpSecurity> {
  return {value : {typeRef : {kind: "reference", value : snHttpSecurity}, parameters : []}};
}

/**
 * Empty Struct (Used mostly for Void RPC responses)
 */
export interface Unit {
}

export function makeUnit(
  _input: {
  }
): Unit {
  return {
  };
}

const Unit_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Empty Struct (Used mostly for Void RPC responses)\n"}],"name":"Unit","type_":{"kind":"struct_","value":{"fields":[],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snUnit: ADL.ScopedName = {moduleName:"common.http", name:"Unit"};

export function texprUnit(): ADL.ATypeExpr<Unit> {
  return {value : {typeRef : {kind: "reference", value : snUnit}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "common.http.HttpReq" : HttpReq_AST,
  "common.http.HttpMethod" : HttpMethod_AST,
  "common.http.HttpSecurity" : HttpSecurity_AST,
  "common.http.Unit" : Unit_AST
};
