import { parseArgs } from "@std/cli/parse-args";
import { AdlcError } from "@adllang/adlc-tools";

export interface Cli {
  /** Value of a string option that must be present */
  required(name: string): string;
  /** Value of a string option that may be absent */
  optional(name: string): string | undefined;
  /** Values of a repeatable string option */
  all(name: string): string[];
  verbose: boolean;
  /** Positional arguments (the adl modules) */
  modules: string[];
}

/**
 * Parse the arguments of an adlc-* tool. Options are declared as
 * repeatable (`multi`) or single-valued (`single`).
 */
export function parseCli(
  usage: string,
  opts: { single: string[]; multi: string[] },
): Cli {
  const args = parseArgs(Deno.args, {
    string: [...opts.single, ...opts.multi],
    collect: opts.multi,
    boolean: ["verbose", "help"],
  });
  if (args.help) {
    console.log(usage);
    Deno.exit(0);
  }
  const fail = (msg: string): never => {
    console.error(`${msg}\n\n${usage}`);
    return Deno.exit(2);
  };
  const modules = args._.map(String);
  if (modules.length === 0) {
    fail("no adl modules specified");
  }
  const rec = args as unknown as Record<string, unknown>;
  return {
    required: (name) => {
      const v = rec[name];
      return typeof v === "string" ? v : fail(`missing option --${name}`);
    },
    optional: (name) => rec[name] as string | undefined,
    all: (name) => (rec[name] as string[] | undefined) ?? [],
    verbose: !!args.verbose,
    modules,
  };
}

/** Run the body of an adlc-* tool, reporting errors in the style of adlc */
export async function runTool(body: () => Promise<void>): Promise<void> {
  try {
    await body();
  } catch (e: unknown) {
    if (e instanceof AdlcError && e.showTraceback === false) {
      console.error(e.message);
    } else {
      console.error(e);
    }
    Deno.exit(1);
  }
}
