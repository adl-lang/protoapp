/* @generated from adl module common.db */

import * as ADL from '@adllang/adl-runtime';

export interface DbTable {
  table_name: string;
  indexes: string[][];
  uniqueness_constraints: string[][];
  extra_sql: string[];
  label: string[];
  id_prefix: string;
}

export function makeDbTable(
  input: {
    table_name?: string,
    indexes?: string[][],
    uniqueness_constraints?: string[][],
    extra_sql?: string[],
    label?: string[],
    id_prefix?: string,
  }
): DbTable {
  return {
    table_name: input.table_name === undefined ? "" : input.table_name,
    indexes: input.indexes === undefined ? [] : input.indexes,
    uniqueness_constraints: input.uniqueness_constraints === undefined ? [] : input.uniqueness_constraints,
    extra_sql: input.extra_sql === undefined ? [] : input.extra_sql,
    label: input.label === undefined ? [] : input.label,
    id_prefix: input.id_prefix === undefined ? "" : input.id_prefix,
  };
}

const DbTable_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"DbTable","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":""},"name":"table_name","serializedName":"table_name","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[],"default":{"kind":"just","value":[]},"name":"indexes","serializedName":"indexes","typeExpr":{"parameters":[{"parameters":[{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"primitive","value":"Vector"}}],"typeRef":{"kind":"primitive","value":"Vector"}}},{"annotations":[],"default":{"kind":"just","value":[]},"name":"uniqueness_constraints","serializedName":"uniqueness_constraints","typeExpr":{"parameters":[{"parameters":[{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"primitive","value":"Vector"}}],"typeRef":{"kind":"primitive","value":"Vector"}}},{"annotations":[],"default":{"kind":"just","value":[]},"name":"extra_sql","serializedName":"extra_sql","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"primitive","value":"Vector"}}},{"annotations":[],"default":{"kind":"just","value":[]},"name":"label","serializedName":"label","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"primitive","value":"Vector"}}},{"annotations":[],"default":{"kind":"just","value":""},"name":"id_prefix","serializedName":"id_prefix","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.db"};

export const snDbTable: ADL.ScopedName = {moduleName:"common.db", name:"DbTable"};

export function texprDbTable(): ADL.ATypeExpr<DbTable> {
  return {value : {typeRef : {kind: "reference", value : snDbTable}, parameters : []}};
}

export interface DbView {
  view_name: string;
}

export function makeDbView(
  input: {
    view_name?: string,
  }
): DbView {
  return {
    view_name: input.view_name === undefined ? "" : input.view_name,
  };
}

const DbView_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"DbView","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"just","value":""},"name":"view_name","serializedName":"view_name","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.db"};

export const snDbView: ADL.ScopedName = {moduleName:"common.db", name:"DbView"};

export function texprDbView(): ADL.ATypeExpr<DbView> {
  return {value : {typeRef : {kind: "reference", value : snDbView}, parameters : []}};
}

/**
 * Field level annotation to override the name of the
 * database column.
 */
export type DbColumnName = string;

const DbColumnName_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Field level annotation to override the name of the\ndatabase column.\n"}],"name":"DbColumnName","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.db"};

export const snDbColumnName: ADL.ScopedName = {moduleName:"common.db", name:"DbColumnName"};

export function texprDbColumnName(): ADL.ATypeExpr<DbColumnName> {
  return {value : {typeRef : {kind: "reference", value : snDbColumnName}, parameters : []}};
}

/**
 * Field or type level annotation to override the type of the
 * database column.
 */
export type DbColumnType = string;

const DbColumnType_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Field or type level annotation to override the type of the\ndatabase column.\n"}],"name":"DbColumnType","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.db"};

export const snDbColumnType: ADL.ScopedName = {moduleName:"common.db", name:"DbColumnType"};

export function texprDbColumnType(): ADL.ATypeExpr<DbColumnType> {
  return {value : {typeRef : {kind: "reference", value : snDbColumnType}, parameters : []}};
}

/**
 * Field level annotation to indicate that that the fields
 * contained in this field should be lifted up to the current
 * table.
 */
export type DbSpread = null;

const DbSpread_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Field level annotation to indicate that that the fields\ncontained in this field should be lifted up to the current\ntable.\n"}],"name":"DbSpread","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.db"};

export const snDbSpread: ADL.ScopedName = {moduleName:"common.db", name:"DbSpread"};

export function texprDbSpread(): ADL.ATypeExpr<DbSpread> {
  return {value : {typeRef : {kind: "reference", value : snDbSpread}, parameters : []}};
}

/**
 * Field level annotation to indicate that that field
 * is part of the primary key
 */
export type DbPrimaryKey = null;

const DbPrimaryKey_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Field level annotation to indicate that that field\nis part of the primary key\n"}],"name":"DbPrimaryKey","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.db"};

export const snDbPrimaryKey: ADL.ScopedName = {moduleName:"common.db", name:"DbPrimaryKey"};

export function texprDbPrimaryKey(): ADL.ATypeExpr<DbPrimaryKey> {
  return {value : {typeRef : {kind: "reference", value : snDbPrimaryKey}, parameters : []}};
}

/**
 * A reference for a database stored value, referenced by a
 * string primary key.
 */
export type DbKey<_T> = string;

const DbKey_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A reference for a database stored value, referenced by a\nstring primary key.\n"}],"name":"DbKey","type_":{"kind":"newtype_","value":{"default":{"kind":"nothing"},"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":["T"]}},"version":{"kind":"nothing"}},"moduleName":"common.db"};

export const snDbKey: ADL.ScopedName = {moduleName:"common.db", name:"DbKey"};

export function texprDbKey<T>(texprT : ADL.ATypeExpr<T>): ADL.ATypeExpr<DbKey<T>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.db",name : "DbKey"}}, parameters : [texprT.value]}};
}

/**
 * Extent a datatype for use as a database table, giving it a
 * primary key
 */
export interface WithId<T> {
  id: string;
  value: T;
}

export function makeWithId<T>(
  input: {
    id: string,
    value: T,
  }
): WithId<T> {
  return {
    id: input.id,
    value: input.value,
  };
}

const WithId_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"Extent a datatype for use as a database table, giving it a\nprimary key\n"}],"name":"WithId","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"common.db","name":"DbPrimaryKey"},"value":null}],"default":{"kind":"nothing"},"name":"id","serializedName":"id","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[{"key":{"moduleName":"common.db","name":"DbSpread"},"value":null}],"default":{"kind":"nothing"},"name":"value","serializedName":"value","typeExpr":{"parameters":[],"typeRef":{"kind":"typeParam","value":"T"}}}],"typeParams":["T"]}},"version":{"kind":"nothing"}},"moduleName":"common.db"};

export const snWithId: ADL.ScopedName = {moduleName:"common.db", name:"WithId"};

export function texprWithId<T>(texprT : ADL.ATypeExpr<T>): ADL.ATypeExpr<WithId<T>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "common.db",name : "WithId"}}, parameters : [texprT.value]}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "common.db.DbTable" : DbTable_AST,
  "common.db.DbView" : DbView_AST,
  "common.db.DbColumnName" : DbColumnName_AST,
  "common.db.DbColumnType" : DbColumnType_AST,
  "common.db.DbSpread" : DbSpread_AST,
  "common.db.DbPrimaryKey" : DbPrimaryKey_AST,
  "common.db.DbKey" : DbKey_AST,
  "common.db.WithId" : WithId_AST
};
