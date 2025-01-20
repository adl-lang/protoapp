/* @generated from adl module protoapp.apis.cap */

import * as ADL from '@adllang/adl-runtime';
import * as common_capability from './../../common/capability';
import * as common_http from './../../common/http';
import * as protoapp_apis_types from './types';
import * as protoapp_db from './../db';

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
  {"decl":{"annotations":[],"name":"Capability","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"user_id","serializedName":"user_id","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"roles","serializedName":"roles","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"primitive","value":"Vector"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snCapability: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"Capability"};

export function texprCapability(): ADL.ATypeExpr<Capability> {
  return {value : {typeRef : {kind: "reference", value : snCapability}, parameters : []}};
}

export interface ApiRequests {
  /**
   * AWS default compatible health check
   */
  healthy: common_capability.HttpGet<common_http.Unit>;
  /**
   * Test the server is live
   */
  ping: common_capability.HttpPost<common_http.Unit, common_http.Unit>;
  /**
   * Login a user
   * The response will set an httpOnly cookie containing the refresh token
   */
  login: common_capability.HttpPost<protoapp_apis_types.LoginReq, protoapp_apis_types.LoginResp>;
  /**
   * Get a refreshed token, the refresh token is used to get an access token
   */
  new_refresh: common_capability.HttpPost<protoapp_apis_types.LoginReq, protoapp_apis_types.NewRefreshResp>;
  /**
   * Clear the `refreshToken` cookie.
   */
  logout: common_capability.HttpPost<common_http.Unit, common_http.Unit>;
  a: common_capability.HttpPost<common_http.Unit, A_ApiResp>;
  accessTokenApi: common_capability.CapabilityApi<A_ApiToken, common_http.Unit, A_Api>;
  /**
   * API Endpoint used to refresh the access token
   */
  refreshTokenApi: common_capability.CapabilityApi<protoapp_apis_types.RefreshToken, common_http.Unit, RefreshApiRequests>;
  /**
   * API endpoints accessible when logged in as admin
   */
  userApi: common_capability.CapabilityApi<protoapp_apis_types.AdminAccessToken, Capability, UserApiRequests>;
}

export function makeApiRequests(
  input: {
    healthy?: common_capability.HttpGet<common_http.Unit>,
    ping?: common_capability.HttpPost<common_http.Unit, common_http.Unit>,
    login?: common_capability.HttpPost<protoapp_apis_types.LoginReq, protoapp_apis_types.LoginResp>,
    new_refresh?: common_capability.HttpPost<protoapp_apis_types.LoginReq, protoapp_apis_types.NewRefreshResp>,
    logout?: common_capability.HttpPost<common_http.Unit, common_http.Unit>,
    a?: common_capability.HttpPost<common_http.Unit, A_ApiResp>,
    accessTokenApi?: common_capability.CapabilityApi<A_ApiToken, common_http.Unit, A_Api>,
    refreshTokenApi?: common_capability.CapabilityApi<protoapp_apis_types.RefreshToken, common_http.Unit, RefreshApiRequests>,
    userApi?: common_capability.CapabilityApi<protoapp_apis_types.AdminAccessToken, Capability, UserApiRequests>,
  }
): ApiRequests {
  return {
    healthy: input.healthy === undefined ? {path : "/", rateLimit : null, respType : common_http.texprUnit()} : input.healthy,
    ping: input.ping === undefined ? {path : "/ping", rateLimit : null, reqType : common_http.texprUnit(), respType : common_http.texprUnit()} : input.ping,
    login: input.login === undefined ? {path : "/login", rateLimit : null, reqType : protoapp_apis_types.texprLoginReq(), respType : protoapp_apis_types.texprLoginResp()} : input.login,
    new_refresh: input.new_refresh === undefined ? {path : "/new_refresh", rateLimit : null, reqType : protoapp_apis_types.texprLoginReq(), respType : protoapp_apis_types.texprNewRefreshResp()} : input.new_refresh,
    logout: input.logout === undefined ? {path : "/logout", rateLimit : null, reqType : common_http.texprUnit(), respType : common_http.texprUnit()} : input.logout,
    a: input.a === undefined ? {path : "/a", rateLimit : null, reqType : common_http.texprUnit(), respType : texprA_ApiResp()} : input.a,
    accessTokenApi: input.accessTokenApi === undefined ? {token : texprA_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {b : {path : "/b", rateLimit : null, reqType : texprA_ApiToken(), respType : texprB_ApiResp()}, accessTokenApi : {token : texprA_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {c : {path : "/c", rateLimit : null, reqType : texprB_ApiToken(), respType : texprC_ApiResp()}, accessTokenApi : {token : texprB_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {hello : {path : "/hello", rateLimit : null, reqType : texprC_ApiToken(), respType : ADL.texprString()}}, name : ""}}, name : ""}}, name : ""} : input.accessTokenApi,
    refreshTokenApi: input.refreshTokenApi === undefined ? {token : protoapp_apis_types.texprRefreshToken(), cap : common_http.texprUnit(), service_prefix : "", service : {refresh : {path : "/refresh", rateLimit : null, reqType : protoapp_apis_types.texprCapRefreshReq(), respType : protoapp_apis_types.texprRefreshResp()}, accessTokenApi : {token : protoapp_apis_types.texprAccessToken(), cap : texprCapability(), service_prefix : "", service : {newMessage : {path : "/messages/new", rateLimit : null, reqType : protoapp_apis_types.texprNewMessageReq(), respType : protoapp_db.texprMessageId()}, recentMessages : {path : "/messages/recent", rateLimit : null, reqType : protoapp_apis_types.texprRecentMessagesReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprMessage())}, who_am_i : {path : "/whoami", rateLimit : null, respType : protoapp_apis_types.texprUserWithId()}}, name : "Logged-in API"}}, name : "Refresh Token API"} : input.refreshTokenApi,
    userApi: input.userApi === undefined ? {token : protoapp_apis_types.texprAdminAccessToken(), cap : texprCapability(), service_prefix : "", service : {create_user : {path : "/users/create", rateLimit : null, reqType : protoapp_apis_types.texprUserDetails(), respType : protoapp_db.texprAppUserId()}, update_user : {path : "/users/update", rateLimit : null, reqType : protoapp_apis_types.texprWithId(protoapp_db.texprAppUserId(), protoapp_apis_types.texprUserDetails()), respType : common_http.texprUnit()}, query_users : {path : "/users/query", rateLimit : null, reqType : protoapp_apis_types.texprQueryUsersReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprUserWithId())}}, name : "User Admin API"} : input.userApi,
  };
}

const ApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"ApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"AWS default compatible health check\n"}],"default":{"kind":"just","value":{"path":"/"}},"name":"healthy","serializedName":"healthy","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpGet"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Test the server is live\n"}],"default":{"kind":"just","value":{"path":"/ping"}},"name":"ping","serializedName":"ping","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Login a user\n\nThe response will set an httpOnly cookie containing the refresh token\n"}],"default":{"kind":"just","value":{"path":"/login"}},"name":"login","serializedName":"login","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"LoginReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"LoginResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get a refreshed token, the refresh token is used to get an access token\n"}],"default":{"kind":"just","value":{"path":"/new_refresh"}},"name":"new_refresh","serializedName":"new_refresh","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"LoginReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"NewRefreshResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Clear the `refreshToken` cookie.\n"}],"default":{"kind":"just","value":{"path":"/logout"}},"name":"logout","serializedName":"logout","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{"path":"/a"}},"name":"a","serializedName":"a","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"A_ApiResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{"service":{}}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"A_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"A_Api"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"API Endpoint used to refresh the access token\n"}],"default":{"kind":"just","value":{"name":"Refresh Token API","service":{}}},"name":"refreshTokenApi","serializedName":"refreshTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RefreshToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"RefreshApiRequests"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"API endpoints accessible when logged in as admin\n"}],"default":{"kind":"just","value":{"name":"User Admin API","service":{}}},"name":"userApi","serializedName":"userApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"AdminAccessToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"Capability"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"UserApiRequests"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"ApiRequests"};

