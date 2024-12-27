import {
  packages,
  forPlatform,
  getHostPlatform,
  installTo
} from "@adllang/local-setup";

const ADL = packages.adl("1.2.3");
const NODE = packages.nodejs("20.7.0");
const PNPM = packages.pnpm("8.3.1");

export async function main() {
  if (Deno.args.length != 2) {
    console.error("Usage: local-setup DENOVERSION LOCALDIR");
    Deno.exit(1);
  }
  const denoVersion = Deno.args[0];
  const localdir = Deno.args[1];

  const platform = getHostPlatform();

  const DENO = packages.deno(denoVersion);

  const installs = [
    forPlatform(DENO, platform),
    forPlatform(ADL, platform),
    forPlatform(NODE, platform),
    forPlatform(PNPM, platform),
  ];

  await installTo(installs, localdir);
}

main()
  .catch((err) => {
    console.error("error in main", err);
  });
