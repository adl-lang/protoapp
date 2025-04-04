/* @generated from adl module sys.annotations */

import * as ADL from '@adllang/adl-runtime';

export type Doc = string;

const Doc_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"Doc","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"sys.annotations"};

export const snDoc: ADL.ScopedName = {moduleName:"sys.annotations", name:"Doc"};

export function texprDoc(): ADL.ATypeExpr<Doc> {
  return {value : {typeRef : {kind: "reference", value : snDoc}, parameters : []}};
}

export type SerializedName = string;

const SerializedName_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"SerializedName","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"sys.annotations"};

export const snSerializedName: ADL.ScopedName = {moduleName:"sys.annotations", name:"SerializedName"};

export function texprSerializedName(): ADL.ATypeExpr<SerializedName> {
  return {value : {typeRef : {kind: "reference", value : snSerializedName}, parameters : []}};
}

export interface SerializedWithInternalTag {
  tag: string;
}

export function makeSerializedWithInternalTag(
  input: {
    tag: string,
  }
): SerializedWithInternalTag {
  return {
    tag: input.tag,
  };
}

const SerializedWithInternalTag_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"SerializedWithInternalTag","type_":{"kind":"struct_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"tag","serializedName":"tag","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"sys.annotations"};

export const snSerializedWithInternalTag: ADL.ScopedName = {moduleName:"sys.annotations", name:"SerializedWithInternalTag"};

export function texprSerializedWithInternalTag(): ADL.ATypeExpr<SerializedWithInternalTag> {
  return {value : {typeRef : {kind: "reference", value : snSerializedWithInternalTag}, parameters : []}};
}

export type CustomSerialization = boolean;

const CustomSerialization_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[],"name":"CustomSerialization","type_":{"kind":"type_","value":{"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Bool"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"sys.annotations"};

export const snCustomSerialization: ADL.ScopedName = {moduleName:"sys.annotations", name:"CustomSerialization"};

export function texprCustomSerialization(): ADL.ATypeExpr<CustomSerialization> {
  return {value : {typeRef : {kind: "reference", value : snCustomSerialization}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "sys.annotations.Doc" : Doc_AST,
  "sys.annotations.SerializedName" : SerializedName_AST,
  "sys.annotations.SerializedWithInternalTag" : SerializedWithInternalTag_AST,
  "sys.annotations.CustomSerialization" : CustomSerialization_AST
};
