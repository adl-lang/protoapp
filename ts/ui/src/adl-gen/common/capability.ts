/* @generated from adl module common.capability */

import * as ADL from '@adllang/adl-runtime';
import * as common_http from './http';
import { makeTypeExpr, makeTypeRef } from '../sys/adlast';

/**
 * Used to create a field inside an API struct which represents a section of the api requiring a token.
 * C is the type of the client-side token
 * S is the type of the server-side capability
 * V is the type of the API struct requiring the capability
 */
export interface CapabilityApi<C, S, V> {
  cap_defn: CapabilityDefn<C, S>;
  service_prefix: string;
  service: V;
}

export function makeCapabilityApi<C, S, V>(
  input: {
    cap_defn?: CapabilityDefn<C, S>,
    service_prefix?: string,
    service: V,
  }
): CapabilityApi<C, S, V> {
  return {
    cap_defn: input.cap_defn === undefined ? {
      token: ADL.makeATypeExpr(makeTypeExpr({ typeRef: makeTypeRef("typeParam", "C"), parameters: [] })),
      cap: ADL.makeATypeExpr(makeTypeExpr({ typeRef: makeTypeRef("typeParam", "S"), parameters: [] }))
    } : input.cap_defn,
    service_prefix: input.service_prefix === undefined ? "" : input.service_prefix,
    service: input.service,
  };
}

const CapabilityApi_AST: ADL.ScopedDecl =
  { "decl": { "annotations": [{ "key": { "moduleName": "sys.annotations", "name": "Doc" }, "value": "Used to create a field inside an API struct which represents a section of the api requiring a token.\nC is the type of the client-side token\nS is the type of the server-side capability\nV is the type of the API struct requiring the capability\n" }], "name": "CapabilityApi", "type_": { "kind": "struct_", "value": { "fields": [{ "annotations": [], "default": { "kind": "just", "value": {} }, "name": "cap_defn", "serializedName": "cap_defn", "typeExpr": { "parameters": [{ "parameters": [], "typeRef": { "kind": "typeParam", "value": "C" } }, { "parameters": [], "typeRef": { "kind": "typeParam", "value": "S" } }], "typeRef": { "kind": "reference", "value": { "moduleName": "common.capability", "name": "CapabilityDefn" } } } }, { "annotations": [], "default": { "kind": "just", "value": "" }, "name": "service_prefix", "serializedName": "service_prefix", "typeExpr": { "parameters": [], "typeRef": { "kind": "primitive", "value": "String" } } }, { "annotations": [], "default": { "kind": "nothing" }, "name": "service", "serializedName": "service", "typeExpr": { "parameters": [], "typeRef": { "kind": "typeParam", "value": "V" } } }], "typeParams": ["C", "S", "V"] } }, "version": { "kind": "nothing" } }, "moduleName": "common.capability" };

export const snCapabilityApi: ADL.ScopedName = { moduleName: "common.capability", name: "CapabilityApi" };

export function texprCapabilityApi<C, S, V>(texprC: ADL.ATypeExpr<C>, texprS: ADL.ATypeExpr<S>, texprV: ADL.ATypeExpr<V>): ADL.ATypeExpr<CapabilityApi<C, S, V>> {
  return { value: { typeRef: { kind: "reference", value: { moduleName: "common.capability", name: "CapabilityApi" } }, parameters: [texprC.value, texprS.value, texprV.value] } };
}

/**
 * Used to annotation api field as an api call which creates a cap.
 * more accurately, since generic types can be used as annotation type, used to create a type alias which is used as the annotation.
 */
export interface CapabilityDefn<C, S> {
  token: ADL.ATypeExpr<C>;
  cap: ADL.ATypeExpr<S>;
}

const CapabilityDefn_AST: ADL.ScopedDecl =
  { "decl": { "annotations": [{ "key": { "moduleName": "sys.annotations", "name": "Doc" }, "value": "Used to annotation api field as an api call which creates a cap.\nmore accurately, since generic types can be used as annotation type, used to create a type alias which is used as the annotation.\n" }], "name": "CapabilityDefn", "type_": { "kind": "struct_", "value": { "fields": [{ "annotations": [], "default": { "kind": "just", "value": null }, "name": "token", "serializedName": "token", "typeExpr": { "parameters": [{ "parameters": [], "typeRef": { "kind": "typeParam", "value": "C" } }], "typeRef": { "kind": "primitive", "value": "TypeToken" } } }, { "annotations": [], "default": { "kind": "just", "value": null }, "name": "cap", "serializedName": "cap", "typeExpr": { "parameters": [{ "parameters": [], "typeRef": { "kind": "typeParam", "value": "S" } }], "typeRef": { "kind": "primitive", "value": "TypeToken" } } }], "typeParams": ["C", "S"] } }, "version": { "kind": "nothing" } }, "moduleName": "common.capability" };

export const snCapabilityDefn: ADL.ScopedName = { moduleName: "common.capability", name: "CapabilityDefn" };

export function texprCapabilityDefn<C, S>(texprC: ADL.ATypeExpr<C>, texprS: ADL.ATypeExpr<S>): ADL.ATypeExpr<CapabilityDefn<C, S>> {
  return { value: { typeRef: { kind: "reference", value: { moduleName: "common.capability", name: "CapabilityDefn" } }, parameters: [texprC.value, texprS.value] } };
}

/**
 * Used to annotation resp struct of branch of resp union which creates a cap.
 * more accurately, since generic types can be used as annotation type, used to create a type alias which is used as the annotation.
 */
