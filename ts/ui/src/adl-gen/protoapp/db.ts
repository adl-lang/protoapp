/* @generated from adl module protoapp.db */

import * as ADL from '@adllang/adl-runtime';
import * as common_db from './../common/db';
import * as common_strings from './../common/strings';
import * as common_time from './../common/time';

export interface AppUser {
  fullname: common_strings.StringNE;
  email: common_strings.StringNE;
  is_admin: boolean;
  hashed_password: common_strings.StringNE;
}

export function makeAppUser(
  input: {
    fullname: common_strings.StringNE,
    email: common_strings.StringNE,
    is_admin: boolean,
    hashed_password?: common_strings.StringNE,
  }
): AppUser {
  return {
    fullname: input.fullname,
    email: input.email,
    is_admin: input.is_admin,
    hashed_password: input.hashed_password === undefined ? "" : input.hashed_password,
  };
}

const AppUser_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"AppUser","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"fullname","serializedName":"fullname","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"email","serializedName":"email","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"is_admin","serializedName":"is_admin","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Bool"}}},{"annotations":[],"default":{"kind":"just","value":""},"name":"hashed_password","serializedName":"hashed_password","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.db"};

export const snAppUser: ADL.ScopedName = {moduleName:"protoapp.db", name:"AppUser"};

export function texprAppUser(): ADL.ATypeExpr<AppUser> {
  return {value : {typeRef : {kind: "reference", value : snAppUser}, parameters : []}};
}

export type AppUserTable = common_db.WithId<AppUser>;

const AppUserTable_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"common.db","name":"DbTable"},"value":{"id_prefix":"U-","indexes":[["email"]],"uniqueness_constraints":[["email"]]}}],"name":"AppUserTable","type_":{"kind":"newtype_","value":{"default":{"kind":"nothing"},"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUser"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.db","name":"WithId"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.db"};

export const snAppUserTable: ADL.ScopedName = {moduleName:"protoapp.db", name:"AppUserTable"};

export function texprAppUserTable(): ADL.ATypeExpr<AppUserTable> {
  return {value : {typeRef : {kind: "reference", value : snAppUserTable}, parameters : []}};
}

export type AppUserId = common_db.DbKey<AppUserTable>;

const AppUserId_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"AppUserId","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserTable"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.db","name":"DbKey"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.db"};

export const snAppUserId: ADL.ScopedName = {moduleName:"protoapp.db", name:"AppUserId"};

export function texprAppUserId(): ADL.ATypeExpr<AppUserId> {
  return {value : {typeRef : {kind: "reference", value : snAppUserId}, parameters : []}};
}

export interface Message {
  posted_at: common_time.Instant;
  posted_by: AppUserId;
  message: common_strings.StringML;
  u1: U1;
  u2: U2;
}

export function makeMessage(
  input: {
    posted_at: common_time.Instant,
    posted_by: AppUserId,
    message: common_strings.StringML,
    u1: U1,
    u2: U2,
  }
): Message {
  return {
    posted_at: input.posted_at,
    posted_by: input.posted_by,
    message: input.message,
    u1: input.u1,
    u2: input.u2,
  };
}

const Message_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"Message","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"posted_at","serializedName":"posted_at","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.time","name":"Instant"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"posted_by","serializedName":"posted_by","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"message","serializedName":"message","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringML"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"u1","serializedName":"u1","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"U1"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"u2","serializedName":"u2","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"U2"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.db"};

export const snMessage: ADL.ScopedName = {moduleName:"protoapp.db", name:"Message"};

export function texprMessage(): ADL.ATypeExpr<Message> {
  return {value : {typeRef : {kind: "reference", value : snMessage}, parameters : []}};
}

export type MessageTable = common_db.WithId<Message>;

const MessageTable_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"common.db","name":"DbTable"},"value":{"id_prefix":"M-","indexes":[["posted_at"]]}}],"name":"MessageTable","type_":{"kind":"newtype_","value":{"default":{"kind":"nothing"},"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"Message"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.db","name":"WithId"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.db"};

export const snMessageTable: ADL.ScopedName = {moduleName:"protoapp.db", name:"MessageTable"};

export function texprMessageTable(): ADL.ATypeExpr<MessageTable> {
  return {value : {typeRef : {kind: "reference", value : snMessageTable}, parameters : []}};
}

export type MessageId = common_db.DbKey<MessageTable>;

const MessageId_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"MessageId","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"MessageTable"}}}],"typeRef":{"kind":"reference","value":{"moduleName":"common.db","name":"DbKey"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.db"};

export const snMessageId: ADL.ScopedName = {moduleName:"protoapp.db", name:"MessageId"};

export function texprMessageId(): ADL.ATypeExpr<MessageId> {
  return {value : {typeRef : {kind: "reference", value : snMessageId}, parameters : []}};
}

export type U1 = 'a' | 'b';
export const valuesU1 : U1[] = ['a', 'b'];

const U1_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"U1","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"a","serializedName":"a","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"b","serializedName":"b","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.db"};

export const snU1: ADL.ScopedName = {moduleName:"protoapp.db", name:"U1"};

export function texprU1(): ADL.ATypeExpr<U1> {
  return {value : {typeRef : {kind: "reference", value : snU1}, parameters : []}};
}

export interface U2_A {
  kind: 'a';
}
export interface U2_B {
  kind: 'b';
  value: boolean;
}

export type U2 = U2_A | U2_B;

export interface U2Opts {
  a: null;
  b: boolean;
}

export function makeU2<K extends keyof U2Opts>(kind: K, value: U2Opts[K]) { return {kind, value}; }

const U2_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"U2","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"a","serializedName":"a","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"b","serializedName":"b","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Bool"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.db"};

export const snU2: ADL.ScopedName = {moduleName:"protoapp.db", name:"U2"};

export function texprU2(): ADL.ATypeExpr<U2> {
  return {value : {typeRef : {kind: "reference", value : snU2}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "protoapp.db.AppUser" : AppUser_AST,
  "protoapp.db.AppUserTable" : AppUserTable_AST,
  "protoapp.db.AppUserId" : AppUserId_AST,
  "protoapp.db.Message" : Message_AST,
  "protoapp.db.MessageTable" : MessageTable_AST,
  "protoapp.db.MessageId" : MessageId_AST,
  "protoapp.db.U1" : U1_AST,
  "protoapp.db.U2" : U2_AST
};
