/* @generated from adl module protoapp.apis.ui */

import * as ADL from '@adllang/adl-runtime';
import * as common_http from './../../common/http';
import * as protoapp_apis_types from './types';
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
  login: common_http.HttpPost<protoapp_apis_types.LoginReq, protoapp_apis_types.LoginResp>;
  /**
   * Get a refreshed access token
   * If the refresh token is not provided in the request body, then it will
   * be read from the refrestToken cookie in the request.
   */
  refresh: common_http.HttpPost<protoapp_apis_types.RefreshReq, protoapp_apis_types.RefreshResp>;
  /**
   * Clear the `refreshToken` cookie.
   */
  logout: common_http.HttpPost<common_http.Unit, common_http.Unit>;
  /**
   * Post a message to the noticeboard
   */
  new_message: common_http.HttpPost<protoapp_apis_types.NewMessageReq, protoapp_db.MessageId>;
  /**
   * Get recent noticeboard messages
   */
  recent_messages: common_http.HttpPost<protoapp_apis_types.RecentMessagesReq, protoapp_apis_types.Paginated<protoapp_apis_types.Message>>;
  message_api: MessageApi;
  /**
   * Gets info about the logged in user
   */
  who_am_i: common_http.HttpGet<protoapp_apis_types.UserWithId>;
  /**
   * Create a new user
   */
  create_user: common_http.HttpPost<protoapp_apis_types.UserDetails, protoapp_db.AppUserId>;
  /**
   * Update a user
   */
  update_user: common_http.HttpPost<protoapp_apis_types.WithId<protoapp_db.AppUserId, protoapp_apis_types.UserDetails>, common_http.Unit>;
  /**
   * Query users
   */
  query_users: common_http.HttpPost<protoapp_apis_types.QueryUsersReq, protoapp_apis_types.Paginated<protoapp_apis_types.UserWithId>>;
}

export function makeApiRequests(
  input: {
    healthy?: common_http.HttpGet<common_http.Unit>,
    ping?: common_http.HttpPost<common_http.Unit, common_http.Unit>,
    login?: common_http.HttpPost<protoapp_apis_types.LoginReq, protoapp_apis_types.LoginResp>,
    refresh?: common_http.HttpPost<protoapp_apis_types.RefreshReq, protoapp_apis_types.RefreshResp>,
    logout?: common_http.HttpPost<common_http.Unit, common_http.Unit>,
    new_message?: common_http.HttpPost<protoapp_apis_types.NewMessageReq, protoapp_db.MessageId>,
    recent_messages?: common_http.HttpPost<protoapp_apis_types.RecentMessagesReq, protoapp_apis_types.Paginated<protoapp_apis_types.Message>>,
    message_api?: MessageApi,
    who_am_i?: common_http.HttpGet<protoapp_apis_types.UserWithId>,
    create_user?: common_http.HttpPost<protoapp_apis_types.UserDetails, protoapp_db.AppUserId>,
    update_user?: common_http.HttpPost<protoapp_apis_types.WithId<protoapp_db.AppUserId, protoapp_apis_types.UserDetails>, common_http.Unit>,
    query_users?: common_http.HttpPost<protoapp_apis_types.QueryUsersReq, protoapp_apis_types.Paginated<protoapp_apis_types.UserWithId>>,
  }
): ApiRequests {
  return {
    healthy: input.healthy === undefined ? {path : "/", security : {kind : "public"}, rateLimit : null, respType : common_http.texprUnit()} : input.healthy,
    ping: input.ping === undefined ? {path : "/ping", security : {kind : "public"}, rateLimit : null, reqType : common_http.texprUnit(), respType : common_http.texprUnit()} : input.ping,
    login: input.login === undefined ? {path : "/login", security : {kind : "public"}, rateLimit : null, reqType : protoapp_apis_types.texprLoginReq(), respType : protoapp_apis_types.texprLoginResp()} : input.login,
    refresh: input.refresh === undefined ? {path : "/refresh", security : {kind : "public"}, rateLimit : null, reqType : protoapp_apis_types.texprRefreshReq(), respType : protoapp_apis_types.texprRefreshResp()} : input.refresh,
    logout: input.logout === undefined ? {path : "/logout", security : {kind : "public"}, rateLimit : null, reqType : common_http.texprUnit(), respType : common_http.texprUnit()} : input.logout,
    new_message: input.new_message === undefined ? {path : "/messages/new", security : {kind : "token"}, rateLimit : null, reqType : protoapp_apis_types.texprNewMessageReq(), respType : protoapp_db.texprMessageId()} : input.new_message,
    recent_messages: input.recent_messages === undefined ? {path : "/messages/recent", security : {kind : "token"}, rateLimit : null, reqType : protoapp_apis_types.texprRecentMessagesReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprMessage())} : input.recent_messages,
    message_api: input.message_api === undefined ? {new_message : {path : "/messages/new", security : {kind : "token"}, rateLimit : null, reqType : protoapp_apis_types.texprNewMessageReq(), respType : protoapp_db.texprMessageId()}, recent_messages : {path : "/messages/recent", security : {kind : "token"}, rateLimit : null, reqType : protoapp_apis_types.texprRecentMessagesReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprMessage())}} : input.message_api,
    who_am_i: input.who_am_i === undefined ? {path : "/whoami", security : {kind : "token"}, rateLimit : null, respType : protoapp_apis_types.texprUserWithId()} : input.who_am_i,
    create_user: input.create_user === undefined ? {path : "/users/create", security : {kind : "tokenWithRole", value : "admin"}, rateLimit : null, reqType : protoapp_apis_types.texprUserDetails(), respType : protoapp_db.texprAppUserId()} : input.create_user,
    update_user: input.update_user === undefined ? {path : "/users/update", security : {kind : "tokenWithRole", value : "admin"}, rateLimit : null, reqType : protoapp_apis_types.texprWithId(protoapp_db.texprAppUserId(), protoapp_apis_types.texprUserDetails()), respType : common_http.texprUnit()} : input.update_user,
    query_users: input.query_users === undefined ? {path : "/users/query", security : {kind : "tokenWithRole", value : "admin"}, rateLimit : null, reqType : protoapp_apis_types.texprQueryUsersReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprUserWithId())} : input.query_users,
  };
}

