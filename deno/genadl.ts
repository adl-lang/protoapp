import * as path from "@std/path";
import { genRust, genTypescript } from "@adllang/adlc-tools";

import { genCreateSqlSchema } from "./gen-sqlschema.ts";
import { genRustSeaQuerySchema } from "./gen-rs-seaquery-schema.ts";

async function main() {
  const repo = getRepoRoot();

  const commonFlags = {
    searchPath: [repo + "/adl"],
    verbose: false,
  }

  {
    //----------------------------------------------------------------------
    // Generate typescript for the protoapp ui
    
    const outputDir = repo + "/ts/ui/src/adl-gen";
    await genTypescript({
      ...commonFlags,
      adlModules: [
        "protoapp.apis.ui",
        "sys.adlast",
        "common.ui",
      ],
      tsStyle: "tsc",
      outputDir: outputDir,
      includeResolver: true,
      manifest: outputDir + "/.adl-manifest",
      generateTransitive: true,
      excludeAstAnnotations: [],
    });
  }

  {
    //----------------------------------------------------------------------
    // Generate rust for the protoapp server
    
    const outputDir = repo + "/rust/shared/src";
    await genRust({
      ...commonFlags,
      adlModules: [
        "protoapp.apis.ui",
        "protoapp.db",
        "protoapp.config.server"
      ],
      outputDir: outputDir,
      module: "adl::gen",
      runtimeModule: "adl::rt",
      includeRuntime: true,
      manifest: outputDir + "/.adl-manifest",
      generateTransitive: true,
    });


    await genRustSeaQuerySchema({
      ...commonFlags,
      adlModules: [
        "protoapp.db"
      ],
      outputFile: outputDir + '/adl/db/schema.rs',
    });
  }

  {
    //----------------------------------------------------------------------
    // Generate a db schema
    
    await genCreateSqlSchema({
      ...commonFlags,
      mergeAdlExts: ['adl-pg'],
      adlModules: [
        "protoapp.db",
      ],
      createFile:  repo + "/sql/adl-gen/adl-tables.latest.sql",
      viewsFile:  repo + "/sql/adl-gen/adl-views.latest.sql",
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

main()
  .catch((err) => {
    console.error("error in main", err);
  });
