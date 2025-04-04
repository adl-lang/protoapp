/* @generated from adl module common.time */

import * as ADL from '@adllang/adl-runtime';
import * as common_strings from './strings';

/**
 * A instant in time, represented as milliseconds from
 * the epoch of "1970-01-01T00:00:00Z
 */
export type Instant = number;

const Instant_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A instant in time, represented as milliseconds from\nthe epoch of \"1970-01-01T00:00:00Z\n"}],"name":"Instant","type_":{"kind":"newtype_","value":{"default":{"kind":"nothing"},"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Int64"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.time"};

export const snInstant: ADL.ScopedName = {moduleName:"common.time", name:"Instant"};

export function texprInstant(): ADL.ATypeExpr<Instant> {
  return {value : {typeRef : {kind: "reference", value : snInstant}, parameters : []}};
}

/**
 * A date in ISO8601 format
 */
export type LocalDate = string;

const LocalDate_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A date in ISO8601 format\n"}],"name":"LocalDate","type_":{"kind":"newtype_","value":{"default":{"kind":"just","value":"1970-01-01"},"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.time"};

export const snLocalDate: ADL.ScopedName = {moduleName:"common.time", name:"LocalDate"};

export function texprLocalDate(): ADL.ATypeExpr<LocalDate> {
  return {value : {typeRef : {kind: "reference", value : snLocalDate}, parameters : []}};
}

/**
 * A time in ISO8601 format
 */
export type LocalTime = string;

const LocalTime_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A time in ISO8601 format\n"}],"name":"LocalTime","type_":{"kind":"newtype_","value":{"default":{"kind":"just","value":"00:00:00"},"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.time"};

export const snLocalTime: ADL.ScopedName = {moduleName:"common.time", name:"LocalTime"};

export function texprLocalTime(): ADL.ATypeExpr<LocalTime> {
  return {value : {typeRef : {kind: "reference", value : snLocalTime}, parameters : []}};
}

/**
 * A datetime in ISO8601 format
 */
export type LocalDateTime = string;

const LocalDateTime_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A datetime in ISO8601 format\n"}],"name":"LocalDateTime","type_":{"kind":"newtype_","value":{"default":{"kind":"just","value":"1970-01-01T00:00:00"},"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.time"};

export const snLocalDateTime: ADL.ScopedName = {moduleName:"common.time", name:"LocalDateTime"};

export function texprLocalDateTime(): ADL.ATypeExpr<LocalDateTime> {
  return {value : {typeRef : {kind: "reference", value : snLocalDateTime}, parameters : []}};
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export const valuesDayOfWeek : DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DayOfWeek_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"The day of the week\n"}],"name":"DayOfWeek","type_":{"kind":"union_","value":{"fields":[{"annotations":[],"default":{"kind":"nothing"},"name":"monday","serializedName":"monday","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"tuesday","serializedName":"tuesday","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"wednesday","serializedName":"wednesday","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"thursday","serializedName":"thursday","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"friday","serializedName":"friday","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"saturday","serializedName":"saturday","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}},{"annotations":[],"default":{"kind":"nothing"},"name":"sunday","serializedName":"sunday","typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"Void"}}}],"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.time"};

export const snDayOfWeek: ADL.ScopedName = {moduleName:"common.time", name:"DayOfWeek"};

export function texprDayOfWeek(): ADL.ATypeExpr<DayOfWeek> {
  return {value : {typeRef : {kind: "reference", value : snDayOfWeek}, parameters : []}};
}

/**
 * A duration in ISO8601 format
 */
export type Duration = string;

const Duration_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"A duration in ISO8601 format\n"}],"name":"Duration","type_":{"kind":"newtype_","value":{"default":{"kind":"just","value":"P1D"},"typeExpr":{"parameters":[],"typeRef":{"kind":"primitive","value":"String"}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.time"};

export const snDuration: ADL.ScopedName = {moduleName:"common.time", name:"Duration"};

export function texprDuration(): ADL.ATypeExpr<Duration> {
  return {value : {typeRef : {kind: "reference", value : snDuration}, parameters : []}};
}

/**
 * An IANA timezone
 */
export type Timezone = common_strings.StringNE;

const Timezone_AST : ADL.ScopedDecl =
  {"decl":{"annotations":[{"key":{"moduleName":"sys.annotations","name":"Doc"},"value":"An IANA timezone\n"}],"name":"Timezone","type_":{"kind":"newtype_","value":{"default":{"kind":"nothing"},"typeExpr":{"parameters":[],"typeRef":{"kind":"reference","value":{"moduleName":"common.strings","name":"StringNE"}}},"typeParams":[]}},"version":{"kind":"nothing"}},"moduleName":"common.time"};

export const snTimezone: ADL.ScopedName = {moduleName:"common.time", name:"Timezone"};

export function texprTimezone(): ADL.ATypeExpr<Timezone> {
  return {value : {typeRef : {kind: "reference", value : snTimezone}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "common.time.Instant" : Instant_AST,
  "common.time.LocalDate" : LocalDate_AST,
  "common.time.LocalTime" : LocalTime_AST,
  "common.time.LocalDateTime" : LocalDateTime_AST,
  "common.time.DayOfWeek" : DayOfWeek_AST,
  "common.time.Duration" : Duration_AST,
  "common.time.Timezone" : Timezone_AST
};
