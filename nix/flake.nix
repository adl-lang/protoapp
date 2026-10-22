{
  description = "protoapp development shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
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

        # Upstream only publishes adlc for linux-x64 and macos-arm64. Elsewhere
        # the shell is still useful for everything but code generation, so leave
        # adlc out rather than failing to evaluate at all.
        adlcAvailable = builtins.elem system [ "x86_64-linux" "aarch64-darwin" ];
        adlc = pkgs.callPackage ./adlc.nix { };
      in {
        devShells.default = pkgs.mkShell (rustEnv // {
          buildInputs = rustEnv.buildInputs ++ (with pkgs; [
            postgresql_16

            # Also listed in ../.prototools, for contributors who use proto
            # rather than nix. The versions there are the ones these attrs
            # resolve to, so bumping the nixpkgs input means updating that
            # file too (and vice versa).
            nodejs_24
            pnpm_10
            deno
          ]) ++ pkgs.lib.optional adlcAvailable adlc;
        });
      });
}
