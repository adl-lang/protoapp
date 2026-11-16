import { parseCli, runTool } from "./cli.ts";
import * as adl from "@adllang/adl-runtime";
import * as adlast from "@adllang/adlc-tools/adlgen/sys/adlast";
import mustache from "mustache_ts";

import {
  createJsonBinding,
  JsonObject,
  scopedName,
} from "@adllang/adl-runtime";
import { AdlSourceParams } from "@adllang/adlc-tools/utils/sources";
import {
  decodeTypeExpr,
  expandNewType,
  expandTypeAlias,
  expandTypes,
  getAnnotation,
  LoadedAdl,
} from "@adllang/adlc-tools/utils/adl";

import {
  DB_VIEW,
  DbResources,
  DbTable,
  getColumnName,
  getDbTableName,
  getViewName,
  loadDbResources,
} from "./db-resources.ts";
import { FileWriter } from "./file-writer.ts";

const usage = `Usage: adlc sqlschema [OPTION...] <module>...

Generate sql create table and view scripts from ADL db schema declarations.

  --searchdir DIR        adl search directory (repeatable)
  --merge-adlext EXT     adl extension to merge, eg adl-pg (repeatable)
  --create-file FILE     sql file for the table definitions
  --views-file FILE      sql file for the view definitions
  --metadata-file FILE   optional metadata file to write
  --extension NAME       sql extension to create (repeatable)
  --db-profile PROFILE   postgresql, postgresql2 or mssql2
  --verbose`;

async function main() {
  const cli = parseCli(usage, {
    single: ["create-file", "views-file", "metadata-file", "db-profile"],
    multi: ["searchdir", "merge-adlext", "extension"],
  });
  await genCreateSqlSchema({
    searchPath: cli.all("searchdir"),
    mergeAdlExts: cli.all("merge-adlext"),
    adlModules: cli.modules,
    createFile: cli.required("create-file"),
    viewsFile: cli.required("views-file"),
    metadataFile: cli.optional("metadata-file"),
    extensions: cli.all("extension"),
    dbProfile: cli.optional("db-profile") as
      | "postgresql"
      | "postgresql2"
      | "mssql2"
      | undefined,
    verbose: cli.verbose,
  });
}

interface GenSqlParams extends AdlSourceParams {
  extensions?: string[];
  templates?: Template[];
  viewsFile: string;
  metadataFile?: string;
  dbProfile?: "postgresql" | "postgresql2" | "mssql2";
  verbose?: boolean;
}

interface GenCreateSqlParams extends GenSqlParams {
  createFile: string;
}

interface Template {
  template: string;
  outfile: string;
}

async function genCreateSqlSchema(
  params: GenCreateSqlParams,
): Promise<void> {
  const { loadedAdl, dbResources } = await loadDbResources({
    ...params,
  });

  await generateCreateSqlSchema(params, loadedAdl, dbResources);
  await writeOtherFiles(params, loadedAdl, dbResources);
}

async function writeOtherFiles(
  params: GenSqlParams,
  loadedAdl: LoadedAdl,
  dbResources: DbResources,
): Promise<void> {
  await generateViews(params.viewsFile, params, loadedAdl, dbResources);
  if (params.metadataFile) {
    await generateMetadata(params.metadataFile, params, loadedAdl, dbResources);
  }
  if (params.templates) {
    for (const t of params.templates) {
      generateTemplate(t, dbResources);
    }
  }
}

