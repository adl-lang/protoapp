/* @generated from adl module protoapp.apis.cap */

import * as ADL from '@adllang/adl-runtime';
import * as common_capability from './../../common/capability';
import * as common_http from './../../common/http';
import * as common_strings from './../../common/strings';
import * as common_time from './../../common/time';
import * as protoapp_db from './../db';

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
  login: common_capability.HttpPost<LoginReq, LoginResp>;
  /**
   * Clear the `refreshToken` cookie.
   */
  logout: common_capability.HttpPost<common_http.Unit, common_http.Unit>;
  /**
   * Enpoints requiring an AccessToken
   */
  accessTokenApi: common_capability.CapabilityApi<AccessToken, Capability, AccessApiRequests>;
  /**
   * Enpoints requiring a RefreshToken
   * This is a simple refresh model, hence the Unit as the S type.
   * If a more complex model (eg. with user blacklisting) was required the S payload would be different
   */
  refreshTokenApi: common_capability.CapabilityApi<RefreshToken, common_http.Unit, RefreshApiRequests>;
  /**
   * Enpoints requiring a User
   */
  userApi: common_capability.CapabilityApi<AdminAccessToken, Capability, UserApiRequests>;
}

export function makeApiRequests(
  input: {
    healthy?: common_capability.HttpGet<common_http.Unit>,
    ping?: common_capability.HttpPost<common_http.Unit, common_http.Unit>,
    login?: common_capability.HttpPost<LoginReq, LoginResp>,
    logout?: common_capability.HttpPost<common_http.Unit, common_http.Unit>,
    accessTokenApi?: common_capability.CapabilityApi<AccessToken, Capability, AccessApiRequests>,
    refreshTokenApi?: common_capability.CapabilityApi<RefreshToken, common_http.Unit, RefreshApiRequests>,
    userApi?: common_capability.CapabilityApi<AdminAccessToken, Capability, UserApiRequests>,
  }
): ApiRequests {
  return {
    healthy: input.healthy === undefined ? {path : "/", rateLimit : null, respType : common_http.texprUnit()} : input.healthy,
    ping: input.ping === undefined ? {path : "/ping", rateLimit : null, reqType : common_http.texprUnit(), respType : common_http.texprUnit()} : input.ping,
    login: input.login === undefined ? {path : "/login", rateLimit : null, reqType : texprLoginReq(), respType : texprLoginResp()} : input.login,
    logout: input.logout === undefined ? {path : "/logout", rateLimit : null, reqType : common_http.texprUnit(), respType : common_http.texprUnit()} : input.logout,
    accessTokenApi: input.accessTokenApi === undefined ? {cap_defn : {token : texprAccessToken(), cap : texprCapability()}, service_prefix : "", service : {newMessage : {path : "/messages/new", rateLimit : null, reqType : texprNewMessageReq(), respType : protoapp_db.texprMessageId()}, recentMessages : {path : "/messages/recent", rateLimit : null, reqType : texprRecentMessagesReq(), respType : texprPaginated(texprMessage())}, who_am_i : {path : "/whoami", rateLimit : null, respType : texprUserWithId()}}} : input.accessTokenApi,
    refreshTokenApi: input.refreshTokenApi === undefined ? {cap_defn : {token : texprRefreshToken(), cap : common_http.texprUnit()}, service_prefix : "", service : {refresh : {path : "/refresh", rateLimit : null, reqType : texprRefreshReq(), respType : texprRefreshResp()}}} : input.refreshTokenApi,
    userApi: input.userApi === undefined ? {cap_defn : {token : texprAdminAccessToken(), cap : texprCapability()}, service_prefix : "", service : {create_user : {path : "/users/create", rateLimit : null, reqType : texprUserDetails(), respType : protoapp_db.texprAppUserId()}, update_user : {path : "/users/update", rateLimit : null, reqType : texprWithId(protoapp_db.texprAppUserId(), texprUserDetails()), respType : common_http.texprUnit()}, query_users : {path : "/users/query", rateLimit : null, reqType : texprQueryUsersReq(), respType : texprPaginated(texprUserWithId())}}} : input.userApi,
  };
}

const ApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"ApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"AWS default compatible health check\n"}],"default":{"kind":"just","value":{"path":"/"}},"name":"healthy","serializedName":"healthy","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpGet"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Test the server is live\n"}],"default":{"kind":"just","value":{"path":"/ping"}},"name":"ping","serializedName":"ping","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Login a user\n\nThe response will set an httpOnly cookie containing the refresh token\n"}],"default":{"kind":"just","value":{"path":"/login"}},"name":"login","serializedName":"login","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"LoginReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"LoginResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Clear the `refreshToken` cookie.\n"}],"default":{"kind":"just","value":{"path":"/logout"}},"name":"logout","serializedName":"logout","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Enpoints requiring an AccessToken\n"}],"default":{"kind":"just","value":{"service":{}}},"name":"accessTokenApi","serializedName":"accessTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"AccessToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"Capability"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"AccessApiRequests"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Enpoints requiring a RefreshToken\n\nThis is a simple refresh model, hence the Unit as the S type.\nIf a more complex model (eg. with user blacklisting) was required the S payload would be different\n"}],"default":{"kind":"just","value":{"service":{}}},"name":"refreshTokenApi","serializedName":"refreshTokenApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"RefreshToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"RefreshApiRequests"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Enpoints requiring a User\n"}],"default":{"kind":"just","value":{"service":{}}},"name":"userApi","serializedName":"userApi","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"AdminAccessToken"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"Capability"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"UserApiRequests"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"CapabilityApi"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"ApiRequests"};

export function texprApiRequests(): ADL.ATypeExpr<ApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snApiRequests}, parameters : []}};
}

export interface AccessApiRequests {
  /**
   * Post a message to the noticeboard
   */
  newMessage: common_capability.HttpPost<NewMessageReq, protoapp_db.MessageId>;
  /**
   * Get recent noticeboard messages
   */
  recentMessages: common_capability.HttpPost<RecentMessagesReq, Paginated<Message>>;
  /**
   * Gets info about the logged in user
   */
  who_am_i: common_capability.HttpGet<UserWithId>;
}

export function makeAccessApiRequests(
  input: {
    newMessage?: common_capability.HttpPost<NewMessageReq, protoapp_db.MessageId>,
    recentMessages?: common_capability.HttpPost<RecentMessagesReq, Paginated<Message>>,
    who_am_i?: common_capability.HttpGet<UserWithId>,
  }
): AccessApiRequests {
  return {
    newMessage: input.newMessage === undefined ? {path : "/messages/new", rateLimit : null, reqType : texprNewMessageReq(), respType : protoapp_db.texprMessageId()} : input.newMessage,
    recentMessages: input.recentMessages === undefined ? {path : "/messages/recent", rateLimit : null, reqType : texprRecentMessagesReq(), respType : texprPaginated(texprMessage())} : input.recentMessages,
    who_am_i: input.who_am_i === undefined ? {path : "/whoami", rateLimit : null, respType : texprUserWithId()} : input.who_am_i,
  };
}

const AccessApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"AccessApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Post a message to the noticeboard\n"}],"default":{"kind":"just","value":{"path":"/messages/new"}},"name":"newMessage","serializedName":"newMessage","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"NewMessageReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"MessageId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get recent noticeboard messages\n"}],"default":{"kind":"just","value":{"path":"/messages/recent"}},"name":"recentMessages","serializedName":"recentMessages","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"RecentMessagesReq"}}},{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"Message"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"Paginated"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Gets info about the logged in user\n"}],"default":{"kind":"just","value":{"path":"/whoami"}},"name":"who_am_i","serializedName":"who_am_i","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"UserWithId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpGet"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snAccessApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"AccessApiRequests"};

export function texprAccessApiRequests(): ADL.ATypeExpr<AccessApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snAccessApiRequests}, parameters : []}};
}

export interface RefreshApiRequests {
  /**
   * Get a refreshed access token
   * If the refresh token is not provided in the request body, then it will
   * be read from the refrestToken cookie in the request.
   */
  refresh: common_capability.HttpPost<RefreshReq, RefreshResp>;
}

export function makeRefreshApiRequests(
  input: {
    refresh?: common_capability.HttpPost<RefreshReq, RefreshResp>,
  }
): RefreshApiRequests {
  return {
    refresh: input.refresh === undefined ? {path : "/refresh", rateLimit : null, reqType : texprRefreshReq(), respType : texprRefreshResp()} : input.refresh,
  };
}

const RefreshApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"RefreshApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get a refreshed access token\n\nIf the refresh token is not provided in the request body, then it will\nbe read from the refrestToken cookie in the request.\n"}],"default":{"kind":"just","value":{"path":"/refresh"}},"name":"refresh","serializedName":"refresh","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"RefreshReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"RefreshResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snRefreshApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"RefreshApiRequests"};

