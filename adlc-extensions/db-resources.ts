import * as adlast from "@adllang/adlc-tools/adlgen/sys/adlast";
import { snakeCase } from "@mesqueeb/case-anything";
import { Json, JsonObject, scopedName } from "@adllang/adl-runtime";
import { AdlSourceParams } from "@adllang/adlc-tools/utils/sources";
import {
  forEachDecl,
  getAnnotation,
  LoadedAdl,
  parseAdlModules,
} from "@adllang/adlc-tools/utils/adl";

// Code shared by the adlc-sqlschema and adlc-rust-seaquery-schema commands:
// finding the db tables and views declared in adl.

export interface DbResources {
  tables: DbTable[];
  views: DbView[];
}

export interface DbTable {
  scopedName: adlast.ScopedName;
  scopedDecl: adlast.ScopedDecl;
  fields: adlast.Field[];
  ann: Json;
  name: string;
  primaryKey: string[];
  idPrefix: string;
}

export interface DbView {
  scopedDecl: adlast.ScopedDecl;
  fields: adlast.Field[];
  ann: Json;
  name: string;
}

export async function loadDbResources(
  params: AdlSourceParams,
): Promise<{ loadedAdl: LoadedAdl; dbResources: DbResources }> {
  const loadedAdl = await parseAdlModules(params);

  const dbResources: DbResources = { tables: [], views: [] };

  // Find all of the struct declarations that have a DbTable annotation
  forEachDecl(loadedAdl.modules, (scopedDecl) => {
    const ann = getAnnotation(scopedDecl.decl.annotations, DB_TABLE);
    if (ann != undefined) {
      const scopedName = {
        moduleName: scopedDecl.moduleName,
        name: scopedDecl.decl.name,
      };
      const name = getDbTableName(scopedDecl);
      const fields = getDbFields(loadedAdl, scopedDecl);
      const primaryKey = getPrimaryKey(fields);
      const idPrefix = (ann as { id_prefix: string }).id_prefix || "";
      dbResources.tables.push({
        scopedName,
        scopedDecl,
        fields,
        ann,
        name,
        primaryKey,
        idPrefix,
      });
    }
  });
  dbResources.tables.sort((t1, t2) =>
    t1.name < t2.name ? -1 : t1.name > t2.name ? 1 : 0
  );

  // Find all of the struct declarations that have a DbView annotation
  forEachDecl(loadedAdl.modules, (scopedDecl) => {
    const ann = getAnnotation(scopedDecl.decl.annotations, DB_VIEW);
    if (ann != undefined) {
      const name = getDbTableName(scopedDecl);
      const fields = getDbFields(loadedAdl, scopedDecl);
      dbResources.views.push({ scopedDecl, fields, ann, name });
    }
  });

  dbResources.views.sort((t1, t2) =>
    t1.name < t2.name ? -1 : t1.name > t2.name ? 1 : 0
  );

  return { loadedAdl, dbResources };
}

/**
 *  Returns the SQL name for the table
 */
export function getDbTableName(scopedDecl: adlast.ScopedDecl): string {
  const ann = getAnnotation(scopedDecl.decl.annotations, DB_TABLE);
  let tableName = assumeField<string>(ann, "table_name");
  if (tableName) {
    return tableName;
  }
  tableName = snakeCase(scopedDecl.decl.name);
  if (tableName.endsWith("_table")) {
    tableName = tableName.substring(0, tableName.length - 6);
  }
  return tableName;
}

/**
 *  Returns the SQL name for the view
 */
export function getViewName(scopedDecl: adlast.ScopedDecl): string {
  const ann = getAnnotation(scopedDecl.decl.annotations, DB_VIEW);
  const viewName = assumeField<string>(ann, "view_name");
  return viewName || snakeCase(scopedDecl.decl.name);
}

/**
 *  Returns the adl fields that will beome table columns
 */