async function generateCreateSqlSchema(
  params: GenCreateSqlParams,
  loadedAdl: LoadedAdl,
  dbResources: DbResources,
): Promise<void> {
  const dbTables = dbResources.tables;
  // Now generate the SQL file
  const writer = new FileWriter(params.createFile, !!params.verbose);
  const moduleNames: Set<string> = new Set(
    dbTables.map((dbt) => dbt.scopedDecl.moduleName),
  );
  writer.write(
    `-- Schema auto-generated from adl modules: ${
      Array.from(
        moduleNames.keys(),
      ).join(", ")
    }\n`,
  );
  writer.write(`--\n`);
  writer.write(`-- column comments show original ADL types\n`);

  if (params.extensions && params.extensions.length > 0) {
    writer.write("\n");
    params.extensions.forEach((e) => {
      writer.write(`create extension ${e};\n`);
    });
  }

  const constraints: string[] = [];
  let allExtraSql: string[] = [];
  const dbProfile = getDbProfile(params.dbProfile);

  // Output the tables
  for (const t of dbTables) {
    const ann: JsonObject = t.ann as JsonObject;
    const indexes = (ann["indexes"] || []) as string[][];
    const uniquenessConstraints = (ann["uniqueness_constraints"] ||
      []) as string[][];
    const extraSql = (ann["extra_sql"] as string[]) || [];

    const lines: { code: string; comment?: string }[] = [];
    for (const f of t.fields) {
      const columnName = getColumnName(f);
      const columnType = getColumnType(
        loadedAdl.resolver,
        dbTables,
        f,
        dbProfile,
      );
      lines.push({
        code: `${columnName} ${columnType.sqltype}${
          columnType.notNullable ? " not null" : ""
        }`,
        comment: adl.typeExprToStringUnscoped(f.typeExpr),
      });
      if (columnType.fkey) {
        constraints.push(
          `alter table ${
            quoteReservedName(t.name)
          } add constraint ${t.name}_${columnName}_fk foreign key (${columnName}) references ${
            quoteReservedName(
              columnType.fkey.table,
            )
          }(${columnType.fkey.column});`,
        );
      }
    }

    const findColName = function (s: string): string {
      for (const f of t.fields) {
        if (f.name == s) {
          return getColumnName(f);
        }
      }
      return s;
    };

    for (let i = 0; i < indexes.length; i++) {
      const cols = indexes[i].map(findColName);
      constraints.push(
        `create index ${t.name}_${i + 1}_idx on ${
          quoteReservedName(
            t.name,
          )
        }(${cols.join(", ")});`,
      );
    }
    for (let i = 0; i < uniquenessConstraints.length; i++) {
      const cols = uniquenessConstraints[i].map(findColName);
      constraints.push(
        `alter table ${quoteReservedName(t.name)} add constraint ${t.name}_${
          i + 1
        }_con unique (${cols.join(", ")});`,
      );
    }
    if (t.primaryKey.length > 0) {
      const cols = t.primaryKey.map(findColName);
      lines.push({ code: `primary key(${cols.join(",")})` });
    }

    writer.write("\n");
    writer.write(`create table ${quoteReservedName(t.name)}(\n`);
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].code;
      if (i < lines.length - 1) {
        line += ",";
      }
      if (lines[i].comment) {
        line = line.padEnd(36, " ");
        line = line + " -- " + lines[i].comment;
      }
      writer.write("  " + line + "\n");
    }
    writer.write(`);\n`);
    allExtraSql = allExtraSql.concat(extraSql);
  }

  if (constraints.length > 0) {
    writer.write("\n");
  }

  for (const constraint of constraints) {
    writer.write(constraint + "\n");
  }

  if (allExtraSql.length > 0) {
    writer.write("\n");
  }

  // And any sql
  for (const sql of allExtraSql) {
    writer.write(sql + "\n");
  }

  await writer.close();
}

const RESERVED_NAMES: { [name: string]: boolean } = {};
[
  // TODO: Add other names here
  "user",
].forEach((n) => {
  RESERVED_NAMES[n] = true;
});

function quoteReservedName(s: string) {
  if (RESERVED_NAMES[s]) {
    return `"${s}"`;
  } else {
    return s;
  }
}

interface ColumnType {
  sqltype: string;
  fkey?: {
    table: string;
    column: string;
  };
  notNullable: boolean;
}

