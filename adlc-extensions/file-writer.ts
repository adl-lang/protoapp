export class FileWriter {
  content: string[] = [];

  constructor(readonly path: string, readonly verbose: boolean) {
    if (verbose) {
      console.log(`Writing ${path}...`);
    }
    this.content = [];
  }

  write(s: string) {
    this.content.push(s);
  }

  close(): Promise<void> {
    return Deno.writeTextFile(this.path, this.content.join(""));
  }
}
