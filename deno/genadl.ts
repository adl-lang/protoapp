import * as path from "@std/path";
import { genRust, genTypescript } from "@adllang/adlc-tools";

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

    const outputDir = repo + "/ts/adl/src";
    await genTypescript({
      ...commonFlags,
      adlModules: ["protoapp.apis.ui", "sys.adlast", "common.ui"],
      tsStyle: "tsc",
      outputDir: outputDir,
      includeResolver: true,
      manifest: outputDir + "/.adl-manifest",
      generateTransitive: true,
      excludeAstAnnotations: [],
    });

    // ensure pnpm dependencies are installed
    let cmd = new Deno.Command("pnpm", {
      args: ["install"],
      cwd: repo + "/ts",
    });
    const installOutput = await cmd.output();
    if (installOutput.stderr.length > 0) {
      console.error(
        "pnpm install stderr:",
        new TextDecoder().decode(installOutput.stderr),
      );
    }

    // build the adl package so it can be consumed
    cmd = new Deno.Command("pnpm", {
      args: ["run", "build"],
      cwd: repo + "/ts/adl",
    });
    const buildOutput = await cmd.output();
    if (buildOutput.stderr.length > 0) {
      console.error(
        "pnpm build stderr:",
        new TextDecoder().decode(buildOutput.stderr),
      );
    }
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

main().catch((err) => {
  console.error("error in main", err);
});