function getColumnType(
  resolver: adl.DeclResolver,
  dbTables: DbTable[],
  field: adlast.Field,
  dbProfile: DbProfile,
): ColumnType {
  const ann = getAnnotation(field.annotations, DB_COLUMN_TYPE);
  const annctype: string | undefined = typeof ann === "string"
    ? ann
    : undefined;

  const typeExpr = field.typeExpr;

  // For Maybe<T> and Nullable<T> the sql column will allow nulls
  const dtype = decodeTypeExpr(typeExpr);
  if (
    dtype.kind == "Nullable" ||
    (dtype.kind == "Reference" &&
      adl.scopedNamesEqual(dtype.refScopedName, MAYBE))
  ) {
    return {
      sqltype: annctype ||
        getColumnType1(resolver, typeExpr.parameters[0], dbProfile),
      fkey: getForeignKeyRef(resolver, dbTables, typeExpr.parameters[0]),
      notNullable: false,
    };
  }

  // For all other types, the column will not allow nulls
  return {
    sqltype: annctype || getColumnType1(resolver, typeExpr, dbProfile),
    fkey: getForeignKeyRef(resolver, dbTables, typeExpr),
    notNullable: true,
  };
}

function getColumnType1(
  resolver: adl.DeclResolver,
  typeExpr: adlast.TypeExpr,
  dbProfile: DbProfile,
): string {
  const dtype = decodeTypeExpr(typeExpr);
  switch (dtype.kind) {
    case "Reference": {
      const sdecl = resolver(dtype.refScopedName);

      const ann = getAnnotation(sdecl.decl.annotations, DB_COLUMN_TYPE);
      if (typeof ann === "string") {
        return ann;
      }

      if (
        sdecl.decl.type_.kind == "union_" &&
        adl.isEnum(sdecl.decl.type_.value)
      ) {
        return dbProfile.enumColumnType;
      }
      // If we have a reference to a newtype or type alias, resolve
      // to the underlying type
      let texpr2 = null;
      texpr2 = texpr2 || expandTypeAlias(resolver, typeExpr);
      texpr2 = texpr2 || expandNewType(resolver, typeExpr);
      if (texpr2) {
        return getColumnType1(resolver, texpr2, dbProfile);
      }
    }
    /* falls through */
    default:
      return dbProfile.primColumnType(dtype.kind);
  }
}

function getForeignKeyRef(
  resolver: adl.DeclResolver,
  dbTables: DbTable[],
  typeExpr0: adlast.TypeExpr,
): { table: string; column: string } | undefined {
  const typeExpr = expandTypes(resolver, typeExpr0, {
    expandTypeAliases: true,
  });
  const dtype = decodeTypeExpr(typeExpr);
  if (
    dtype.kind == "Reference" &&
    adl.scopedNamesEqual(dtype.refScopedName, DB_KEY)
  ) {
    const param0 = dtype.parameters[0];
    if (param0.kind == "Reference") {
      const table = dbTables.find((t) =>
        adl.scopedNamesEqual(param0.refScopedName, t.scopedName)
      );
      if (!table) {
        throw new Error(
          `No table declaration for ${param0.refScopedName.moduleName}.${param0.refScopedName.name}`,
        );
      }
      if (table.primaryKey.length !== 1) {
        throw new Error(
          `No singular primary key for ${param0.refScopedName.moduleName}.${param0.refScopedName.name}`,
        );
      }
      const decl = resolver(param0.refScopedName);
      return { table: getDbTableName(decl), column: table.primaryKey[0] };
    }
  }
  return undefined;
}

// Contains customizations for the db mapping
interface DbProfile {
  idColumnType: string;
  enumColumnType: string;
  primColumnType(ptype: string): string;
}

