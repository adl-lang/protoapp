import { isEnum }  from "@adllang/adl-runtime";
import { AdlSourceParams } from "@adllang/adlc-tools/utils/sources";
import {
  decodeTypeExpr,
  DecodedTypeExpr,
  LoadedAdl,
  getAnnotation,
  hasAnnotation,
  scopedName,
} from "@adllang/adlc-tools/utils/adl";
import * as adlast from "@adllang/adlc-tools/adlgen/sys/adlast";
import { pascalCase, snakeCase } from "@mesqueeb/case-anything";


import { FileWriter, loadDbResources } from "./gen-sqlschema.ts";


export interface GenRustSeaQuerySchemaParams extends AdlSourceParams {
  outputFile: string
}

/***
 * Generate a db schema for the rust sea query
 * library
 */
export async function genRustSeaQuerySchema(
  params: GenRustSeaQuerySchemaParams,
): Promise<void> {
  const { loadedAdl, dbResources } = await loadDbResources({
    mergeAdlExts: ["adl-rs"],
    ...params,
  });

  const writer = new FileWriter(params.outputFile, false);
  writer.write('// This file is generated from the schema definition\n');
  writer.write('#![allow(unused)]\n');
  writer.write('\n');
  writer.write('use super::types::ColumnSpec;\n');
  writer.write('use sea_query::{Alias, DynIden, IntoIden};\n');
  writer.write('\n');
  writer.write('use crate::adl::custom::common::db::DbKey;\n');
  writer.write('use crate::adl::gen as adlgen;\n');
  writer.write('use crate::adl::rt as adlrt;\n');
  writer.write('\n');

  const declsToDerive: { [key: string]: DeclToDerive } = {};
  for (const dbt of dbResources.tables) {
    writer.write(`pub struct ${titleCase(dbt.name)} {}\n`);
    writer.write('\n');
    writer.write(`impl ${titleCase(dbt.name)} {\n`);
    writer.write(`    pub fn table_str() -> &'static str {\n`);
    writer.write(`        "${dbt.name}"\n`);
    writer.write(`    }\n`);
    writer.write(`\n`);
    if (dbt.idPrefix !== "") {
      writer.write(`    pub fn id_prefix() -> &'static str {\n`);
      writer.write(`        "${dbt.idPrefix}"\n`);
      writer.write(`    }\n`);
      writer.write(`\n`);
    }
    writer.write(`    pub fn table() -> DynIden {\n`);
    writer.write(`        Alias::new(Self::table_str()).into_iden()\n`);
    writer.write(`    }\n`);
    for (const f of dbt.fields) {
      const dte = decodeTypeExpr(f.typeExpr);
      const dtd = declToDerive(loadedAdl, dte);
      if (dtd) {
        declsToDerive[rustScopedName(dtd.sn)] = dtd;
      }

      let typeStr = genTypeExpr(loadedAdl, dte);

      if (hasAnnotation(f.annotations, SN_DB_PRIMARY_KEY)) {
        typeStr = `DbKey<${rustScopedName(dbt.scopedName)}>`;
      }
      writer.write('\n');
      writer.write(`    pub fn ${f.name}() -> ColumnSpec<${typeStr}> {\n`);
      writer.write(`        ColumnSpec::new(Self::table_str(), "${f.name}")\n`);
      writer.write(`    }\n`);
    }
    writer.write('}\n');
    writer.write('\n');
  }

  const dtdKeys = Object.keys(declsToDerive);
  dtdKeys.sort();
  if (dtdKeys.length > 0) {
    writer.write('\n');
    for (const key of dtdKeys) {
      const dtd = declsToDerive[key];
      if (dtd.isEnum) {
        writer.write(`derive_db_conversions_adl_enum!(${rustScopedName(dtd.sn)});\n`);
      } else {
        writer.write(`derive_db_conversions_adl!(${rustScopedName(dtd.sn)});\n`);
      }
    }
  }

  writer.close();
}

