# The ADL compiler, from the upstream release binaries.
#
# Keep `version` in step with the `adlc` entry in ../.prototools, so that the
# nix and proto paths generate code with the same compiler.
{
  lib,
  stdenv,
  fetchurl,
  unzip,
  makeWrapper,
  glibc,
  gmp,
  version ? "1.4.1",
}:

let
  # Upstream only publishes these two platforms.
  dists = {
    "aarch64-darwin" = {
      file = "macos-arm64";
      sha256 = "sha256-8zmfFhEkkJK9ddszGJYOW9TUy6A00ejpzGAXoF0ct4M=";
    };
    "x86_64-linux" = {
      file = "linux-x64";
      sha256 = "sha256-LPgCw5kM9h0bVO5Gn7oC/S2y6NsOIXBxco5dKdvLQJY=";
    };
  };

  system = stdenv.hostPlatform.system;

  dist =
    dists.${system}
      or (throw "adlc: no release binary for ${system}, only ${builtins.concatStringsSep " and " (builtins.attrNames dists)} are published");
in
stdenv.mkDerivation {
  pname = "adlc";
  inherit version;

  src = fetchurl {
    url = "https://github.com/adl-lang/adl/releases/download/v${version}/adl-bindist-${version}-${dist.file}.zip";
    inherit (dist) sha256;
  };

  nativeBuildInputs = [
    unzip
    makeWrapper
  ];

  # Do not rewrite this binary's ELF headers. It is a non-PIE executable whose
  # program header table has no slack, so patchelf has to insert a new PT_LOAD
  # below the image and move PHDR/INTERP/DYNAMIC into it. patchelf 0.19.2 (what
  # nixpkgs ships) sizes that segment so it overlaps the original read-only
  # LOAD and lands `.dynamic` inside the overlap, where the kernel's later
  # read-only mapping wins; the loader then faults writing DT_DEBUG at startup.
  # 0.18 is no better and 0.15.x, which got it right, is long gone from
  # nixpkgs. So supply the loader from the wrapper below instead.
  dontPatchELF = true;

  sourceRoot = ".";

  installPhase = ''
    runHook preInstall

    mkdir -p $out/bin $out/lib $out/libexec
    cp -r lib/* $out/lib/
    install -Dm755 bin/adlc $out/libexec/adlc

    runHook postInstall
  '';

  # adlc locates its bundled lib/ from /proc/self/exe, which points at the
  # loader rather than at adlc once it is launched this way, so tell it
  # explicitly via ADL_ROOT (honoured by ADL.Compiler.DataFiles.getLibDir).
  postFixup =
    if stdenv.hostPlatform.isLinux then
      ''
        makeWrapper ${stdenv.cc.bintools.dynamicLinker} $out/bin/adlc \
          --set ADL_ROOT $out \
          --add-flags "--library-path ${lib.makeLibraryPath [ gmp glibc ]}" \
          --add-flags "$out/libexec/adlc"
      ''
    else
      ''
        makeWrapper $out/libexec/adlc $out/bin/adlc --set ADL_ROOT $out
      '';

  meta = {
    description = "ADL compiler";
    homepage = "https://github.com/adl-lang/adl";
    platforms = builtins.attrNames dists;
    mainProgram = "adlc";
  };
}
