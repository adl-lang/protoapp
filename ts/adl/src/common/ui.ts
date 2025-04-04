/* @generated from adl module common.ui */

import * as ADL from '@adllang/adl-runtime';
import * as sys_types from './../sys/types';

export type FormLabel = string;

const FormLabel_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"FormLabel","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.ui"};

export const snFormLabel: ADL.ScopedName = {moduleName:"common.ui", name:"FormLabel"};

export function texprFormLabel(): ADL.ATypeExpr<FormLabel> {
  return {value : {typeRef : {kind: "reference", value : snFormLabel}, parameters : []}};
}

export type FormGroupKey = string;

const FormGroupKey_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"FormGroupKey","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.ui"};

export const snFormGroupKey: ADL.ScopedName = {moduleName:"common.ui", name:"FormGroupKey"};

export function texprFormGroupKey(): ADL.ATypeExpr<FormGroupKey> {
  return {value : {typeRef : {kind: "reference", value : snFormGroupKey}, parameters : []}};
}

export interface FormGroups {
  defaultKey: FormGroupKey;
  labels: sys_types.Pair<FormGroupKey, string>[];
}

export function makeFormGroups(
  input: {
    defaultKey: FormGroupKey,
    labels: sys_types.Pair<FormGroupKey, string>[],
  }
): FormGroups {
  return {
    defaultKey: input.defaultKey,
    labels: input.labels,
  };
}

const FormGroups_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"FormGroups","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"defaultKey","serializedName":"defaultKey","typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.ui","name":"FormGroupKey"}}}},{"annotations":[],"default":{"kind":"nothing"},"name":"labels","serializedName":"labels","typeExpr":{"parameters":[{"parameters":[{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.ui","name":"FormGroupKey"}}},{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"reference","value":{"moduleName":"sys.types","name":"Pair"}}}],"typeRef":{"kind":"primitive","value":"Vector"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.ui"};

export const snFormGroups: ADL.ScopedName = {moduleName:"common.ui", name:"FormGroups"};

export function texprFormGroups(): ADL.ATypeExpr<FormGroups> {
  return {value : {typeRef : {kind: "reference", value : snFormGroups}, parameters : []}};
}

/**
 * An field/type alias annotation to constrain the
 * values allowed by a string to the enumerated values
 */
export interface ValidValues {
  /**
   * The allowed values
   */
  values: string[];
  /**
   * A (short) user readable string describing the
   * expected text.
   */
  description: string;
}

export function makeValidValues(
  input: {
    values: string[],
    description: string,
  }
): ValidValues {
  return {
    values: input.values,
    description: input.description,
  };
}

const ValidValues_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"An field/type alias annotation to constrain the\nvalues allowed by a string to the enumerated values\n"}],"name":"ValidValues","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The allowed values\n"}],"default":{"kind":"nothing"},"name":"values","serializedName":"values","typeExpr":{"parameters":[{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}],"typeRef":{"kind":"primitive","value":"Vector"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A (short) user readable string describing the\nexpected text.\n"}],"default":{"kind":"nothing"},"name":"description","serializedName":"description","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.ui"};

export const snValidValues: ADL.ScopedName = {moduleName:"common.ui", name:"ValidValues"};

export function texprValidValues(): ADL.ATypeExpr<ValidValues> {
  return {value : {typeRef : {kind: "reference", value : snValidValues}, parameters : []}};
}

/**
 * An field/type alias annotation to constrain the
 * values allowed by a string to a regular expression
 */
export interface ValidRegex {
  /**
   * The regexp that must be matched
   */
  regex: string;
  /**
   * A (short) user readable string describing the
   * expected text.
   */
  description: string;
  /**
   * The regex group index to return if matches
   * 0 is the entire string
   */
  returnGroup: number;
}

export function makeValidRegex(
  input: {
    regex: string,
    description: string,
    returnGroup?: number,
  }
): ValidRegex {
  return {
    regex: input.regex,
    description: input.description,
    returnGroup: input.returnGroup === undefined ? 0 : input.returnGroup,
  };
}

const ValidRegex_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"An field/type alias annotation to constrain the\nvalues allowed by a string to a regular expression\n"}],"name":"ValidRegex","type_":{"kind":"struct_","value":{"fields":[{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The regexp that must be matched\n"}],"default":{"kind":"nothing"},"name":"regex","serializedName":"regex","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A (short) user readable string describing the\nexpected text.\n"}],"default":{"kind":"nothing"},"name":"description","serializedName":"description","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}},{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The regex group index to return if matches\n0 is the entire string\n"}],"default":{"kind":"just","value":0},"name":"returnGroup","serializedName":"returnGroup","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Int8"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.ui"};

export const snValidRegex: ADL.ScopedName = {moduleName:"common.ui", name:"ValidRegex"};

export function texprValidRegex(): ADL.ATypeExpr<ValidRegex> {
  return {value : {typeRef : {kind: "reference", value : snValidRegex}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "common.ui.FormLabel" : FormLabel_AST,
  "common.ui.FormGroupKey" : FormGroupKey_AST,
  "common.ui.FormGroups" : FormGroups_AST,
  "common.ui.ValidValues" : ValidValues_AST,
  "common.ui.ValidRegex" : ValidRegex_AST
};