const postgresDbProfile: DbProfile = {
  idColumnType: "text",
  enumColumnType: "text",
  primColumnType(ptype: string): string {
    switch (ptype) {
      case "String":
        return "text";
      case "Bool":
        return "boolean";
      case "Json":
        return "json";
      case "Int8":
        return "smallint";
      case "Int16":
        return "smallint";
      case "Int32":
        return "integer";
      case "Int64":
        return "bigint";
      case "Word8":
        return "smallint";
      case "Word16":
        return "smallint";
      case "Word32":
        return "integer";
      case "Word64":
        return "bigint";
      case "Float":
        return "real";
      case "Double":
        return "double precision";
    }
    return "json";
  },
};

const postgres2DbProfile: DbProfile = {
  idColumnType: "text",
  enumColumnType: "text",
  primColumnType(ptype: string): string {
    switch (ptype) {
      case "String":
        return "text";
      case "Bool":
        return "boolean";
      case "Json":
        return "jsonb";
      case "Int8":
        return "smallint";
      case "Int16":
        return "smallint";
      case "Int32":
        return "integer";
      case "Int64":
        return "bigint";
      case "Word8":
        return "smallint";
      case "Word16":
        return "smallint";
      case "Word32":
        return "integer";
      case "Word64":
        return "bigint";
      case "Float":
        return "real";
      case "Double":
        return "double precision";
    }
    return "jsonb";
  },
};

const mssql2DbProfile: DbProfile = {
  idColumnType: "nvarchar(64)",
  enumColumnType: "nvarchar(64)",
  primColumnType(ptype: string): string {
    switch (ptype) {
      case "String":
        return "nvarchar(max)";
      case "Int8":
        return "smallint";
      case "Int16":
        return "smallint";
      case "Int32":
        return "int";
      case "Int64":
        return "bigint";
      case "Word8":
        return "smallint";
      case "Word16":
        return "smallint";
      case "Word32":
        return "int";
      case "Word64":
        return "bigint";
      case "Float":
        return "float(24)";
      case "Double":
        return "float(53)";
      case "Bool":
        return "bit";
    }
    return "nvarchar(max)";
  },
};

function getDbProfile(
  dbProfile?: "postgresql" | "postgresql2" | "mssql2",
): DbProfile {
  if (dbProfile == undefined) {
    return postgres2DbProfile;
  }
  switch (dbProfile) {
    case "postgresql2":
      return postgres2DbProfile;
    case "postgresql":
      return postgresDbProfile;
    case "mssql2":
      return mssql2DbProfile;
  }
}

async function generateMetadata(
  outmetadata: string,
  params: GenSqlParams,
  loadedAdl: LoadedAdl,
  dbResources: DbResources,
): Promise<void> {
  const writer = new FileWriter(outmetadata, !!params.verbose);

  // Exclude metadata for the metadata tables
  const dbTables = dbResources.tables.filter(
    (dbt) => dbt.name != "meta_table" && dbt.name !== "meta_adl_decl",
  );

  writer.write("delete from meta_table;\n");
  for (const dbTable of dbTables) {
    const docAnn = getAnnotation(dbTable.scopedDecl.decl.annotations, DOC);
    const description = typeof docAnn === "string" ? docAnn : "";
    writer.write(
      `insert into meta_table(name,description,decl_module_name, decl_name) values (${
        dbstr(
          dbTable.name,
        )
      },${dbstr(description)},${dbstr(dbTable.scopedDecl.moduleName)},${
        dbstr(
          dbTable.scopedDecl.decl.name,
        )
      });\n`,
    );
  }
  for (const dbView of dbResources.views) {
    const docAnn = getAnnotation(dbView.scopedDecl.decl.annotations, DOC);
    const description = typeof docAnn === "string" ? docAnn : "";
    writer.write(
      `insert into meta_table(name,description,decl_module_name, decl_name) values (${
        dbstr(
          dbView.name,
        )
      },${dbstr(description)},${dbstr(dbView.scopedDecl.moduleName)},${
        dbstr(
          dbView.scopedDecl.decl.name,
        )
      });\n`,
    );
  }

  writer.write("\n");

  writer.write("delete from meta_adl_decl;\n");
  insertDecls(loadedAdl.resolver, writer, [
    ...dbTables.map((dbt) => dbt.scopedDecl),
    ...dbResources.views.map((dbv) => dbv.scopedDecl),
  ]);
  await writer.close();
}

