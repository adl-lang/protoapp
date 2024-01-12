/* @generated from adl module common.strings */

import * as ADL from './../runtime/adl';

/**
 * A string that isn't empty, and isn't only whitespace.
 */
export type StringNE = string;

const StringNE_AST : ADL.ScopedDecl =
  {"moduleName":"common.strings","decl":{"annotations":[{"value":{"regex":"^.*\\S+.*$","returnGroup":0,"description":"non empty"},"key":{"moduleName":"common.ui","name":"ValidRegex"}},{"value":"A string that isn't empty, and isn't only whitespace.\n","key":{"moduleName":"sys.annotations","name":"Doc"}}],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"StringNE","version":{"kind":"nothing"}}};

export const snStringNE: ADL.ScopedName = {moduleName:"common.strings", name:"StringNE"};

export function texprStringNE(): ADL.ATypeExpr<StringNE> {
  return {value : {typeRef : {kind: "reference", value : snStringNE}, parameters : []}};
}

/**
 * An alphanumeric string, with hyphens for separation.
 */
export type StringANH = string;

const StringANH_AST : ADL.ScopedDecl =
  {"moduleName":"common.strings","decl":{"annotations":[{"value":{"regex":"^[A-Za-z][A-Za-z0-9-]*$","returnGroup":0,"description":"alphanumeric"},"key":{"moduleName":"common.ui","name":"ValidRegex"}},{"value":"An alphanumeric string, with hyphens for separation.\n","key":{"moduleName":"sys.annotations","name":"Doc"}}],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"StringANH","version":{"kind":"nothing"}}};

export const snStringANH: ADL.ScopedName = {moduleName:"common.strings", name:"StringANH"};

export function texprStringANH(): ADL.ATypeExpr<StringANH> {
  return {value : {typeRef : {kind: "reference", value : snStringANH}, parameters : []}};
}

/**
 * A multi line, free-form text string
 */
export type StringML = string;

const StringML_AST : ADL.ScopedDecl =
  {"moduleName":"common.strings","decl":{"annotations":[{"value":"A multi line, free-form text string\n","key":{"moduleName":"sys.annotations","name":"Doc"}}],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"StringML","version":{"kind":"nothing"}}};

export const snStringML: ADL.ScopedName = {moduleName:"common.strings", name:"StringML"};

export function texprStringML(): ADL.ATypeExpr<StringML> {
  return {value : {typeRef : {kind: "reference", value : snStringML}, parameters : []}};
}

/**
 * An email address
 */
export type EmailAddress = string;

const EmailAddress_AST : ADL.ScopedDecl =
  {"moduleName":"common.strings","decl":{"annotations":[{"value":{"regex":"^\\s*((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\]))\\s*$","returnGroup":1,"description":"an email address"},"key":{"moduleName":"common.ui","name":"ValidRegex"}},{"value":"An email address\n","key":{"moduleName":"sys.annotations","name":"Doc"}}],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"EmailAddress","version":{"kind":"nothing"}}};

export const snEmailAddress: ADL.ScopedName = {moduleName:"common.strings", name:"EmailAddress"};

export function texprEmailAddress(): ADL.ATypeExpr<EmailAddress> {
  return {value : {typeRef : {kind: "reference", value : snEmailAddress}, parameters : []}};
}

/**
 * A markdown text string
 */
export type StringMD = string;

const StringMD_AST : ADL.ScopedDecl =
  {"moduleName":"common.strings","decl":{"annotations":[{"value":"A markdown text string\n","key":{"moduleName":"sys.annotations","name":"Doc"}}],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"StringMD","version":{"kind":"nothing"}}};

export const snStringMD: ADL.ScopedName = {moduleName:"common.strings", name:"StringMD"};

export function texprStringMD(): ADL.ATypeExpr<StringMD> {
  return {value : {typeRef : {kind: "reference", value : snStringMD}, parameters : []}};
}

/**
 * A password, which cannot be empty. Other constraints
 * are application specific.
 */
export type Password = string;

const Password_AST : ADL.ScopedDecl =
  {"moduleName":"common.strings","decl":{"annotations":[{"value":"A password, which cannot be empty. Other constraints\nare application specific.\n","key":{"moduleName":"sys.annotations","name":"Doc"}}],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"Password","version":{"kind":"nothing"}}};

export const snPassword: ADL.ScopedName = {moduleName:"common.strings", name:"Password"};

export function texprPassword(): ADL.ATypeExpr<Password> {
  return {value : {typeRef : {kind: "reference", value : snPassword}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "common.strings.StringNE" : StringNE_AST,
  "common.strings.StringANH" : StringANH_AST,
  "common.strings.StringML" : StringML_AST,
  "common.strings.EmailAddress" : EmailAddress_AST,
  "common.strings.StringMD" : StringMD_AST,
  "common.strings.Password" : Password_AST
};