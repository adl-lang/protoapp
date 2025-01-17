/* @generated from adl module protoapp.apis.types */

import * as ADL from '@adllang/adl-runtime';
import * as common_strings from './../../common/strings';
import * as common_time from './../../common/time';
import * as protoapp_db from './../db';

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
  {"decl":{"annotations":[],"name":"LoginReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"email","serializedName":"email","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"password","serializedName":"password","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"Password"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snLoginReq: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"LoginReq"};

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
  {"decl":{"annotations":[],"name":"LoginResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"tokens","serializedName":"tokens","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"LoginTokens"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"invalid_credentials","serializedName":"invalid_credentials","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snLoginResp: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"LoginResp"};

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
  {"decl":{"annotations":[],"name":"RefreshReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":null},"name":"refresh_token","serializedName":"refresh_token","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}],"typeRef":{"kind":"primitive","value":"Nullable"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snRefreshReq: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"RefreshReq"};

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
  {"decl":{"annotations":[],"name":"RefreshResp","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"access_token","serializedName":"access_token","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"invalid_refresh_token","serializedName":"invalid_refresh_token","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snRefreshResp: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"RefreshResp"};

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
  {"decl":{"annotations":[],"name":"LoginTokens","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"access_jwt","serializedName":"access_jwt","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"refresh_jwt","serializedName":"refresh_jwt","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snLoginTokens: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"LoginTokens"};

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
  {"decl":{"annotations":[],"name":"NewMessageReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"message","serializedName":"message","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringML"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snNewMessageReq: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"NewMessageReq"};

export function texprNewMessageReq(): ADL.ATypeExpr<NewMessageReq> {
  return {value : {typeRef : {kind: "reference", value : snNewMessageReq}, parameters : []}};
}

export interface RecentMessagesReq {
  page: PageReq;
}

export function makeRecentMessagesReq(
  input: {
    page: PageReq,
  }
): RecentMessagesReq {
  return {
    page: input.page,
  };
}

const RecentMessagesReq_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"RecentMessagesReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"page","serializedName":"page","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"PageReq"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snRecentMessagesReq: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"RecentMessagesReq"};

export function texprRecentMessagesReq(): ADL.ATypeExpr<RecentMessagesReq> {
  return {value : {typeRef : {kind: "reference", value : snRecentMessagesReq}, parameters : []}};
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
  {"decl":{"annotations":[],"name":"PageReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":0},"name":"offset","serializedName":"offset","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word64"}}},{"annotations":[],"default":{"kind":"just","value":20},"name":"limit","serializedName":"limit","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word64"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snPageReq: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"PageReq"};

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
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A holder for paginated results\n"}],"name":"Paginated","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The paginated items\n"}],"default":{"kind":"nothing"},"name":"items","serializedName":"items","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"typeParam","value":"T"}}],"typeRef":{"kind":"primitive","value":"Vector"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The offset used for this query\n"}],"default":{"kind":"nothing"},"name":"current_offset","serializedName":"current_offset","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word64"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The size of the entire date set\n"}],"default":{"kind":"nothing"},"name":"total_count","serializedName":"total_count","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Word64"}}}],"typeParams":["T"]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snPaginated: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"Paginated"};

export function texprPaginated<T>(texprT : ADL.ATypeExpr<T>): ADL.ATypeExpr<Paginated<T>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "protoapp.apis.types",name : "Paginated"}}, parameters : [texprT.value]}};
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
  {"decl":{"annotations":[],"name":"Message","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"id","serializedName":"id","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"MessageId"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"posted_at","serializedName":"posted_at","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.time","name":"Instant"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"user_fullname","serializedName":"user_fullname","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"message","serializedName":"message","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringML"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snMessage: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"Message"};

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
  {"decl":{"annotations":[],"name":"QueryUsersReq","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":{}},"name":"page","serializedName":"page","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"PageReq"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snQueryUsersReq: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"QueryUsersReq"};

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
  {"decl":{"annotations":[],"name":"User","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"fullname","serializedName":"fullname","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"email","serializedName":"email","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"EmailAddress"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"is_admin","serializedName":"is_admin","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Bool"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snUser: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"User"};

export function texprUser(): ADL.ATypeExpr<User> {
  return {value : {typeRef : {kind: "reference", value : snUser}, parameters : []}};
}

export type UserWithId = WithId<protoapp_db.AppUserId, User>;

const UserWithId_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"UserWithId","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}},{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"User"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.apis.types","name":"WithId"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snUserWithId: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"UserWithId"};

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
  {"decl":{"annotations":[],"name":"UserDetails","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"fullname","serializedName":"fullname","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"email","serializedName":"email","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"EmailAddress"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"is_admin","serializedName":"is_admin","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Bool"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"password","serializedName":"password","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"Password"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snUserDetails: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"UserDetails"};

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
  {"decl":{"annotations":[],"name":"WithId","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"id","serializedName":"id","typeExpr":{"parameters":[],"typeRef":{"kind":"typeParam","value":"I"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"value","serializedName":"value","typeExpr":{"parameters":[],"typeRef":{"kind":"typeParam","value":"T"}}}],"typeParams":["I","T"]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.apis.types"};

export const snWithId: ADL.ScopedName = {moduleName:"protoapp.apis.types", name:"WithId"};

export function texprWithId<I, T>(texprI : ADL.ATypeExpr<I>, texprT : ADL.ATypeExpr<T>): ADL.ATypeExpr<WithId<I, T>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "protoapp.apis.types",name : "WithId"}}, parameters : [texprI.value, texprT.value]}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "protoapp.apis.types.LoginReq" : LoginReq_AST,
  "protoapp.apis.types.LoginResp" : LoginResp_AST,
  "protoapp.apis.types.RefreshReq" : RefreshReq_AST,
  "protoapp.apis.types.RefreshResp" : RefreshResp_AST,
  "protoapp.apis.types.LoginTokens" : LoginTokens_AST,
  "protoapp.apis.types.NewMessageReq" : NewMessageReq_AST,
  "protoapp.apis.types.RecentMessagesReq" : RecentMessagesReq_AST,
  "protoapp.apis.types.PageReq" : PageReq_AST,
  "protoapp.apis.types.Paginated" : Paginated_AST,
  "protoapp.apis.types.Message" : Message_AST,
  "protoapp.apis.types.QueryUsersReq" : QueryUsersReq_AST,
  "protoapp.apis.types.User" : User_AST,
  "protoapp.apis.types.UserWithId" : UserWithId_AST,
  "protoapp.apis.types.UserDetails" : UserDetails_AST,
  "protoapp.apis.types.WithId" : WithId_AST
};
