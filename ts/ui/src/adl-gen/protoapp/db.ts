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
}

export function makeMessage(
  input: {
    posted_at: common_time.Instant,
    posted_by: AppUserId,
    message: common_strings.StringML,
  }
): Message {
  return {
    posted_at: input.posted_at,
    posted_by: input.posted_by,
    message: input.message,
  };
}

const Message_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"Message","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"posted_at","serializedName":"posted_at","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.time","name":"Instant"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"posted_by","serializedName":"posted_by","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"protoapp.db","name":"AppUserId"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"message","serializedName":"message","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringML"}}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"protoapp.db"};

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

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "protoapp.db.AppUser" : AppUser_AST,
  "protoapp.db.AppUserTable" : AppUserTable_AST,
  "protoapp.db.AppUserId" : AppUserId_AST,
  "protoapp.db.Message" : Message_AST,
  "protoapp.db.MessageTable" : MessageTable_AST,
  "protoapp.db.MessageId" : MessageId_AST
};