const ApiRequests_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"ApiRequests","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"AWS default compatible health check\n"}],"default":{"kind":"just","value":{"path":"/","security":"public"}},"name":"healthy","serializedName":"healthy","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpGet"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Test the server is live\n"}],"default":{"kind":"just","value":{"path":"/ping","security":"public"}},"name":"ping","serializedName":"ping","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Login a user\n\nThe response will set an httpOnly cookie containing the refresh token\n"}],"default":{"kind":"just","value":{"path":"/login","security":"public"}},"name":"login","serializedName":"login","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"LoginReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"LoginResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get a refreshed access token\n\nIf the refresh token is not provided in the request body, then it will\nbe read from the refrestToken cookie in the request.\n"}],"default":{"kind":"just","value":{"path":"/refresh","security":"public"}},"name":"refresh","serializedName":"refresh","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RefreshReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RefreshResp"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Clear the `refreshToken` cookie.\n"}],"default":{"kind":"just","value":{"path":"/logout","security":"public"}},"name":"logout","serializedName":"logout","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Post a message to the noticeboard\n"}],"default":{"kind":"just","value":{"path":"/messages/new","security":"token"}},"name":"new_message","serializedName":"new_message","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"NewMessageReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"MessageId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get recent noticeboard messages\n"}],"default":{"kind":"just","value":{"path":"/messages/recent","security":"token"}},"name":"recent_messages","serializedName":"recent_messages","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RecentMessagesReq"}}},{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"Message"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"Paginated"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[],"default":{"kind":"just","value":{}},"name":"message_api","serializedName":"message_api","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.ui","name":"MessageApi"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Gets info about the logged in user\n"}],"default":{"kind":"just","value":{"path":"/whoami","security":"token"}},"name":"who_am_i","serializedName":"who_am_i","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"UserWithId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpGet"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Create a new user\n"}],"default":{"kind":"just","value":{"path":"/users/create","security":{"tokenWithRole":"admin"}}},"name":"create_user","serializedName":"create_user","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"UserDetails"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Update a user\n"}],"default":{"kind":"just","value":{"path":"/users/update","security":{"tokenWithRole":"admin"}}},"name":"update_user","serializedName":"update_user","typeExpr":{"parameters":[{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"UserDetails"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"WithId"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"Unit"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Query users\n"}],"default":{"kind":"just","value":{"path":"/users/query","security":{"tokenWithRole":"admin"}}},"name":"query_users","serializedName":"query_users","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"QueryUsersReq"}}},{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"UserWithId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"Paginated"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snApiRequests: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"ApiRequests"};

export function texprApiRequests(): ADL.ATypeExpr<ApiRequests> {
  return {value : {typeRef : {kind: "reference", value : snApiRequests}, parameters : []}};
}

export interface MessageApi {
  /**
   * Post a message to the noticeboard
   */
  new_message: common_http.HttpPost<protoapp_apis_types.NewMessageReq, protoapp_db.MessageId>;
  /**
   * Get recent noticeboard messages
   */
  recent_messages: common_http.HttpPost<protoapp_apis_types.RecentMessagesReq, protoapp_apis_types.Paginated<protoapp_apis_types.Message>>;
}

export function makeMessageApi(
  input: {
    new_message?: common_http.HttpPost<protoapp_apis_types.NewMessageReq, protoapp_db.MessageId>,
    recent_messages?: common_http.HttpPost<protoapp_apis_types.RecentMessagesReq, protoapp_apis_types.Paginated<protoapp_apis_types.Message>>,
  }
): MessageApi {
  return {
    new_message: input.new_message === undefined ? {path : "/messages/new", security : {kind : "token"}, rateLimit : null, reqType : protoapp_apis_types.texprNewMessageReq(), respType : protoapp_db.texprMessageId()} : input.new_message,
    recent_messages: input.recent_messages === undefined ? {path : "/messages/recent", security : {kind : "token"}, rateLimit : null, reqType : protoapp_apis_types.texprRecentMessagesReq(), respType : protoapp_apis_types.texprPaginated(protoapp_apis_types.texprMessage())} : input.recent_messages,
  };
}

const MessageApi_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"MessageApi","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Post a message to the noticeboard\n"}],"default":{"kind":"just","value":{"path":"/messages/new","security":"token"}},"name":"new_message","serializedName":"new_message","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"NewMessageReq"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"MessageId"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Get recent noticeboard messages\n"}],"default":{"kind":"just","value":{"path":"/messages/recent","security":"token"}},"name":"recent_messages","serializedName":"recent_messages","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"RecentMessagesReq"}}},{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"Message"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"Paginated"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.http","name":"HttpPost"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.ui"};

export const snMessageApi: ADL.ScopedName = {moduleName:"protoapp.apis.ui", name:"MessageApi"};

export function texprMessageApi(): ADL.ATypeExpr<MessageApi> {
  return {value : {typeRef : {kind: "reference", value : snMessageApi}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "protoapp.apis.ui.ApiRequests" : ApiRequests_AST,
  "protoapp.apis.ui.MessageApi" : MessageApi_AST
};
