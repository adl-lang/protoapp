/* @generated from adl module common.http */

import * as ADL from '@adllang/adl-runtime';

/**
 * Request types
 * An API is a struct whose fields are HttpReq values. Everything about an
 * endpoint other than its request and response types is an annotation on the
 * field rather than a value in this struct: the http path, the method and the
 * security policy. Those are facts about the declaration, so every backend
 * that consumes an API can read them from the ADL itself, and the rust
 * `HttpApi` derive can read them at macro expansion time and vary the code it
 * generates. Every backend must agree on them: the rust server, the
 * typescript client and the api workbench.
 */
export interface HttpReq<I, O> {
  reqType: ADL.ATypeExpr<I>;
  respType: ADL.ATypeExpr<O>;
}

const HttpReq_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Request types\nAn API is a struct whose fields are HttpReq values. Everything about an\nendpoint other than its request and response types is an annotation on the\nfield rather than a value in this struct: the http path, the method and the\nsecurity policy. Those are facts about the declaration, so every backend\nthat consumes an API can read them from the ADL itself, and the rust\n`HttpApi` derive can read them at macro expansion time and vary the code it\ngenerates. Every backend must agree on them: the rust server, the\ntypescript client and the api workbench.\n"}],"name":"HttpReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":null},"name":"reqType","serializedName":"reqType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"I"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}},{"annotations":[],"default":{"kind":"just","value":null},"name":"respType","serializedName":"respType","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"O"}}],"typeRef":{"kind":"primitive","value":"TypeToken"}}}],"typeParams":["I","O"]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpReq: ADL.ScopedName = {moduleName:"common.http", name:"HttpReq"};

export function texprHttpReq<I, O>(texprI : ADL.ATypeExpr<I>, texprO : ADL.ATypeExpr<O>): ADL.ATypeExpr<HttpReq<I, O>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.http",name : "HttpReq"}}, parameters : [texprI.value, texprO.value]}};
}

export type HttpMethod = 'get' | 'post';
export const valuesHttpMethod : HttpMethod[] = ['get', 'post'];

const HttpMethod_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The http method of an endpoint, as an annotation on the HttpReq field:\n\n    @HttpMethod \"get\"\n    HttpReq<RecentMessagesReq, Paginated<Message>> recent_messages = {};\n\nAnnotating the api struct instead sets the default for all of its own\nendpoints, which a field annotation then overrides. The default does not\nreach a nested api: that is a separate declaration, and one that may be\nnested at more than one field, so what it means cannot depend on where it\nis mounted.\n\nRequests are post when neither annotation is present. If a given request:\n    - is side-effect free\n    - has a body I small enough to fit encoded in the URI\none can set the method to \"get\", eg to allow CDN caching etc.\n"}],"name":"HttpMethod","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"get","serializedName":"get","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"post","serializedName":"post","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

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

/**
 * The security policy of an endpoint, as an annotation on the HttpReq field:
 *     @HttpSecurity "token"
 *     HttpReq<NewMessageReq, MessageId> new_message = {};
 *     @HttpSecurity { "tokenWithRole": "admin" }
 *     HttpReq<UserDetails, AppUserId> create_user = {};
 * Annotating the api struct instead sets the policy for all of its own
 * endpoints, which a field annotation then overrides. An api whose whole
 * surface shares a policy says so once rather than repeating it, and in the
 * tokenWithRole case that also means the role name appears once. As with the
 * method, the default does not reach a nested api.
 * Beyond that there is no default. An endpoint that resolves to no policy is
 * an error, not a public endpoint: a policy that silently fell back to
 * "public" would be the worst possible failure mode. The rust `HttpApi`
 * derive refuses to compile such a declaration, and the typescript endpoint
 * walk throws.
 */
export type HttpSecurity = HttpSecurity_Public | HttpSecurity_Token | HttpSecurity_TokenWithRole;

export interface HttpSecurityOpts {
  public: null;
  token: null;
  tokenWithRole: string;
}

export function makeHttpSecurity<K extends keyof HttpSecurityOpts>(kind: K, value: HttpSecurityOpts[K]) { return {kind, value}; }

const HttpSecurity_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The security policy of an endpoint, as an annotation on the HttpReq field:\n\n    @HttpSecurity \"token\"\n    HttpReq<NewMessageReq, MessageId> new_message = {};\n\n    @HttpSecurity { \"tokenWithRole\": \"admin\" }\n    HttpReq<UserDetails, AppUserId> create_user = {};\n\nAnnotating the api struct instead sets the policy for all of its own\nendpoints, which a field annotation then overrides. An api whose whole\nsurface shares a policy says so once rather than repeating it, and in the\ntokenWithRole case that also means the role name appears once. As with the\nmethod, the default does not reach a nested api.\n\nBeyond that there is no default. An endpoint that resolves to no policy is\nan error, not a public endpoint: a policy that silently fell back to\n\"public\" would be the worst possible failure mode. The rust `HttpApi`\nderive refuses to compile such a declaration, and the typescript endpoint\nwalk throws.\n"}],"name":"HttpSecurity","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"public","serializedName":"public","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"tokenWithRole","serializedName":"tokenWithRole","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpSecurity: ADL.ScopedName = {moduleName:"common.http", name:"HttpSecurity"};

export function texprHttpSecurity(): ADL.ATypeExpr<HttpSecurity> {
  return {value : {typeRef : {kind: "reference", value : snHttpSecurity}, parameters : []}};
}

/**
 * Overrides the HTTP path of an endpoint, which otherwise derives from the
 * field name as "/" ++ the field name.
 * Annotate the HttpReq field, not its type:
 *     @HttpPath "/"
 *     HttpReq<Void,Void> healthy = {};
 * The value is used verbatim, so it carries its own leading slash. This is
 * the only way to reach a path an ADL field name cannot spell, such as the
 * root path, a kebab cased one, or one with more than one segment, and the
 * way to pin a path that something outside the application dictates.
 */
export type HttpPath = string;

const HttpPath_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Overrides the HTTP path of an endpoint, which otherwise derives from the\nfield name as \"/\" ++ the field name.\n\nAnnotate the HttpReq field, not its type:\n\n    @HttpPath \"/\"\n    HttpReq<Void,Void> healthy = {};\n\nThe value is used verbatim, so it carries its own leading slash. This is\nthe only way to reach a path an ADL field name cannot spell, such as the\nroot path, a kebab cased one, or one with more than one segment, and the\nway to pin a path that something outside the application dictates.\n"}],"name":"HttpPath","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.http"};

export const snHttpPath: ADL.ScopedName = {moduleName:"common.http", name:"HttpPath"};

export function texprHttpPath(): ADL.ATypeExpr<HttpPath> {
  return {value : {typeRef : {kind: "reference", value : snHttpPath}, parameters : []}};
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
  "common.http.HttpPath" : HttpPath_AST,
  "common.http.Unit" : Unit_AST
};