async function generateViews(
  outviews: string,
  params: GenSqlParams,
  _loadedAdl: LoadedAdl,
  dbResources: DbResources,
): Promise<void> {
  const writer = new FileWriter(outviews, !!params.verbose);
  writer.write("\n");
  for (const dbView of dbResources.views) {
    const ann0 = getAnnotation(dbView.scopedDecl.decl.annotations, DB_VIEW);
    const ann = ann0 as Record<string, string[] | undefined>;
    const viewSql: string[] = ann["viewSql"] || [];
    if (viewSql.length > 0) {
      writer.write(`drop view if exists ${getViewName(dbView.scopedDecl)};\n`);
      writer.write("\n");
      for (const sql of viewSql) {
        writer.write(sql + "\n");
      }
      writer.write("\n");
    }
  }
  await writer.close();
}

function insertDecls(
  resolver: adl.DeclResolver,
  writer: FileWriter,
  sdecls: adlast.ScopedDecl[],
) {
  const done: { [name: string]: boolean } = {};
  const jbDecl = createJsonBinding(resolver, adlast.texprDecl());

  function insertDecl(sdecl: adlast.ScopedDecl) {
    const name = sdecl.moduleName + "." + sdecl.decl.name;
    if (done[name] === undefined) {
      const jsdecl = JSON.stringify(jbDecl.toJson(sdecl.decl));
      writer.write(
        `insert into meta_adl_decl(module_name,name,decl) values (${
          dbstr(
            sdecl.moduleName,
          )
        },${dbstr(sdecl.decl.name)}, ${dbstr(jsdecl)});\n`,
      );
      done[name] = true;
      switch (sdecl.decl.type_.kind) {
        case "struct_":
        case "union_":
          for (const field of sdecl.decl.type_.value.fields) {
            insertTypeExpr(field.typeExpr);
          }
          break;
        case "newtype_":
        case "type_":
          insertTypeExpr(sdecl.decl.type_.value.typeExpr);
          break;
      }
    }
  }

  function insertTypeExpr(texpr: adlast.TypeExpr) {
    switch (texpr.typeRef.kind) {
      case "reference": {
        const sname = texpr.typeRef.value;
        const decl = resolver(sname);
        insertDecl(decl);
        break;
      }
      case "primitive":
      case "typeParam":
        break;
    }
    texpr.parameters.forEach((te) => insertTypeExpr(te));
  }

  sdecls.forEach(insertDecl);
}

function generateTemplate(template: Template, dbResources: DbResources) {
  const templateStr: string = Deno.readTextFileSync(template.template);
  const view: JsonObject = {
    tables: dbResources.tables.map((dbtable) => {
      const attributes: JsonObject = {};
      attributes["tablename"] = dbtable.name;
      for (const annotation of dbtable.scopedDecl.decl.annotations) {
        attributes[annotation.key.name] = annotation.value;
      }
      return attributes;
    }),
  };
  const outStr: string = mustache.render(templateStr, view);
  Deno.writeTextFileSync(template.outfile, outStr);
}

function dbstr(s: string) {
  return "'" + s.replace(/'/g, "''") + "'";
}

const DOC = scopedName("sys.annotations", "Doc");
const MAYBE = scopedName("sys.types", "Maybe");

const DB_COLUMN_TYPE = scopedName("common.db", "DbColumnType");
const DB_KEY = scopedName("common.db", "DbKey");

// Run last, so that the constants above are initialised
await runTool(main);
