/* @generated from adl module protoapp.apis.cap */

import * as ADL from '@adllang/adl-runtime';
import * as common_capability from './../../common/capability';
import * as common_http from './../../common/http';
import * as protoapp_apis_captest from './captest';
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
  a: common_capability.HttpPost<common_http.Unit, protoapp_apis_captest.A_ApiResp>;
  accessTokenApi: common_capability.CapabilityApi<protoapp_apis_captest.A_ApiToken, common_http.Unit, protoapp_apis_captest.A_Api>;
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
    a?: common_capability.HttpPost<common_http.Unit, protoapp_apis_captest.A_ApiResp>,
    accessTokenApi?: common_capability.CapabilityApi<protoapp_apis_captest.A_ApiToken, common_http.Unit, protoapp_apis_captest.A_Api>,
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
    a: input.a === undefined ? {path : "/a", rateLimit : null, reqType : common_http.texprUnit(), respType : protoapp_apis_captest.texprA_ApiResp()} : input.a,
    accessTokenApi: input.accessTokenApi === undefined ? {token : protoapp_apis_captest.texprA_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {b : {path : "/b", rateLimit : null, reqType : protoapp_apis_captest.texprA_ApiToken(), respType : protoapp_apis_captest.texprB_ApiResp()}, accessTokenApi : {token : protoapp_apis_captest.texprB_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {c : {path : "/c", rateLimit : null, reqType : protoapp_apis_captest.texprB_ApiToken(), respType : protoapp_apis_captest.texprC_ApiResp()}, accessTokenApi : {token : protoapp_apis_captest.texprC_ApiToken(), cap : common_http.texprUnit(), service_prefix : "", service : {hello : {path : "/hello", rateLimit : null, reqType : protoapp_apis_captest.texprC_ApiToken(), respType : ADL.texprString()}}, name : "", token_delivery : {kind : "cookie", value : "c_cookie"}}}, name : "", token_delivery : {kind : "cookie", value : "b_cookie"}}}, name : "", token_delivery : {kind : "cookie", value : "a_cookie"}} : input.accessTokenApi,
    refreshTokenApi: input.refreshTokenApi === undefined ? {token : protoapp_apis_types.texprRefreshToken(), cap : common_http.texprUnit(), service_prefix : "", service : {refresh : {path : "/refresh", rateLimit : null, reqType : protoapp_apis_types.texprRefreshReq(), respType : protoapp_apis_types.texprRefreshResp()}, accessTokenApi : {token : protoapp_apis_types.texprAccessToken(), cap : texprCapability(), service_prefix : "", service : {newMessage : {path : "/messages/new", rateLimit : null, reqType : protoapp_apis_types.texprNewMessageReq(), respType : protoapp_db.texprMessageId()}, recentMessages : {path : "/messages/recent", rateLimit : null, reqType : protoapp_apis_types.texprRecentMessagesReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprMessage())}, who_am_i : {path : "/whoami", rateLimit : null, respType : protoapp_apis_types.texprUserWithId()}}, name : "Logged-in API", token_delivery : {kind : "bearer"}}}, name : "Refresh Token API", token_delivery : {kind : "cookie", value : "refreshToken"}} : input.refreshTokenApi,
    userApi: input.userApi === undefined ? {token : protoapp_apis_types.texprAdminAccessToken(), cap : texprCapability(), service_prefix : "", service : {create_user : {path : "/users/create", rateLimit : null, reqType : protoapp_apis_types.texprUserDetails(), respType : protoapp_db.texprAppUserId()}, update_user : {path : "/users/update", rateLimit : null, reqType : protoapp_apis_types.texprWithId(protoapp_db.texprAppUserId(), protoapp_apis_types.texprUserDetails()), respType : common_http.texprUnit()}, query_users : {path : "/users/query", rateLimit : null, reqType : protoapp_apis_types.texprQueryUsersReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprUserWithId())}}, name : "User Admin API", token_delivery : {kind : "bearer"}} : input.userApi,
  };
}

const ApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"ApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"AWS default compatible health check\n"}],"default":{"kind":"just","value":{"path":"/"}},"name":"healthy","serializedName":"healthy","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpGet"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Test the server is live\n"}],"default":{"kind":"just","value":{"path":"/ping"}},"name":"ping","serializedName":"ping","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Login a user\n\nThe response will set an httpOnly cookie containing the refresh token\n"}],"default":{"kind":"just","value":{"path":"/login"}},"name":"login","serializedName":"login","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"LoginReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"LoginResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get a refreshed token, the refresh token is used to get an access token\n"}],"default":{"kind":"just","value":{"path":"/new_refresh"}},"name":"new_refresh","serializedName":"new_refresh","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"LoginReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"NewRefreshResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Clear the `refreshToken` cookie.\n"}],"default":{"kind":"just","value":{"path":"/logout"}},"name":"logout","serializedName":"logout","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{"path":"/a"}},"name":"a","serializedName":"a","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"A_ApiResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{"service":{},"token_delivery":{"cookie":"a_cookie"}}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"A_ApiToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.captest","name":"A_Api"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"API Endpoint used to refresh the access token\n"}],"default":{"kind":"just","value":{"name":"Refresh Token API","service":{},"token_delivery":{"cookie":"refreshToken"}}},"name":"refreshTokenApi","serializedName":"refreshTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RefreshToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"RefreshApiRequests"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"API endpoints accessible when logged in as admin\n"}],"default":{"kind":"just","value":{"name":"User Admin API","service":{},"token_delivery":"bearer"}},"name":"userApi","serializedName":"userApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"AdminAccessToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"Capability"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"UserApiRequests"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

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
  refresh: common_capability.HttpPost<protoapp_apis_types.RefreshReq, protoapp_apis_types.RefreshResp>;
  /**
   * API endpoints accessible when logged in
   */
  accessTokenApi: common_capability.CapabilityApi<protoapp_apis_types.AccessToken, Capability, AccessApiRequests>;
}

export function makeRefreshApiRequests(
  input: {
    refresh?: common_capability.HttpPost<protoapp_apis_types.RefreshReq, protoapp_apis_types.RefreshResp>,
    accessTokenApi?: common_capability.CapabilityApi<protoapp_apis_types.AccessToken, Capability, AccessApiRequests>,
  }
): RefreshApiRequests {
  return {
    refresh: input.refresh === undefined ? {path : "/refresh", rateLimit : null, reqType : protoapp_apis_types.texprRefreshReq(), respType : protoapp_apis_types.texprRefreshResp()} : input.refresh,
    accessTokenApi: input.accessTokenApi === undefined ? {token : protoapp_apis_types.texprAccessToken(), cap : texprCapability(), service_prefix : "", service : {newMessage : {path : "/messages/new", rateLimit : null, reqType : protoapp_apis_types.texprNewMessageReq(), respType : protoapp_db.texprMessageId()}, recentMessages : {path : "/messages/recent", rateLimit : null, reqType : protoapp_apis_types.texprRecentMessagesReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprMessage())}, who_am_i : {path : "/whoami", rateLimit : null, respType : protoapp_apis_types.texprUserWithId()}}, name : "Logged-in API", token_delivery : {kind : "bearer"}} : input.accessTokenApi,
  };
}

const RefreshApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"RefreshApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get a refreshed access token\n\nIf the refresh token is not provided in the request body, then it will\nbe read from the refreshToken cookie in the request.\n"}],"default":{"kind":"just","value":{"path":"/refresh"}},"name":"refresh","serializedName":"refresh","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RefreshReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RefreshResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"API endpoints accessible when logged in\n"}],"default":{"kind":"just","value":{"name":"Logged-in API","service":{},"token_delivery":"bearer"}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"AccessToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"Capability"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"AccessApiRequests"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snRefreshApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"RefreshApiRequests"};

export function texprRefreshApiRequests(): ADL.ATypeExpr<RefreshApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snRefreshApiRequests}, parameters : []}};
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
  "protoapp.apis.cap.UserApiRequests" : UserApiRequests_AST
};