export function texprRefreshApiRequests(): ADL.ATypeExpr<RefreshApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snRefreshApiRequests}, parameters : []}};
}

export interface UserApiRequests {
  /**
   * Create a new user
   */
  create_user: common_capability.HttpPost<UserDetails, protoapp_db.AppUserId>;
  /**
   * Update a user
   */
  update_user: common_capability.HttpPost<WithId<protoapp_db.AppUserId, UserDetails>, common_http.Unit>;
  /**
   * Query users
   */
  query_users: common_capability.HttpPost<QueryUsersReq, Paginated<UserWithId>>;
}

export function makeUserApiRequests(
  input: {
    create_user?: common_capability.HttpPost<UserDetails, protoapp_db.AppUserId>,
    update_user?: common_capability.HttpPost<WithId<protoapp_db.AppUserId, UserDetails>, common_http.Unit>,
    query_users?: common_capability.HttpPost<QueryUsersReq, Paginated<UserWithId>>,
  }
): UserApiRequests {
  return {
    create_user: input.create_user === undefined ? {path : "/users/create", rateLimit : null, reqType : texprUserDetails(), respType : protoapp_db.texprAppUserId()} : input.create_user,
    update_user: input.update_user === undefined ? {path : "/users/update", rateLimit : null, reqType : texprWithId(protoapp_db.texprAppUserId(), texprUserDetails()), respType : common_http.texprUnit()} : input.update_user,
    query_users: input.query_users === undefined ? {path : "/users/query", rateLimit : null, reqType : texprQueryUsersReq(), respType : texprPaginated(texprUserWithId())} : input.query_users,
  };
}

const UserApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"UserApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Create a new user\n"}],"default":{"kind":"just","value":{"path":"/users/create"}},"name":"create_user","serializedName":"create_user","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"UserDetails"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Update a user\n"}],"default":{"kind":"just","value":{"path":"/users/update"}},"name":"update_user","serializedName":"update_user","typeExpr":{"parameters":[{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"UserDetails"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"WithId"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Query users\n"}],"default":{"kind":"just","value":{"path":"/users/query"}},"name":"query_users","serializedName":"query_users","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"QueryUsersReq"}}},{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"UserWithId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"Paginated"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.capability","name":"HttpPost"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snUserApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"UserApiRequests"};

export function texprUserApiRequests(): ADL.ATypeExpr<UserApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snUserApiRequests}, parameters : []}};
}

export type AccessToken = common_strings.StringNE;

const AccessToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"AccessToken","type_":{"kind":"newtype_","value":{"default":{"kind":"nothing"},"typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snAccessToken: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"AccessToken"};

export function texprAccessToken(): ADL.ATypeExpr<AccessToken> {
  return {value : {typeRef : {kind: "reference", value : snAccessToken}, parameters : []}};
}

export type RefreshToken = common_strings.StringNE;

const RefreshToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"RefreshToken","type_":{"kind":"newtype_","value":{"default":{"kind":"nothing"},"typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snRefreshToken: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"RefreshToken"};

export function texprRefreshToken(): ADL.ATypeExpr<RefreshToken> {
  return {value : {typeRef : {kind: "reference", value : snRefreshToken}, parameters : []}};
}

export type AdminAccessToken = common_strings.StringNE;

const AdminAccessToken_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"AdminAccessToken","type_":{"kind":"newtype_","value":{"default":{"kind":"nothing"},"typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snAdminAccessToken: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"AdminAccessToken"};

export function texprAdminAccessToken(): ADL.ATypeExpr<AdminAccessToken> {
  return {value : {typeRef : {kind: "reference", value : snAdminAccessToken}, parameters : []}};
}

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

export interface LoginReq {
  email: common_strings.StringNE;
  password: common_strings.Password;
}

export function makeLoginReq(
  input: {
    email: common_strings.StringNE,
    password: common_strings.Password,
  }
): LoginReq {
  return {
    email: input.email,
    password: input.password,
  };
}

const LoginReq_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"LoginReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"email","serializedName":"email","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"password","serializedName":"password","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"Password"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snLoginReq: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"LoginReq"};

export function texprLoginReq(): ADL.ATypeExpr<LoginReq> {
  return {value : {typeRef : {kind: "reference", value : snLoginReq}, parameters : []}};
}

export interface LoginResp_Tokens {
  kind: 'tokens';
  value: LoginTokens;
}
export interface LoginResp_Invalid_credentials {
  kind: 'invalid_credentials';
}

export type LoginResp = LoginResp_Tokens | LoginResp_Invalid_credentials;

export interface LoginRespOpts {
  tokens: LoginTokens;
  invalid_credentials: null;
}

export function makeLoginResp<K extends keyof LoginRespOpts>(kind: K, value: LoginRespOpts[K]) { return {kind, value}; }

const LoginResp_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"LoginResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"tokens","serializedName":"tokens","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"LoginTokens"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"invalid_credentials","serializedName":"invalid_credentials","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snLoginResp: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"LoginResp"};

export function texprLoginResp(): ADL.ATypeExpr<LoginResp> {
  return {value : {typeRef : {kind: "reference", value : snLoginResp}, parameters : []}};
}

export interface RefreshReq {
  refresh_token: (common_strings.StringNE|null);
}

export function makeRefreshReq(
  input: {
    refresh_token?: (common_strings.StringNE|null),
  }
): RefreshReq {
  return {
    refresh_token: input.refresh_token === undefined ? null : input.refresh_token,
  };
}

const RefreshReq_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"RefreshReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":null},"name":"refresh_token","serializedName":"refresh_token","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}],"typeRef":{"kind":"primitive","value":"Nullable"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snRefreshReq: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"RefreshReq"};

export function texprRefreshReq(): ADL.ATypeExpr<RefreshReq> {
  return {value : {typeRef : {kind: "reference", value : snRefreshReq}, parameters : []}};
}

export interface RefreshResp_Access_token {
  kind: 'access_token';
  value: common_strings.StringNE;
}
export interface RefreshResp_Invalid_refresh_token {
  kind: 'invalid_refresh_token';
}

export type RefreshResp = RefreshResp_Access_token | RefreshResp_Invalid_refresh_token;

export interface RefreshRespOpts {
  access_token: common_strings.StringNE;
  invalid_refresh_token: null;
}

export function makeRefreshResp<K extends keyof RefreshRespOpts>(kind: K, value: RefreshRespOpts[K]) { return {kind, value}; }

const RefreshResp_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"RefreshResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"access_token","serializedName":"access_token","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"invalid_refresh_token","serializedName":"invalid_refresh_token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snRefreshResp: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"RefreshResp"};

export function texprRefreshResp(): ADL.ATypeExpr<RefreshResp> {
  return {value : {typeRef : {kind: "reference", value : snRefreshResp}, parameters : []}};
}

export interface LoginTokens {
  access_jwt: common_strings.StringNE;
  refresh_jwt: common_strings.StringNE;
}

export function makeLoginTokens(
  input: {
    access_jwt: common_strings.StringNE,
    refresh_jwt: common_strings.StringNE,
  }
): LoginTokens {
  return {
    access_jwt: input.access_jwt,
    refresh_jwt: input.refresh_jwt,
  };
}

const LoginTokens_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"LoginTokens","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"access_jwt","serializedName":"access_jwt","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"refresh_jwt","serializedName":"refresh_jwt","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snLoginTokens: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"LoginTokens"};

export function texprLoginTokens(): ADL.ATypeExpr<LoginTokens> {
  return {value : {typeRef : {kind: "reference", value : snLoginTokens}, parameters : []}};
}

export interface NewMessageReq {
  message: common_strings.StringML;
}

export function makeNewMessageReq(
  input: {
    message: common_strings.StringML,
  }
): NewMessageReq {
  return {
    message: input.message,
  };
}

const NewMessageReq_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"NewMessageReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"message","serializedName":"message","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringML"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snNewMessageReq: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"NewMessageReq"};

export function texprNewMessageReq(): ADL.ATypeExpr<NewMessageReq> {
  return {value : {typeRef : {kind: "reference", value : snNewMessageReq}, parameters : []}};
}

export interface RecentMessagesReq {
  offset: number;
  limit: number;
}

export function makeRecentMessagesReq(
  input: {
    offset?: number,
    limit?: number,
  }
): RecentMessagesReq {
  return {
    offset: input.offset === undefined ? 0 : input.offset,
    limit: input.limit === undefined ? 20 : input.limit,
  };
}

const RecentMessagesReq_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"RecentMessagesReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":0},"name":"offset","serializedName":"offset","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word32"}}},{"annotations":[],"default":{"kind":"just","value":20},"name":"limit","serializedName":"limit","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word32"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snRecentMessagesReq: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"RecentMessagesReq"};

export function texprRecentMessagesReq(): ADL.ATypeExpr<RecentMessagesReq> {
  return {value : {typeRef : {kind: "reference", value : snRecentMessagesReq}, parameters : []}};
}

export interface Message {
  id: protoapp_db.MessageId;
  posted_at: common_time.Instant;
  user_fullname: string;
  message: common_strings.StringML;
}

export function makeMessage(
  input: {
    id: protoapp_db.MessageId,
    posted_at: common_time.Instant,
    user_fullname: string,
    message: common_strings.StringML,
  }
): Message {
  return {
    id: input.id,
    posted_at: input.posted_at,
    user_fullname: input.user_fullname,
    message: input.message,
  };
}

const Message_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"Message","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"id","serializedName":"id","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"MessageId"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"posted_at","serializedName":"posted_at","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.time","name":"Instant"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"user_fullname","serializedName":"user_fullname","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"message","serializedName":"message","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringML"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snMessage: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"Message"};

export function texprMessage(): ADL.ATypeExpr<Message> {
  return {value : {typeRef : {kind: "reference", value : snMessage}, parameters : []}};
}

export interface QueryUsersReq {
  page: PageReq;
}

export function makeQueryUsersReq(
  input: {
    page?: PageReq,
  }
): QueryUsersReq {
  return {
    page: input.page === undefined ? {offset : 0, limit : 20} : input.page,
  };
}

const QueryUsersReq_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"QueryUsersReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":{}},"name":"page","serializedName":"page","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"PageReq"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snQueryUsersReq: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"QueryUsersReq"};