export function texprApiRequests(): ADL.ATypeExpr<ApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snApiRequests}, parameters : []}};
}

export interface AccessApiRequests {
  /**
   * Post a message to the noticeboard
   */
  newMessage: common_capability.HttpPost<protoapp_apis_types.NewMessageReq, protoapp_db.MessageId>;
  /**
   * Get recent noticeboard messages
   */
  recentMessages: common_capability.HttpPost<protoapp_apis_types.RecentMessagesReq, protoapp_apis_types.Paginated<protoapp_apis_types.Message>>;
  /**
   * Gets info about the logged in user
   */
  who_am_i: common_capability.HttpGet<protoapp_apis_types.UserWithId>;
}

export function makeAccessApiRequests(
  input: {
    newMessage?: common_capability.HttpPost<protoapp_apis_types.NewMessageReq, protoapp_db.MessageId>,
    recentMessages?: common_capability.HttpPost<protoapp_apis_types.RecentMessagesReq, protoapp_apis_types.Paginated<protoapp_apis_types.Message>>,
    who_am_i?: common_capability.HttpGet<protoapp_apis_types.UserWithId>,
  }
): AccessApiRequests {
  return {
    newMessage: input.newMessage === undefined ? {path : "/messages/new", rateLimit : null, reqType : protoapp_apis_types.texprNewMessageReq(), respType : protoapp_db.texprMessageId()} : input.newMessage,
    recentMessages: input.recentMessages === undefined ? {path : "/messages/recent", rateLimit : null, reqType : protoapp_apis_types.texprRecentMessagesReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprMessage())} : input.recentMessages,
    who_am_i: input.who_am_i === undefined ? {path : "/whoami", rateLimit : null, respType : protoapp_apis_types.texprUserWithId()} : input.who_am_i,
  };
}

const AccessApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"AccessApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Post a message to the noticeboard\n"}],"default":{"kind":"just","value":{"path":"/messages/new"}},"name":"newMessage","serializedName":"newMessage","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"NewMessageReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"MessageId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get recent noticeboard messages\n"}],"default":{"kind":"just","value":{"path":"/messages/recent"}},"name":"recentMessages","serializedName":"recentMessages","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RecentMessagesReq"}}},{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"Message"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"Paginated"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Gets info about the logged in user\n"}],"default":{"kind":"just","value":{"path":"/whoami"}},"name":"who_am_i","serializedName":"who_am_i","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"UserWithId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpGet"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snAccessApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"AccessApiRequests"};

export function texprAccessApiRequests(): ADL.ATypeExpr<AccessApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snAccessApiRequests}, parameters : []}};
}

export interface RefreshApiRequests {
  /**
   * Get a refreshed access token
   * If the refresh token is not provided in the request body, then it will
   * be read from the refreshToken cookie in the request.
   */
  refresh: common_capability.HttpPost<protoapp_apis_types.CapRefreshReq, protoapp_apis_types.RefreshResp>;
  /**
   * API endpoints accessible when logged in
   */
  accessTokenApi: common_capability.CapabilityApi<protoapp_apis_types.AccessToken, Capability, AccessApiRequests>;
}

