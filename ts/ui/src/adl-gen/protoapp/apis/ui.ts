/* @generated from adl module protoapp.apis.ui */

import * as ADL from '@adllang/adl-runtime';
import * as common_http from './../../common/http';
import * as common_strings from './../../common/strings';
import * as common_time from './../../common/time';
import * as protoapp_db from './../db';

export interface ApiRequests {
  /**
   * AWS default compatible health check
   */
  healthy: common_http.HttpGet<common_http.Unit>;
  /**
   * Test the server is live
   */
  ping: common_http.HttpPost<common_http.Unit, common_http.Unit>;
  /**
   * Login a user
   * The response will set an httpOnly cookie containing the refresh token
   */
  login: common_http.HttpPost<LoginReq, LoginResp>;
  /**
   * Get a refreshed access token
   * If the refresh token is not provided in the request body, then it will
   * be read from the refrestToken cookie in the request.
   */
  refresh: common_http.HttpPost<RefreshReq, RefreshResp>;
  /**
   * Clear the `refreshToken` cookie.
   */
  logout: common_http.HttpPost<common_http.Unit, common_http.Unit>;
  /**
   * Post a message to the noticeboard
   */
  newMessage: common_http.HttpPost<NewMessageReq, protoapp_db.MessageId>;
  /**
   * Get recent noticeboard messages
   */
  recentMessages: common_http.HttpPost<RecentMessagesReq, Paginated<Message>>;
  /**
   * Gets the logged in user details
   */
  whoAmI: common_http.HttpGet<UserProfile>;
}

export function makeApiRequests(
  input: {
    healthy?: common_http.HttpGet<common_http.Unit>,
    ping?: common_http.HttpPost<common_http.Unit, common_http.Unit>,
    login?: common_http.HttpPost<LoginReq, LoginResp>,
    refresh?: common_http.HttpPost<RefreshReq, RefreshResp>,
    logout?: common_http.HttpPost<common_http.Unit, common_http.Unit>,
    newMessage?: common_http.HttpPost<NewMessageReq, protoapp_db.MessageId>,
    recentMessages?: common_http.HttpPost<RecentMessagesReq, Paginated<Message>>,
    whoAmI?: common_http.HttpGet<UserProfile>,
  }
): ApiRequests {
  return {
    healthy: input.healthy === undefined ? {path : "/", security : {kind : "public"}, rateLimit : null, respType : common_http.texprUnit()} : input.healthy,
    ping: input.ping === undefined ? {path : "/ping", security : {kind : "public"}, rateLimit : null, reqType : common_http.texprUnit(), respType : common_http.texprUnit()} : input.ping,
    login: input.login === undefined ? {path : "/login", security : {kind : "public"}, rateLimit : null, reqType : texprLoginReq(), respType : texprLoginResp()} : input.login,
    refresh: input.refresh === undefined ? {path : "/refresh", security : {kind : "public"}, rateLimit : null, reqType : texprRefreshReq(), respType : texprRefreshResp()} : input.refresh,
    logout: input.logout === undefined ? {path : "/logout", security : {kind : "public"}, rateLimit : null, reqType : common_http.texprUnit(), respType : common_http.texprUnit()} : input.logout,
    newMessage: input.newMessage === undefined ? {path : "/messages/new", security : {kind : "token"}, rateLimit : null, reqType : texprNewMessageReq(), respType : protoapp_db.texprMessageId()} : input.newMessage,
    recentMessages: input.recentMessages === undefined ? {path : "/messages/recent", security : {kind : "token"}, rateLimit : null, reqType : texprRecentMessagesReq(), respType : texprPaginated(texprMessage())} : input.recentMessages,
    whoAmI: input.whoAmI === undefined ? {path : "/whoami", security : {kind : "token"}, rateLimit : null, respType : texprUserProfile()} : input.whoAmI,
  };
}

const ApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"ApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"AWS default compatible health check\n"}],"default":{"kind":"just","value":{"path":"/","security":"public"}},"name":"healthy","serializedName":"healthy","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpGet"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Test the server is live\n"}],"default":{"kind":"just","value":{"path":"/ping","security":"public"}},"name":"ping","serializedName":"ping","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Login a user\n\nThe response will set an httpOnly cookie containing the refresh token\n"}],"default":{"kind":"just","value":{"path":"/login","security":"public"}},"name":"login","serializedName":"login","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"LoginReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"LoginResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get a refreshed access token\n\nIf the refresh token is not provided in the request body, then it will\nbe read from the refrestToken cookie in the request.\n"}],"default":{"kind":"just","value":{"path":"/refresh","security":"public"}},"name":"refresh","serializedName":"refresh","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"RefreshReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"RefreshResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Clear the `refreshToken` cookie.\n"}],"default":{"kind":"just","value":{"path":"/logout","security":"public"}},"name":"logout","serializedName":"logout","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Post a message to the noticeboard\n"}],"default":{"kind":"just","value":{"path":"/messages/new","security":"token"}},"name":"newMessage","serializedName":"newMessage","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"NewMessageReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"MessageId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get recent noticeboard messages\n"}],"default":{"kind":"just","value":{"path":"/messages/recent","security":"token"}},"name":"recentMessages","serializedName":"recentMessages","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"RecentMessagesReq"}}},{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"Message"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"Paginated"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Gets the logged in user details\n"}],"default":{"kind":"just","value":{"path":"/whoami","security":"token"}},"name":"whoAmI","serializedName":"whoAmI","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"UserProfile"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpGet"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"ApiRequests"};

