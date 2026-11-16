{ pkgs, src }:

# The adlc-* subcommands (run as `adlc <name>`, see ../tasks/genadl.sh) are typescript
# programs in ../adlc-extensions, passed here as `src`. They are compiled to
# standalone executables, so that deno is a build-time detail of the flake and
# not something contributors have to install or see.
let
  # The jsr/https dependencies, vendored with network access (hence the
  # fixed output hash). A vendor dir is plain source files, unlike
  # DENO_DIR, whose cache entries record fetch times and so do not hash
  # reproducibly. Refresh the hash whenever adlc-extensions/deno.lock changes:
  # set it to pkgs.lib.fakeHash and rebuild.
  denoDeps = pkgs.stdenvNoCC.mkDerivation {
    name = "protoapp-deno-deps";
    inherit src;
    nativeBuildInputs = [ pkgs.deno ];
    dontFixup = true;
    buildPhase = ''
      export DENO_DIR=$TMPDIR/deno
      deno cache --vendor --frozen adlc-*.ts
    '';
    installPhase = "cp -r vendor $out";
    outputHashMode = "recursive";
    outputHashAlgo = "sha256";
    outputHash = "sha256-EbUTpTLYIe3qFWTTohWCfFSptN4uOt2C/iRgClZobhc=";
  };
in
pkgs.stdenvNoCC.mkDerivation {
  name = "protoapp-adlc-tools";
  inherit src;
  nativeBuildInputs = [ pkgs.deno ];
  # Stripping or patching a compiled deno binary corrupts the program
  # appended to it
  dontStrip = true;
  dontFixup = true;
  buildPhase = ''
    # use the denort runtime from nixpkgs rather than downloading one
    export DENORT_BIN=${pkgs.deno.denort}/bin/denort
    export DENO_DIR=$TMPDIR/deno
    cp -r ${denoDeps} vendor
    mkdir -p $out/bin
    for tool in ts-package rust-seaquery-schema sqlschema; do
      deno compile --vendor --cached-only --frozen \
        --allow-read --allow-write --allow-run \
        --output $out/bin/adlc-$tool adlc-$tool.ts
    done
  '';
  installPhase = "true";
}