export function makeRefreshApiRequests(
  input: {
    refresh?: common_capability.HttpPost<protoapp_apis_types.CapRefreshReq, protoapp_apis_types.RefreshResp>,
    accessTokenApi?: common_capability.CapabilityApi<protoapp_apis_types.AccessToken, Capability, AccessApiRequests>,
  }
): RefreshApiRequests {
  return {
    refresh: input.refresh === undefined ? {path : "/refresh", rateLimit : null, reqType : protoapp_apis_types.texprCapRefreshReq(), respType : protoapp_apis_types.texprRefreshResp()} : input.refresh,
    accessTokenApi: input.accessTokenApi === undefined ? {token : protoapp_apis_types.texprAccessToken(), cap : texprCapability(), service_prefix : "", service : {newMessage : {path : "/messages/new", rateLimit : null, reqType : protoapp_apis_types.texprNewMessageReq(), respType : protoapp_db.texprMessageId()}, recentMessages : {path : "/messages/recent", rateLimit : null, reqType : protoapp_apis_types.texprRecentMessagesReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprMessage())}, who_am_i : {path : "/whoami", rateLimit : null, respType : protoapp_apis_types.texprUserWithId()}}, name : "Logged-in API"} : input.accessTokenApi,
  };
}

const RefreshApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"RefreshApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get a refreshed access token\n\nIf the refresh token is not provided in the request body, then it will\nbe read from the refreshToken cookie in the request.\n"}],"default":{"kind":"just","value":{"path":"/refresh"}},"name":"refresh","serializedName":"refresh","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"CapRefreshReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RefreshResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"API endpoints accessible when logged in\n"}],"default":{"kind":"just","value":{"name":"Logged-in API","service":{}}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"AccessToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"Capability"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"AccessApiRequests"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snRefreshApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"RefreshApiRequests"};

export function texprRefreshApiRequests(): ADL.ATypeExpr<RefreshApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snRefreshApiRequests}, parameters : []}};
}

export type A_ApiToken = string;

const A_ApiToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"A_ApiToken","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snA_ApiToken: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"A_ApiToken"};

export function texprA_ApiToken(): ADL.ATypeExpr<A_ApiToken> {
  return {value : {typeRef : {kind: "reference", value : snA_ApiToken}, parameters : []}};
}

export type A_ApiTokenMarker = common_capability.CapabilityToken<A_ApiToken>;

const A_ApiTokenMarker_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"A_ApiTokenMarker","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"A_ApiToken"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityToken"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snA_ApiTokenMarker: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"A_ApiTokenMarker"};

export function texprA_ApiTokenMarker(): ADL.ATypeExpr<A_ApiTokenMarker> {
  return {value : {typeRef : {kind: "reference", value : snA_ApiTokenMarker}, parameters : []}};
}

export type B_ApiToken = string;

const B_ApiToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"B_ApiToken","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snB_ApiToken: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"B_ApiToken"};

export function texprB_ApiToken(): ADL.ATypeExpr<B_ApiToken> {
  return {value : {typeRef : {kind: "reference", value : snB_ApiToken}, parameters : []}};
}

export type B_ApiTokenMarker = common_capability.CapabilityToken<B_ApiToken>;

const B_ApiTokenMarker_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"B_ApiTokenMarker","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"B_ApiToken"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityToken"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snB_ApiTokenMarker: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"B_ApiTokenMarker"};

export function texprB_ApiTokenMarker(): ADL.ATypeExpr<B_ApiTokenMarker> {
  return {value : {typeRef : {kind: "reference", value : snB_ApiTokenMarker}, parameters : []}};
}

export type C_ApiToken = string;

const C_ApiToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"C_ApiToken","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snC_ApiToken: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"C_ApiToken"};

export function texprC_ApiToken(): ADL.ATypeExpr<C_ApiToken> {
  return {value : {typeRef : {kind: "reference", value : snC_ApiToken}, parameters : []}};
}

export type C_ApiTokenMarker = common_capability.CapabilityToken<C_ApiToken>;

const C_ApiTokenMarker_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"C_ApiTokenMarker","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"C_ApiToken"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityToken"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snC_ApiTokenMarker: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"C_ApiTokenMarker"};

export function texprC_ApiTokenMarker(): ADL.ATypeExpr<C_ApiTokenMarker> {
  return {value : {typeRef : {kind: "reference", value : snC_ApiTokenMarker}, parameters : []}};
}

