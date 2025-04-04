import { FieldFns } from "./fields/type";

import { getFormLabelFromAnnotation } from "./adl-annotations";
import { enumField, maybeField, nullableField, adlPrimitiveFieldFns } from "./fields/adl";
import { ATypeExpr, DeclResolver, ScopedDecl } from "@adllang/adl-runtime";
import { isEnum } from "@adllang/adl-runtime";
import * as adlast from "adl/sys/adlast";
import * as adltree from "./adl-tree";
import { CustomContext, fieldLabel } from "./veditor/adlfactory";

// This file contains various helper functions for dealing
// with adl table data.

// API cleanup TODOS
// - get rid of CI param
// - merge headerCell & tableCell in factory interface, & get rid of onClick

export interface CellPopup<CI> {
  loc: CellLoc<CI>;
  render(): JSX.Element;
}

type CustomFieldFn = (ctx: CustomContext) => FieldFns<unknown> | null;

export type TableSection = "header" | "body";

/** CI - type representing the column index, e.g. if you want string vs int */
export interface CellLoc<CI> {
  section: TableSection;

  /** Starts at zero */
  rowi: number;

  coli: CI;
}

export type CellContent = null | {
  value: JSX.Element | string; // TODO(dan/timd) consider removing the 'string' option
  style: { [key: string]: string } | null;
};

export function cellContent(value: string | JSX.Element): CellContent {
  return { value, style: null };
}

export interface Column<T, CI> {
  id: CI;
  header: CellContent;
  content(item: T, i: number): CellContent;
}

export interface TableFactory {
  table(headerCells: JSX.Element[], rows: JSX.Element[]): JSX.Element;
  tableRow(i: number, cells: JSX.Element[], style: string): JSX.Element;

  headerCell(i: number, content: CellContent, popupContent: JSX.Element | null): JSX.Element;
  tableCell(
    i: number,
    onClick: () => void,
    content: CellContent,
    popupContent: JSX.Element | null
  ): JSX.Element;
}

export interface AdlColumn<T> {
  fieldname: string;
  label: string;
  defaultVisible: boolean;
  column: Column<T, string>;
  fieldfns: FieldFns<T>; // TODO(timd) generalize this to an arbitrary editor
  adlTree: adltree.AdlTree;
}

export interface AdlTableInfo {
  columns: AdlColumn<unknown>[];
  columnsByFieldName: { [key: string]: AdlColumn<unknown> };
}

// Type to capture a value along with it's corresponding id.
export interface WithId<I, T> {
  id: I;
  value: T;
}

// Derive column information from an adl structure
export function getAdlTableInfo<T>(
  declResolver: DeclResolver,
  typeExpr: ATypeExpr<T>,
  customFields?: CustomFieldFn
): AdlTableInfo {
  const adlStruct = adltree.createAdlTree(typeExpr.value, declResolver).details();

  if (adlStruct.kind !== "struct") {
    throw new Error("AdlTable only implemented for struct types");
  }

  const scopedDecl = {
    moduleName: adlStruct.moduleName,
    decl: adlStruct.astDecl
  };

  const columns: AdlColumn<unknown>[] = [];

  adlStruct.fields.forEach(f => {
    const fieldfns = getFieldFns(declResolver, scopedDecl, f.astField, f.adlTree, customFields);
    if (fieldfns !== null) {
      const fieldfnsT: FieldFns<unknown> = fieldfns;
      const defaultVisible =  true;
      const label =
        getFormLabelFromAnnotation(declResolver, f.astField) || fieldLabel(f.astField.name);

      // A column containing multi line strings
      const content = (item: {[key : string] : unknown}): CellContent => {
        const text = fieldfnsT.toText(item[f.astField.name]);
        // show max 40 characters of the first line
        const s = text;
        let line0 = s.split("\n")[0].substr(0, 40);
        if (line0.length < s.length) {
          line0 = line0 + "...";
        }
        return cellContent(line0);
      };

      columns.push({
        fieldname: f.astField.name,
        adlTree: f.adlTree,
        label,
        defaultVisible,
        fieldfns: fieldfnsT,
        column: {
          id: f.astField.name,
          header: cellContent(label),
          content
        }
      });
    }
  });

  const columnsByFieldName : {[key: string] : AdlColumn<unknown>}= {};
  columns.forEach(c => {
    columnsByFieldName[c.fieldname] = c;
  });

  return { columns, columnsByFieldName };
}

export function getFieldFns(
  declResolver: DeclResolver,
  scopedDecl: ScopedDecl | null,
  field: adlast.Field | null,
  t: adltree.AdlTree,
  customFields?: CustomFieldFn
): FieldFns<unknown> | null {
  if (customFields) {
    const typeExpr = t.typeExpr;
    const fieldfns = customFields({ declResolver, scopedDecl, field, typeExpr });
    if (fieldfns) {
      return fieldfns;
    }
  }
  const fdetails = t.details();
  if (fdetails.kind === "typedef") {
    return getFieldFns(declResolver, scopedDecl, field, fdetails.adlTree, customFields);
  } else if (fdetails.kind === "newtype") {
      return getFieldFns(declResolver, scopedDecl, field, fdetails.adlTree, customFields);
  } else if (fdetails.kind === "primitive") {
    return adlPrimitiveFieldFns(fdetails.ptype);
  } else if (fdetails.kind === "nullable") {
    const fieldfns = getFieldFns(declResolver, scopedDecl, field, fdetails.param, customFields);
    if (fieldfns === null) {
      return null;
    }
    return nullableField(fieldfns);
  } else if (
    fdetails.kind === "union" &&
    fdetails.moduleName === "sys.types" &&
    fdetails.astDecl.name === "Maybe"
  ) {
    const t2 = adltree.createAdlTree(t.typeExpr.parameters[0], declResolver);
    const fieldfns = getFieldFns(declResolver, scopedDecl, field, t2, customFields);
    if (fieldfns === null) {
      return null;
    }
    return maybeField(fieldfns);
  } else if (
    fdetails.kind === "union" &&
    fdetails.astDecl.type_.kind === "union_" &&
    isEnum(fdetails.astDecl.type_.value)
  ) {
    return enumField(fdetails.astDecl, fdetails.astDecl.type_.value);
  }
  return null;
}

