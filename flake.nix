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
        rustEnv = import ./nix/rust.nix {
          inherit pkgs;
          toolchainFile = ./rust/rust-toolchain.toml;
        };

        adlc = adl.packages.${system}.adlc;

        # The adlc-* subcommands used by ./genadl
        adlcExtensions = import ./nix/adlc-extensions.nix {
          inherit pkgs;
          src = ./adlc-extensions;
        };
      in {
        packages.adlc-extensions = adlcExtensions;

        devShells.default = pkgs.mkShell (rustEnv // {
          buildInputs = rustEnv.buildInputs ++ (with pkgs; [
            postgresql_16

            # Runs the local dev services, see ./process-compose.yaml
            process-compose

            # Runs the project tasks in ./Taskfile.yml, see `task --list`
            go-task

            # Shows what the proc macros generate, eg
            #   cargo expand -p adl gen::protoapp::apis::ui
            # for #[derive(adl::HttpApi)]. It drives rustc's unstable
            # -Zunpretty=expanded, but supplies RUSTC_BOOTSTRAP itself, so the
            # stable toolchain above is enough and no nightly is needed.
            cargo-expand

            # The node and pnpm versions here are also pinned in
            # ./ts/ui/Dockerfile, so keep them in step.
            nodejs_24
            pnpm_10
            adlc
            adlcExtensions
          ]);
        });
      });
}