export interface A_Api {
  b: common_capability.HttpPost<A_ApiToken, B_ApiResp>;
  accessTokenApi: common_capability.CapabilityApi<A_ApiToken, common_http.Unit, B_Api>;
}

export function makeA_Api(
  input: {
    b?: common_capability.HttpPost<A_ApiToken, B_ApiResp>,
    accessTokenApi?: common_capability.CapabilityApi<A_ApiToken, common_http.Unit, B_Api>,
  }
): A_Api {
  return {
    b: input.b === undefined ? {path : "/b", rateLimit : null, reqType : texprA_ApiToken(), respType : texprB_ApiResp()} : input.b,
    accessTokenApi: input.accessTokenApi === undefined ? {token : texprA_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {c : {path : "/c", rateLimit : null, reqType : texprB_ApiToken(), respType : texprC_ApiResp()}, accessTokenApi : {token : texprB_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {hello : {path : "/hello", rateLimit : null, reqType : texprC_ApiToken(), respType : ADL.texprString()}}, name : ""}}, name : ""} : input.accessTokenApi,
  };
}

const A_Api_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"A_Api","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":{"path":"/b"}},"name":"b","serializedName":"b","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"A_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"B_ApiResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{"service":{}}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"A_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"B_Api"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snA_Api: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"A_Api"};

export function texprA_Api(): ADL.ATypeExpr<A_Api> {
  return {value : {typeRef : {kind: "reference", value : snA_Api}, parameters : []}};
}

export interface B_Api {
  c: common_capability.HttpPost<B_ApiToken, C_ApiResp>;
  accessTokenApi: common_capability.CapabilityApi<B_ApiToken, common_http.Unit, C_Api>;
}

export function makeB_Api(
  input: {
    c?: common_capability.HttpPost<B_ApiToken, C_ApiResp>,
    accessTokenApi?: common_capability.CapabilityApi<B_ApiToken, common_http.Unit, C_Api>,
  }
): B_Api {
  return {
    c: input.c === undefined ? {path : "/c", rateLimit : null, reqType : texprB_ApiToken(), respType : texprC_ApiResp()} : input.c,
    accessTokenApi: input.accessTokenApi === undefined ? {token : texprB_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {hello : {path : "/hello", rateLimit : null, reqType : texprC_ApiToken(), respType : ADL.texprString()}}, name : ""} : input.accessTokenApi,
  };
}

