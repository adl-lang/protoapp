import { parseCli, runTool } from "./cli.ts";
import { AdlSourceParams } from "@adllang/adlc-tools/utils/sources";
import { parseAdlModules } from "@adllang/adlc-tools/utils/adl";

import { FileWriter } from "./file-writer.ts";

const usage = `Usage: adlc ts-package [OPTION...] <module>...

Generate the package.json for a typescript package containing generated ADL code.

  --searchdir DIR            adl search directory (repeatable)
  --package-name NAME        npm package name
  --package-root DIR         directory to write package.json into
  --build-output-dir /DIR    build output dir, relative to the package root
  --adl-runtime-version VER  version of the adl runtime to depend on
  --verbose`;

async function main() {
  const cli = parseCli(usage, {
    single: [
      "package-name",
      "package-root",
      "build-output-dir",
      "adl-runtime-version",
    ],
    multi: ["searchdir"],
  });
  await genAdlTsPackage({
    searchPath: cli.all("searchdir"),
    adlModules: cli.modules,
    packageName: cli.required("package-name"),
    packageRoot: cli.required("package-root"),
    buildOutputDir: cli.required("build-output-dir") as `/${string}`,
    adlRuntimeVersion: cli.required("adl-runtime-version"),
    verbose: cli.verbose,
  });
}

interface GenAdlTsParams extends AdlSourceParams {
  packageName: string;
  packageRoot: string;
  buildOutputDir: `/${string}`;
  adlRuntimeVersion: string;
  verbose?: boolean;
}

async function genAdlTsPackage(params: GenAdlTsParams): Promise<void> {
  const loadedAdl = await parseAdlModules(params);
  const modules = Object.entries(loadedAdl.modules).map(
    ([_, module]) => module.name,
  );

  const outputFile = params.packageRoot + "/package.json";

  const writer = new FileWriter(outputFile, !!params.verbose);
  writer.write(`{\n`);
  writer.write(`  "name": "${params.packageName}",\n`);
  writer.write(
    `  "description": "Auto-generated TypeScript package containing ADL code",\n`,
  );
  writer.write(`  "private": true,\n`);
  writer.write(`  "version": "1.0.0",\n`);
  writer.write(`  "type": "module",\n`);
  writer.write(`  "scripts": {\n`);
  writer.write(`    "build": "tsc",\n`);
  writer.write(`    "check": "tsc --noEmit",\n`);
  writer.write(`    "postinstall": "tsc"\n`);
  writer.write(`  },\n`);
  writer.write(`  "dependencies": {\n`);
  writer.write(
    `    "@adllang/adl-runtime": "npm:@jsr/adllang__adl-runtime@${params.adlRuntimeVersion}"\n`,
  );
  writer.write(`  },\n`);
  writer.write(`  "devDependencies": {\n`);
  writer.write(`    "typescript": "catalog:"\n`);
  writer.write(`  },\n`);
  writer.write(`  "exports": {\n`);
  writer.write(`    ".": "./dist/index.js",\n`);
  writer.write(`    "./resolver": "./dist/resolver.js",\n`);
  // generate a package export for each adl module
  modules.forEach((module, index) => {
    const modulePath = module.split(".").join("/");
    writer.write(
      `    "./${modulePath}": "./dist/${modulePath}.js"${
        index < modules.length - 1 ? "," : ""
      }\n`,
    );
  });
  writer.write(`  }\n`);
  writer.write(`}\n`);
  writer.close();
}

// Run last, so that the constants above are initialised
await runTool(main);
