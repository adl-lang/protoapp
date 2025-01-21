/**
 * Typescript pattern to ensure exhaustive checks in switch/unions.
 *
 * See https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
export function assertNever(x: never, msg?: string): never {
  // tslint:disable-next-line:no-console
  console.log(msg || "unexpected object:", x);
  throw new Error(`${msg || "unexpected object:"} ${x}`);
}