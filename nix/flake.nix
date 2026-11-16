{
  description = "protoapp development shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    # Not made to follow our nixpkgs: it builds adlc with the GHC from its own
    # pinned package set.
    adl.url = "github:adl-lang/adl";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay, adl }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
        };
        rustEnv = import ./rust.nix {
          inherit pkgs;
          toolchainFile = ../rust/rust-toolchain.toml;
        };

        # Keep the adl input in step with the `adlc` entry in ../.prototools,
        # so that the nix and proto paths generate code with the same compiler.
        adlc = adl.packages.${system}.adlc;

        # The adlc-* subcommands (run as `adlc <name>`, see ../genadl) are
        # typescript programs in ../adlc-extensions. They are compiled to standalone
        # executables here, so that deno is a build-time detail of this flake
        # and not something contributors have to install or see.
        denoSrc = pkgs.lib.fileset.toSource {
          root = ../.;
          fileset = ../adlc-extensions;
        };

        # The jsr/https dependencies, vendored with network access (hence the
        # fixed output hash). A vendor dir is plain source files, unlike
        # DENO_DIR, whose cache entries record fetch times and so do not hash
        # reproducibly. Refresh the hash whenever adlc-extensions/deno.lock changes:
        # set it to pkgs.lib.fakeHash and rebuild.
        denoDeps = pkgs.stdenvNoCC.mkDerivation {
          name = "protoapp-deno-deps";
          src = denoSrc;
          nativeBuildInputs = [ pkgs.deno ];
          dontFixup = true;
          buildPhase = ''
            export DENO_DIR=$TMPDIR/deno
            cd adlc-extensions
            deno cache --vendor --frozen adlc-*.ts
          '';
          installPhase = "cp -r adlc-extensions/vendor $out";
          outputHashMode = "recursive";
          outputHashAlgo = "sha256";
          outputHash = "sha256-EbUTpTLYIe3qFWTTohWCfFSptN4uOt2C/iRgClZobhc=";
        };

        adlcTools = pkgs.stdenvNoCC.mkDerivation {
          name = "protoapp-adlc-tools";
          src = denoSrc;
          nativeBuildInputs = [ pkgs.deno ];
          # Stripping or patching a compiled deno binary corrupts the program
          # appended to it
          dontStrip = true;
          dontFixup = true;
          buildPhase = ''
            # use the denort runtime from nixpkgs rather than downloading one
            export DENORT_BIN=${pkgs.deno.denort}/bin/denort
            export DENO_DIR=$TMPDIR/deno
            cd adlc-extensions
            cp -r ${denoDeps} vendor
            mkdir -p $out/bin
            for tool in ts-package rust-seaquery-schema sqlschema; do
              deno compile --vendor --cached-only --frozen \
                --allow-read --allow-write --allow-run \
                --output $out/bin/adlc-$tool adlc-$tool.ts
            done
          '';
          installPhase = "true";
        };
      in {
        packages.adlc-tools = adlcTools;

        devShells.default = pkgs.mkShell (rustEnv // {
          buildInputs = rustEnv.buildInputs ++ (with pkgs; [
            postgresql_16

            # Runs the local dev services, see ../process-compose.yaml
            process-compose

            # Runs the project tasks in ../Taskfile.yml, see `task --list`
            go-task

            # Shows what the proc macros generate, eg
            #   cargo expand -p adl gen::protoapp::apis::ui
            # for #[derive(adl::HttpApi)]. It drives rustc's unstable
            # -Zunpretty=expanded, but supplies RUSTC_BOOTSTRAP itself, so the
            # stable toolchain above is enough and no nightly is needed.
            cargo-expand

            # Also listed in ../.prototools, for contributors who use proto
            # rather than nix. The versions there are the ones these attrs
            # resolve to, so bumping the nixpkgs input means updating that
            # file too (and vice versa).
            nodejs_24
            pnpm_10
            adlc
            adlcTools
          ]);
        });
      });
}