export function texprQueryUsersReq(): ADL.ATypeExpr<QueryUsersReq> {
  return {value : {typeRef : {kind: "reference", value : snQueryUsersReq}, parameters : []}};
}

export interface User {
  fullname: common_strings.StringNE;
  email: common_strings.EmailAddress;
  is_admin: boolean;
}

export function makeUser(
  input: {
    fullname: common_strings.StringNE,
    email: common_strings.EmailAddress,
    is_admin: boolean,
  }
): User {
  return {
    fullname: input.fullname,
    email: input.email,
    is_admin: input.is_admin,
  };
}

const User_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"User","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"fullname","serializedName":"fullname","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"email","serializedName":"email","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"EmailAddress"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"is_admin","serializedName":"is_admin","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Bool"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snUser: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"User"};

export function texprUser(): ADL.ATypeExpr<User> {
  return {value : {typeRef : {kind: "reference", value : snUser}, parameters : []}};
}

export type UserWithId = WithId<protoapp_db.AppUserId, User>;

const UserWithId_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"UserWithId","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"User"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.cap","name":"WithId"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snUserWithId: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"UserWithId"};

export function texprUserWithId(): ADL.ATypeExpr<UserWithId> {
  return {value : {typeRef : {kind: "reference", value : snUserWithId}, parameters : []}};
}

export interface UserDetails {
  fullname: common_strings.StringNE;
  email: common_strings.EmailAddress;
  is_admin: boolean;
  password: common_strings.Password;
}

export function makeUserDetails(
  input: {
    fullname: common_strings.StringNE,
    email: common_strings.EmailAddress,
    is_admin: boolean,
    password: common_strings.Password,
  }
): UserDetails {
  return {
    fullname: input.fullname,
    email: input.email,
    is_admin: input.is_admin,
    password: input.password,
  };
}

const UserDetails_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"UserDetails","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"fullname","serializedName":"fullname","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"email","serializedName":"email","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"EmailAddress"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"is_admin","serializedName":"is_admin","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Bool"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"password","serializedName":"password","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"Password"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snUserDetails: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"UserDetails"};

export function texprUserDetails(): ADL.ATypeExpr<UserDetails> {
  return {value : {typeRef : {kind: "reference", value : snUserDetails}, parameters : []}};
}

export interface WithId<I, T> {
  id: I;
  value: T;
}

export function makeWithId<I, T>(
  input: {
    id: I,
    value: T,
  }
): WithId<I, T> {
  return {
    id: input.id,
    value: input.value,
  };
}