export interface CapabilityToken<S> {
  cap: ADL.ATypeExpr<S>;
}

const CapabilityToken_AST: ADL.ScopedDecl =
  { "decl": { "annotations": [{ "key": { "moduleName": "sys.annotations", "name": "Doc" }, "value": "Used to annotation resp struct of branch of resp union which creates a cap.\nmore accurately, since generic types can be used as annotation type, used to create a type alias which is used as the annotation.\n" }], "name": "CapabilityToken", "type_": { "kind": "struct_", "value": { "fields": [{ "annotations": [], "default": { "kind": "just", "value": null }, "name": "cap", "serializedName": "cap", "typeExpr": { "parameters": [{ "parameters": [], "typeRef": { "kind": "typeParam", "value": "S" } }], "typeRef": { "kind": "primitive", "value": "TypeToken" } } }], "typeParams": ["S"] } }, "version": { "kind": "nothing" } }, "moduleName": "common.capability" };

export const snCapabilityToken: ADL.ScopedName = { moduleName: "common.capability", name: "CapabilityToken" };

export function texprCapabilityToken<S>(texprS: ADL.ATypeExpr<S>): ADL.ATypeExpr<CapabilityToken<S>> {
  return { value: { typeRef: { kind: "reference", value: { moduleName: "common.capability", name: "CapabilityToken" } }, parameters: [texprS.value] } };
}

export interface HttpGet<O> {
  path: string;
  rateLimit: (common_http.HttpRateLimit | null);
  respType: ADL.ATypeExpr<O>;
}

const HttpGet_AST: ADL.ScopedDecl =
  { "decl": { "annotations": [], "name": "HttpGet", "type_": { "kind": "struct_", "value": { "fields": [{ "annotations": [], "default": { "kind": "nothing" }, "name": "path", "serializedName": "path", "typeExpr": { "parameters": [], "typeRef": { "kind": "primitive", "value": "String" } } }, { "annotations": [], "default": { "kind": "just", "value": null }, "name": "rateLimit", "serializedName": "rateLimit", "typeExpr": { "parameters": [{ "parameters": [], "typeRef": { "kind": "reference", "value": { "moduleName": "common.http", "name": "HttpRateLimit" } } }], "typeRef": { "kind": "primitive", "value": "Nullable" } } }, { "annotations": [], "default": { "kind": "just", "value": null }, "name": "respType", "serializedName": "respType", "typeExpr": { "parameters": [{ "parameters": [], "typeRef": { "kind": "typeParam", "value": "O" } }], "typeRef": { "kind": "primitive", "value": "TypeToken" } } }], "typeParams": ["O"] } }, "version": { "kind": "nothing" } }, "moduleName": "common.capability" };

export const snHttpGet: ADL.ScopedName = { moduleName: "common.capability", name: "HttpGet" };

export function texprHttpGet<O>(texprO: ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpGet<O>> {
  return { value: { typeRef: { kind: "reference", value: { moduleName: "common.capability", name: "HttpGet" } }, parameters: [texprO.value] } };
}

export interface HttpPost<I, O> {
  path: string;
  rateLimit: (common_http.HttpRateLimit | null);
  reqType: ADL.ATypeExpr<I>;
  respType: ADL.ATypeExpr<O>;
}

const HttpPost_AST: ADL.ScopedDecl =
  { "decl": { "annotations": [], "name": "HttpPost", "type_": { "kind": "struct_", "value": { "fields": [{ "annotations": [], "default": { "kind": "nothing" }, "name": "path", "serializedName": "path", "typeExpr": { "parameters": [], "typeRef": { "kind": "primitive", "value": "String" } } }, { "annotations": [], "default": { "kind": "just", "value": null }, "name": "rateLimit", "serializedName": "rateLimit", "typeExpr": { "parameters": [{ "parameters": [], "typeRef": { "kind": "reference", "value": { "moduleName": "common.http", "name": "HttpRateLimit" } } }], "typeRef": { "kind": "primitive", "value": "Nullable" } } }, { "annotations": [], "default": { "kind": "just", "value": null }, "name": "reqType", "serializedName": "reqType", "typeExpr": { "parameters": [{ "parameters": [], "typeRef": { "kind": "typeParam", "value": "I" } }], "typeRef": { "kind": "primitive", "value": "TypeToken" } } }, { "annotations": [], "default": { "kind": "just", "value": null }, "name": "respType", "serializedName": "respType", "typeExpr": { "parameters": [{ "parameters": [], "typeRef": { "kind": "typeParam", "value": "O" } }], "typeRef": { "kind": "primitive", "value": "TypeToken" } } }], "typeParams": ["I", "O"] } }, "version": { "kind": "nothing" } }, "moduleName": "common.capability" };

export const snHttpPost: ADL.ScopedName = { moduleName: "common.capability", name: "HttpPost" };

export function texprHttpPost<I, O>(texprI: ADL.ATypeExpr<I>, texprO: ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpPost<I, O>> {
  return { value: { typeRef: { kind: "reference", value: { moduleName: "common.capability", name: "HttpPost" } }, parameters: [texprI.value, texprO.value] } };
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "common.capability.CapabilityApi": CapabilityApi_AST,
  "common.capability.CapabilityDefn": CapabilityDefn_AST,
  "common.capability.CapabilityToken": CapabilityToken_AST,
  "common.capability.HttpGet": HttpGet_AST,
  "common.capability.HttpPost": HttpPost_AST
};