interface DeclToDerive {
  sn: adlast.ScopedName,
  isEnum: boolean,
}

function declToDerive(loadedAdl: LoadedAdl, dte: DecodedTypeExpr): DeclToDerive | undefined {
  if (dte.kind === 'Reference') {
    const sn = dte.refScopedName;
    const decl = loadedAdl.allAdlDecls[sn.moduleName + '.' + sn.name].decl;
    if (decl.type_.kind === 'type_' || decl.type_.kind === 'newtype_') {
      return declToDerive(loadedAdl, decodeTypeExpr(decl.type_.value.typeExpr));
    }
    const customAnnotation = getRustCustomTypeAnnotation(loadedAdl, sn);
    if (!customAnnotation) {
      if (decl.type_.kind === 'union_') {
        return {sn, isEnum: isEnum(decl.type_.value)}
      }
      return {sn, isEnum: false}
    }
  }
  return undefined;
}

function genTypeExpr(loadedAdl: LoadedAdl, dte: DecodedTypeExpr): string {
  const custom = genTypeExprForCustomType(loadedAdl, dte);
  if (custom) {
    return custom;
  }

  switch (dte.kind) {
    case 'Void': return '()';
    case 'String': return 'String';
    case 'Bool': return 'bool';
    case 'Json': return 'serde_json::Value';
    case 'Int8': return 'i8';
    case 'Int16': return 'i16';
    case 'Int32': return 'i32';
    case 'Int64': return 'i64';
    case 'Word8': return 'u8';
    case 'Word16': return 'u16';
    case 'Word32': return 'u32';
    case 'Word64': return 'u64';
    case 'Float': return 'f32';
    case 'Double': return 'f64';
    case 'Vector': return `std::vec::Vec<${genTypeExpr(loadedAdl, dte.elemType)}>`;
    case 'StringMap': return `StringMap<${genTypeExpr(loadedAdl, dte.elemType)}>`;
    case 'Nullable': return `std::option::Option<${genTypeExpr(loadedAdl, dte.elemType)}>`;
    case 'Reference': return rustScopedName(dte.refScopedName) + genTypeParams(loadedAdl, dte.parameters);
  }
  return "unknown";
}


function genTypeExprForCustomType(loadedAdl: LoadedAdl, dte: DecodedTypeExpr): string | undefined {
  if (dte.kind !== 'Reference') {
    return;
  }
  const customAnnotation = getRustCustomTypeAnnotation(loadedAdl, dte.refScopedName);
  if (customAnnotation === undefined) {
    return;
  }
  const ref = customAnnotation.rustname.replace("{{STDLIBMODULE}}", "adlrt");
  return ref + genTypeParams(loadedAdl, dte.parameters);
}

function rustScopedName(scopedName: adlast.ScopedName): string {
  const scope = scopedName.moduleName.replace('.', '::');
  const name = scopedName.name;
  return `adlgen::${scope}::${name}`;
}

function genTypeParams(loadedAdl: LoadedAdl, dtes: DecodedTypeExpr[]): string {
  if (dtes.length === 0) {
    return '';
  }
  const params = dtes.map(te => genTypeExpr(loadedAdl, te));
  return `<${params.join(', ')}>`;
}

function getRustCustomTypeAnnotation(loadedAdl: LoadedAdl, sn: adlast.ScopedName): {rustname: string} | undefined {
  const module = loadedAdl.modules[sn.moduleName];
  if (!module) {
    return
  }
  const decl = module.decls[sn.name];
  const customAnnotation = getAnnotation(decl.annotations, SN_RUST_CUSTOM_TYPE);
  return customAnnotation as { rustname: string };
}

const titleCase = pascalCase;

const SN_RUST_CUSTOM_TYPE = scopedName("adlc.config.rust", "RustCustomType");
const SN_DB_PRIMARY_KEY = scopedName("common.db", "DbPrimaryKey");