const WithId_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"WithId","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"id","serializedName":"id","typeExpr":{"parameters":[],"typeRef":{"kind":"typeParam","value":"I"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"value","serializedName":"value","typeExpr":{"parameters":[],"typeRef":{"kind":"typeParam","value":"T"}}}],"typeParams":["I","T"]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snWithId: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"WithId"};

export function texprWithId<I, T>(texprI : ADL.ATypeExpr<I>, texprT : ADL.ATypeExpr<T>): ADL.ATypeExpr<WithId<I, T>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "protoapp.apis.cap",name : "WithId"}}, parameters : [texprI.value, texprT.value]}};
}

export interface PageReq {
  offset: number;
  limit: number;
}

export function makePageReq(
  input: {
    offset?: number,
    limit?: number,
  }
): PageReq {
  return {
    offset: input.offset === undefined ? 0 : input.offset,
    limit: input.limit === undefined ? 20 : input.limit,
  };
}

const PageReq_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"PageReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":0},"name":"offset","serializedName":"offset","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word64"}}},{"annotations":[],"default":{"kind":"just","value":20},"name":"limit","serializedName":"limit","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word64"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snPageReq: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"PageReq"};

export function texprPageReq(): ADL.ATypeExpr<PageReq> {
  return {value : {typeRef : {kind: "reference", value : snPageReq}, parameters : []}};
}

/**
 * A holder for paginated results
 */
export interface Paginated<T> {
  /**
   * The paginated items
   */
  items: T[];
  /**
   * The offset used for this query
   */
  current_offset: number;
  /**
   * The size of the entire date set
   */
  total_count: number;
}

export function makePaginated<T>(
  input: {
    items: T[],
    current_offset: number,
    total_count: number,
  }
): Paginated<T> {
  return {
    items: input.items,
    current_offset: input.current_offset,
    total_count: input.total_count,
  };
}

const Paginated_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A holder for paginated results\n"}],"name":"Paginated","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The paginated items\n"}],"default":{"kind":"nothing"},"name":"items","serializedName":"items","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"T"}}],"typeRef":{"kind":"primitive","value":"Vector"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The offset used for this query\n"}],"default":{"kind":"nothing"},"name":"current_offset","serializedName":"current_offset","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word32"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The size of the entire date set\n"}],"default":{"kind":"nothing"},"name":"total_count","serializedName":"total_count","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word32"}}}],"typeParams":["T"]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.cap"};

export const snPaginated: ADL.ScopedName = {moduleName:"protoapp.apis.cap", name:"Paginated"};

export function texprPaginated<T>(texprT : ADL.ATypeExpr<T>): ADL.ATypeExpr<Paginated<T>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "protoapp.apis.cap",name : "Paginated"}}, parameters : [texprT.value]}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "protoapp.apis.cap.ApiRequests" : ApiRequests_AST,
  "protoapp.apis.cap.AccessApiRequests" : AccessApiRequests_AST,
  "protoapp.apis.cap.RefreshApiRequests" : RefreshApiRequests_AST,
  "protoapp.apis.cap.UserApiRequests" : UserApiRequests_AST,
  "protoapp.apis.cap.AccessToken" : AccessToken_AST,
  "protoapp.apis.cap.RefreshToken" : RefreshToken_AST,
  "protoapp.apis.cap.AdminAccessToken" : AdminAccessToken_AST,
  "protoapp.apis.cap.Capability" : Capability_AST,
  "protoapp.apis.cap.LoginReq" : LoginReq_AST,
  "protoapp.apis.cap.LoginResp" : LoginResp_AST,
  "protoapp.apis.cap.RefreshReq" : RefreshReq_AST,
  "protoapp.apis.cap.RefreshResp" : RefreshResp_AST,
  "protoapp.apis.cap.LoginTokens" : LoginTokens_AST,
  "protoapp.apis.cap.NewMessageReq" : NewMessageReq_AST,
  "protoapp.apis.cap.RecentMessagesReq" : RecentMessagesReq_AST,
  "protoapp.apis.cap.Message" : Message_AST,
  "protoapp.apis.cap.QueryUsersReq" : QueryUsersReq_AST,
  "protoapp.apis.cap.User" : User_AST,
  "protoapp.apis.cap.UserWithId" : UserWithId_AST,
  "protoapp.apis.cap.UserDetails" : UserDetails_AST,
  "protoapp.apis.cap.WithId" : WithId_AST,
  "protoapp.apis.cap.PageReq" : PageReq_AST,
  "protoapp.apis.cap.Paginated" : Paginated_AST
};