function getDbFields(
  loadedAdl: LoadedAdl,
  scopedDecl: adlast.ScopedDecl,
): DbField[] {
  function _fromDecl(
    scopedDecl: adlast.ScopedDecl,
    typeBindings: TypeBinding[],
  ): adlast.Field[] {
    if (scopedDecl.decl.type_.kind == "type_") {
      const typeExpr0 = scopedDecl.decl.type_.value.typeExpr;
      const typeExpr = substituteTypeBindings(typeExpr0, typeBindings);
      return _fromTypeExpr(typeExpr);
    }

    if (scopedDecl.decl.type_.kind == "newtype_") {
      const typeExpr0 = scopedDecl.decl.type_.value.typeExpr;
      const typeExpr = substituteTypeBindings(typeExpr0, typeBindings);
      return _fromTypeExpr(typeExpr);
    }

    if (scopedDecl.decl.type_.kind == "struct_") {
      let result: DbField[] = [];
      for (const f of scopedDecl.decl.type_.value.fields) {
        result = [...result, ..._fromField(f, typeBindings)];
      }
      return result;
    }
    throw new Error("only structs and type aliases are supported as db tables");
  }

  function _fromTypeExpr(typeExpr: adlast.TypeExpr): DbField[] {
    if (typeExpr.typeRef.kind != "reference") {
      throw new Error("db type expressions must reference a decl");
    }
    const decl = loadedAdl.resolver(typeExpr.typeRef.value);
    const typeParams = decl.decl.type_.value.typeParams;
    const typeBindings = createTypeBindings(typeParams, typeExpr.parameters);
    return _fromDecl(decl, typeBindings);
  }

  function _fromField(
    field: adlast.Field,
    typeBindings: TypeBinding[],
  ): DbField[] {
    const typeExpr = substituteTypeBindings(field.typeExpr, typeBindings);
    const isSpread = getAnnotation(field.annotations, DB_SPREAD) !== undefined;

    if (isSpread) {
      return _fromTypeExpr(typeExpr);
    }

    return [
      {
        name: field.name,
        serializedName: field.serializedName,
        typeExpr,
        default: field.default,
        annotations: field.annotations,
      },
    ];
  }

  return _fromDecl(scopedDecl, []);
}

type DbField = adlast.Field; // For now

/**
 *  Returns the primary key for the table
 */
function getPrimaryKey(fields: DbField[]): string[] {
  const primaryKey = fields
    .filter((f) => getAnnotation(f.annotations, DB_PRIMARY_KEY) !== undefined)
    .map((f) => getColumnName(f));

  return primaryKey;
}

function assumeField<T>(obj: Json | undefined, key: string): T | undefined {
  if (obj == undefined) {
    return undefined;
  }
  return (obj as JsonObject)[key] as T;
}

/**
 * Returns the SQL name for a column corresponding to a field
 */
export function getColumnName(field: adlast.Field): string {
  const ann = getAnnotation(field.annotations, DB_COLUMN_NAME);
  if (typeof ann === "string") {
    return ann;
  }
  return snakeCase(field.name);
}

interface TypeBinding {
  name: string;
  value: adlast.TypeExpr;
}

function createTypeBindings(
  names: string[],
  values: adlast.TypeExpr[],
): TypeBinding[] {
  const result: TypeBinding[] = [];
  for (let i = 0; i < names.length; i++) {
    result.push({ name: names[i], value: values[i] });
  }
  return result;
}

function substituteTypeBindings(
  texpr: adlast.TypeExpr,
  bindings: TypeBinding[],
): adlast.TypeExpr {
  const parameters = texpr.parameters.map((te) =>
    substituteTypeBindings(te, bindings)
  );

  if (texpr.typeRef.kind == "typeParam") {
    const name = texpr.typeRef.value;
    const binding = bindings.find((b) => b.name === name);
    if (!binding) {
      return {
        typeRef: texpr.typeRef,
        parameters,
      };
    } else {
      if (parameters.length != 0) {
        throw new Error("Type param not a concrete type");
      }
      return binding.value;
    }
  }

  return {
    typeRef: texpr.typeRef,
    parameters,
  };
}

const DB_TABLE = scopedName("common.db", "DbTable");
const DB_SPREAD = scopedName("common.db", "DbSpread");
const DB_PRIMARY_KEY = scopedName("common.db", "DbPrimaryKey");
export const DB_VIEW = scopedName("common.db", "DbView");
const DB_COLUMN_NAME = scopedName("common.db", "DbColumnName");
