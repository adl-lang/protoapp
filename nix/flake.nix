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
      in {
        devShells.default = pkgs.mkShell (rustEnv // {
          buildInputs = rustEnv.buildInputs ++ (with pkgs; [
            postgresql_16

            # Runs the local dev services, see ../process-compose.yaml
            process-compose

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
            deno
            adlc
          ]);
        });
      });
}
