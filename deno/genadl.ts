import * as path from "@std/path";
import { AdlcError, genRust, genTypescript } from "@adllang/adlc-tools";

import { genAdlTsPackage } from "./gen-adl-ts-package.ts";
import { genCreateSqlSchema } from "./gen-sqlschema.ts";
import { genRustSeaQuerySchema } from "./gen-rs-seaquery-schema.ts";

async function main() {
  const repo = getRepoRoot();

  const commonFlags = {
    searchPath: [repo + "/adl"],
    verbose: false,
  };

  {
    //----------------------------------------------------------------------
    // Generate typescript for the adl package

    const packageRoot = repo + "/ts/adl";
    await genTypescript({
      ...commonFlags,
      adlModules: ["protoapp.apis.ui", "sys.adlast", "common.ui"],
      tsStyle: "tsc",
      outputDir: packageRoot + "/src",
      includeResolver: true,
      manifest: packageRoot + "/src/.adl-manifest",
      generateTransitive: true,
      excludeAstAnnotations: [],
    });

    await genAdlTsPackage({
      ...commonFlags,
      adlModules: ["protoapp.apis.ui", "sys.adlast", "common.ui"],
      packageName: "@protoapp/adl",
      packageRoot: repo + "/ts/adl",
      buildOutputDir: "/dist",
      adlRuntimeVersion: "0.1.2",
    });
  }

  {
    //----------------------------------------------------------------------
    // Generate rust for the server

    const outputDir = repo + "/rust/adl/src";
    await genRust({
      ...commonFlags,
      adlModules: ["protoapp.apis.ui", "protoapp.db", "protoapp.config.server"],
      outputDir: outputDir,
      module: "gen",
      runtimeModule: "rt",
      includeRuntime: true,
      manifest: outputDir + "/.adl-manifest",
      generateTransitive: true,
    });

    await genRustSeaQuerySchema({
      ...commonFlags,
      adlModules: ["protoapp.db"],
      outputFile: outputDir + "/db/schema.rs",
    });
  }

  {
    //----------------------------------------------------------------------
    // Generate a db schema

    await genCreateSqlSchema({
      ...commonFlags,
      mergeAdlExts: ["adl-pg"],
      adlModules: ["protoapp.db"],
      createFile: repo + "/sql/adl-gen/adl-tables.latest.sql",
      viewsFile: repo + "/sql/adl-gen/adl-views.latest.sql",
    });

    // Make the first migrations these two files. Once there is a live
    // database, these copy operations should be deleted, and migrations
    // written by hand
    Deno.copyFile(
      repo + "/sql/adl-gen/adl-tables.latest.sql",
      repo + "/rust/server/migrations/00000000000020_adl-tables.latest.sql",
    );
    Deno.copyFile(
      repo + "/sql/adl-gen/adl-views.latest.sql",
      repo + "/rust/server/migrations/00000000000030_adl-views.latest.sql",
    );
  }
}

export function getRepoRoot(): string {
  const modulepath = new URL(import.meta.url).pathname;
  return path.dirname(path.dirname(modulepath));
}

try {
  await main();
} catch (e: unknown) {
  if (e instanceof AdlcError && e.showTraceback === false) {
    console.error(e.message);
  } else {
    console.error(e);
  }
  Deno.exit(1);
}