const B_Api_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"B_Api","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":{"path":"/c"}},"name":"c","serializedName":"c","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"B_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"C_ApiResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{"service":{}}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"B_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"C_Api"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snB_Api: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"B_Api"};

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
  {"decl":{"annotations":[],"name":"C_Api","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":{"path":"/hello"}},"name":"hello","serializedName":"hello","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"C_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snC_Api: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"C_Api"};

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
  {"decl":{"annotations":[],"name":"A_ApiResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[{"key":{"moduleName":"protoapp.apis.cap","name":"A_ApiTokenMarker"},"value":{}}],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snA_ApiResp: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"A_ApiResp"};

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
  {"decl":{"annotations":[],"name":"B_ApiResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[{"key":{"moduleName":"protoapp.apis.cap","name":"B_ApiTokenMarker"},"value":{}}],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snB_ApiResp: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"B_ApiResp"};

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
  {"decl":{"annotations":[],"name":"C_ApiResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[{"key":{"moduleName":"protoapp.apis.cap","name":"C_ApiTokenMarker"},"value":{}}],"default":{"kind":"nothing"},"name":"token","serializedName":"token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snC_ApiResp: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"C_ApiResp"};

export function texprC_ApiResp(): ADL.ATypeExpr<C_ApiResp> {
  return {value : {typeRef : {kind: "reference", value : snC_ApiResp}, parameters : []}};
}

export interface UserApiRequests {
  /**
   * Create a new user
   */
  create_user: common_capability.HttpPost<protoapp_apis_types.UserDetails, protoapp_db.AppUserId>;
  /**
   * Update a user
   */
  update_user: common_capability.HttpPost<protoapp_apis_types.WithId<protoapp_db.AppUserId, protoapp_apis_types.UserDetails>, common_http.Unit>;
  /**
   * Query users
   */
  query_users: common_capability.HttpPost<protoapp_apis_types.QueryUsersReq, protoapp_apis_types.Paginated<protoapp_apis_types.UserWithId>>;
}

export function makeUserApiRequests(
  input: {
    create_user?: common_capability.HttpPost<protoapp_apis_types.UserDetails, protoapp_db.AppUserId>,
    update_user?: common_capability.HttpPost<protoapp_apis_types.WithId<protoapp_db.AppUserId, protoapp_apis_types.UserDetails>, common_http.Unit>,
    query_users?: common_capability.HttpPost<protoapp_apis_types.QueryUsersReq, protoapp_apis_types.Paginated<protoapp_apis_types.UserWithId>>,
  }
): UserApiRequests {
  return {
    create_user: input.create_user === undefined ? {path : "/users/create", rateLimit : null, reqType : protoapp_apis_types.texprUserDetails(), respType : protoapp_db.texprAppUserId()} : input.create_user,
    update_user: input.update_user === undefined ? {path : "/users/update", rateLimit : null, reqType : protoapp_apis_types.texprWithId(protoapp_db.texprAppUserId(), protoapp_apis_types.texprUserDetails()), respType : common_http.texprUnit()} : input.update_user,
    query_users: input.query_users === undefined ? {path : "/users/query", rateLimit : null, reqType : protoapp_apis_types.texprQueryUsersReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprUserWithId())} : input.query_users,
  };
}

const UserApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"UserApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Create a new user\n"}],"default":{"kind":"just","value":{"path":"/users/create"}},"name":"create_user","serializedName":"create_user","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"UserDetails"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Update a user\n"}],"default":{"kind":"just","value":{"path":"/users/update"}},"name":"update_user","serializedName":"update_user","typeExpr":{"parameters":[{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"UserDetails"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"WithId"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Query users\n"}],"default":{"kind":"just","value":{"path":"/users/query"}},"name":"query_users","serializedName":"query_users","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"QueryUsersReq"}}},{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"UserWithId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"Paginated"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snUserApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"UserApiRequests"};

export function texprUserApiRequests(): ADL.ATypeExpr<UserApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snUserApiRequests}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "protoapp.apis.cap.Capability" : Capability_AST,
  "protoapp.apis.cap.ApiRequests" : ApiRequests_AST,
  "protoapp.apis.cap.AccessApiRequests" : AccessApiRequests_AST,
  "protoapp.apis.cap.RefreshApiRequests" : RefreshApiRequests_AST,
  "protoapp.apis.cap.A_ApiToken" : A_ApiToken_AST,
  "protoapp.apis.cap.A_ApiTokenMarker" : A_ApiTokenMarker_AST,
  "protoapp.apis.cap.B_ApiToken" : B_ApiToken_AST,
  "protoapp.apis.cap.B_ApiTokenMarker" : B_ApiTokenMarker_AST,
  "protoapp.apis.cap.C_ApiToken" : C_ApiToken_AST,
  "protoapp.apis.cap.C_ApiTokenMarker" : C_ApiTokenMarker_AST,
  "protoapp.apis.cap.A_Api" : A_Api_AST,
  "protoapp.apis.cap.B_Api" : B_Api_AST,
  "protoapp.apis.cap.C_Api" : C_Api_AST,
  "protoapp.apis.cap.A_ApiResp" : A_ApiResp_AST,
  "protoapp.apis.cap.B_ApiResp" : B_ApiResp_AST,
  "protoapp.apis.cap.C_ApiResp" : C_ApiResp_AST,
  "protoapp.apis.cap.UserApiRequests" : UserApiRequests_AST
};