export function texprApiRequests(): ADL.ATypeExpr<ApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snApiRequests}, parameters : []}};
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
  {"decl":{"annotations":[],"name":"LoginReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"email","serializedName":"email","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"password","serializedName":"password","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"Password"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snLoginReq: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"LoginReq"};

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
  {"decl":{"annotations":[],"name":"LoginResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"tokens","serializedName":"tokens","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"LoginTokens"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"invalid_credentials","serializedName":"invalid_credentials","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snLoginResp: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"LoginResp"};

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
  {"decl":{"annotations":[],"name":"RefreshReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":null},"name":"refresh_token","serializedName":"refresh_token","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}],"typeRef":{"kind":"primitive","value":"Nullable"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snRefreshReq: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"RefreshReq"};

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
  {"decl":{"annotations":[],"name":"RefreshResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"access_token","serializedName":"access_token","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"invalid_refresh_token","serializedName":"invalid_refresh_token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snRefreshResp: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"RefreshResp"};

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
  {"decl":{"annotations":[],"name":"LoginTokens","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"access_jwt","serializedName":"access_jwt","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"refresh_jwt","serializedName":"refresh_jwt","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snLoginTokens: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"LoginTokens"};

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
  {"decl":{"annotations":[],"name":"NewMessageReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"message","serializedName":"message","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringML"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snNewMessageReq: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"NewMessageReq"};

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
  {"decl":{"annotations":[],"name":"RecentMessagesReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":0},"name":"offset","serializedName":"offset","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word32"}}},{"annotations":[],"default":{"kind":"just","value":20},"name":"limit","serializedName":"limit","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word32"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snRecentMessagesReq: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"RecentMessagesReq"};

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
  {"decl":{"annotations":[],"name":"Message","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"id","serializedName":"id","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"MessageId"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"posted_at","serializedName":"posted_at","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.time","name":"Instant"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"user_fullname","serializedName":"user_fullname","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"message","serializedName":"message","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringML"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snMessage: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"Message"};

export function texprMessage(): ADL.ATypeExpr<Message> {
  return {value : {typeRef : {kind: "reference", value : snMessage}, parameters : []}};
}

export interface UserProfile {
  id: protoapp_db.AppUserId;
  fullname: string;
  email: string;
  is_admin: boolean;
}

export function makeUserProfile(
  input: {
    id: protoapp_db.AppUserId,
    fullname: string,
    email: string,
    is_admin: boolean,
  }
): UserProfile {
  return {
    id: input.id,
    fullname: input.fullname,
    email: input.email,
    is_admin: input.is_admin,
  };
}

const UserProfile_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"UserProfile","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"id","serializedName":"id","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"fullname","serializedName":"fullname","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"email","serializedName":"email","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"is_admin","serializedName":"is_admin","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Bool"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snUserProfile: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"UserProfile"};

export function texprUserProfile(): ADL.ATypeExpr<UserProfile> {
  return {value : {typeRef : {kind: "reference", value : snUserProfile}, parameters : []}};
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
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A holder for paginated results\n"}],"name":"Paginated","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The paginated items\n"}],"default":{"kind":"nothing"},"name":"items","serializedName":"items","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"T"}}],"typeRef":{"kind":"primitive","value":"Vector"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The offset used for this query\n"}],"default":{"kind":"nothing"},"name":"current_offset","serializedName":"current_offset","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word32"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The size of the entire date set\n"}],"default":{"kind":"nothing"},"name":"total_count","serializedName":"total_count","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word32"}}}],"typeParams":["T"]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snPaginated: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"Paginated"};

export function texprPaginated<T>(texprT : ADL.ATypeExpr<T>): ADL.ATypeExpr<Paginated<T>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "protoapp.apis.ui",name : "Paginated"}}, parameters : [texprT.value]}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "protoapp.apis.ui.ApiRequests" : ApiRequests_AST,
  "protoapp.apis.ui.LoginReq" : LoginReq_AST,
  "protoapp.apis.ui.LoginResp" : LoginResp_AST,
  "protoapp.apis.ui.RefreshReq" : RefreshReq_AST,
  "protoapp.apis.ui.RefreshResp" : RefreshResp_AST,
  "protoapp.apis.ui.LoginTokens" : LoginTokens_AST,
  "protoapp.apis.ui.NewMessageReq" : NewMessageReq_AST,
  "protoapp.apis.ui.RecentMessagesReq" : RecentMessagesReq_AST,
  "protoapp.apis.ui.Message" : Message_AST,
  "protoapp.apis.ui.UserProfile" : UserProfile_AST,
  "protoapp.apis.ui.Paginated" : Paginated_AST
};
