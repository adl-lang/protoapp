/* @generated from adl module common.capability */

import * as ADL from '@adllang/adl-runtime';
import * as common_http from './http';

/**
 * Used to create a field inside an API struct which represents a section of the api requiring a token.
 * C is the type of the client-side token
 * S is the type of the server-side capability
 * V is the type of the API struct requiring the capability
 */
export interface CapabilityApi<C, S, V> {
  token: ADL.ATypeExpr<C>;
  cap: ADL.ATypeExpr<S>;
  service_prefix: string;
  service: V;
  name: string;
  token_delivery: DeliveryMethod;
}

const CapabilityApi_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Used to create a field inside an API struct which represents a section of the api requiring a token.\nC is the type of the client-side token\nS is the type of the server-side capability\nV is the type of the API struct requiring the capability\n"}],"name":"CapabilityApi","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":null},"name":"token","serializedName":"token","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"C"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"cap","serializedName":"cap","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"S"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}},{"annotations":[],"default":{"kind":"just","value":""},"name":"service_prefix","serializedName":"service_prefix","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"service","serializedName":"service","typeExpr":{"parameters":[],"typeRef":{"kind":"typeParam","value":"V"}}},{"annotations":[],"default":{"kind":"just","value":""},"name":"name","serializedName":"name","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"token_delivery","serializedName":"token_delivery","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"DeliveryMethod"}}}}],"typeParams":["C","S","V"]}},"version":{"kind":"nothing"}},"moduleName":"common.capability"};

export const snCapabilityApi: ADL.ScopedName = {moduleName:"common.capability", name:"CapabilityApi"};

export function texprCapabilityApi<C, S, V>(texprC : ADL.ATypeExpr<C>, texprS : ADL.ATypeExpr<S>, texprV : ADL.ATypeExpr<V>): ADL.ATypeExpr<CapabilityApi<C, S, V>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.capability",name : "CapabilityApi"}}, parameters : [texprC.value, texprS.value, texprV.value]}};
}

export interface DeliveryMethod_None {
  kind: 'none';
}
export interface DeliveryMethod_Auth_bearer {
  kind: 'auth_bearer';
}
export interface DeliveryMethod_Header {
  kind: 'header';
  value: string;
}

export type DeliveryMethod = DeliveryMethod_None | DeliveryMethod_Auth_bearer | DeliveryMethod_Header;

export interface DeliveryMethodOpts {
  /**
   * don't send the token back to the server
   */
  none: null;
  /**
   * add as an "authorization: Bearer" headder
   */
  auth_bearer: null;
  /**
   * add as a cookie, the provided string in the cookie name
   */
  header: string;
}

export function makeDeliveryMethod<K extends keyof DeliveryMethodOpts>(kind: K, value: DeliveryMethodOpts[K]) { return {kind, value}; }

const DeliveryMethod_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"DeliveryMethod","type_":{"kind":"union_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"don't send the token back to the server\n"}],"default":{"kind":"nothing"},"name":"none","serializedName":"none","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"add as an \"authorization: Bearer\" headder\n"}],"default":{"kind":"nothing"},"name":"auth_bearer","serializedName":"auth_bearer","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"add as a cookie, the provided string in the cookie name\n"}],"default":{"kind":"nothing"},"name":"header","serializedName":"header","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.capability"};

export const snDeliveryMethod: ADL.ScopedName = {moduleName:"common.capability", name:"DeliveryMethod"};

export function texprDeliveryMethod(): ADL.ATypeExpr<DeliveryMethod> {
  return {value : {typeRef : {kind: "reference", value : snDeliveryMethod}, parameters : []}};
}

/**
 * Used to annotation resp struct of branch of resp union which creates a cap.
 * more accurately, since generic types can be used as annotation type, used to create a type alias which is used as the annotation.
 */
export interface CapabilityToken<S> {
  cap: ADL.ATypeExpr<S>;
}

const CapabilityToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Used to annotation resp struct of branch of resp union which creates a cap.\nmore accurately, since generic types can be used as annotation type, used to create a type alias which is used as the annotation.\n"}],"name":"CapabilityToken","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":null},"name":"cap","serializedName":"cap","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"S"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}}],"typeParams":["S"]}},"version":{"kind":"nothing"}},"moduleName":"common.capability"};

export const snCapabilityToken: ADL.ScopedName = {moduleName:"common.capability", name:"CapabilityToken"};

export function texprCapabilityToken<S>(texprS : ADL.ATypeExpr<S>): ADL.ATypeExpr<CapabilityToken<S>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.capability",name : "CapabilityToken"}}, parameters : [texprS.value]}};
}

export interface HttpGet<O> {
  path: string;
  rateLimit: (common_http.HttpRateLimit|null);
  respType: ADL.ATypeExpr<O>;
}

const HttpGet_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"HttpGet","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"path","serializedName":"path","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"rateLimit","serializedName":"rateLimit","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpRateLimit"}}}],"typeRef":{"kind":"primitive","value":"Nullable"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"respType","serializedName":"respType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"O"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}}],"typeParams":["O"]}},"version":{"kind":"nothing"}},"moduleName":"common.capability"};

export const snHttpGet: ADL.ScopedName = {moduleName:"common.capability", name:"HttpGet"};

export function texprHttpGet<O>(texprO : ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpGet<O>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.capability",name : "HttpGet"}}, parameters : [texprO.value]}};
}

export interface HttpPost<I, O> {
  path: string;
  rateLimit: (common_http.HttpRateLimit|null);
  reqType: ADL.ATypeExpr<I>;
  respType: ADL.ATypeExpr<O>;
}

const HttpPost_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"HttpPost","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"path","serializedName":"path","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"rateLimit","serializedName":"rateLimit","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpRateLimit"}}}],"typeRef":{"kind":"primitive","value":"Nullable"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"reqType","serializedName":"reqType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"I"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"respType","serializedName":"respType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"O"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}}],"typeParams":["I","O"]}},"version":{"kind":"nothing"}},"moduleName":"common.capability"};

export const snHttpPost: ADL.ScopedName = {moduleName:"common.capability", name:"HttpPost"};

export function texprHttpPost<I, O>(texprI : ADL.ATypeExpr<I>, texprO : ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpPost<I, O>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.capability",name : "HttpPost"}}, parameters : [texprI.value, texprO.value]}};
}

export interface CapCall<C, P> {
  token: C;
  payload: P;
}

export function makeCapCall<C, P>(
  input: {
    token: C,
    payload: P,
  }
): CapCall<C, P> {
  return {
    token: input.token,
    payload: input.payload,
  };
}

const CapCall_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"CapCall","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"typeParam","value":"C"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"payload","serializedName":"payload","typeExpr":{"parameters":[],"typeRef":{"kind":"typeParam","value":"P"}}}],"typeParams":["C","P"]}},"version":{"kind":"nothing"}},"moduleName":"common.capability"};

export const snCapCall: ADL.ScopedName = {moduleName:"common.capability", name:"CapCall"};

export function texprCapCall<C, P>(texprC : ADL.ATypeExpr<C>, texprP : ADL.ATypeExpr<P>): ADL.ATypeExpr<CapCall<C, P>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.capability",name : "CapCall"}}, parameters : [texprC.value, texprP.value]}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "common.capability.CapabilityApi" : CapabilityApi_AST,
  "common.capability.DeliveryMethod" : DeliveryMethod_AST,
  "common.capability.CapabilityToken" : CapabilityToken_AST,
  "common.capability.HttpGet" : HttpGet_AST,
  "common.capability.HttpPost" : HttpPost_AST,
  "common.capability.CapCall" : CapCall_AST
};
